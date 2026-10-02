"""Score + sound design + mix: build/vo.wav + build/timeline.json -> build/mix.wav.

Everything here is synthesized from numpy: a warm 100 BPM music bed
(F - C - Dm - Bb, keys + marimba arpeggio + soft drums), UI sound effects
cued from the narration timeline, and a sidechain duck under the voice.
"""
import json, os
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
SR = 48000
rng = np.random.default_rng(7)

tl = json.load(open(os.path.join(BUILD, "timeline.json")))
S = {s["id"]: s for s in tl["scenes"]}
TOTAL = tl["total"] + 1.4
N = int(TOTAL * SR)


def tt(d):
    return np.arange(int(d * SR)) / SR


def place(buf, at, x, g=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x)] += g * x


def env(d, a=0.005, r=None):
    t = tt(d)
    e = np.minimum(t / a, 1.0)
    return e * (np.exp(-t / r) if r else 1.0)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cut):
    # one-pole, run as a vectorized IIR via cumulative trick is unstable; loop in chunks is fine at this length
    a = np.exp(-2 * np.pi * cut / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc
        y[i] = acc
    return y


# ---------------------------------------------------------------- music
BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT
music = np.zeros(N)

chords = [  # F, C/E, Dm, Bb  (midi)
    [53, 57, 60, 65], [52, 55, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62],
]
bass = [41, 40, 38, 34]


def keys(m, d):
    t = tt(d)
    f = hz(m)
    x = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.25)
         + 0.12 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.1))
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return x * trem * env(d, 0.01, 1.4)


def marimba(m, d=0.6):
    t = tt(d)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.03)
    return x * env(d, 0.002, 0.16)


def bassnote(m, d):
    t = tt(d)
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t)) * env(d, 0.01, 0.9)


def kick():
    t = tt(0.35)
    f = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.35, 0.002, 0.12)


def shaker():
    return rng.standard_normal(int(0.06 * SR)) * env(0.06, 0.004, 0.018)


music_end = S["outro"]["beats"][-1]["t"] + 0.2  # land the final chord on "Made in a minute"
nbars = int(music_end // BAR) + 1
for b in range(nbars):
    t0 = b * BAR
    ci = b % 4
    intro = t0 < S["hook"]["end"] - 0.5
    for m in chords[ci]:
        place(music, t0, keys(m, BAR + 0.4), 0.055)
    if not intro:
        place(music, t0, bassnote(bass[ci], BAR * 0.5), 0.16)
        place(music, t0 + BAR * 0.625, bassnote(bass[ci] + 12 if ci == 3 else bass[ci], BAR * 0.375), 0.12)
    # arpeggio: chord tones up an octave, 8ths, with a little melodic turn every 4th bar
    arp = [chords[ci][i] + 12 for i in (0, 1, 2, 3, 2, 1, 2, 3)]
    if b % 4 == 3:
        arp[-2:] = [chords[ci][3] + 14, chords[ci][3] + 17]
    for i, m in enumerate(arp):
        if intro and i % 2:
            continue
        place(music, t0 + i * BEAT / 2, marimba(m), 0.07)
    if not intro:
        for i in range(4):
            place(music, t0 + i * BEAT, kick(), 0.22 if i % 2 == 0 else 0.12)
        for i in range(8):
            place(music, t0 + i * BEAT / 2 + 0.01, shaker(), 0.035 if i % 2 else 0.02)

# final chord: big, open F with a long tail
t_end = nbars * BAR
for m in [41, 53, 60, 65, 69, 72]:
    place(music, t_end, keys(m, 4.0), 0.07)
place(music, t_end, marimba(77, 1.5), 0.08)
# trim music to the final chord, fade
fade_at = int(min(t_end + 3.2, TOTAL - 0.05) * SR)
music[fade_at:] = 0
fl = int(1.0 * SR)
music[fade_at - fl:fade_at] *= np.linspace(1, 0, fl)

# ---------------------------------------------------------------- sfx
sfx = np.zeros(N)


def whoosh(d=0.45):
    n = rng.standard_normal(int(d * SR))
    t = tt(d)
    shape = np.sin(np.pi * t / d) ** 2
    lo = lowpass(n, 1400)
    return (n - lo) * 0.5 * shape + lo * shape * 1.4


def pop(m=84):
    t = tt(0.14)
    f = hz(m) * (1 + 0.6 * np.exp(-t / 0.012))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.14, 0.001, 0.04)


def click():
    t = tt(0.25)
    thunk = np.sin(2 * np.pi * np.cumsum(120 + 200 * np.exp(-t / 0.01)) / SR) * env(0.25, 0.001, 0.05)
    tick = rng.standard_normal(len(t)) * env(0.25, 0.0005, 0.004)
    return thunk + 0.5 * tick


def chime():
    out = np.zeros(int(2.2 * SR))
    for i, m in enumerate([77, 81, 84, 89]):
        t = tt(1.8)
        f = hz(m)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t / 0.15)) * env(1.8, 0.002, 0.6)
        out[int(i * 0.07 * SR):int(i * 0.07 * SR) + len(x)] += x
    return out


def tick():
    return pop(96) * 0.6


for s in tl["scenes"][1:]:
    place(sfx, s["start"] - 0.32, whoosh(), 0.10)
for sid, idxs, base in [("sources", [1, 2, 3], 79), ("formats", [0, 1, 2], 81),
                        ("limits", [0, 1, 2, 3], 84), ("playlist", [1, 2, 3], 82),
                        ("icons", [1], 86), ("bonus", [1], 84)]:
    for j, i in enumerate(idxs):
        place(sfx, S[sid]["beats"][i]["t"] + 0.05, pop(base + 2 * j), 0.16)
# phone taps on "Make Your Own" and "New Playlist"
pb = S["playlist"]["beats"][0]
place(sfx, pb["t"] + pb["d"] * 0.42, tick(), 0.25)
place(sfx, pb["t"] + pb["d"] * 0.88, tick(), 0.25)
# extra pops as the formats/limits graphics land
place(sfx, S["formats"]["beats"][2]["t"] + 1.4, pop(91), 0.1)
# card in + it's alive
ALIVE = S["link"]["voEnd"] + 0.15
place(sfx, ALIVE - 0.02, click(), 0.55)
place(sfx, ALIVE + 0.12, chime(), 0.18)
place(sfx, S["outro"]["beats"][-1]["t"], chime(), 0.10)

# ---------------------------------------------------------------- mix
vo24, sr = sf.read(os.path.join(BUILD, "vo.wav"))
vo = np.interp(np.arange(N) / SR, np.arange(len(vo24)) / sr, vo24, right=0.0)
# sidechain duck: smoothed voice envelope pulls the music down ~9 dB
e = np.abs(vo)
k = int(0.12 * SR)
e = np.convolve(e, np.ones(k) / k, mode="same")
duck = 1 - 0.65 * np.clip(e / 0.04, 0, 1)
duck = np.convolve(duck, np.ones(int(0.08 * SR)) / int(0.08 * SR), mode="same")

mix = vo * 1.0 + music * duck * 0.9 + sfx
# gentle stereo: music arpeggio is mono; widen with a tiny haas on the sfx/music
d = int(0.011 * SR)
L = mix
R = vo + np.concatenate([np.zeros(d), (music * duck * 0.9 + sfx)[:-d]])
st = np.stack([L, R], axis=1)
peak = np.max(np.abs(st))
st = np.tanh(st / peak * 1.25) / np.tanh(1.25) * 0.89
sf.write(os.path.join(BUILD, "mix.wav"), st.astype(np.float32), SR)
json.dump({"alive": round(ALIVE, 3), "bpm": BPM, "musicEnd": round(t_end, 3), "total": round(TOTAL, 3)},
          open(os.path.join(BUILD, "cues.json"), "w"))
print("mix ok", round(TOTAL, 2), "s; alive at", round(ALIVE, 2), "; final chord at", round(t_end, 2))

"""Narration: script.json -> build/vo.wav + build/timeline.json.

Runs Kokoro-82M locally through kokoro-onnx. Each beat (phrase) is synthesized
separately so the animation knows the exact moment every phrase starts.
Model files are not committed; point KOKORO_DIR at a folder holding
model.onnx + voices.npz (see README).
"""
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
KDIR = os.environ.get("KOKORO_DIR") or sys.exit("set KOKORO_DIR")

script = json.load(open(os.path.join(HERE, "script.json")))
os.makedirs(BUILD, exist_ok=True)
k = Kokoro(os.path.join(KDIR, "model.onnx"), os.path.join(KDIR, "voices.npz"))
SR = 24000


def speak(text):
    audio, sr = k.create(text, voice=script["voice"], speed=script["speed"], lang="en-us")
    assert sr == SR
    # trim near-silence so each cue lands on the first syllable
    nz = np.flatnonzero(np.abs(audio) > 0.01)
    return audio[max(nz[0] - 240, 0): nz[-1] + 1800]


t = script["lead_in"]
chunks, scenes = [], []
for s in script["scenes"]:
    start, beats = t, []
    for i, text in enumerate(s["beats"]):
        if i:
            t += script["beat_gap"]
        a = speak(text)
        beats.append({"text": text.replace("Lib-ri-vox", "LibriVox"), "t": round(t, 3), "d": round(len(a) / SR, 3)})
        chunks.append((t, a))
        t += len(a) / SR
    scenes.append({"id": s["id"], "start": round(start, 3), "voEnd": round(t, 3),
                   "end": round(t + s["pad"], 3), "beats": beats})
    t += s["pad"]

vo = np.zeros(int(t * SR) + SR, dtype=np.float32)
for at, a in chunks:
    i = int(at * SR)
    vo[i:i + len(a)] += a
sf.write(os.path.join(BUILD, "vo.wav"), vo, SR)
json.dump({"total": round(t, 3), "scenes": scenes},
          open(os.path.join(BUILD, "timeline.json"), "w"), indent=1)
for s in scenes:
    print(f"{s['id']:9s} {s['start']:6.2f} -> {s['end']:6.2f}  " + " | ".join(f"{b['t']:.2f}" for b in s["beats"]))
print("total", round(t, 2))

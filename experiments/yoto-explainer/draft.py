"""Draft timing without a voice: script.json -> build/timeline.json + silent build/vo.wav.

Phrase durations are estimated from text length (fit to an earlier Kokoro
af_heart run: ~0.057 s per character + 0.25 s, mean error ~0.2 s), so the
subtitled draft paces like the voiced cut will. Run tts.py instead once the
script is approved.
"""
import json, os, wave

HERE = os.path.dirname(os.path.abspath(__file__))
BUILD = os.path.join(HERE, "build")
script = json.load(open(os.path.join(HERE, "script.json")))
os.makedirs(BUILD, exist_ok=True)


def est(text):
    return round(0.057 * len(text.replace("Lib-ri-vox", "LibriVox")) + 0.25, 3)


t = script["lead_in"]
scenes = []
for s in script["scenes"]:
    start, beats = t, []
    for i, text in enumerate(s["beats"]):
        if i:
            t += script["beat_gap"]
        d = est(text)
        beats.append({"text": text.replace("Lib-ri-vox", "LibriVox"), "t": round(t, 3), "d": d})
        t += d
    scenes.append({"id": s["id"], "start": round(start, 3), "voEnd": round(t, 3),
                   "end": round(t + s["pad"], 3), "beats": beats})
    t += s["pad"]

with wave.open(os.path.join(BUILD, "vo.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000)
    w.writeframes(b"\0\0" * int((t + 1) * 24000))
json.dump({"draft": True, "total": round(t, 3), "scenes": scenes},
          open(os.path.join(BUILD, "timeline.json"), "w"), indent=1)
for s in scenes:
    print(f"{s['id']:9s} {s['start']:6.2f} -> {s['end']:6.2f}")
print("total", round(t, 2))

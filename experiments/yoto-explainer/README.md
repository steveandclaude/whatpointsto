# Make Your Own Yoto Card — 60-second explainer

Side project, not part of whatpointsto. `yoto-explainer.mp4` (1920×1080, 30 fps, 60 s)
is built entirely from code in this folder: script, voice, music, sound effects and every
frame. Nothing is stock and nothing is hand-edited.

| Step | File | What it does |
|---|---|---|
| 1 | `script.json` | Narration, split into beats (phrases) |
| 2 | `tts.py` | Kokoro-82M (local, via `kokoro-onnx`) speaks each beat → `build/vo.wav` + `build/timeline.json` (exact start of every phrase) |
| 3 | `mix.py` | numpy-synthesized 100 BPM score (F–C–Dm–B♭), UI sound effects cued from the timeline, sidechain duck under the voice → `build/mix.wav` |
| 4 | `scene.html` | Canvas animation; `draw(t)` is a pure function of time, keyed to the timeline. Open it over a local server for a live preview with sound |
| 5 | `render.mjs` | Headless Chromium draws 1,800 frames → ffmpeg → MP4 |

## Rebuild

Not wired into the repo's package.json, so the main project gains no dependencies.

```sh
python3 -m venv venv && venv/bin/pip install kokoro-onnx soundfile
# model: onnx-community/Kokoro-82M-v1.0-ONNX on Hugging Face — onnx/model.onnx + voices/af_heart.bin
# pack voices: np.savez("voices.npz", af_heart=np.fromfile("af_heart.bin", np.float32).reshape(-1,1,256))
KOKORO_DIR=/path/to/kokoro venv/bin/python tts.py
venv/bin/python mix.py
node render.mjs                    # needs playwright + ffmpeg; ~5 min
node render.mjs --stills 12,46.5   # spot-check frames
```

## Facts in the video (researched Oct 2026)

- Limits per card: 100 tracks, 5 hours / 500 MB in total; any one track up to 60 min / 100 MB
  ([Yoto support](https://support.yotoplay.com/en_gb/how-much-audio-fits-on-a-make-your-own-card-r1ssdFimfl.md)).
- Formats: MP3 and M4A/AAC upload cleanly; convert WAV/FLAC/OGG first. 96 kbps mono is
  plenty for speech, at about 43 MB an hour ([Wayfable guide](https://wayfablestories.com/guides/yoto-myo-limits/)).
- Flow: Make Your Own → New Playlist (app, or my.yotoplay.com/my-cards) → upload → order → name →
  playlist ⋯ → Link to a Card → insert the blank card ([Yoto support](https://support.yotoplay.com/en_gb/how-to-add-your-own-mp3-files-to-a-yoto-card-rJl2utiQfe.md)).
- Icons: 16×16 px (PNG with transparency is best); free community icons at yotoicons.com
  ([Yoto Space tutorial](https://yoto.space/tutorials/post/adding-icons-to-make-your-own-cards-7cduDfknMnlQ1YT)).
- Free audio: LibriVox (public domain) and Yoto Space's public-domain section
  ([Yoto Space](https://yoto.space/public-domain/post/public-domain-on-yoto-UdHDbWXxYt2Om5a)).
- Podcasts: paste an RSS feed at yotoplay.com/create → Podcasts, then link it to a card; new episodes
  arrive on their own ([Yoto support](https://support.yotoplay.com/en_gb/how-to-add-podcasts-that-aren't-in-the-yoto-app-ByJ3uYjQGe.md)).

The player in the video is a generic illustration, not Yoto's product art. Not affiliated with Yoto.
Fonts: Fredoka and Silkscreen (SIL Open Font License).

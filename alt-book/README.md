# ALT Book — interactive edition (chapters 1–4)

Open `index.html`, or publish the folder with GitHub Pages. Every chapter is one self-contained HTML file: no libraries, no build step, works from a double-click.

    index.html              library page
    chapter-01.html … 04    full text + interactive figures + narration player
    narration/chNN-narration.txt   spoken script, split per audio file
    audio/chNN/sNN.mp3      optional studio narration (folders are empty for now)

## Audio
The player reads each chapter with the browser's built-in voice (pick the voice and speed in the bar at the bottom; on Apple devices install an "Enhanced" or "Premium" English voice in Settings → Accessibility → Spoken Content for best quality).

Fastest route to studio audio: run `python3 make_audio.py` in this folder (ElevenLabs API key needed; see the top of the script for options). It generates every missing section, skips ones already done, and stops cleanly when credits run out.

By hand instead: generate one MP3 per block of `narration/chNN-narration.txt` in any text-to-speech service and save it under the file name printed above that block, e.g. `audio/ch01/s00.mp3`. The player detects the files automatically, section by section, and falls back to the browser voice for any section without one. The script is written for the ear: formulas are spoken in words and every figure and table is described.

## Rebuilding / adding chapters
Sources are in `src/`: `chN.md` (chapter text plus `@@widget`, `@@formula`, `@@say` lines), `wN.js` (that chapter's figures), shared `lib.js`, `reader.js`, `style.css`. Run `python3 src/build.py`.

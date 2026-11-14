#!/bin/bash
# Double-click on a Mac: generates one short test section (ch01/s00) with ElevenLabs.
cd "$(dirname "$0")" || exit 1
if ! command -v python3 >/dev/null; then echo "python3 is not installed. Run:  xcode-select --install   then try again."; read -n 1 -s -r -p "Press any key to close."; exit 1; fi
python3 make_audio.py --test
echo; read -n 1 -s -r -p "Press any key to close."

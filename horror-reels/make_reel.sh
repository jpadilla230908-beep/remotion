#!/usr/bin/env bash
# Pipeline completo: guion -> voces (Kokoro) -> subtítulos (Whisper) -> vídeo (Remotion)
# Uso: ./make_reel.sh stories/el-armario.json
set -euo pipefail
cd "$(dirname "$0")"
STORY="$1"
ID=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['id'])" "$STORY")
PY="${PYTHON:-/home/user/venv/bin/python}"          # Whisper
VOICE_PY="${VOICE_PYTHON:-/home/user/venv-qwen/bin/python}"  # Qwen3-TTS + Kokoro + Whisper (QA)
export REMOTION_BROWSER="${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
[ -x "$REMOTION_BROWSER" ] || unset REMOTION_BROWSER

echo "== 1/4 Efectos de sonido";   "$PY" scripts/sfx.py
echo "== 2/4 Voces (Qwen3-TTS)"; "$VOICE_PY" scripts/voices.py "$STORY"
echo "== 3/4 Subtítulos (Whisper)"; "$PY" scripts/captions.py "$ID" "${WHISPER_MODEL:-small}"
echo "== 4/4 Render (Remotion)"
mkdir -p out
npx remotion render HorrorReel "out/$ID.mp4" --props="{\"storyId\":\"$ID\"}"
echo "Listo: out/$ID.mp4"

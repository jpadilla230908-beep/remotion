"""Genera la pista de voz de una historia con Kokoro (TTS local, sin API).

Uso: python scripts/voices.py stories/el-armario.json

Salida en public/reels/<id>/:
  - scenes/<scene>.wav   voz procesada de cada escena
  - voice.wav            todas las escenas concatenadas con sus pausas
  - timeline.json        inicio/fin de cada escena (segundos)
  - story.json           copia de la historia para Remotion
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("MODELS_DIR", "/home/user/models")
SR = 24000
LEAD_IN = 0.5  # silencio inicial antes de la primera frase

# Cadenas de ffmpeg que dan carácter a cada tipo de voz
FX = {
    "narrador": f"asetrate={SR}*0.93,aresample={SR},atempo=1.075,"
    "aecho=0.8:0.5:70:0.18,bass=g=4,volume=1.2",
    "nina": f"asetrate={SR}*1.1,aresample={SR},atempo=0.91,aecho=0.8:0.4:50:0.12",
    "fantasma": f"asetrate={SR}*0.8,aresample={SR},atempo=1.1,"
    "aecho=0.8:0.75:110|260:0.5|0.3,tremolo=f=7:d=0.35,highpass=f=120,volume=1.6",
    "seco": "anull",
}


def apply_fx(samples: np.ndarray, fx: str) -> np.ndarray:
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, "in.wav"), os.path.join(tmp, "out.wav")
        sf.write(src, samples, SR)
        # pad final para que el eco no se corte
        chain = FX.get(fx, "anull") + ",apad=pad_dur=0.25"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", chain, "-ar", str(SR), "-ac", "1", dst],
            check=True,
        )
        out, _ = sf.read(dst, dtype="float32")
    return out


def main(story_path: str) -> None:
    story = json.load(open(story_path, encoding="utf-8"))
    out_dir = os.path.join(ROOT, "public", "reels", story["id"])
    os.makedirs(os.path.join(out_dir, "scenes"), exist_ok=True)

    kokoro = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))

    track = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    cursor = LEAD_IN
    timeline = []
    for scene in story["scenes"]:
        v = story["voices"][scene["speaker"]]
        samples, sr = kokoro.create(scene["text"], voice=v["voice"], speed=v.get("speed", 1.0), lang="es")
        assert sr == SR, sr
        samples = apply_fx(np.asarray(samples, dtype=np.float32), v.get("fx", "seco"))
        peak = float(np.max(np.abs(samples))) or 1.0
        samples = samples / peak * 0.9
        sf.write(os.path.join(out_dir, "scenes", f"{scene['id']}.wav"), samples, SR)

        speech = len(samples) / SR
        pause = float(scene.get("pauseAfter", 0.3))
        timeline.append(
            {"id": scene["id"], "start": round(cursor, 3), "speechEnd": round(cursor + speech, 3),
             "end": round(cursor + speech + pause, 3)}
        )
        track += [samples, np.zeros(int(pause * SR), dtype=np.float32)]
        cursor += speech + pause
        print(f"  {scene['id']:>4} [{scene['speaker']}] {speech:5.2f}s  {scene['text']}")

    sf.write(os.path.join(out_dir, "voice.wav"), np.concatenate(track), SR)
    json.dump({"duration": round(cursor, 3), "scenes": timeline}, open(os.path.join(out_dir, "timeline.json"), "w"), indent=1)
    shutil.copy(story_path, os.path.join(out_dir, "story.json"))
    print(f"Voz lista: {cursor:.1f}s -> {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1])

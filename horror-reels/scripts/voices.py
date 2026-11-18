"""Genera la pista de voz de una historia con TTS local (sin API).

Motores por voz ("engine" en story.voices):
  - "kokoro"     rápido, algo robótico
  - "chatterbox" Chatterbox Multilingual: voz humana, con control de dramatismo
                 ("exaggeration", "cfg", "temperature") y clonación opcional
                 desde un audio de referencia ("ref", ruta relativa al proyecto)

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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("MODELS_DIR", "/home/user/models")
SR = 24000
LEAD_IN = 0.5  # silencio inicial antes de la primera frase

# Cadenas de ffmpeg que dan carácter a cada tipo de voz
FX = {
    "narrador": f"asetrate={SR}*0.93,aresample={SR},atempo=1.075,"
    "aecho=0.8:0.5:70:0.18,bass=g=4,volume=1.2",
    "cuentacuentos": "aecho=0.8:0.4:60:0.14,bass=g=2,volume=1.1",
    "nina": f"asetrate={SR}*1.1,aresample={SR},atempo=0.91,aecho=0.8:0.4:50:0.12",
    # niña asustada: más aguda y con la voz temblorosa
    "nina_miedo": f"asetrate={SR}*1.1,aresample={SR},atempo=0.91,tremolo=f=8:d=0.3,"
    "vibrato=f=6:d=0.15,aecho=0.8:0.4:45:0.12,volume=1.2",
    "fantasma": f"asetrate={SR}*0.8,aresample={SR},atempo=1.1,"
    "aecho=0.8:0.75:110|260:0.5|0.3,tremolo=f=7:d=0.35,highpass=f=120,volume=1.6",
    "seco": "anull",
}


def apply_fx(samples: np.ndarray, fx: str, sr: int = SR) -> np.ndarray:
    with tempfile.TemporaryDirectory() as tmp:
        src, dst = os.path.join(tmp, "in.wav"), os.path.join(tmp, "out.wav")
        sf.write(src, samples, sr)
        # pad final para que el eco no se corte
        chain = f"aresample={SR}," + FX.get(fx, "anull") + ",apad=pad_dur=0.25"
        subprocess.run(
            ["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-af", chain, "-ar", str(SR), "-ac", "1", dst],
            check=True,
        )
        out, _ = sf.read(dst, dtype="float32")
    return out


_engines = {}


def synth(text: str, v: dict) -> tuple:
    """Devuelve (muestras float32, sample rate) según el motor de la voz."""
    engine = v.get("engine", "kokoro")
    if engine == "kokoro":
        if "kokoro" not in _engines:
            from kokoro_onnx import Kokoro

            _engines["kokoro"] = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
        samples, sr = _engines["kokoro"].create(text, voice=v["voice"], speed=v.get("speed", 1.0), lang="es")
        return np.asarray(samples, dtype=np.float32), sr
    if engine == "chatterbox":
        if "chatterbox" not in _engines:
            import torch
            from chatterbox.mtl_tts import ChatterboxMultilingualTTS

            torch.manual_seed(int(os.environ.get("TTS_SEED", "7")))
            _engines["chatterbox"] = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
        model = _engines["chatterbox"]
        ref = v.get("ref")
        wav = model.generate(
            text,
            language_id="es",
            audio_prompt_path=os.path.join(ROOT, ref) if ref else None,
            exaggeration=v.get("exaggeration", 0.5),
            cfg_weight=v.get("cfg", 0.5),
            temperature=v.get("temperature", 0.8),
        )
        return wav.squeeze(0).cpu().numpy().astype(np.float32), model.sr
    raise ValueError(f"Motor de voz desconocido: {engine}")


def main(story_path: str) -> None:
    story = json.load(open(story_path, encoding="utf-8"))
    out_dir = os.path.join(ROOT, "public", "reels", story["id"])
    os.makedirs(os.path.join(out_dir, "scenes"), exist_ok=True)

    track = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    cursor = LEAD_IN
    timeline = []
    for scene in story["scenes"]:
        v = story["voices"][scene["speaker"]]
        samples, sr = synth(scene["text"], v)
        samples = apply_fx(samples, v.get("fx", "seco"), sr)
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

"""Genera la pista de voz de una historia con TTS local (sin API).

Motores por voz ("engine" en story.voices):
  - "kokoro"     rápido, algo robótico
  - "chatterbox" Chatterbox Multilingual: control de dramatismo
                 ("exaggeration", "cfg", "temperature") y clonación desde "ref"
  - "qwen"       Qwen3-TTS (Apache 2.0), el más natural: clona la voz de "ref"
                 (una toma elegida en el casting) usando su texto, que está en
                 voices/refs.json. Necesita el entorno con qwen-tts.

Uso: python scripts/voices.py stories/el-armario.json

Salida en public/reels/<id>/:
  - scenes/<scene>.wav   voz procesada de cada escena
  - voice.wav            todas las escenas concatenadas con sus pausas
  - timeline.json        inicio/fin de cada escena (segundos)
  - story.json           copia de la historia para Remotion
"""
import json
import re
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
    "cuentacuentos": "aecho=0.8:0.3:40:0.06,bass=g=1.5",  # casi seco: suena más humano
    "nina": f"asetrate={SR}*1.1,aresample={SR},atempo=0.91,aecho=0.8:0.4:50:0.12",
    # niña asustada: más aguda y con la voz temblorosa
    "nina_miedo": f"asetrate={SR}*1.1,aresample={SR},atempo=0.91,tremolo=f=8:d=0.3,"
    "vibrato=f=6:d=0.15,aecho=0.8:0.4:45:0.12,volume=1.2",
    "fantasma": f"asetrate={SR}*0.8,aresample={SR},atempo=1.1,"
    "aecho=0.8:0.75:110|260:0.5|0.3,tremolo=f=7:d=0.35,highpass=f=120,volume=1.6",
    "seco": "anull",
    # para las voces de Qwen: solo un poco de sala y presencia, sin cambiar la voz
    "sala": "aecho=0.8:0.25:35:0.05,volume=1.1",
    # la radio responde con la propia voz de Tomás, pero algo más grave y rota
    "radio": f"highpass=f=350,lowpass=f=3000,asetrate={SR}*0.9,aresample={SR},atempo=1.11,"
    "acrusher=bits=8:mix=0.3,aecho=0.8:0.5:40|90:0.3|0.2,volume=1.8",
    # voz por teléfono: banda estrecha y algo comprimida
    "telefono": "atempo=0.85,highpass=f=400,lowpass=f=3200,acrusher=bits=10:mix=0.15,volume=1.6",
    # voz al otro lado de la puerta: amortiguada
    "tras_puerta": "atempo=0.85,lowpass=f=1400,aecho=0.8:0.4:25:0.3,volume=1.8",
    # la risa del teléfono que se vuelve otra cosa
    "risa_telefono": f"highpass=f=400,lowpass=f=3200,asetrate={SR}*0.86,aresample={SR},atempo=1.0,"
    "aecho=0.8:0.6:60|140:0.4|0.25,volume=1.8",
    # la imitadora con su voz real: grave, rota, con modulación metálica y eco
    "monstruo": "rubberband=pitch=0.68,tremolo=f=38:d=0.65,flanger=delay=4:depth=6:speed=0.4,"
    "acrusher=bits=7:mix=0.35,aecho=0.8:0.7:80|170:0.45|0.3,highpass=f=70,lowpass=f=5000,volume=2.2",
    "fantasma_sala": "aecho=0.8:0.6:90|200:0.35|0.2,highpass=f=100,volume=1.3",
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


def synth(text: str, v: dict, intensity: float = 0.0) -> tuple:
    """Devuelve (muestras float32, sample rate) según el motor de la voz.
    `intensity` (0..1, por escena) sube el dramatismo y hace la lectura más pausada."""
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
            exaggeration=v.get("exaggeration", 0.5) + 0.45 * intensity,
            cfg_weight=max(0.25, v.get("cfg", 0.5) - 0.2 * intensity),
            temperature=v.get("temperature", 0.8),
        )
        return wav.squeeze(0).cpu().numpy().astype(np.float32), model.sr
    if engine == "qwen":
        import torch

        if "qwen" not in _engines:
            from qwen_tts import Qwen3TTSModel

            _engines["qwen"] = Qwen3TTSModel.from_pretrained(
                os.environ.get("QWEN_MODEL", "Qwen/Qwen3-TTS-12Hz-1.7B-Base"), device_map="cpu", dtype=torch.float32
            )
            _engines["qwen_prompts"] = {}
        model, prompts = _engines["qwen"], _engines["qwen_prompts"]
        ref = v["ref"]
        if ref not in prompts:
            ref_text = json.load(open(os.path.join(ROOT, "voices", "refs.json"), encoding="utf-8"))[os.path.basename(ref)]
            prompts[ref] = model.create_voice_clone_prompt(ref_audio=os.path.join(ROOT, ref), ref_text=ref_text)
        wavs, sr = model.generate_voice_clone(
            text=text, language="Spanish", voice_clone_prompt=prompts[ref],
            **({"temperature": v["temperature"]} if "temperature" in v else {}),
        )
        return np.asarray(wavs[0], dtype=np.float32), sr
    raise ValueError(f"Motor de voz desconocido: {engine}")


def _norm(t: str) -> str:
    """Texto comparable: números en letras, sin tildes ni signos, k→c."""
    import unicodedata

    from num2words import num2words

    t = re.sub(r"\d+", lambda m: " " + num2words(int(m.group()), lang="es") + " ", t.lower())
    t = "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")
    return " ".join(re.sub(r"[^a-zñ ]", " ", t.replace("k", "c")).split())


def checked(text: str, v: dict, intensity: float, tries: int = 3) -> tuple:
    """Genera con Chatterbox o Qwen y comprueba con Whisper que dice el texto.
    Si no coincide, reintenta con otra semilla y se queda la mejor toma."""
    if v.get("engine") not in ("chatterbox", "qwen") or not v.get("qa", True) or os.environ.get("VOICE_QA", "1") == "0":
        return synth(text, v, intensity)
    import difflib

    import torch
    import whisper

    if "whisper" not in _engines:
        _engines["whisper"] = whisper.load_model("small", download_root=os.path.join(MODELS, "whisper"))
    best = None
    for k in range(tries):
        torch.manual_seed(int(os.environ.get("TTS_SEED", "7")) + k)
        samples, sr = synth(text, v, intensity)
        audio16 = whisper.audio.resample(torch.from_numpy(samples), sr, 16000).numpy() if hasattr(whisper.audio, "resample") else None
        if audio16 is None:
            import librosa

            audio16 = librosa.resample(samples, orig_sr=sr, target_sr=16000)
        heard = _engines["whisper"].transcribe(audio16.astype(np.float32), language="es", fp16=False)["text"]
        score = difflib.SequenceMatcher(a=_norm(text), b=_norm(heard), autojunk=False).ratio()
        if best is None or score > best[0]:
            best = (score, samples, sr)
        print(f"      toma {k + 1}: {score:.2f}  {heard.strip()}")
        if score >= 0.9:
            break
    return best[1], best[2]


def speak(text: str, v: dict, intensity: float, beat_pause: float) -> tuple:
    """Parte la frase en "golpes" por los puntos suspensivos y mete silencios
    reales entre ellos, como un cuentacuentos."""
    beats = [b.strip() for b in re.split(r"(?<=\.\.\.)\s+", text) if b.strip()] if v.get("beats") else [text]
    # Chatterbox se inventa cosas con fragmentos muy cortos: los uno al siguiente
    merged = []
    for b in beats:
        if merged and len(merged[-1].split()) < 3:
            merged[-1] += " " + b
        else:
            merged.append(b)
    if len(merged) > 1 and len(merged[-1].split()) < 3:
        tail = merged.pop()
        merged[-1] += " " + tail
    out, sr = [], SR
    for i, b in enumerate(merged):
        samples, sr = checked(b, v, intensity)
        out.append(samples)
        if i < len(merged) - 1:
            out.append(np.zeros(int(beat_pause * sr), dtype=np.float32))
    return np.concatenate(out), sr


def main(story_path: str) -> None:
    story = json.load(open(story_path, encoding="utf-8"))
    out_dir = os.path.join(ROOT, "public", "reels", story["id"])
    os.makedirs(os.path.join(out_dir, "scenes"), exist_ok=True)

    track = [np.zeros(int(LEAD_IN * SR), dtype=np.float32)]
    cursor = LEAD_IN
    timeline = []
    for scene in story["scenes"]:
        v = story["voices"][scene["speaker"]]
        wav_path = os.path.join(out_dir, "scenes", f"{scene['id']}.wav")
        # caché: si el texto y la voz no cambiaron, reutiliza la toma anterior
        key = json.dumps([scene["text"], v, scene.get("intensity"), scene.get("beatPause"), FX.get(v.get("fx", "seco"))],
                         ensure_ascii=False, sort_keys=True)
        key_path = wav_path[:-4] + ".key"
        if os.path.exists(wav_path) and os.path.exists(key_path) and open(key_path, encoding="utf-8").read() == key:
            samples, _ = sf.read(wav_path, dtype="float32")
        else:
            samples, sr = speak(scene["text"], v, float(scene.get("intensity", 0)), float(scene.get("beatPause", 0.45)))
            samples = apply_fx(samples, v.get("fx", "seco"), sr)
            peak = float(np.max(np.abs(samples))) or 1.0
            samples = samples / peak * 0.9
            sf.write(wav_path, samples, SR)
            open(key_path, "w", encoding="utf-8").write(key)

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

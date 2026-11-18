"""Subtítulos palabra a palabra con Whisper (local).

Uso: python scripts/captions.py <story-id> [modelo]

Transcribe cada escena por separado (con el guion como pista para que acierte
la ortografía) y desplaza los tiempos según timeline.json.
Salida: public/reels/<id>/captions.json -> [{text, start, end, scene}]
"""
import difflib
import json
import os
import re
import sys

import whisper

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = os.environ.get("MODELS_DIR", "/home/user/models")


def norm(w: str) -> str:
    return re.sub(r"[^\wáéíóúñü]", "", w.lower())


def align(script: str, heard: list, total: float) -> list:
    """Texto del guion + tiempos de Whisper. Las palabras que Whisper no oyó
    se interpolan entre sus vecinas."""
    tokens = script.split()
    times = [None] * len(tokens)
    sm = difflib.SequenceMatcher(a=[norm(t) for t in tokens], b=[norm(h["word"]) for h in heard], autojunk=False)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            times[a + k] = (heard[b + k]["start"], heard[b + k]["end"])
    # anclas para interpolar
    known = [(-1, (0.0, 0.0))] + [(i, t) for i, t in enumerate(times) if t] + [(len(tokens), (total, total))]
    for (i0, t0), (i1, t1) in zip(known, known[1:]):
        gap = i1 - i0
        for k in range(1, gap):
            a = t0[1] + (t1[0] - t0[1]) * (k - 1) / (gap - 1)
            b = t0[1] + (t1[0] - t0[1]) * k / (gap - 1)
            times[i0 + k] = (a, b)
    return [(tok, s, e) for tok, (s, e) in zip(tokens, times)]


def transcribe(model, path, prompt):
    kw = dict(language="es", word_timestamps=True, condition_on_previous_text=False, fp16=False)
    res = model.transcribe(path, initial_prompt=prompt, **kw)
    words = [w for seg in res["segments"] for w in seg.get("words", [])]
    return res, words


def main(story_id: str, model_name: str = "small") -> None:
    reel = os.path.join(ROOT, "public", "reels", story_id)
    story = json.load(open(os.path.join(reel, "story.json"), encoding="utf-8"))
    timeline = {s["id"]: s for s in json.load(open(os.path.join(reel, "timeline.json")))["scenes"]}
    model = whisper.load_model(model_name, download_root=os.path.join(MODELS, "whisper"))

    words = []
    for scene in story["scenes"]:
        t = timeline[scene["id"]]
        path = os.path.join(reel, "scenes", f"{scene['id']}.wav")
        result, heard = transcribe(model, path, scene["text"])
        if len(heard) < 0.7 * len(scene["text"].split()):
            # a veces el prompt hace que Whisper se salte frases: reintento sin él
            result, heard = transcribe(model, path, None)
        total = t["speechEnd"] - t["start"]
        for tok, s, e in align(scene["text"], heard, total):
            words.append({"text": tok, "start": round(t["start"] + s, 3), "end": round(t["start"] + e, 3), "scene": scene["id"]})
        print(f"  {scene['id']:>4}: oído={result['text'].strip()!r} ({len(heard)} palabras)")

    json.dump(words, open(os.path.join(reel, "captions.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(words)} palabras -> captions.json")


if __name__ == "__main__":
    main(*sys.argv[1:])

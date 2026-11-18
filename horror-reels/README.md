# Horror Reels 🕯️

Reels verticales (1080×1920) de **historias de terror animadas en 2D** con personajes.

| Paso | Herramienta | Qué hace |
|------|-------------|----------|
| Voces | **Kokoro** (TTS local) + ffmpeg | Una voz por personaje, con efectos (narrador grave, niña, fantasma con eco) |
| Subtítulos | **Whisper** (repo `whisper`, modelo `small`) | Tiempos palabra a palabra; el texto sale del guion |
| SFX | `scripts/sfx.py` | Drone, golpes, crujido, latido y golpe de susto sintetizados |
| Animación | **Remotion** | Sets SVG, personajes con parpadeo, miedo y lip-sync, cámara, grano, susto final |

> ElevenLabs queda fuera del piloto. Para cambiar de motor de voz basta con sustituir `scripts/voices.py`.

## Uso

```bash
./make_reel.sh stories/el-armario.json   # -> out/el-armario.mp4
npm run studio                           # previsualizar en Remotion Studio
```

Requisitos: un entorno virtual de Python con `openai-whisper` (`pip install -e ../../whisper`), `kokoro-onnx` y `soundfile`, y los modelos en `$MODELS_DIR` (por defecto `/home/user/models`): `kokoro-v1.0.onnx` y `voices-v1.0.bin`, que se descargan de las releases de GitHub de `thewh1teagle/kokoro-onnx`.

## Escribir una historia nueva

Copia `stories/el-armario.json`. Cada escena tiene:

- `set`: `bedroom` | `hallway` | `closet` | `underbed` | `black`
- `speaker`: una clave de `voices` (voces de Kokoro en español: `em_alex`, `em_santa`, `ef_dora`)
- `camera`: `zoomIn` | `slowZoomIn` | `shake` | `closeKid` | `panCloset` | `dolly` | `jumpscare` | `none`
- `kid`: `{x, mood: normal|scared|hiding, look}` · `ghost`: `{where: closet|underbed}` · `closet`: 0..1 (apertura)
- `sfx`: `knock` | `creak` | `heartbeat` | `sting` · `clock`, `showTitle`, `pauseAfter`

El susto (`camera: "jumpscare"`) cae justo al terminar la frase de esa escena.

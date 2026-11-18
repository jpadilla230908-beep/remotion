# Horror Reels 🕯️

Reels verticales (1080×1920) de **historias de terror animadas en 2D** con personajes.

| Paso | Herramienta | Qué hace |
|------|-------------|----------|
| Voces | **Chatterbox Multilingual** (narrador) y **Kokoro** (personajes) + ffmpeg | Narrador humano y grave con dramatismo; niña y fantasma con efectos |
| Subtítulos | **Whisper** (repo `whisper`, modelo `small`) | Tiempos palabra a palabra; el texto sale del guion |
| SFX | `scripts/sfx.py` | Drone, golpes, crujido, latido y golpe de susto sintetizados |
| Animación | **Remotion** | Sets SVG, personajes con parpadeo, miedo y lip-sync, cámara, grano, susto final |

> ElevenLabs queda fuera del piloto: todo el TTS es local y gratuito.

### Voces

Cada voz de `story.voices` elige motor con `engine`:

- `"chatterbox"`: Chatterbox Multilingual (MIT). Es natural, imita el timbre de `ref` (unos 10 s de audio) y admite `exaggeration` (0.5 = neutro, 0.7 = dramático), `cfg` (más bajo = más pausado) y `temperature`. Sin GPU tarda unos 30 s por frase.
- `"kokoro"`: rápido, pero más robótico. Usa `voice` (`em_alex`, `em_santa`, `ef_dora`) y `speed`.

`voices/narrador.wav` es la voz real de un lector humano de LibriVox (CC BY 4.0, ver `voices/CREDITS.md`). Una referencia humana es la clave para que la voz no suene a IA. `voices/nina.wav` sigue siendo sintética.

## Uso

```bash
./make_reel.sh stories/el-armario.json   # -> out/el-armario.mp4
npm run studio                           # previsualizar en Remotion Studio
```

Requisitos: dos entornos virtuales de Python. `/home/user/venv` lleva Whisper (`pip install -e ../../whisper`). `/home/user/venv-cb` lleva `torch==2.6.0 torchaudio==2.6.0` desde el índice de PyTorch para CPU, más `chatterbox-tts kokoro-onnx soundfile`. Además necesitas los modelos en `$MODELS_DIR` (por defecto `/home/user/models`): `kokoro-v1.0.onnx` y `voices-v1.0.bin`, que se descargan de las releases de GitHub de `thewh1teagle/kokoro-onnx`.

## Escribir una historia nueva

Copia `stories/el-armario.json`. Cada escena tiene:

- `set`: `bedroom` | `hallway` | `closet` | `underbed` | `black`
- `speaker`: una clave de `voices` (voces de Kokoro en español: `em_alex`, `em_santa`, `ef_dora`)
- `camera`: `zoomIn` | `slowZoomIn` | `shake` | `closeKid` | `panCloset` | `dolly` | `jumpscare` | `none`
- `kid`: `{x, mood: normal|scared|hiding, look}` · `ghost`: `{where: closet|underbed}` · `closet`: 0..1 (apertura)
- `sfx`: `knock` | `creak` | `heartbeat` | `sting` · `clock`, `showTitle`, `pauseAfter`
- `intensity` (0..1): dramatismo de la escena con Chatterbox (sube `exaggeration`, baja `cfg`). Con `"beats": true` en la voz, cada `...` del texto se convierte en una pausa real (`beatPause`, 0.45 s por defecto)

El susto (`camera: "jumpscare"`) cae justo al terminar la frase de esa escena.

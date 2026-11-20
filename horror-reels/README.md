# Horror Reels 🕯️

Reels verticales (1080×1920) de **historias de terror animadas en 2D** con personajes.

| Paso | Herramienta | Qué hace |
|------|-------------|----------|
| Voces | **Qwen3-TTS** (Alibaba, Apache 2.0) + ffmpeg | Narrador, Lucía y fantasma clonados de voces diseñadas y elegidas en un casting; Whisper revisa cada frase |
| Subtítulos | **Whisper** (repo `whisper`, modelo `small`) | Tiempos palabra a palabra; el texto sale del guion |
| SFX | `scripts/sfx.py` + `public/audio/scream.wav` | Ambiente, golpes, crujido y latido sintetizados; grito real CC0 diseñado por capas para el susto (ver `public/audio/CREDITS.md`) |
| Animación | **Remotion** | Sets SVG, personajes con parpadeo, miedo y lip-sync, cámara, grano, susto final |

> ElevenLabs queda fuera del piloto: todo el TTS es local y gratuito.

### Voces

Cada voz de `story.voices` elige motor con `engine`:

- `"qwen"` (el que se usa ahora): Qwen3-TTS Base clona la voz de `ref`, una toma de `voices/` cuyo texto está en `voices/refs.json`. Es el más natural de los que probamos. Sin GPU tarda alrededor de 1 minuto por frase.
- `"chatterbox"`: Chatterbox Multilingual (MIT). Admite `exaggeration`, `cfg` e `intensity` por escena.
- `"kokoro"`: muy rápido, pero suena robótico.

Whisper comprueba cada frase de Qwen y Chatterbox, y si no coincide con el guion la vuelve a generar con otra semilla (`"qa": false` lo desactiva). Para crear voces nuevas: diseña una toma con Qwen3-TTS VoiceDesign describiéndola en texto, guárdala en `voices/` y añade su texto a `refs.json`. Más detalles en `voices/CREDITS.md`.

## Historias

| Historia | Archivo | Personajes y escenarios |
|---|---|---|
| No abras el armario | `stories/el-armario.json` | Lucía, el fantasma · dormitorio, pasillo, armario, debajo de la cama |
| La llamada de las 3:33 | `stories/la-llamada.json` | Valeria (variante de la niña, con teléfono), su mamá y la imitadora · dormitorio, pasillo con pies bajo la puerta, susto en el pasillo |
| Algo te observa | `stories/algo-te-observa.json` | Tomás el guardabosques, la criatura · bosque, sendero con linterna, cabaña, ventana, susto en la cabaña |

Escenarios disponibles en `set`: `bedroom`, `hallway`, `closet`, `underbed`, `forest`, `forestPath`, `cabin`, `cabinWindow`, `cabinScare`, `black`. Para el bosque, una escena admite `ranger: {x, mood: normal|scared, look, flashlight}`, `creature: {where: far|bushes|dark}` y `handprint: true`. Sonidos: `knock`, `creak`, `heartbeat`, `snap` (rama), `static` (radio), `scream` y `scream_creature`.

## Uso

```bash
./make_reel.sh stories/el-armario.json   # -> out/el-armario.mp4
npm run studio                           # previsualizar en Remotion Studio
```

Requisitos: `/home/user/venv` con Whisper (`pip install -e ../../whisper`) para los subtítulos, y `/home/user/venv-qwen` para las voces: `torch torchaudio` desde el índice de PyTorch para CPU, más `qwen-tts kokoro-onnx soundfile num2words` y `-e ../../whisper`. También hace falta el programa `sox` (`apt-get install sox`). Chatterbox es opcional y va en su propio entorno (`torch==2.6.0`), porque necesita otra versión de transformers. Además necesitas los modelos en `$MODELS_DIR` (por defecto `/home/user/models`): `kokoro-v1.0.onnx` y `voices-v1.0.bin`, que se descargan de las releases de GitHub de `thewh1teagle/kokoro-onnx`.

## Portada

`src/Cover.tsx` (composición `Portada`) genera una portada vertical de 1080×1920 con el dormitorio, Lucía y el armario. Las palabras entre `*asteriscos*` salen en rojo:

```bash
npx remotion still Portada out/portadas/portada.png --props='{"lines":["Si escuchas","3 golpes...","*No abras*"],"tag":"Historia de terror animada"}'
```

## Escribir una historia nueva

Copia `stories/el-armario.json`. Cada escena tiene:

- `set`: `bedroom` | `hallway` | `closet` | `underbed` | `black`
- `speaker`: una clave de `voices` (voces de Kokoro en español: `em_alex`, `em_santa`, `ef_dora`)
- `camera`: `zoomIn` | `slowZoomIn` | `shake` | `closeKid` | `panCloset` | `dolly` | `jumpscare` | `none`
- `kid`: `{x, mood: normal|scared|hiding|sleeping, look, wakeAt}`. Con `wakeAt` (segundos) la niña duerme hasta ese momento y se despierta de un salto · `ghost`: `{where: closet|underbed}` · `closet`: 0..1 (apertura)
- `sfx`: `knock` | `creak` | `heartbeat` | `sting` · `clock`, `showTitle`, `pauseAfter`
- `hitDelay` (susto): segundos de silencio entre el final de la frase y el golpe. Con `"sfx": "scream"` suena el grito de `public/audio/scream.wav`, alineado con el golpe visual, y el ambiente se apaga justo antes
- `tempo` (p. ej. 0.88): ralentiza la voz de esa escena sin cambiar el tono · `pauses`: `[{"after": "venía", "occurrence": 2, "sec": 0.6}]` mete un silencio real después de esa palabra (Whisper encuentra dónde acaba)
- `intensity` (0..1): dramatismo de la escena con Chatterbox (sube `exaggeration`, baja `cfg`). Con `"beats": true` en la voz, cada `...` del texto se convierte en una pausa real (`beatPause`, 0.45 s por defecto)

El susto (`camera: "jumpscare"`) cae justo al terminar la frase de esa escena.

# Voces de referencia

Las tres voces se diseñaron con **Qwen3-TTS VoiceDesign 1.7B** (Alibaba, licencia Apache 2.0) a partir de una
descripción escrita, y se eligieron en el casting. El pipeline las clona con **Qwen3-TTS Base 1.7B** para que
cada personaje mantenga la misma voz en todas las frases. El texto de cada toma está en `refs.json`.

| Archivo | Personaje | Descripción usada |
|---|---|---|
| `narrador.wav` | Narrador (casting N3) | Locutor maduro de un programa de terror nocturno: barítono profundo, cálido y seguro, dicción clara, crea suspenso. Acento latinoamericano neutro. |
| `nina.wav` | Lucía (casting G5) | Niña real de 8 años grabada en su cuarto de noche: voz infantil natural, asustada e insegura, algo temblorosa. Acento latinoamericano neutro. |
| `fantasma.wav` | Fantasma | Niña fantasma de unos 10 años: susurro hueco y aireado, calma fría e inquietante, algo cantarina. |
- `tomas.wav`: Tomás, el guardabosques. Diseñada con Qwen3-TTS VoiceDesign: hombre de unos 45 años, voz media-grave algo áspera, inquieto. La radio de «Algo te observa» usa esta misma voz, distorsionada.
- `valeria.wav`: Valeria, de 12 años («La llamada de las 3:33»). Opción V7 del casting de voz: diseñada con Qwen3-TTS VoiceDesign pidiendo una niña mexicana nativa de 12 años, de Ciudad de México, con acento mexicano natural y nada de acento extranjero.
- `mama.wav`: la mamá de Valeria. Diseñada con Qwen3-TTS VoiceDesign. Se usa con tres efectos: por teléfono, detrás de la puerta y la risa.

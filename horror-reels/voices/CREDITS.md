# Voces de referencia

Las tres voces se diseñaron con **Qwen3-TTS VoiceDesign 1.7B** (Alibaba, licencia Apache 2.0) a partir de una
descripción escrita, y se eligieron en el casting. El pipeline las clona con **Qwen3-TTS Base 1.7B** para que
cada personaje mantenga la misma voz en todas las frases. El texto de cada toma está en `refs.json`.

| Archivo | Personaje | Descripción usada |
|---|---|---|
| `narrador.wav` | Narrador (casting N3) | Locutor maduro de un programa de terror nocturno: barítono profundo, cálido y seguro, dicción clara, crea suspenso. Acento latinoamericano neutro. |
| `nina.wav` | Lucía (casting G5) | Niña real de 8 años grabada en su cuarto de noche: voz infantil natural, asustada e insegura, algo temblorosa. Acento latinoamericano neutro. |
| `fantasma.wav` | Fantasma | Niña fantasma de unos 10 años: susurro hueco y aireado, calma fría e inquietante, algo cantarina. |

"""Sintetiza los efectos de sonido de terror (sin descargar nada).

Uso: python scripts/sfx.py  -> public/sfx/{drone,knock,creak,sting,heartbeat}.wav
"""
import os

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
rng = np.random.default_rng(13)


def t(sec):
    return np.arange(int(sec * SR)) / SR


def brown(n):
    x = np.cumsum(rng.standard_normal(n))
    x -= np.convolve(x, np.ones(2000) / 2000, mode="same")  # quita la deriva
    return x / (np.max(np.abs(x)) + 1e-9)


def env(n, a, r):
    e = np.ones(n)
    ai, ri = int(a * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai)
    e[-ri:] *= np.linspace(1, 0, ri)
    return e


def norm(x, peak=0.9):
    return (x / (np.max(np.abs(x)) + 1e-9) * peak).astype(np.float32)


def drone(sec=30):
    x = t(sec)
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * x)
    tone = (np.sin(2 * np.pi * 55 * x) + 0.6 * np.sin(2 * np.pi * 58.3 * x)
            + 0.3 * np.sin(2 * np.pi * 110.7 * x)) * lfo
    wind = brown(len(x)) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * x + 1))
    out = norm(tone * 0.6 + wind * 0.5, 0.7)
    fade = int(2 * SR)  # bucle sin cortes
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out


def knock_once():
    x = t(0.25)
    body = np.sin(2 * np.pi * 90 * x * (1 - 0.4 * x)) * np.exp(-x * 28)
    click = rng.standard_normal(len(x)) * np.exp(-x * 120) * 0.4
    return body + click


def knock():
    out = np.zeros(int(2.2 * SR))
    for i, at in enumerate([0.0, 0.55, 1.1]):
        k = knock_once()
        s = int(at * SR)
        out[s:s + len(k)] += k
    return norm(out)


def creak(sec=1.6):
    x = t(sec)
    f = 140 + 60 * np.sin(2 * np.pi * 0.6 * x) + 20 * rng.standard_normal(len(x)).cumsum() / SR
    phase = 2 * np.pi * np.cumsum(f) / SR
    saw = 2 * ((phase / (2 * np.pi)) % 1) - 1
    grain = (rng.random(len(x)) < 0.02) * 1.0
    return norm((saw * 0.5 + np.convolve(grain, np.hanning(200), "same")) * env(len(x), 0.1, 0.4), 0.6)


def sting(sec=2.5):
    x = t(sec)
    cluster = sum(np.sin(2 * np.pi * f * x) for f in [233, 247, 262, 466, 494, 523, 698])
    screech = np.sin(2 * np.pi * (1800 + 900 * np.sin(2 * np.pi * 9 * x)) * x)
    hit = brown(len(x)) * np.exp(-x * 6) * 2
    sub = np.sin(2 * np.pi * 45 * x) * np.exp(-x * 2) * 1.5
    e = np.exp(-x * 1.6)
    return norm((cluster * 0.25 + screech * 0.25) * e + hit + sub)


def heartbeat(sec=2.0):
    out = np.zeros(int(sec * SR))
    for at in [0.0, 0.28, 1.0, 1.28]:
        x = t(0.2)
        b = np.sin(2 * np.pi * 50 * x) * np.exp(-x * 30)
        s = int(at * SR)
        out[s:s + len(b)] += b
    return norm(out)


def snap(sec=0.9):
    """Rama que cruje: chasquidos secos y un crujido de madera."""
    out = np.zeros(int(sec * SR))
    for at, g in [(0.0, 1.0), (0.05, 0.6), (0.11, 0.8), (0.2, 0.4)]:
        x = t(0.08)
        c = rng.standard_normal(len(x)) * np.exp(-x * 90) * g
        c = np.convolve(c, [1, -0.9], "same")
        s = int(at * SR)
        out[s:s + len(c)] += c
    x = t(sec)
    out += np.sin(2 * np.pi * 180 * x * (1 + rng.standard_normal(len(x)).cumsum() / SR * 0.2)) * np.exp(-x * 9) * 0.25
    return norm(out)


def static(sec=1.2):
    """Estática de radio con cortes."""
    x = t(sec)
    n = rng.standard_normal(len(x))
    gate = (np.sin(2 * np.pi * 7 * x) > -0.3).astype(float) * 0.7 + 0.3
    band = np.convolve(n, np.hanning(9), "same")
    return norm(band * gate * env(len(x), 0.02, 0.3), 0.6)


def ring(sec=2.6):
    """Tono de llamada de móvil: dos pitidos repetidos con vibración."""
    out = np.zeros(int(sec * SR))
    for at in [0.0, 0.35, 1.3, 1.65]:
        x = t(0.25)
        b = (np.sin(2 * np.pi * 880 * x) + 0.5 * np.sin(2 * np.pi * 1320 * x)) * env(len(x), 0.01, 0.05)
        s = int(at * SR)
        out[s:s + len(b)] += b * 0.6
    x = t(sec)
    buzz = np.sin(2 * np.pi * 150 * x) * (np.sin(2 * np.pi * 2 * x) > 0) * 0.25
    return norm(out + buzz, 0.7)


if __name__ == "__main__":
    d = os.path.join(ROOT, "public", "sfx")
    os.makedirs(d, exist_ok=True)
    for name, fn in [("drone", drone), ("knock", knock), ("creak", creak), ("sting", sting), ("heartbeat", heartbeat), ("snap", snap), ("static", static), ("ring", ring)]:
        sf.write(os.path.join(d, f"{name}.wav"), fn(), SR)
        print("sfx:", name)

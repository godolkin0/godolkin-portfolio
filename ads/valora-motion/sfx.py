"""Sound effects for the Valora motion ad, synthesised with numpy, written as 48 kHz stereo WAV.

Times are in scene time; everything from 7.0 s on is shifted 0.3 s earlier, like the video (SH).
"""
import sys, wave
import numpy as np

SR, DUR, SH = 48000, 35.7, 0.3
rng = np.random.default_rng(7)
mix = np.zeros((int(SR * DUR) + SR, 2))


def tt(d):
    return np.arange(int(SR * d)) / SR


def add(t, sig, gain=1.0, pan=0.0):
    if t >= 7.0:
        t -= SH
    i = int(t * SR)
    sig = sig[: len(mix) - i] * gain
    mix[i:i + len(sig), 0] += sig * np.sqrt((1 - pan) / 2)
    mix[i:i + len(sig), 1] += sig * np.sqrt((1 + pan) / 2)


def onepole(x, fc):
    """Low-pass with a per-sample cutoff (scalar or array)."""
    fc = np.broadcast_to(fc, x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y, prev = np.empty_like(x), 0.0
    for n in range(len(x)):
        prev = (1 - a[n]) * x[n] + a[n] * prev
        y[n] = prev
    return y


def sine_sweep(f0, f1, d, curve=4.0):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-curve * t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def pop(f0=900, f1=280, d=.11):
    return sine_sweep(f0, f1, d, 6) * np.exp(-tt(d) * 38) * .7


def click():
    n = rng.standard_normal(int(SR * .014))
    n = n - onepole(n, 2500)
    return n * np.exp(-tt(.014) * 420) * .5


def tick(f=2900):
    return (np.sin(2 * np.pi * f * tt(.03)) * .5 + rng.standard_normal(int(SR * .03)) * .15) * np.exp(-tt(.03) * 160)


def whoosh(d=.5, f0=400, f1=4000, g=.5):
    n = rng.standard_normal(int(SR * d))
    t = tt(d) / d
    fc = f0 * (f1 / f0) ** np.sin(np.pi * t * .5)
    y = onepole(n, fc) - onepole(n, fc * .25)
    env = np.sin(np.pi * t) ** 1.6
    return y * env * g


def bell(f=1318.5, d=1.2, g=.35):
    t = tt(d)
    parts = [(1, 1, 3.2), (2.0, .45, 5), (2.76, .25, 7), (5.4, .12, 11)]
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in parts)
    return y * np.minimum(1, t * 400) * g


def hit(d=.9, g=.9):
    t = tt(d)
    body = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 18)) / SR) * np.exp(-t * 4.5)
    n = rng.standard_normal(len(t))
    trans = onepole(n, 1800) * np.exp(-t * 40) * 1.6
    return np.tanh((body + trans) * 1.4) * g


def chomp():
    d = .16
    t = tt(d)
    n = rng.standard_normal(len(t))
    crunch = (onepole(n, 3000) - onepole(n, 600)) * np.exp(-t * 26) * (rng.random(len(t)) > .55) * 2.2
    thump = np.sin(2 * np.pi * np.cumsum(90 + 120 * np.exp(-t * 40)) / SR) * np.exp(-t * 22)
    return (crunch + thump) * .6


def knock():
    d = .09
    t = tt(d)
    return (np.sin(2 * np.pi * 210 * t) + .5 * np.sin(2 * np.pi * 470 * t)) * np.exp(-t * 55) * .55


def riser(d=.7, g=.45):
    n = rng.standard_normal(int(SR * d))
    t = tt(d) / d
    y = onepole(n, 300 + 5000 * t ** 2) - onepole(n, 150 + 1500 * t ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(220 + 660 * t ** 2) / SR) * .25
    return (y + tone) * t ** 2.2 * g


def sparkle(d=.7):
    y = np.zeros(int(SR * d))
    for k in range(9):
        s = int(rng.random() * (d - .15) * SR)
        f = 2600 + rng.random() * 2600
        b = np.sin(2 * np.pi * f * tt(.15)) * np.exp(-tt(.15) * 30)
        y[s:s + len(b)] += b * .18
    return y


def chime(root=1046.5, g=.3):
    y = np.zeros(int(SR * 1.6))
    for i, r in enumerate((1, 1.26, 1.5, 2.0)):
        b = bell(root * r, 1.3, g)
        y[int(i * .07 * SR):int(i * .07 * SR) + len(b)] += b
    return y


# --- S1: the leak (no shift)
add(0.0, hit(.8, .55))
add(.12, pop(500, 180, .14), .8)
add(.5, pop(450, 170, .12), .5)
for a in (1.3, 2.7, 4.1):
    add(a, chomp(), 1.0, .2)
    add(a + .03, whoosh(.32, 900, 5000, .25), 1, -.3)
    add(a + .15, pop(1200, 500, .08), .5, .4)
add(5.3, tick(2200), .8)
add(5.6, hit(1.0, .85))
# --- S2: night
add(7.0, whoosh(.6, 300, 2500, .55))
add(7.15, pop(700, 300, .1), .7)
add(7.75, pop(1500, 900, .08), .6)
for i, x in enumerate(np.linspace(7.6, 8.55, 12)):
    add(x, tick(3200 if i % 2 else 2600), .55, .25 if i % 2 else -.25)
add(8.6, bell(1760, .9, .25))
add(9.0, bell(392, 1.6, .25))
add(9.4, hit(.9, .6))
# --- S3: brand
add(9.95, riser(.65, .5))
add(10.6, whoosh(.45, 600, 6000, .45))
add(10.95, hit(.7, .55))
add(10.97, chime(1046.5, .22))
add(11.55, pop(900, 350, .1), .6)
# --- S4: the form
add(12.25, whoosh(.5, 300, 3000, .45))
for s, a, b in (('Marco Rossi', 12.7, 13.1), ('Via Roma 10, Milano', 13.2, 13.85), ('marco@esempio.it', 13.95, 14.4)):
    for k in range(len(s)):
        add(a + (b - a) * (k + .5) / len(s), click(), .35 + .3 * rng.random(), rng.uniform(-.3, .3))
add(14.6, knock(), .9)
add(14.75, whoosh(.3, 1200, 6000, .25))
for x in np.arange(15.45, 16.35, .075):
    add(x, tick(3000), .35)
add(15.6, chime(1318.5, .2))
# --- S5: the lead
add(18.0, whoosh(.5, 300, 3000, .45))
add(18.4, bell(1318.5, 1.0, .3))
add(18.55, bell(1760, 1.1, .28))
add(19.75, knock(), 1.0, -.2)
add(20.15, knock(), 1.0, .2)
for i in range(4):
    add(20.9 + i * .14, pop(800 + i * 150, 350, .09), .6, -.45 + i * .3)
# --- S6: trust
add(22.6, whoosh(.5, 300, 3000, .45))
for i in range(3):
    add(23.5 + i * .45, whoosh(.35, 1500, 6000, .25), 1, .5)
    add(23.95 + i * .45, pop(1100 + i * 120, 600, .08), .55)
# --- S7: morning
add(27.0, whoosh(.5, 300, 3000, .45))
add(27.4, whoosh(.4, 800, 4000, .25))
for i in range(3):
    add(28.05 + i * .28, bell(1568 + i * 200, .8, .2), 1, -.3 + i * .3)
add(29.0, chime(784, .16))
# --- S8: end
add(30.8, whoosh(.6, 300, 2500, .5))
add(31.4, hit(.9, .6))
add(32.45, riser(.55, .45))
add(33.0, hit(.9, .7))
add(33.02, chime(1046.5, .26))
add(33.7, pop(700, 280, .12), .8)
add(34.1, sparkle(.7), 1)

# small room: exponentially decaying noise IR, mixed in lightly
ir = rng.standard_normal(int(SR * .7)) * np.exp(-tt(.7) * 7)
ir /= np.sqrt((ir ** 2).sum())
n = 1 << int(np.ceil(np.log2(len(mix) + len(ir))))
wet = np.stack([np.fft.irfft(np.fft.rfft(mix[:, c], n) * np.fft.rfft(ir, n), n)[:len(mix)] for c in (0, 1)], 1)
out = mix + wet * .12
out = out[:int(SR * DUR)]
out *= .89 / np.abs(out).max()
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok', out.shape)

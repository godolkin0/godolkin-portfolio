"""Music bed and sound effects for the Valora AI motion ad (23.5 s), synthesised with numpy.

120 BPM, A minor. Dark intro (0-6 s), drop on the cut to the agency lighting up (6 s),
groove under the product beats, resolution on C when the logo lands (21.5 s).
Writes 48 kHz stereo 16-bit WAV.
"""
import sys, wave
import numpy as np

SR, DUR = 48000, 23.5
N = int(SR * DUR)
rng = np.random.default_rng(11)
BEAT = 0.5


def tt(d):
    return np.arange(int(SR * d)) / SR


class Bus:
    def __init__(self):
        self.x = np.zeros((N + SR * 2, 2))

    def add(self, t, sig, gain=1.0, pan=0.0):
        i = int(round(t * SR))
        if i < 0:
            sig, i = sig[-i:], 0
        sig = sig[: len(self.x) - i] * gain
        if sig.ndim == 1:
            self.x[i:i + len(sig), 0] += sig * np.sqrt((1 - pan) / 2)
            self.x[i:i + len(sig), 1] += sig * np.sqrt((1 + pan) / 2)
        else:
            self.x[i:i + len(sig)] += sig


def lp(x, fc, order=2):
    """Zero-phase low-pass in the frequency domain (Butterworth magnitude)."""
    n = 1 << int(np.ceil(np.log2(len(x) + 1)))
    f = np.fft.rfftfreq(n, 1 / SR)
    h = 1 / np.sqrt(1 + (f / fc) ** (2 * order))
    return np.fft.irfft(np.fft.rfft(x, n) * h, n)[:len(x)]


def hp(x, fc, order=2):
    return x - lp(x, fc, order)


def onepole(x, fc):
    """Causal one-pole low-pass with a per-sample cutoff (for sweeps)."""
    fc = np.broadcast_to(fc, x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y, prev = np.empty_like(x), 0.0
    for n in range(len(x)):
        prev = (1 - a[n]) * x[n] + a[n] * prev
        y[n] = prev
    return y


def env(d, a=.005, r=.1):
    t = tt(d)
    return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)


def sweep(f0, f1, d, k=6.0):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-k * t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def saw(f, d, det=0.0):
    t = tt(d)
    ph = (f * (1 + det) * t + rng.random()) % 1
    return 2 * ph - 1


# ---------------------------------------------------------------- instruments
def kick(g=1.0):
    d = .45
    t = tt(d)
    body = sweep(160, 46, d, 9) * np.exp(-t * 7)
    click = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * .4
    return np.tanh((body + click) * 1.6) * .8 * g


def thump(g=1.0):
    d = .35
    t = tt(d)
    return sweep(90, 40, d, 7) * np.exp(-t * 11) * g


def clap():
    d = .3
    t = tt(d)
    n = rng.standard_normal(len(t))
    e = np.zeros(len(t))
    for k, o in enumerate((0, .011, .022)):
        i = int(o * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) * (90 if k < 2 else 18))
    return lp(hp(n, 900), 4500) * e * .45


def hat(open_=False):
    d = .25 if open_ else .06
    t = tt(d)
    n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70)) * (.22 if open_ else .18)


def tick():
    d = .03
    t = tt(d)
    return (np.sin(2 * np.pi * 3100 * t) * .5 + rng.standard_normal(len(t)) * .12) * np.exp(-t * 170)


def pluck(f, d=.45, g=.25):
    t = tt(d)
    y = sum(np.sin(2 * np.pi * f * k * t + k) / k ** 1.2 * np.exp(-t * (5 + 5 * k)) for k in range(1, 9))
    return y * np.minimum(1, t / .002) * g


def bass(f, d, g=.5):
    t = tt(d)
    y = lp(saw(f, d) * .6 + np.sin(2 * np.pi * f * t) * .9, 420)
    return np.tanh(y * 1.3) * env(d, .004, .05) * g


def pad(freqs, d, fc=1800, g=.12):
    y = np.zeros(int(SR * d))
    for f in freqs:
        for det in (-.006, 0, .007):
            y += saw(f, d, det)
    y = lp(y, fc)
    return y * env(d, .25, .5) * g / len(freqs)


def whoosh(d=.5, f0=400, f1=4500, g=.5):
    n = rng.standard_normal(int(SR * d))
    t = tt(d) / d
    fc = f0 * (f1 / f0) ** np.sin(np.pi * t * .5)
    return (onepole(n, fc) - onepole(n, fc * .25)) * np.sin(np.pi * t) ** 1.6 * g


def riser(d=1.4, g=.45):
    n = rng.standard_normal(int(SR * d))
    t = tt(d) / d
    y = onepole(n, 300 + 7000 * t ** 2) - onepole(n, 150 + 2000 * t ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(180 + 720 * t ** 2) / SR) * .25
    return (y + tone) * t ** 2.2 * g


def impact(g=1.0):
    d = 1.6
    t = tt(d)
    body = np.sin(2 * np.pi * np.cumsum(36 + 70 * np.exp(-t * 16)) / SR) * np.exp(-t * 3.2)
    crash = hp(rng.standard_normal(len(t)), 4000) * np.exp(-t * 2.6) * .35
    trans = lp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 35) * 1.2
    return np.tanh((body + trans) * 1.5) * .9 * g + crash * g


def bell(f=1318.5, d=1.2, g=.3):
    t = tt(d)
    parts = [(1, 1, 3.2), (2.0, .45, 5), (2.76, .25, 7), (5.4, .12, 11)]
    y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for r, a, k in parts)
    return y * np.minimum(1, t * 400) * g


def chime(root=1046.5, g=.26):
    y = np.zeros(int(SR * 1.8))
    for i, r in enumerate((1, 1.26, 1.5, 2.0)):
        b = bell(root * r, 1.4, g)
        y[int(i * .07 * SR):int(i * .07 * SR) + len(b)] += b
    return y


def pop(f0=900, f1=300, d=.1):
    return sweep(f0, f1, d, 6) * np.exp(-tt(d) * 36) * .6


def knock():
    d = .09
    t = tt(d)
    return (np.sin(2 * np.pi * 210 * t) + .5 * np.sin(2 * np.pi * 470 * t)) * np.exp(-t * 55) * .6


def sparkle(d=.8):
    y = np.zeros(int(SR * d))
    for _ in range(10):
        s = int(rng.random() * (d - .15) * SR)
        b = np.sin(2 * np.pi * (2600 + rng.random() * 2800) * tt(.15)) * np.exp(-tt(.15) * 30)
        y[s:s + len(b)] += b * .16
    return y


def sad(d=.9):
    """A soft descending 'no answer' tone."""
    t = tt(d)
    f = 330 * 2 ** (-t / d * .9) * (1 + .012 * np.sin(2 * np.pi * 6 * t))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return y * env(d, .02, .5) * .22


# ---------------------------------------------------------------- arrangement
mus, sfx = Bus(), Bus()
Am, F, G, Cm = (220, 261.63, 329.63), (174.61, 220, 261.63), (196, 246.94, 293.66), (261.63, 329.63, 392)
ROOT = {'Am': 55, 'F': 43.65, 'G': 49, 'C': 65.41}
CH = {'Am': Am, 'F': F, 'G': G, 'C': Cm}

# intro 0-6: dark pad, sub drone, heartbeat, clock ticks
intro_pad = pad((110, 130.81, 164.81), 6.3, 700, .16)
intro_pad += lp(pad((110, 130.81, 164.81, 220), 6.3, 2600, .12), 2600) * np.clip((tt(6.3) - 3.2) / 2.6, 0, 1)
mus.add(0, intro_pad)
mus.add(0, np.sin(2 * np.pi * 55 * tt(6)) * env(6, .5, .4) * .16)
for t0 in (0.0, 2.0, 4.0):
    mus.add(t0, thump(.7)); mus.add(t0 + .24, thump(.45))
for i in range(24):
    t0 = i * .25
    if t0 < 5.8:
        mus.add(t0, tick(), .25 + .2 * (i % 2 == 0) * min(1, t0 / 2), .3 if i % 2 else -.3)
mus.add(4.45, riser(1.45, .5))

# groove 6-21.5
prog = [('F', 6), ('G', 8), ('Am', 10), ('C', 12), ('F', 14), ('G', 16), ('F', 18), ('G', 20)]
side = np.ones(N + SR * 2)
for name, t0 in prog:
    d = 2.0 if t0 < 20 else 1.5
    mus.add(t0, pad(CH[name], d + .45, 2400, .2))
    for b in range(int(d / .25)):
        tb = t0 + b * .25
        f = ROOT[name] * (2 if b % 2 else 1)
        mus.add(tb, bass(f * 2, .22, .42))
    arp = [0, 1, 2, 1] if t0 < 12 else [0, 1, 2, 3]
    tones = list(CH[name]) + [CH[name][0] * 2]
    for b in range(int(d / .25)):
        tb = t0 + b * .25
        f = tones[arp[b % 4]] * 2
        mus.add(tb, pluck(f, .42, .2 if b % 2 == 0 else .14), 1, (-.35, .35)[b % 2])
for i in range(int((21.5 - 6) / BEAT)):
    tb = 6 + i * BEAT
    if 20.5 <= tb < 21.5:
        continue
    mus.add(tb, kick())
    k0 = int(tb * SR)
    duck = 1 - .55 * np.exp(-tt(BEAT) / .09)
    side[k0:k0 + len(duck)] = np.minimum(side[k0:k0 + len(duck)], duck)
    mus.add(tb + .25, hat(True), 1, .2)
    if i % 2 == 1:
        mus.add(tb, clap(), 1, -.05)
    for s in (.125, .375):
        mus.add(tb + s, hat(), .7, -.25)
mus.add(20.1, riser(1.4, .55))

# resolution on C, 21.5-23.5
mus.add(21.5, pad(Cm + (130.81,), 2.2, 3000, .26))
mus.add(21.5, bass(130.81, 1.6, .45))
mus.add(21.5, kick(1.1))
for b, f in enumerate((523.25, 659.25, 783.99, 1046.5, 783.99, 659.25)):
    mus.add(21.5 + b * .25, pluck(f, .6, .16), 1, (-.3, .3)[b % 2])

# ---------------------------------------------------------------- sound effects
sfx.add(.1, pop(700, 280, .12), .8)
sfx.add(.3, whoosh(.45, 500, 5000, .22))
sfx.add(2.82, whoosh(.4, 300, 3000, .4))
sfx.add(3.0, thump(.8))
sfx.add(3.6, sad(1.0))
sfx.add(5.86, whoosh(.25, 2000, 8000, .2))
sfx.add(6.0, impact(1.0))
sfx.add(6.02, chime(1046.5, .2))
for c in (9.0, 12.0, 15.0, 18.0):
    sfx.add(c - .28, whoosh(.45, 350, 4500, .42))
for x in np.arange(9.5, 10.4, .06):
    sfx.add(x, tick(), .3)
sfx.add(10.05, whoosh(.45, 600, 5000, .3))
sfx.add(10.4, bell(1568, .9, .18))
sfx.add(12.45, whoosh(.5, 600, 6000, .35))
sfx.add(12.95, bell(1318.5, 1.0, .3))
sfx.add(13.1, bell(1760, 1.1, .28))
sfx.add(13.45, knock(), 1.0, -.2)
sfx.add(13.8, knock(), 1.0, .2)
for i in range(4):
    sfx.add(13.95 + i * .12, pop(800 + i * 150, 350, .09), .55, -.45 + i * .3)
for i in range(3):
    sfx.add(15.5 + i * .25, whoosh(.3, 1200, 6000, .18), 1, -.3)
    sfx.add(15.62 + i * .25, bell(1975.5 - i * 120, .6, .14), 1, -.2 + i * .2)
for i in range(3):
    sfx.add(18.1 + i * .22, whoosh(.32, 1500, 6500, .2), 1, .5)
    sfx.add(18.45 + i * .22, pop(1100 + i * 120, 600, .08), .5)
sfx.add(21.48, impact(.75))
sfx.add(21.5, chime(1046.5, .28))
sfx.add(22.0, pop(700, 280, .12), .8)
sfx.add(22.35, sparkle(.8), 1)

# ---------------------------------------------------------------- mix
m = mus.x * side[:, None] * .55
out = m + sfx.x * .9
ir = rng.standard_normal(int(SR * 1.2)) * np.exp(-tt(1.2) * 4.5)
ir /= np.sqrt((ir ** 2).sum())
n = 1 << int(np.ceil(np.log2(len(out) + len(ir))))
wet = np.stack([np.fft.irfft(np.fft.rfft(out[:, c], n) * np.fft.rfft(ir, n), n)[:len(out)] for c in (0, 1)], 1)
out = out + wet * .14
out = out[:N]
fade = np.clip((DUR - tt(DUR)) / .6, 0, 1)
out *= fade[:, None]
out = np.tanh(out / np.abs(out).max() * 1.3) / np.tanh(1.3) * .9
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype('<i2').tobytes())
print('ok', out.shape)

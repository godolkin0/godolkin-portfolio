#!/usr/bin/env python3
"""Valora ad: a 1080x1920 motion edit built from the real screenshots.

usage: render.py frames            raw rgb24 frames on stdout (pipe into ffmpeg)
       render.py preview T1,T2...  PNG frames at those times
       render.py sfx               ffmpeg filter graph for the sound effects
       render.py redacted          save the redacted screenshots for checking
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

os.chdir(os.path.dirname(os.path.abspath(__file__)))  # screenshots and outputs live next to this script

FMT = os.environ.get('VFMT', '916')  # 916 = 1080x1920 (Reels/Stories), 45 = 1080x1350 (Feed)
L = {'916': dict(H=1920, card=1160, rest=1140, cap=(338, 440), bar=516, zy=(1060, 1090), zh=760, n8=(1000, 1340),
                 v=(650, 590, 360), end=(940, 1050, 1185), glow=(1150, 650), scrim=640),
     '45': dict(H=1350, card=1010, rest=810, cap=(110, 200), bar=285, zy=(780, 800), zh=600, n8=(770, 1120),
                v=(420, 370, 300), end=(690, 790, 905), glow=(820, 430), scrim=420)}[FMT]
W, H, FPS, DUR = 1080, L['H'], 30, 21.3
FONT = os.environ.get('VFONT', '/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf')
MINT, WHITE, GREEN, INK = (150, 235, 185), (255, 255, 255), (48, 107, 79), (20, 70, 45)


def clamp(x, a=0.0, b=1.0): return a if x < a else b if x > b else x
def prog(t, t0, t1): return clamp((t - t0) / (t1 - t0))
def lerp(a, b, p): return a + (b - a) * p
def eoc(p): return 1 - (1 - p) ** 3
def eio(p): return 4 * p ** 3 if p < .5 else 1 - (-2 * p + 2) ** 3 / 2
def eob(p, s=1.7): q = p - 1; return 1 + (s + 1) * q ** 3 + s * q ** 2


# --- privacy: phone numbers, emails and personal names, from the OCR boxes -------------
PII = {
    '06': [(84, 1089, 397, 1123), (83, 1335, 561, 1376)],
    '07': [(83, 824, 397, 860), (83, 1072, 560, 1113)],
    '09': [(177, 1499, 293, 1531)],
    '11': [(500, 751, 694, 785), (49, 797, 312, 830), (359, 797, 800, 833), (511, 1357, 705, 1391),
           (49, 1403, 327, 1436), (314, 1403, 800, 1438), (692, 198, 799, 227),
           (49, 420, 491, 451), (48, 1026, 493, 1057), (48, 1632, 493, 1661)],  # raw ISO timestamps
}
# names inside running text: blur only the name words of these lines
WORDS = {'09': [((178, 1573, 813, 1600), 'last'), ((179, 1606, 861, 1636), 'first')],
         '10': [((85, 297, 382, 335), 'after1')]}


def word_spans(img, box, gap=9):
    a = np.asarray(img.crop(box).convert('L'), np.float32)
    cols = (np.abs(a - np.median(a)) > 45).any(axis=0)
    spans, start, last = [], None, -99
    for x, ink in enumerate(cols):
        if not ink:
            continue
        if start is None:
            start = x
        elif x - last > gap:
            spans.append((start, last + 1))
            start = x
        last = x
    if start is not None:
        spans.append((start, last + 1))
    return [(box[0] + s0, box[0] + s1) for s0, s1 in spans]


def redact(key, img):
    boxes = list(PII.get(key, []))
    for box, which in WORDS.get(key, []):
        sp = word_spans(img, box)
        if len(sp) < 2:
            boxes.append(box)  # cannot split the line safely: blur all of it
        elif which == 'last':
            boxes.append((sp[-1][0], box[1], box[2], box[3]))
        elif which == 'first':
            boxes.append((box[0], box[1], sp[0][1], box[3]))
        else:
            boxes.append((sp[1][0], box[1], box[2], box[3]))
    for x0, y0, x1, y1 in boxes:
        b = (max(0, x0 - 8), max(0, y0 - 6), min(img.width, x1 + 8), min(img.height, y1 + 6))
        r = img.crop(b)
        w, h = r.size
        r = r.resize((max(1, w // 16), max(1, h // 16)), Image.BILINEAR).resize((w, h), Image.BILINEAR)
        img.paste(r.filter(ImageFilter.GaussianBlur(5)), b[:2])
    return img


# --- copy fixes painted onto the screenshots: città, Italian price format, sample names -
LIB = '/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf'


def _ink(img, box, th=60):
    a = np.asarray(img.crop(box).convert('L'), np.float32)
    bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]))
    return np.abs(a - bg) > th


def _spans(mask, gap=1):
    out, s, last = [], None, -99
    for x, v in enumerate(mask.any(axis=0)):
        if not v:
            continue
        if s is None:
            s = x
        elif x - last > gap:
            out.append((s, last + 1))
            s = x
        last = x
    if s is not None:
        out.append((s, last + 1))
    return out


def _bg(img, box):
    a = np.asarray(img.crop(box).convert('RGB')).reshape(-1, 3)
    return tuple(int(v) for v in np.median(np.concatenate([a[:4], a[-4:]]), axis=0))


def _inkcol(img, box, dark=True):
    a = np.asarray(img.crop(box).convert('RGB')).reshape(-1, 3).astype(int)
    i = np.argsort(a.sum(1))
    n = max(1, len(i) // 50)
    return tuple(int(v) for v in a[i[:n] if dark else i[-n:]].mean(0))


def _grave(img, box):  # citta) -> città)
    m = _ink(img, box)
    ax0, ax1 = _spans(m)[-2]
    rows = np.where(m[:, ax0:ax1].any(axis=1))[0]
    xt, xh, w = rows.min(), rows.max() - rows.min(), ax1 - ax0
    col = _inkcol(img, (box[0] + ax0, box[1] + xt, box[0] + ax1, box[1] + rows.max()))
    X, Y = box[0] + ax0, box[1] + xt
    ImageDraw.Draw(img).line([(X + w * .28, Y - xh * .62), (X + w * .62, Y - xh * .16)], fill=col, width=max(2, round(xh * .16)))


def _commas(img, box):  # 169,000 -> 169.000: cut the tail of every comma between digits
    m = _ink(img, box, 40)
    sp = _spans(m)
    tb = [(lambda r: (r.min(), r.max()))(np.where(m[:, a:b].any(axis=1))[0]) for a, b in sp]
    ws = np.array([b - a for a, b in sp])
    dw = np.median(ws[ws > np.median(ws) * .6])
    dig = [i for i, w in enumerate(ws) if abs(w - dw) < dw * .35]
    base = int(np.median([tb[i][1] for i in dig]))
    full = np.median([tb[i][1] - tb[i][0] for i in dig])
    # nothing in these price lines descends below the digits except comma tails
    ImageDraw.Draw(img).rectangle((box[0], box[1] + base + 2, box[2], box[3]), fill=_bg(img, box))


def _retext(img, box, text, bold=False, dark=True):
    m = _ink(img, box)
    r, c = np.where(m.any(axis=1))[0], np.where(m.any(axis=0))[0]
    ib = (box[0] + c.min(), box[1] + r.min(), box[0] + c.max() + 1, box[1] + r.max() + 1)
    col, bg = _inkcol(img, ib, dark), _bg(img, (ib[2] + 6, ib[1], ib[2] + 40, ib[3]))
    f = ImageFont.truetype(LIB % ('Bold' if bold else 'Regular'), int((ib[3] - ib[1]) / .72))
    d = ImageDraw.Draw(img)
    d.rectangle((ib[0] - 4, ib[1] - 4, ib[2] + 4, ib[3] + 4), fill=bg)
    d.text((ib[0], ib[1] - f.getbbox('T')[1]), text, font=f, fill=col)


def _drop_last(img, box):  # "casa??" -> "casa?"
    s0, s1 = _spans(_ink(img, box))[-1]
    x0, x1 = box[0] + s0 - 1, box[0] + s1 + 1
    img.paste(img.crop((x1 + 6, box[1], 2 * x1 + 6 - x0, box[3])), (x0, box[1]))


def fix_text(key, img):
    if key in ('02', '03'):
        _grave(img, (60, 1042, 738, 1084))
    if key == '10':
        _commas(img, (160, 976, 785, 1042))
    if key == '11':
        for b in ((218, 328, 659, 368), (279, 934, 748, 974), (47, 1537, 489, 1580)):
            _commas(img, b)
    if key == '06':
        _retext(img, (79, 836, 166, 880), 'Marco Rossi')
    if key == '07':
        _retext(img, (80, 573, 165, 615), 'Marco Rossi')
    if key == '01':
        _drop_last(img, (177, 1587, 568, 1618))
        _retext(img, (175, 1550, 323, 1586), 'Giulia', bold=True, dark=False)
    return img


def load(key):
    for ext in ('jpg', 'png', 'jpeg'):
        if os.path.exists(f'{key}.{ext}'):
            return fix_text(key, redact(key, Image.open(f'{key}.{ext}').convert('RGB')))
    raise SystemExit(f'missing {key}')


# --- drawing primitives -----------------------------------------------------------------
def blit(frame, src, X0, Y0, k, a=1.0, rs=Image.LANCZOS):
    """Draw premultiplied `src` scaled by k with its top-left at the float point (X0, Y0)."""
    sw, sh = src.size
    fx0, fy0 = max(0, math.floor(X0)), max(0, math.floor(Y0))
    fx1, fy1 = min(W, math.ceil(X0 + sw * k)), min(H, math.ceil(Y0 + sh * k))
    if fx1 <= fx0 or fy1 <= fy0 or a <= 0.004:
        return
    box = (clamp((fx0 - X0) / k, 0, sw), clamp((fy0 - Y0) / k, 0, sh),
           clamp((fx1 - X0) / k, 0, sw), clamp((fy1 - Y0) / k, 0, sh))
    piece = src.resize((fx1 - fx0, fy1 - fy0), rs, box=box).convert('RGBA')
    if a < 0.996:
        piece.putalpha(piece.getchannel('A').point(lambda v: int(v * a + .5)))
    frame.alpha_composite(piece, (fx0, fy0))


def put_center(frame, im, cx, cy, a=1.0, sc=1.0):
    X0, Y0 = cx - im.width * sc / 2, cy - im.height * sc / 2
    if abs(sc - 1) < 1e-3:  # keep static text pixel-aligned and crisp
        X0, Y0 = round(X0), round(Y0)
    blit(frame, im, X0, Y0, sc, a)


def rr_mask(w, h, r, ss=2):
    m = Image.new('L', (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * ss - 1, h * ss - 1), r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)


class Card:
    """A screenshot inside a dark phone bezel with rounded corners and a soft shadow."""

    def __init__(self, w, h, bez=26, rad=72):
        self.bez, self.cw, self.ch = bez, w + 2 * bez, h + 2 * bez
        self.bezel = Image.new('RGBA', (self.cw, self.ch), (14, 18, 16, 255))
        self.bezel.putalpha(rr_mask(self.cw, self.ch, rad))
        self.smask = rr_mask(w, h, rad - bez)
        self.q, self.pad = 4, 50
        a = self.bezel.getchannel('A').resize((self.cw // self.q, self.ch // self.q), Image.BILINEAR)
        m = Image.new('L', (a.width + 2 * self.pad, a.height + 2 * self.pad), 0)
        m.paste(a, (self.pad, self.pad))
        sh = Image.new('RGBA', m.size, (0, 0, 0, 0))
        sh.putalpha(m.filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * .55)))
        self.shadow = sh.convert('RGBa')

    def compose(self, screen):
        out = self.bezel.copy()
        s = screen.convert('RGBA')
        s.putalpha(self.smask)
        out.alpha_composite(s, (self.bez, self.bez))
        return out.convert('RGBa')

    def put(self, frame, img, cx, cy, s, a=1.0, s_rest=1.0):
        X0, Y0 = cx - self.cw * s / 2, cy - self.ch * s / 2
        sa = a * clamp(1.6 - .6 * s / s_rest)  # the shadow fades out as the camera zooms in
        if sa > 0:
            k = s * self.q
            blit(frame, self.shadow, X0 - self.pad * k, Y0 - self.pad * k + 24, k, sa, Image.BILINEAR)
        blit(frame, img, X0, Y0, s, a)


_fonts = {}


def fnt(size):
    if size not in _fonts:
        _fonts[size] = ImageFont.truetype(FONT, size)
    return _fonts[size]


def text_img(s, size, color=WHITE, accent=MINT, maxw=960, shadow=True):
    """Text with *accent* segments, shrunk to fit maxw, with a soft dark shadow."""
    parts = s.split('*')
    while True:
        f = fnt(size)
        ws = [f.getlength(p) for p in parts]
        if sum(ws) <= maxw or size <= 28:
            break
        size -= 2
    asc, desc = f.getmetrics()
    pad = 28
    im = Image.new('RGBA', (int(sum(ws)) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d, x = ImageDraw.Draw(im), pad
    for i, p in enumerate(parts):
        d.text((x, pad), p, font=f, fill=(accent if i % 2 else color) + (255,))
        x += ws[i]
    if shadow:
        sh = Image.new('RGBA', im.size, (6, 28, 18, 0))
        sh.putalpha(im.getchannel('A').filter(ImageFilter.GaussianBlur(8)).point(lambda v: int(v * .6)))
        base = Image.new('RGBA', im.size, (0, 0, 0, 0))
        base.paste(sh, (0, 4))
        im = Image.alpha_composite(base, im)
    return im.convert('RGBa')


def pill(label, size, bg, fg, check=False):
    f = fnt(size)
    asc, desc = f.getmetrics()
    h = int((asc + desc) * 1.75)
    lx = int(h * 1.05) if check else h // 2 + 6
    w = int(f.getlength(label)) + lx + h // 2 + 6
    im = Image.new('RGBA', (w * 2, h * 2), (0, 0, 0, 0))  # 2x supersampled
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w * 2 - 1, h * 2 - 1), h, fill=bg + (255,))
    if check:
        c = h * .52
        d.line([(c * 2 - h * .44, h + 2), (c * 2 - h * .12, h * 1.32), (c * 2 + h * .46, h * .66)],
               fill=fg + (255,), width=int(h * .2), joint='curve')
    d.text((lx * 2, h - (asc + desc)), label, font=fnt(size * 2), fill=fg + (255,))
    return im.resize((w, h), Image.LANCZOS).convert('RGBa')


def gradient(top, bot, glow_c, glow_y, glow=(36, 58, 44)):
    y = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    img = np.array(top, np.float32) * (1 - y) + np.array(bot, np.float32) * y
    img = np.repeat(img, W, axis=1)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - glow_c) / 640) ** 2 + ((yy - glow_y) / 860) ** 2)
    img += (np.clip(1 - d, 0, 1) ** 2)[..., None] * np.array(glow, np.float32)
    return Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')


# --- assets -------------------------------------------------------------------------------
IM = {k: load(k) for k in ('01', '02', '03', '04', '05', '06', '07', '09', '10', '11')}
PW, PH = IM['01'].size
CP = Card(PW, PH)
S_REST = L['card'] / CP.ch     # resting scale of a phone card
REST = (540, L['rest'])
CARDS = {k: CP.compose(IM[k]) for k in ('01', '09', '10', '11')}
FORM = [IM[k] for k in ('02', '03', '04', '05', '06', '07')]
SBAR = 105                     # status bar height kept fixed while the form scrolls


def zoom_for(r, width=940, height=L['zh'], zmax=2.2):
    return min(zmax, min(width / (r[2] - r[0]), height / (r[3] - r[1])) / S_REST)


def centre(r): return ((r[0] + r[2]) / 2, (r[1] + r[3]) / 2)


T1 = (40, 1528, 906, 1648)     # message notification
T9 = (40, 1485, 906, 1720)     # Gmail notification
T10 = (130, 585, 816, 1140)    # address + estimated value in the opened email
T11 = (30, 1340, 840, 1850)    # today's lead in Telegram
T10V = (130, 905, 816, 1060)   # the estimated value inside the opened email
SUBMIT = (176, 1566)


def cam(focus, Z, target, e):
    """Camera move: scale from rest to Z*rest while `focus` travels to `target`."""
    s = S_REST * lerp(1, Z, e)
    fx, fy = focus[0] + CP.bez - CP.cw / 2, focus[1] + CP.bez - CP.ch / 2
    Fx = lerp(REST[0] + fx * S_REST, target[0], e)
    Fy = lerp(REST[1] + fy * S_REST, target[1], e)
    return Fx - fx * s, Fy - fy * s, s


class N8N:
    """The real n8n run: starts grey, a wave of colour flows left to right through the nodes."""
    R = (290, 300, 1350, 800)  # node graph region (OCR labels span x 377-1257, y 417-731; icons sit above)
    NODES = (820, 550)

    def __init__(self, img):
        self.ci = img.convert('RGB')
        c = np.asarray(self.ci, np.float32)
        lum = c @ np.array([.299, .587, .114], np.float32)
        self.gi = Image.fromarray(np.repeat((lum * .62 + 6)[..., None], 3, 2).clip(0, 255).astype(np.uint8))
        self.vw, self.vh = self.R[2] - self.R[0], self.R[3] - self.R[1]
        self.card = Card(self.vw, self.vh, bez=14, rad=34)

    def screen(self, wx, z, ze, glow):
        cx = lerp((self.R[0] + self.R[2]) / 2, self.NODES[0], ze)
        cy = lerp((self.R[1] + self.R[3]) / 2, self.NODES[1], ze)
        bw, bh = self.vw / z, self.vh / z
        box = (cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2)
        col = np.asarray(self.ci.resize((self.vw, self.vh), Image.BICUBIC, box=box), np.float32)
        if wx is not None:
            gry = np.asarray(self.gi.resize((self.vw, self.vh), Image.BICUBIC, box=box), np.float32)
            xs = box[0] + (np.arange(self.vw, dtype=np.float32) + .5) * (bw / self.vw)
            al = np.clip((wx - xs) / 70 + .5, 0, 1)[None, :, None]
            out = gry * (1 - al) + col * al
            if glow > 0:
                g = (np.exp(-((xs - wx) / 26) ** 2) * glow)[None, :, None]
                out = out + g * (col * 1.2 + np.array([18, 52, 34], np.float32))
            col = out
        return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))


N8 = N8N(Image.open('08.png' if os.path.exists('08.png') else '08.jpg'))


def logo_v(img):
    a = np.asarray(img.convert('RGB'), np.float32).min(axis=2)
    al = np.clip((a - 75) / 170, 0, 1)
    ys, xs = np.where(al > .05)
    al = al[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    v = Image.new('RGBA', (al.shape[1] + 8, al.shape[0] + 8), (255, 255, 255, 0))
    core = Image.new('RGBA', (al.shape[1], al.shape[0]), (255, 255, 255, 255))
    core.putalpha(Image.fromarray((al * 255).astype(np.uint8)))
    v.paste(core, (4, 4))
    return v.convert('RGBa')


LOGO = logo_v(Image.open('12.jpg' if os.path.exists('12.jpg') else '12.png'))
BG = gradient((44, 100, 73), (16, 44, 32), 540, L['glow'][0])
BGEND = gradient((40, 94, 69), (18, 50, 36), 540, L['glow'][1], glow=(46, 72, 54))
SCRIM = Image.new('RGBA', (W, L['scrim']), (6, 22, 15, 0))
SCRIM.putalpha(Image.fromarray((np.linspace(1, 0, L['scrim'], dtype=np.float32) ** 1.4 * 190).astype(np.uint8)[:, None].repeat(W, 1)))

CAPS = [  # (small line, big line, in, out)
    ('Ogni giorno i proprietari chiedono:', '*Quanto vale* casa mia?', 0.10, 2.20),
    ('Lo scoprono sul sito della tua agenzia', 'in *30 secondi*', 2.55, 7.05),
    ('Stima istantanea sui dati OMI', '*100%* automatica', 7.40, 11.30),
    ('Il proprietario riceve', 'la stima *via email*', 11.60, 14.55),
    ('E tu ricevi il lead, già qualificato', 'nello *stesso istante*', 14.95, 17.45),
]
# --- kinetic captions: words rise in one by one, key words get a mint highlight that wipes in
def tag_img(label, size, w=None):
    """Dark text on a mint highlight block; w fixes the width (for counters)."""
    f = fnt(size)
    asc, desc = f.getmetrics()
    px, py = int(size * .24), int(size * .05)
    tw = f.getlength(label)
    w = int(w or tw + 2 * px)
    h = asc + desc + 2 * py
    im = Image.new('RGBA', (w * 2, h * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, int(h * .18), w * 2 - 1, h * 2 - 1 - int(h * .1)), int(h * .3), fill=MINT + (255,))
    d.text(((w - tw), py * 2), label, font=fnt(size * 2), fill=INK + (255,))
    return im.resize((w, h), Image.LANCZOS).convert('RGBa')


def _tokens(s):
    out = []
    for i, seg in enumerate(s.split('*')):
        if i % 2:
            out.append((seg.strip(), True))
        else:
            out += [(w, False) for w in seg.split()]
    return out


class KLine:
    def __init__(self, s, size, color, maxw, y, stagger, count=None):
        self.toks, self.color, self.y, self.stagger, self.count = _tokens(s), color, y, stagger, count
        while True:
            f = fnt(size)
            px = int(size * .24)
            ws = [f.getlength(t) + (2 * px if acc else 0) for t, acc in self.toks]
            tot = sum(ws) + f.getlength(' ') * (len(ws) - 1)
            if tot <= maxw or size <= 28:
                break
            size -= 2
        self.size, self.ws = size, ws
        self.ims = [tag_img(t, size) if acc else text_img(t, size, color=color, maxw=2000) for t, acc in self.toks]
        x, self.xs = 540 - tot / 2, []
        for w in ws:
            self.xs.append(x + w / 2)
            x += w + f.getlength(' ')
        self._cnt = {}

    def counted(self, i, t):
        label, acc = self.toks[i]
        c0, c1 = self.count
        p = eoc(prog(t, c0, c1))
        if p >= 1:
            return self.ims[i]
        n = int(''.join(ch for ch in label if ch.isdigit()))
        lab = label.replace(str(n), str(int(round(n * p))))
        if lab not in self._cnt:
            self._cnt[lab] = tag_img(lab, self.size, self.ims[i].width)
        return self._cnt[lab]

    def draw(self, fr, t, t0, fade, lift):
        for i, (im, (lab, acc)) in enumerate(zip(self.ims, self.toks)):
            ti = t0 + i * self.stagger
            p = prog(t, ti, ti + .38)
            if p <= 0:
                continue
            a = clamp(p * 2.6) * fade
            y = self.y + (1 - eoc(p)) * 34 - lift
            if acc:
                if self.count and any(ch.isdigit() for ch in lab):
                    im = self.counted(i, t)
                wp = eoc(prog(t, ti + .04, ti + .42))
                if wp <= 0:
                    continue
                cw = max(1, int(im.width * wp))
                put_center(fr, im.crop((0, 0, cw, im.height)), self.xs[i] - (im.width - cw) / 2, y, a)
            else:
                put_center(fr, im, self.xs[i], y, a)


class KCaption:
    def __init__(self, small, big, t_in, t_out, count=None):
        self.t_in, self.t_out = t_in, t_out
        self.a = KLine(small, 46, (235, 245, 238), 940, L['cap'][0], .035)
        self.b = KLine(big, 100, WHITE, 960, L['cap'][1], .09, count)

    def draw(self, fr, t):
        if t < self.t_in or t > self.t_out + .35:
            return
        po = eoc(prog(t, self.t_out, self.t_out + .3))
        self.a.draw(fr, t, self.t_in, 1 - po, po * 30)
        self.b.draw(fr, t, self.t_in + .2, 1 - po, po * 30)


CAPK = [KCaption(a, b, t0, t1, cnt) for (a, b, t0, t1), cnt in
        zip(CAPS, (None, (2.95, 3.7), (7.8, 8.6), None, None))]


def chip(p):  # "Completato in 6,9 s", counting up
    return pill(f'Completato in {6.9 * p:.1f} s'.replace('.', ','), 40, MINT, INK, check=True)


# --- frosted glass behind the captions while a zoomed screen sits under them
GY0, GY1 = L['cap'][0] - 62, L['cap'][1] + 78
GMASK = rr_mask(1000, GY1 - GY0, 44)
GEDGE = Image.new('RGBA', (1000, GY1 - GY0), (0, 0, 0, 0))
ImageDraw.Draw(GEDGE).rounded_rectangle((1, 1, 998, GY1 - GY0 - 2), 44, outline=(255, 255, 255, 46), width=2)


def glass(fr, a):
    reg = fr.crop((40, GY0, 1040, GY1)).filter(ImageFilter.GaussianBlur(24))
    reg = Image.alpha_composite(reg, Image.new('RGBA', reg.size, (8, 36, 25, 150)))
    reg.alpha_composite(GEDGE)
    reg.putalpha(GMASK if a > .99 else GMASK.point(lambda v: int(v * a)))
    fr.alpha_composite(reg, (40, GY0))


# --- living background: two soft light blobs drift slowly, plus a fine film grain
def _blob(r, col, peak):
    yy, xx = np.mgrid[0:2 * r, 0:2 * r].astype(np.float32)
    al = np.clip(1 - np.hypot(xx - r, yy - r) / r, 0, 1) ** 2 * peak
    im = Image.new('RGBA', (2 * r, 2 * r), col + (0,))
    im.putalpha(Image.fromarray(al.astype(np.uint8)))
    return im.convert('RGBa')


BLOBS = (_blob(460, (120, 230, 170), 70), _blob(420, (40, 170, 150), 60))
_rng = np.random.default_rng(7)
GRAIN = []
for _ in range(4):
    g = Image.new('RGBA', (W, H), (255, 255, 255, 0))
    g.putalpha(Image.fromarray((_rng.random((H, W)) * 14).astype(np.uint8)))
    GRAIN.append(g)


def living_bg(fr, t):
    for i, (b, ph) in enumerate(zip(BLOBS, (0.0, 2.1))):
        x = 540 + (300 if i else -260) * math.sin(t * .45 + ph)
        y = H * (.28 if i == 0 else .74) + 140 * math.cos(t * .38 + ph)
        blit(fr, b, x - b.width / 2, y - b.height / 2, 1, 1, Image.BILINEAR)


# --- callouts: a mint frame snaps around what matters on the screen, then pulses once
def on_screen(cx, cy, s, r):
    X0, Y0 = cx - CP.cw * s / 2, cy - CP.ch * s / 2
    return (X0 + (r[0] + CP.bez) * s, Y0 + (r[1] + CP.bez) * s, X0 + (r[2] + CP.bez) * s, Y0 + (r[3] + CP.bez) * s)


def _comp(fr, ov, x, y):
    x, y = int(round(x)), int(round(y))
    cx0, cy0 = max(0, -x), max(0, -y)
    cx1, cy1 = min(ov.width, W - x), min(ov.height, H - y)
    if cx1 > cx0 and cy1 > cy0:
        fr.alpha_composite(ov.crop((cx0, cy0, cx1, cy1)), (x + cx0, y + cy0))


def callout(fr, r, a, t):
    if a <= .01:
        return
    m = 18 + (1 - a) * 30  # starts loose and snaps in
    x0, y0, x1, y1 = r[0] - m, r[1] - m, r[2] + m, r[3] + m
    ov = Image.new('RGBA', (int(x1 - x0) + 80, int(y1 - y0) + 80), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.rounded_rectangle((40, 40, x1 - x0 + 40, y1 - y0 + 40), 34, outline=MINT + (int(255 * a),), width=7)
    _comp(fr, ov, x0 - 40, y0 - 40)


def badge_img(label):
    return pill(label, 38, MINT, INK, check=True)


BADGE_MAIL = badge_img('Stima inviata')
BADGE_LEAD = badge_img('Nuovo lead qualificato')


def badge(fr, im, r, p, a):
    if p <= 0 or a <= .01:
        return
    y = min(r[3] + 30 + im.height / 2, H - im.height / 2 - 40)
    put_center(fr, im, 540, y + (1 - eoc(p)) * 40, clamp(p * 3) * a, eob(p) if p < 1 else 1)


# --- end card extras: a ring bursts behind the logo, the button glows and shimmers
def ring(fr, x, y, p):
    if p <= 0 or p >= 1:
        return
    r = lerp(90, 560, eoc(p))
    ov = Image.new('RGBA', (int(2 * r) + 20, int(2 * r) + 20), (0, 0, 0, 0))
    ImageDraw.Draw(ov).ellipse((10, 10, 2 * r + 10, 2 * r + 10), outline=MINT + (int(200 * (1 - p)),),
                               width=max(2, int(14 * (1 - p))))
    _comp(fr, ov, x - r - 10, y - r - 10)


def cta_fx(fr, t, x, y, a):
    if t < 19.9:
        return
    w, h = CTA.size
    for k in range(2):
        e = ((t - 19.9) / 1.4 + k * .5) % 1
        g = int(e * 34)
        ov = Image.new('RGBA', (w + 2 * g + 8, h + 2 * g + 8), (0, 0, 0, 0))
        ImageDraw.Draw(ov).rounded_rectangle((4, 4, w + 2 * g + 3, h + 2 * g + 3), h // 2 + g,
                                             outline=WHITE + (int(150 * (1 - e) * a),), width=4)
        _comp(fr, ov, x - w / 2 - g - 4, y - h / 2 - g - 4)


def shine(im, t):
    if t < 20.0:
        return im
    p = ((t - 20.0) / 1.4) % 1
    w, h = im.size
    xs = np.arange(w, dtype=np.float32)[None, :] + np.arange(h, dtype=np.float32)[:, None] * .6
    c = lerp(-120, w + 120, p)
    band = np.clip(1 - np.abs(xs - c) / 46, 0, 1) * .55
    arr = np.asarray(im.convert('RGBA'), np.float32)
    al = arr[..., 3:] / 255
    arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * band[..., None] * al
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), 'RGBA').convert('RGBa')


WORDMARK = text_img('Valora', 136)
TAGLINE = text_img('Stime online. Lead in automatico.', 48, color=(235, 245, 238))
CTA = pill('Richiedi una demo', 48, WHITE, GREEN)


# --- scenes -------------------------------------------------------------------------------
def s1(fr, t):
    pin, pz, pz2 = eoc(prog(t, 0, .5)), eio(prog(t, .95, 2.25)), eio(prog(t, 2.35, 2.75))
    cx, cy, s = cam(centre(T1), zoom_for(T1) * lerp(1, 1.12, pz2), (540, L['zy'][0]), pz)
    cy, s, a = cy + (1 - pin) * 160, s * lerp(.92, 1, pin), pin * (1 - prog(t, 2.35, 2.7))
    CP.put(fr, CARDS['01'], cx, cy, s, a, S_REST)
    callout(fr, on_screen(cx, cy, s, T1), eoc(prog(t, 1.7, 2.05)) * a, t)


_form_cache = {}


def form_card(j, p):
    if p <= 0:
        if j not in _form_cache:
            _form_cache[j] = CP.compose(FORM[j])
        return _form_cache[j]
    a, b = FORM[j], FORM[j + 1]
    if j == 0:  # the first step only fills in fields: dissolve instead of scrolling
        return CP.compose(Image.blend(a, b, eio(p)))
    off = int(round(eio(p) * (PH - SBAR)))
    s = Image.new('RGB', (PW, PH))
    s.paste(a.crop((0, SBAR, PW, PH)), (0, SBAR - off))
    s.paste(b.crop((0, SBAR, PW, PH)), (0, PH - off))
    s.paste((b if p > .5 else a).crop((0, 0, PW, SBAR)), (0, 0))
    return CP.compose(s)


SLIDES = [3.05 + j * .80 for j in range(5)]


def s2(fr, t):
    pin, pout = eoc(prog(t, 2.4, 2.75)), eoc(prog(t, 7.2, 7.5))
    a, sc = pin * (1 - pout), lerp(.94, 1, pin) * lerp(1, .92, pout)
    j, p = 5, 0.0
    for i, ts in enumerate(SLIDES):
        if t < ts:
            j, p = i, 0.0
            break
        if t < ts + .32:
            j, p = i, prog(t, ts, ts + .32)
            break
    CP.put(fr, form_card(j, p), REST[0], REST[1], S_REST * sc, a, S_REST)
    ba = a * eoc(prog(t, 2.6, 2.9))
    if ba > 0:  # progress bar between the caption and the card
        bar = Image.new('RGBA', (W, 24), (0, 0, 0, 0))
        d = ImageDraw.Draw(bar)
        d.rounded_rectangle((300, 7, 780, 17), 5, fill=(255, 255, 255, int(70 * ba)))
        xf = 300 + 480 * (1 + j + eio(p)) / 6
        d.rounded_rectangle((300, 7, xf, 17), 5, fill=MINT + (int(255 * ba),))
        fr.alpha_composite(bar, (0, L['bar']))
    pr = prog(t, 6.85, 7.3)
    if 0 < pr < 1:  # tap on Submit
        x = REST[0] + (SUBMIT[0] + CP.bez - CP.cw / 2) * S_REST
        y = REST[1] + (SUBMIT[1] + CP.bez - CP.ch / 2) * S_REST
        r = lerp(14, 70, eoc(pr))
        ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(ov).ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(150 * (1 - pr))))
        fr.alpha_composite(ov)


def s3(fr, t):
    pin, pout = eoc(prog(t, 7.35, 7.75)), eoc(prog(t, 11.4, 11.7))
    a, sc = pin * (1 - pout), lerp(.92, 1, pin) * lerp(1, .92, pout)
    pw = prog(t, 7.95, 10.15)
    wx = lerp(250, 1400, eio(pw)) if pw < 1 else None
    ze = eio(prog(t, 10.0, 11.5))
    img = N8.card.compose(N8.screen(wx, lerp(1, 1.06, ze), ze, .9 * math.sin(math.pi * pw)))
    k = 1000 / N8.card.cw
    N8.card.put(fr, img, 540, L['n8'][0], k * sc, a, k)
    pc = prog(t, 10.2, 10.55)
    if pc > 0:
        put_center(fr, chip(eoc(prog(t, 10.2, 10.85))), 540, L['n8'][1], clamp(pc * 3) * (1 - pout), eob(pc) if pc < 1 else 1)


def s4(fr, t):
    if t < 13.7:
        pin, pz, pz2 = eoc(prog(t, 11.5, 11.95)), eio(prog(t, 12.15, 13.05)), eio(prog(t, 13.25, 13.65))
        cx, cy, s = cam(centre(T9), zoom_for(T9) * lerp(1, 1.1, pz2), (540, L['zy'][0]), pz)
        CP.put(fr, CARDS['09'], cx, cy + (1 - pin) * 260, s, pin * (1 - prog(t, 13.3, 13.65)), S_REST)
    if t >= 13.25:
        pin, pout, pz = eoc(prog(t, 13.25, 13.65)), prog(t, 14.75, 15.05), eio(prog(t, 13.75, 14.65))
        cx, cy, s = cam(centre(T10), zoom_for(T10), (540, L['zy'][1]), pz)
        cx, s, a = cx - eoc(pout) * 320, s * lerp(.94, 1, pin), pin * (1 - pout)
        CP.put(fr, CARDS['10'], cx, cy, s, a, S_REST)
        r = on_screen(cx, cy, s, T10V)
        pc = prog(t, 14.0, 14.35)
        callout(fr, r, eoc(pc) * a, t)
        badge(fr, BADGE_MAIL, r, prog(t, 14.1, 14.45), a)


def s5(fr, t):
    pin, pz, pz2 = prog(t, 14.85, 15.35), eio(prog(t, 15.6, 16.7)), eio(prog(t, 17.55, 17.85))
    cx, cy, s = cam(centre(T11), zoom_for(T11) * lerp(1, 1.1, pz2), (540, L['zy'][1]), pz)
    a = clamp(pin * 2.5) * (1 - prog(t, 17.55, 17.85))
    cx = cx + (1 - eob(pin)) * 640
    CP.put(fr, CARDS['11'], cx, cy, s, a, S_REST)
    r = on_screen(cx, cy, s, T11)
    callout(fr, r, eoc(prog(t, 16.2, 16.55)) * a, t)
    badge(fr, BADGE_LEAD, r, prog(t, 16.3, 16.65), a)


def s6(fr, t):
    pv, pg, pl = prog(t, 17.85, 18.4), eio(prog(t, 18.45, 19.2)), prog(t, 19.2, DUR)
    if pv <= 0:
        return
    k = L['v'][2] / LOGO.height * (eob(pv) if pv < 1 else 1) * lerp(1, 1.25, pg) * lerp(1, 1.04, pl)
    vy = lerp(L['v'][0], L['v'][1], pg)
    blit(fr, LOGO, 540 - LOGO.width * k / 2, vy - LOGO.height * k / 2, k, clamp(pv * 4))
    ring(fr, 540, L['v'][0], prog(t, 17.88, 18.7))
    for im, y, t0 in ((WORDMARK, L['end'][0], 18.95), (TAGLINE, L['end'][1], 19.2)):
        p = eoc(prog(t, t0, t0 + .4))
        if p > 0:
            put_center(fr, im, 540, y + (1 - p) * 40, p)
    pc = prog(t, 19.45, 19.85)
    if pc > 0:
        cta_fx(fr, t, 540, L['end'][2], clamp(pc * 3))
        put_center(fr, shine(CTA, t), 540, L['end'][2], clamp(pc * 3), eob(pc) if pc < 1 else 1)


def render(t):
    if t >= 17.55:
        e = eoc(prog(t, 17.55, 17.95))
        fr = Image.blend(BG, BGEND, e) if e < 1 else BGEND.copy()
    else:
        fr = BG.copy()
    living_bg(fr, t)
    if t < 2.8:
        s1(fr, t)
    if 2.4 <= t < 7.6:
        s2(fr, t)
    if 7.3 <= t < 11.75:
        s3(fr, t)
    if 11.45 <= t < 15.1:
        s4(fr, t)
    if 14.8 <= t < 17.9:
        s5(fr, t)
    if t >= 17.8:
        s6(fr, t)
    sc = max(eio(prog(t, .95, 2.25)) * (1 - prog(t, 2.35, 2.75)),       # darken behind captions while a
             eio(prog(t, 12.15, 13.05)) * (1 - prog(t, 14.75, 15.05)),  # zoomed screen sits under them
             eio(prog(t, 15.45, 16.1)) * (1 - prog(t, 17.55, 17.85)))
    if sc > 0.01:
        fr.alpha_composite(SCRIM if sc > .99 else fade(SCRIM, sc))
        glass(fr, clamp(sc * 3))
    for c in CAPK:
        c.draw(fr, t)
    fr.alpha_composite(GRAIN[int(t * FPS) % len(GRAIN)])
    return fr.convert('RGB')


def fade(im, a):
    im = im.copy()
    im.putalpha(im.getchannel('A').point(lambda v: int(v * a)))
    return im


def frame_bytes(i):
    return render(i / FPS).tobytes()


# --- sound effects ------------------------------------------------------------------------
SFX = [('ding', .25), ('whoosh', 2.3), ('tick', 3.05), ('swish', 3.85), ('swish', 4.65), ('swish', 5.45),
       ('swish', 6.25), ('tap', 6.85), ('whoosh', 7.2), ('riser', 7.95), ('chime', 10.2), ('whoosh', 11.45),
       ('ding', 11.75), ('swish', 13.25), ('whoosh', 14.75), ('ding2', 15.0), ('whoosh', 17.5),
       ('hit', 17.88), ('tick', 19.5), ('tick', 14.12), ('tick', 16.32), ('tick', 20.05)]


def sfx_graph():
    def tone(f, d, v, lab, delay=0):
        dl = f',adelay={delay}:all=1' if delay else ''
        return f'sine=f={f}:d={d}:r=48000,volume={v},afade=t=out:d={d}:curve=exp{dl}[{lab}]'

    def mix(labs, out, extra=''):
        return ''.join(f'[{x}]' for x in labs) + f'amix=inputs={len(labs)}:normalize=0{extra}[{out}]'

    parts, outs = [], []
    for i, (name, ts) in enumerate(SFX):
        ms, o = int(ts * 1000), f'e{i}'
        dl = f',adelay={ms}:all=1' if ms else ''
        if name in ('whoosh', 'swish'):
            d, hp, v = (.55, 350, .55) if name == 'whoosh' else (.3, 1200, .3)
            parts.append(f'anoisesrc=d={d}:c=pink:r=48000:a=0.9,highpass=f={hp},lowpass=f=6000,'
                         f'afade=t=in:d={d / 2}:curve=exp,afade=t=out:st={d / 2}:d={d / 2}:curve=exp,volume={v}{dl}[{o}]')
        elif name in ('ding', 'ding2'):
            f1, f2 = (1568, 2093) if name == 'ding' else (1318.5, 1975.5)
            parts += [tone(f1, .9, .30, f'{o}a'), tone(f2, .9, .18, f'{o}b'),
                      mix([f'{o}a', f'{o}b'], o, f',aecho=0.8:0.5:70:0.25{dl}')]
        elif name in ('tick', 'tap'):
            f, v = (1900, .2) if name == 'tick' else (900, .3)
            parts.append(f'sine=f={f}:d=0.07:r=48000,volume={v},afade=t=out:d=0.07{dl}[{o}]')
        elif name == 'riser':
            parts.append(f'anoisesrc=d=2.2:c=pink:r=48000:a=0.8,highpass=f=250,lowpass=f=3000,'
                         f'afade=t=in:d=2.0:curve=exp,afade=t=out:st=2.05:d=0.15,volume=0.35{dl}[{o}]')
        elif name == 'chime':
            parts += [tone(1046.5, .7, .22, f'{o}a'), tone(1318.5, .7, .2, f'{o}b', 80),
                      tone(1568, .8, .18, f'{o}c', 160), mix([f'{o}a', f'{o}b', f'{o}c'], o, dl)]
        elif name == 'hit':
            parts += [tone(55, 1.0, .9, f'{o}a'),
                      f'anoisesrc=d=0.35:c=brown:r=48000:a=0.8,lowpass=f=300,afade=t=out:d=0.35[{o}b]',
                      tone(2637, 1.2, .07, f'{o}c'), mix([f'{o}a', f'{o}b', f'{o}c'], o, dl)]
        outs.append(o)
    parts.append(mix(outs, 'mx', f',volume=2.4,alimiter=limit=0.8,apad=whole_dur={DUR},atrim=0:{DUR},'
                                 'aformat=sample_rates=48000:channel_layouts=stereo'))
    return ';\n'.join(parts).replace('[mx]', '[aout]')


if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'frames':
        from multiprocessing import Pool
        out = sys.stdout.buffer
        with Pool(os.cpu_count()) as pool:
            for b in pool.imap(frame_bytes, range(int(round(DUR * FPS))), chunksize=6):
                out.write(b)
    elif mode == 'preview':
        for ts in sys.argv[2].split(','):
            render(float(ts)).save(f'prev_{float(ts):05.2f}.png')
    elif mode == 'sfx':
        print(sfx_graph())
    elif mode == 'redacted':
        for k, im in IM.items():
            im.save(f'red_{k}.png')

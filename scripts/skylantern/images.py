#!/usr/bin/env python3
"""Generated artwork of the Skylantern Airways demo site (a fictional airline).

    python3 images.py [--out build/images] [--sheet]

Flat, geometric "travel poster" pictures drawn with Pillow: layered skies, suns, seas, mountains
and city silhouettes, always with a floating lantern (the brand motif). Nothing is a photo and
nothing is copied: every picture is drawn here, from fixed seeds, so two runs give the same bytes.

IMAGES is the catalogue read by seed-airline.py: file name, size, bilingual title (the image's
default text alternative: it describes the picture, not the page it sits on) and the function that
draws it. --sheet also writes a contact sheet (contact-sheet.png) to review the set at a glance.

The palette follows the classic-templates "horizon" theme: navy #0B3A66, burnt orange #B4410F,
teal #0E6E8C, tint #E8F5FB, plus warm sunset tones.
"""
import argparse
import io
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---- Palette -----------------------------------------------------------------------------------
NAVY = (11, 58, 102)
NAVY_DEEP = (7, 30, 56)
NIGHT = (12, 22, 46)
ORANGE = (180, 65, 15)
TEAL = (14, 110, 140)
TEAL_LIGHT = (92, 170, 186)
TINT = (232, 245, 251)
SUNSET = (244, 162, 89)
APRICOT = (246, 193, 119)
CORAL = (231, 111, 81)
CREAM = (255, 244, 224)
ROSE = (233, 166, 166)
PLUM = (61, 44, 92)
GOLD = (233, 184, 76)
SNOW = (246, 249, 252)
FOREST = (22, 78, 74)
SAND = (238, 214, 170)
WHITE = (255, 255, 255)

S = 2  # everything is drawn at twice the size, then downsampled for smooth edges


def mix(a, b, t):
    return tuple(int(round(x + (y - x) * t)) for x, y in zip(a, b))


def rgba(c, a=255):
    return (*c[:3], a)


# ---- Building blocks ---------------------------------------------------------------------------

def vgrad(img, stops, y0=0, y1=None):
    """Vertical gradient through (t, colour) stops between y0 and y1."""
    d = ImageDraw.Draw(img)
    w, h = img.size
    y1 = h if y1 is None else y1
    for y in range(int(y0), int(y1)):
        t = (y - y0) / max(1, (y1 - y0 - 1))
        for (ta, ca), (tb, cb) in zip(stops, stops[1:]):
            if ta <= t <= tb:
                d.line([(0, y), (w, y)], fill=mix(ca, cb, (t - ta) / max(1e-6, tb - ta)))
                break


def sun(d, cx, cy, r, colour, stripes=0, gap=None, from_t=0.55):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour)
    if stripes and gap:
        top = cy - r + 2 * r * from_t
        band = (cy + r - top) / (stripes * 2)
        for i in range(stripes):
            y = top + band * (2 * i + 1)
            d.rectangle([cx - r - 2, y, cx + r + 2, y + band * (0.5 + 0.12 * i)], fill=gap)


def ridge(d, w, h, base_y, amp, colour, rng, waves=3, jag=0.0):
    """A mountain ridge from left to right: summed sines (deterministic phases) plus optional jags."""
    phases = [rng.uniform(0, math.tau) for _ in range(waves)]
    freqs = [rng.uniform(0.8, 1.6) * (i + 1) for i in range(waves)]
    pts = [(0, h)]
    steps = 120
    for i in range(steps + 1):
        x = w * i / steps
        u = i / steps * math.tau
        y = sum(math.sin(u * f + p) / (k + 1) for k, (f, p) in enumerate(zip(freqs, phases)))
        y = base_y - amp * (0.5 + 0.35 * y)
        if jag:
            y += rng.uniform(-jag, jag)
        pts.append((x, y))
    pts.append((w, h))
    d.polygon(pts, fill=colour)


def peak(d, cx, base_y, half_w, height, colour, snow=None, snow_frac=0.32):
    """A volcano-like peak with concave flanks and an optional snow cap with a ragged edge."""
    top_w = half_w * 0.12
    left, right = [], []
    for i in range(41):
        t = i / 40
        y = base_y - height * (1 - t)
        x = top_w + (half_w - top_w) * (t ** 1.8)
        left.append((cx - x, y))
        right.append((cx + x, y))
    d.polygon(left + right[::-1], fill=colour)
    if snow:
        cap_y = base_y - height * (1 - snow_frac)
        pts = [p for p in left if p[1] <= cap_y]
        rights = [p for p in right if p[1] <= cap_y][::-1]
        x_l, x_r = pts[-1][0], rights[0][0]
        teeth = []
        n = 7
        for i in range(n + 1):
            x = x_r - (x_r - x_l) * i / n
            y = cap_y + (height * 0.07 if i % 2 else 0)
            teeth.append((x, y))
        d.polygon(pts + rights + teeth, fill=snow)


def sea(d, w, y0, h, top, bottom, wave, rows=7, rng=None):
    for y in range(int(y0), int(h)):
        t = (y - y0) / max(1, h - y0)
        d.line([(0, y), (w, y)], fill=mix(top, bottom, t))
    rng = rng or random.Random(1)
    for i in range(rows):
        y = y0 + (h - y0) * (i + 0.6) / rows
        seg = w / rng.randint(5, 9)
        x = rng.uniform(-seg, 0)
        while x < w:
            length = seg * rng.uniform(0.3, 0.7)
            d.line([(x, y), (x + length, y)], fill=wave, width=max(2, int(3 * S * (0.5 + i / rows))))
            x += seg
    return y0


def cloud(d, x, y, w, colour):
    h = w * 0.22
    d.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=colour)
    d.rounded_rectangle([x + w * 0.18, y - h * 0.55, x + w * 0.62, y + h * 0.4], radius=h / 2, fill=colour)


def birds(d, x, y, n, size, colour, rng):
    for _ in range(n):
        bx, by = x + rng.uniform(0, size * 8), y + rng.uniform(0, size * 3)
        s = size * rng.uniform(0.6, 1.0)
        d.line([(bx - s, by - s * 0.4), (bx, by), (bx + s, by - s * 0.4)], fill=colour, width=max(2, int(s / 4)), joint="curve")


def lantern(img, cx, cy, h, body=ORANGE, rib=None, glow=GOLD, cap=NAVY_DEEP, string=True):
    """The brand motif: a round paper lantern with ribs, caps, a tassel and a soft glow."""
    w = h * 0.82
    if glow:
        halo = Image.new("RGBA", img.size, (0, 0, 0, 0))
        hd = ImageDraw.Draw(halo)
        hd.ellipse([cx - w * 1.1, cy - h * 1.0, cx + w * 1.1, cy + h * 1.0], fill=rgba(glow, 110))
        halo = halo.filter(ImageFilter.GaussianBlur(h * 0.35))
        img.alpha_composite(halo) if img.mode == "RGBA" else img.paste(halo, (0, 0), halo)
    d = ImageDraw.Draw(img, "RGBA")
    rib = rib or mix(body, NAVY_DEEP, 0.35)
    if string:
        d.line([(cx, cy - h * 0.5 - h * 0.6), (cx, cy - h * 0.5)], fill=rgba(cap, 200), width=max(2, int(h * 0.03)))
    d.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=body)
    d.ellipse([cx - w * 0.28, cy - h * 0.36, cx - w * 0.02, cy + h * 0.1], fill=rgba(mix(body, CREAM, 0.45), 120))
    for k in (0.18, 0.36):
        d.arc([cx - w * k, cy - h / 2, cx + w * k, cy + h / 2], 0, 360, fill=rib, width=max(2, int(h * 0.025)))
    d.line([(cx, cy - h / 2), (cx, cy + h / 2)], fill=rib, width=max(2, int(h * 0.025)))
    d.rounded_rectangle([cx - w * 0.22, cy - h * 0.58, cx + w * 0.22, cy - h * 0.44], radius=h * 0.03, fill=cap)
    d.rounded_rectangle([cx - w * 0.22, cy + h * 0.44, cx + w * 0.22, cy + h * 0.58], radius=h * 0.03, fill=cap)
    d.line([(cx, cy + h * 0.58), (cx, cy + h * 0.82)], fill=body, width=max(3, int(h * 0.05)))


def aircraft(img, cx, cy, length, colour, angle=0.0, accent=None):
    """A side-view twin-engine airliner silhouette, rotated by angle (degrees, positive climbs)."""
    L = int(length)
    layer = Image.new("RGBA", (L * 2, L * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ox, oy = L * 0.5, L
    fh = L * 0.085
    d.rounded_rectangle([ox, oy - fh / 2, ox + L, oy + fh / 2], radius=fh / 2, fill=colour)
    d.polygon([(ox + L * 0.02, oy - fh * 0.2), (ox + L * 0.0, oy - fh * 2.4), (ox + L * 0.1, oy - fh * 2.4),
               (ox + L * 0.2, oy - fh * 0.4)], fill=colour)  # fin
    d.polygon([(ox + L * 0.42, oy + fh * 0.1), (ox + L * 0.62, oy + fh * 0.1), (ox + L * 0.36, oy + fh * 1.9),
               (ox + L * 0.3, oy + fh * 1.9)], fill=mix(colour, NAVY_DEEP, 0.25))  # wing
    d.rounded_rectangle([ox + L * 0.44, oy + fh * 0.55, ox + L * 0.56, oy + fh * 1.05], radius=fh * 0.25,
                        fill=mix(colour, NAVY_DEEP, 0.4))  # engine
    d.polygon([(ox + L * 0.03, oy), (ox - L * 0.04, oy + fh * 0.6), (ox + L * 0.12, oy + fh * 0.3)], fill=colour)
    if accent:
        d.ellipse([ox + L * 0.03, oy - fh * 2.0, ox + L * 0.09, oy - fh * 1.3], fill=accent)  # lantern on the fin
        for i in range(10):
            x = ox + L * (0.3 + i * 0.055)
            d.ellipse([x, oy - fh * 0.22, x + fh * 0.22, oy + fh * 0.0], fill=rgba(accent, 230))
    layer = layer.rotate(angle, resample=Image.BICUBIC, center=(ox + L / 2, oy))
    img.paste(layer, (int(cx - ox - L / 2), int(cy - oy)), layer)


def skyline(d, x0, x1, base_y, rng, colour, hmin, hmax, wmin, wmax, windows=None, spires=0.2):
    x = x0
    while x < x1:
        bw = rng.uniform(wmin, wmax)
        bh = rng.uniform(hmin, hmax)
        d.rectangle([x, base_y - bh, x + bw, base_y], fill=colour)
        if rng.random() < spires:
            d.polygon([(x + bw * 0.3, base_y - bh), (x + bw * 0.5, base_y - bh - bh * 0.25), (x + bw * 0.7, base_y - bh)], fill=colour)
        if windows:
            for wy in range(int(base_y - bh + bw * 0.3), int(base_y - bw * 0.2), max(6, int(bw * 0.28))):
                for wx in (x + bw * 0.25, x + bw * 0.6):
                    if rng.random() < 0.55:
                        d.rectangle([wx, wy, wx + bw * 0.13, wy + bw * 0.1], fill=windows)
        x += bw + rng.uniform(0, wmin * 0.3)


def tiered_roof(d, cx, y, w, h, colour):
    """A curved temple roof: wide base with upturned eaves."""
    d.polygon([(cx - w / 2, y), (cx - w * 0.38, y - h * 0.25), (cx - w * 0.2, y - h), (cx + w * 0.2, y - h),
               (cx + w * 0.38, y - h * 0.25), (cx + w / 2, y), (cx + w * 0.42, y + h * 0.12), (cx - w * 0.42, y + h * 0.12)],
              fill=colour)


def pagoda(d, cx, base_y, w, tiers, colour, tier_h=None):
    tier_h = tier_h or w * 0.22
    y = base_y
    for i in range(tiers):
        tw = w * (1 - i * 0.14)
        d.rectangle([cx - tw * 0.28, y - tier_h * 0.75, cx + tw * 0.28, y], fill=colour)
        y -= tier_h * 0.75
        tiered_roof(d, cx, y, tw, tier_h * 0.5, colour)
        y -= tier_h * 0.45
    d.rectangle([cx - w * 0.015, y - tier_h * 0.9, cx + w * 0.015, y], fill=colour)


def prang(d, cx, base_y, w, h, colour):
    """A Thai-style temple spire: stacked tapering bands and a needle."""
    y = base_y
    bands = 7
    for i in range(bands):
        bw = w * (1 - i / bands) ** 0.9
        bh = h * 0.6 / bands
        d.rounded_rectangle([cx - bw / 2, y - bh, cx + bw / 2, y], radius=bh * 0.4, fill=colour)
        y -= bh * 0.92
    d.polygon([(cx - w * 0.05, y), (cx, y - h * 0.4), (cx + w * 0.05, y)], fill=colour)


def palm(d, x, base_y, h, colour, lean=0.15, rng=None):
    rng = rng or random.Random(3)
    top = (x + h * lean, base_y - h)
    trunk = []
    for i in range(21):
        t = i / 20
        trunk.append((x + h * lean * (t ** 1.6), base_y - h * t))
    for i, (px, py) in enumerate(trunk[:-1]):
        nx, ny = trunk[i + 1]
        d.line([(px, py), (nx, ny)], fill=colour, width=int(h * 0.045 * (1.2 - i / 25)))
    for a in (-160, -125, -90, -55, -20, 15, -200):
        ang = math.radians(a + rng.uniform(-8, 8))
        length = h * rng.uniform(0.38, 0.5)
        pts = []
        for k in range(12):
            t = k / 11
            px = top[0] + math.cos(ang) * length * t
            py = top[1] + math.sin(ang) * length * t + (length * 0.35) * t * t
            pts.append((px, py))
        for k in range(len(pts) - 1):
            d.line([pts[k], pts[k + 1]], fill=colour, width=max(3, int(h * 0.05 * (1 - k / 12))))


def pine(d, x, base_y, h, colour, snow=None):
    for i in range(3):
        y = base_y - h * (0.25 + i * 0.25)
        w = h * (0.5 - i * 0.12)
        d.polygon([(x - w / 2, y + h * 0.18), (x, y - h * 0.22), (x + w / 2, y + h * 0.18)], fill=colour)
        if snow:
            d.polygon([(x - w * 0.16, y - h * 0.08), (x, y - h * 0.22), (x + w * 0.16, y - h * 0.08)], fill=snow)
    d.rectangle([x - h * 0.03, base_y - h * 0.12, x + h * 0.03, base_y], fill=colour)


def finish(img, size):
    return img.convert("RGB").resize(size, Image.LANCZOS)


def canvas(size):
    w, h = size
    return Image.new("RGBA", (w * S, h * S), (0, 0, 0, 255)), w * S, h * S


# ---- Destinations ------------------------------------------------------------------------------

def tokyo(size):
    img, w, h = canvas(size)
    rng = random.Random(101)
    vgrad(img, [(0, (252, 226, 196)), (0.55, APRICOT), (1, SUNSET)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.62, h * 0.34, h * 0.2, CORAL, stripes=3, gap=APRICOT)
    ridge(d, w, h, h * 0.72, h * 0.12, mix(TEAL, NAVY, 0.4), rng)
    peak(d, w * 0.42, h * 0.74, w * 0.42, h * 0.48, NAVY, snow=SNOW)
    sea(d, w, h * 0.74, h, TEAL, NAVY_DEEP, rgba(TINT, 90), rng=rng)
    for _ in range(26):  # blossom petals in the corner
        x, y, r = rng.uniform(0, w * 0.22), rng.uniform(h * 0.02, h * 0.3), rng.uniform(h * 0.008, h * 0.018)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba(ROSE, 230))
    d.line([(0, h * 0.06), (w * 0.2, h * 0.18), (w * 0.26, h * 0.3)], fill=PLUM, width=int(h * 0.012), joint="curve")
    lantern(img, w * 0.86, h * 0.2, h * 0.12)
    return img


def osaka(size):
    img, w, h = canvas(size)
    rng = random.Random(102)
    vgrad(img, [(0, PLUM), (0.5, CORAL), (1, APRICOT)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.25, h * 0.42, h * 0.15, GOLD)
    skyline(d, 0, w, h * 0.72, rng, mix(PLUM, NAVY_DEEP, 0.5), h * 0.08, h * 0.22, w * 0.03, w * 0.06, spires=0)
    base = h * 0.72  # castle on a stone base
    d.polygon([(w * 0.46, base), (w * 0.49, base - h * 0.12), (w * 0.71, base - h * 0.12), (w * 0.74, base)], fill=NAVY_DEEP)
    pagoda(d, w * 0.6, base - h * 0.12, w * 0.26, 4, NAVY_DEEP, tier_h=h * 0.09)
    sea(d, w, h * 0.72, h, mix(CORAL, PLUM, 0.5), NAVY_DEEP, rgba(APRICOT, 110), rows=6, rng=rng)
    lantern(img, w * 0.85, h * 0.18, h * 0.1)
    lantern(img, w * 0.12, h * 0.16, h * 0.07, glow=None)
    return img


def sapporo(size):
    img, w, h = canvas(size)
    rng = random.Random(103)
    vgrad(img, [(0, NIGHT), (0.6, NAVY), (1, TEAL)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.74, h * 0.2, h * 0.08, (240, 240, 230))  # a full moon
    ridge(d, w, h, h * 0.66, h * 0.16, mix(TINT, TEAL_LIGHT, 0.35), rng, waves=2)
    ridge(d, w, h, h * 0.8, h * 0.14, SNOW, rng, waves=2)
    for i in range(9):
        x = w * (0.06 + i * 0.11) + rng.uniform(-w * 0.02, w * 0.02)
        pine(d, x, h * 0.86 + rng.uniform(0, h * 0.06), h * rng.uniform(0.16, 0.26), FOREST, snow=SNOW)
    for _ in range(140):
        x, y, r = rng.uniform(0, w), rng.uniform(0, h), rng.uniform(h * 0.003, h * 0.008)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba(WHITE, 200))
    lantern(img, w * 0.3, h * 0.3, h * 0.12)
    return img


def fukuoka(size):
    img, w, h = canvas(size)
    rng = random.Random(104)
    vgrad(img, [(0, (255, 236, 208)), (0.6, SUNSET), (1, CORAL)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.3, h * 0.5, h * 0.17, ORANGE, stripes=4, gap=SUNSET, from_t=0.5)
    base = h * 0.66
    skyline(d, w * 0.35, w, base, rng, NAVY, h * 0.05, h * 0.16, w * 0.025, w * 0.05, spires=0)
    d.polygon([(w * 0.66, base), (w * 0.675, base - h * 0.48), (w * 0.69, base - h * 0.48), (w * 0.705, base)], fill=NAVY_DEEP)  # slim tower
    d.rectangle([w * 0.672, base - h * 0.5, w * 0.693, base - h * 0.46], fill=NAVY_DEEP)
    d.pieslice([w * 0.42, base - h * 0.12, w * 0.58, base + h * 0.12], 180, 360, fill=NAVY_DEEP)  # dome
    sea(d, w, base, h, mix(CORAL, TEAL, 0.5), NAVY_DEEP, rgba(APRICOT, 120), rng=rng)
    birds(d, w * 0.12, h * 0.16, 5, h * 0.02, NAVY_DEEP, rng)
    lantern(img, w * 0.88, h * 0.22, h * 0.1)
    return img


def seoul(size):
    img, w, h = canvas(size)
    rng = random.Random(105)
    vgrad(img, [(0, TINT), (0.6, (196, 226, 236)), (1, TEAL_LIGHT)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.2, h * 0.26, h * 0.1, CORAL)
    ridge(d, w, h, h * 0.52, h * 0.22, mix(TEAL, TINT, 0.35), rng, waves=3)
    ridge(d, w, h, h * 0.62, h * 0.18, TEAL, rng, waves=3)
    d.rectangle([w * 0.705, h * 0.3, w * 0.715, h * 0.46], fill=NAVY)  # tower on the ridge
    d.ellipse([w * 0.695, h * 0.29, w * 0.725, h * 0.33], fill=NAVY)
    base = h * 0.9
    d.rectangle([0, base, w, h], fill=NAVY_DEEP)
    for cx, rw in ((w * 0.5, w * 0.62), (w * 0.5, w * 0.4)):
        pass
    d.rectangle([w * 0.24, base - h * 0.16, w * 0.76, base], fill=ORANGE)  # palace hall
    for i in range(7):
        x = w * (0.27 + i * 0.075)
        d.rectangle([x, base - h * 0.15, x + w * 0.018, base], fill=NAVY_DEEP)
    tiered_roof(d, w * 0.5, base - h * 0.16, w * 0.7, h * 0.12, NAVY_DEEP)
    tiered_roof(d, w * 0.5, base - h * 0.29, w * 0.46, h * 0.1, NAVY_DEEP)
    lantern(img, w * 0.86, h * 0.2, h * 0.1)
    return img


def taipei(size):
    img, w, h = canvas(size)
    rng = random.Random(106)
    vgrad(img, [(0, PLUM), (0.45, (150, 92, 120)), (1, SUNSET)])
    d = ImageDraw.Draw(img, "RGBA")
    ridge(d, w, h, h * 0.72, h * 0.28, mix(FOREST, PLUM, 0.4), rng, waves=2)
    skyline(d, 0, w, h * 0.86, rng, NAVY_DEEP, h * 0.05, h * 0.18, w * 0.03, w * 0.05, windows=rgba(GOLD, 200), spires=0.1)
    cx, y = w * 0.58, h * 0.86  # a tall tower of stacked segments
    seg_w, seg_h = w * 0.1, h * 0.075
    d.rectangle([cx - seg_w * 0.6, y - h * 0.12, cx + seg_w * 0.6, y], fill=NAVY_DEEP)
    y -= h * 0.12
    for i in range(8):
        d.polygon([(cx - seg_w * 0.36, y), (cx - seg_w * 0.5, y - seg_h), (cx + seg_w * 0.5, y - seg_h), (cx + seg_w * 0.36, y)], fill=NAVY_DEEP)
        d.line([(cx - seg_w * 0.4, y - seg_h * 0.5), (cx + seg_w * 0.4, y - seg_h * 0.5)], fill=rgba(GOLD, 200), width=S * 2)
        y -= seg_h
    d.rectangle([cx - seg_w * 0.12, y - h * 0.05, cx + seg_w * 0.12, y], fill=NAVY_DEEP)
    d.rectangle([cx - seg_w * 0.02, y - h * 0.13, cx + seg_w * 0.02, y - h * 0.05], fill=NAVY_DEEP)
    d.rectangle([0, h * 0.86, w, h], fill=NIGHT)
    lantern(img, w * 0.2, h * 0.22, h * 0.12)
    lantern(img, w * 0.82, h * 0.3, h * 0.07, glow=None)
    return img


def bangkok(size):
    img, w, h = canvas(size)
    rng = random.Random(107)
    vgrad(img, [(0, (255, 226, 170)), (0.55, GOLD), (1, ORANGE)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.5, h * 0.42, h * 0.24, (252, 238, 200))
    base = h * 0.7
    prang(d, w * 0.5, base, w * 0.2, h * 0.5, PLUM)
    for cx, s in ((w * 0.3, 0.6), (w * 0.7, 0.6), (w * 0.17, 0.4), (w * 0.83, 0.4)):
        prang(d, cx, base, w * 0.2 * s, h * 0.5 * s, PLUM)
    d.rectangle([0, base - h * 0.02, w, base], fill=PLUM)
    sea(d, w, base, h, mix(ORANGE, PLUM, 0.4), NAVY_DEEP, rgba(GOLD, 140), rows=6, rng=rng)
    d.polygon([(w * 0.12, h * 0.86), (w * 0.38, h * 0.86), (w * 0.34, h * 0.9), (w * 0.15, h * 0.9)], fill=NAVY_DEEP)  # long-tail boat
    d.line([(w * 0.12, h * 0.86), (w * 0.09, h * 0.82)], fill=NAVY_DEEP, width=S * 4)
    lantern(img, w * 0.12, h * 0.2, h * 0.1)
    return img


def singapore(size):
    img, w, h = canvas(size)
    rng = random.Random(108)
    vgrad(img, [(0, NIGHT), (0.6, (26, 70, 104)), (1, TEAL)])
    d = ImageDraw.Draw(img, "RGBA")
    for _ in range(60):
        x, y, r = rng.uniform(0, w), rng.uniform(0, h * 0.45), rng.uniform(h * 0.002, h * 0.005)
        d.ellipse([x - r, y - r, x + r, y + r], fill=rgba(WHITE, 180))
    base = h * 0.74
    skyline(d, 0, w * 0.4, base, rng, NAVY_DEEP, h * 0.12, h * 0.3, w * 0.03, w * 0.05, windows=rgba(GOLD, 180), spires=0.1)
    for i in range(3):  # three towers joined by a deck
        x = w * (0.5 + i * 0.09)
        d.polygon([(x, base), (x + w * 0.012, base - h * 0.4), (x + w * 0.05, base - h * 0.4), (x + w * 0.055, base)], fill=NAVY_DEEP)
    d.polygon([(w * 0.47, base - h * 0.44), (w * 0.78, base - h * 0.45), (w * 0.79, base - h * 0.41), (w * 0.49, base - h * 0.41)], fill=NAVY_DEEP)
    for i, x in enumerate((w * 0.84, w * 0.9, w * 0.96)):  # garden "trees" of steel
        top = base - h * (0.22 + 0.06 * (i % 2))
        d.polygon([(x - w * 0.006, base), (x + w * 0.006, base), (x + w * 0.004, top), (x - w * 0.004, top)], fill=TEAL_LIGHT)
        d.pieslice([x - w * 0.04, top - h * 0.06, x + w * 0.04, top + h * 0.04], 180, 360, fill=TEAL_LIGHT)
    sea(d, w, base, h, (20, 60, 92), NIGHT, rgba(GOLD, 120), rows=7, rng=rng)
    lantern(img, w * 0.18, h * 0.2, h * 0.11)
    return img


def manila(size):
    img, w, h = canvas(size)
    rng = random.Random(109)
    vgrad(img, [(0, (252, 214, 170)), (0.5, CORAL), (1, PLUM)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.66, h * 0.56, h * 0.2, GOLD, stripes=3, gap=CORAL)
    peak(d, w * 0.3, h * 0.66, w * 0.3, h * 0.34, PLUM)
    for i in range(5):  # a wisp of cloud from the crater
        cloud(d, w * (0.24 + i * 0.05), h * (0.28 - i * 0.03), w * 0.12, rgba(CREAM, 150))
    sea(d, w, h * 0.66, h, mix(CORAL, PLUM, 0.5), NAVY_DEEP, rgba(GOLD, 140), rows=6, rng=rng)
    d.polygon([(w * 0.7, h * 0.82), (w * 0.8, h * 0.82), (w * 0.78, h * 0.85), (w * 0.72, h * 0.85)], fill=NAVY_DEEP)
    d.polygon([(w * 0.745, h * 0.81), (w * 0.745, h * 0.66), (w * 0.8, h * 0.81)], fill=CREAM)  # sail
    palm(d, w * 0.92, h * 1.0, h * 0.5, NAVY_DEEP, lean=-0.18, rng=rng)
    lantern(img, w * 0.1, h * 0.18, h * 0.1)
    return img


def da_nang(size):
    img, w, h = canvas(size)
    rng = random.Random(110)
    vgrad(img, [(0, TINT), (0.5, (170, 220, 230)), (1, (120, 196, 210))])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.78, h * 0.22, h * 0.1, SUNSET)
    for cx, hw, hh in ((w * 0.18, w * 0.1, h * 0.26), (w * 0.32, w * 0.08, h * 0.2), (w * 0.44, w * 0.06, h * 0.14)):
        d.rounded_rectangle([cx - hw, h * 0.6 - hh, cx + hw, h * 0.62], radius=hw * 0.7, fill=FOREST)  # limestone hills
    sea(d, w, h * 0.6, h * 0.8, TEAL, mix(TEAL, NAVY, 0.4), rgba(WHITE, 120), rows=5, rng=rng)
    d.arc([w * 0.48, h * 0.48, w * 1.05, h * 0.72], 190, 350, fill=GOLD, width=int(h * 0.025))  # bridge arc
    d.line([(w * 0.48, h * 0.6), (w * 1.0, h * 0.6)], fill=NAVY, width=int(h * 0.012))
    d.rectangle([0, h * 0.8, w, h], fill=SAND)
    d.polygon([(0, h * 0.8), (w, h * 0.78), (w, h * 0.81), (0, h * 0.83)], fill=rgba(WHITE, 160))
    palm(d, w * 0.08, h * 1.02, h * 0.55, NAVY, lean=0.2, rng=rng)
    palm(d, w * 0.18, h * 1.02, h * 0.4, NAVY, lean=0.12, rng=rng)
    lantern(img, w * 0.6, h * 0.2, h * 0.1)
    return img


# ---- Heroes and service pictures ---------------------------------------------------------------

def hero_home(size):
    img, w, h = canvas(size)
    rng = random.Random(201)
    vgrad(img, [(0, NAVY_DEEP), (0.45, PLUM), (0.75, CORAL), (1, APRICOT)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.5, h * 0.78, h * 0.26, SUNSET, stripes=4, gap=CORAL, from_t=0.45)
    skyline(d, 0, w, h * 0.86, rng, NAVY_DEEP, h * 0.05, h * 0.2, w * 0.018, w * 0.035, windows=rgba(GOLD, 170), spires=0.15)
    sea(d, w, h * 0.86, h, mix(CORAL, PLUM, 0.6), NIGHT, rgba(APRICOT, 120), rows=4, rng=rng)
    aircraft(img, w * 0.64, h * 0.3, w * 0.3, NAVY_DEEP, angle=8, accent=GOLD)
    for x, y, s in ((0.12, 0.3, 0.1), (0.24, 0.5, 0.07), (0.86, 0.56, 0.08), (0.36, 0.22, 0.05), (0.92, 0.2, 0.05)):
        lantern(img, w * x, h * y, h * s)
    return img


def hero_offers(size):
    img, w, h = canvas(size)
    rng = random.Random(202)
    vgrad(img, [(0, (120, 186, 214)), (0.6, TINT), (1, (252, 226, 196))])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.22, h * 0.62, h * 0.2, SUNSET)
    for i in range(9):
        cloud(d, w * rng.uniform(-0.1, 0.9), h * (0.62 + i * 0.04), w * rng.uniform(0.25, 0.45), rgba(WHITE, 235))
    aircraft(img, w * 0.6, h * 0.36, w * 0.36, NAVY, angle=6, accent=ORANGE)
    lantern(img, w * 0.86, h * 0.18, h * 0.12)
    return img


def hero_destinations(size):
    img, w, h = canvas(size)
    rng = random.Random(203)
    vgrad(img, [(0, (182, 222, 236)), (1, TEAL_LIGHT)])
    d = ImageDraw.Draw(img, "RGBA")
    for i in range(16):  # wave marks
        y = h * (0.08 + i * 0.06)
        for k in range(7):
            x = w * (k / 6) + (i % 2) * w * 0.07
            d.arc([x, y, x + w * 0.05, y + h * 0.03], 200, 340, fill=rgba(WHITE, 120), width=S * 2)
    islands = [(0.78, 0.22, 0.12, 0.08), (0.7, 0.38, 0.05, 0.1), (0.62, 0.55, 0.04, 0.03), (0.5, 0.52, 0.06, 0.05),
               (0.42, 0.66, 0.08, 0.05), (0.3, 0.78, 0.1, 0.06), (0.2, 0.42, 0.14, 0.12), (0.56, 0.8, 0.04, 0.06)]
    hub = (w * 0.5, h * 0.52)
    for x, y, rx, ry in islands:
        d.ellipse([w * (x - rx), h * (y - ry), w * (x + rx), h * (y + ry)], fill=SAND)
        d.ellipse([w * (x - rx * 0.7), h * (y - ry * 0.6), w * (x + rx * 0.6), h * (y + ry * 0.5)], fill=mix(SAND, FOREST, 0.35))
    for x, y, _, _ in islands:  # dotted routes from the hub
        tx, ty = w * x, h * y
        if abs(tx - hub[0]) < w * 0.03:
            continue
        for k in range(1, 18):
            t = k / 18
            mx_, my_ = hub[0] + (tx - hub[0]) * t, hub[1] + (ty - hub[1]) * t - math.sin(t * math.pi) * h * 0.08
            d.ellipse([mx_ - S * 3, my_ - S * 3, mx_ + S * 3, my_ + S * 3], fill=NAVY)
        d.ellipse([tx - S * 8, ty - S * 8, tx + S * 8, ty + S * 8], fill=ORANGE)
    lantern(img, hub[0], hub[1] - h * 0.02, h * 0.1)
    return img


def hero_book(size):
    img, w, h = canvas(size)
    rng = random.Random(204)
    vgrad(img, [(0, (98, 160, 200)), (0.55, TINT), (1, WHITE)])
    d = ImageDraw.Draw(img, "RGBA")
    for i in range(7):
        cloud(d, w * rng.uniform(-0.1, 0.9), h * rng.uniform(0.55, 0.85), w * rng.uniform(0.3, 0.5), rgba(WHITE, 240))
    d.polygon([(0, h * 0.45), (w * 0.75, h * 0.62), (w * 0.8, h * 0.7), (0, h * 0.68)], fill=NAVY)  # a wing seen from a window
    d.polygon([(w * 0.72, h * 0.6), (w * 0.8, h * 0.42), (w * 0.84, h * 0.43), (w * 0.8, h * 0.68)], fill=NAVY)
    d.polygon([(0, h * 0.62), (w * 0.6, h * 0.66), (w * 0.62, h * 0.7), (0, h * 0.68)], fill=mix(NAVY, TEAL, 0.4))
    d.ellipse([w * 0.79, h * 0.42, w * 0.83, h * 0.46], fill=ORANGE)
    lantern(img, w * 0.16, h * 0.2, h * 0.12)
    return img


def hero_travel(size):
    img, w, h = canvas(size)
    rng = random.Random(205)
    vgrad(img, [(0, (252, 222, 186)), (1, SUNSET)])
    d = ImageDraw.Draw(img, "RGBA")
    sun(d, w * 0.7, h * 0.46, h * 0.16, CORAL)
    d.rectangle([0, h * 0.7, w, h], fill=(120, 110, 120))
    d.line([(0, h * 0.82), (w, h * 0.82)], fill=rgba(CREAM, 200), width=S * 6)
    aircraft(img, w * 0.55, h * 0.66, w * 0.34, NAVY_DEEP, angle=0, accent=GOLD)
    d.rectangle([0, 0, w, h * 0.06], fill=NAVY_DEEP)  # terminal window frame
    d.rectangle([0, h * 0.94, w, h], fill=NAVY_DEEP)
    for k in range(1, 4):
        d.rectangle([w * k / 4 - S * 8, 0, w * k / 4 + S * 8, h], fill=NAVY_DEEP)
    lantern(img, w * 0.12, h * 0.3, h * 0.12)
    return img


def hero_experience(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (198, 226, 238))])
    d = ImageDraw.Draw(img, "RGBA")
    d.polygon([(w * 0.3, 0), (w * 0.7, 0), (w, h), (0, h)], fill=(214, 234, 242))  # aisle perspective
    for i in range(5):
        t = i / 5
        y = h * (0.22 + t * 0.62)
        sw = w * (0.08 + t * 0.12)
        for side in (-1, 1):
            cx = w * 0.5 + side * w * (0.12 + t * 0.32)
            d.rounded_rectangle([cx - sw / 2, y - sw * 0.9, cx + sw / 2, y + sw * 0.2], radius=sw * 0.2, fill=NAVY)
            d.rounded_rectangle([cx - sw * 0.42, y - sw * 0.84, cx + sw * 0.42, y - sw * 0.6], radius=sw * 0.1, fill=TEAL)
    d.rectangle([w * 0.44, h * 0.3, w * 0.56, h * 0.42], fill=rgba(WHITE, 220))
    img2 = img
    lantern(img2, w * 0.5, h * 0.14, h * 0.1)
    return img


def hero_about(size):
    img, w, h = canvas(size)
    rng = random.Random(207)
    vgrad(img, [(0, NIGHT), (0.7, NAVY), (1, TEAL)])
    d = ImageDraw.Draw(img, "RGBA")
    ridge(d, w, h, h * 0.62, h * 0.24, mix(NAVY, NIGHT, 0.5), rng, waves=2)
    skyline(d, 0, w, h * 0.78, rng, NIGHT, h * 0.08, h * 0.3, w * 0.02, w * 0.04, windows=rgba(GOLD, 200), spires=0.2)
    sea(d, w, h * 0.78, h, (16, 50, 84), NIGHT, rgba(GOLD, 110), rows=6, rng=rng)
    for _ in range(14):
        lantern(img, w * rng.uniform(0.05, 0.95), h * rng.uniform(0.1, 0.5), h * rng.uniform(0.03, 0.07), glow=GOLD, string=False)
    return img


def hero_help(size):
    img, w, h = canvas(size)
    rng = random.Random(208)
    vgrad(img, [(0, (96, 150, 190)), (0.6, (180, 214, 230)), (1, TINT)])
    d = ImageDraw.Draw(img, "RGBA")
    ridge(d, w, h, h * 0.8, h * 0.2, FOREST, rng, waves=2)
    d.rectangle([w * 0.62, h * 0.4, w * 0.66, h * 0.76], fill=CREAM)  # a lantern post on the headland
    lantern(img, w * 0.64, h * 0.32, h * 0.16)
    sea(d, w, h * 0.84, h, TEAL, NAVY, rgba(WHITE, 120), rows=4, rng=rng)
    birds(d, w * 0.15, h * 0.2, 6, h * 0.025, NAVY, rng)
    return img


def fleet(size, wide=False, seed=301):
    img, w, h = canvas(size)
    rng = random.Random(seed)
    vgrad(img, [(0, (120, 186, 214)), (0.7, TINT), (1, (252, 230, 204))])
    d = ImageDraw.Draw(img, "RGBA")
    for i in range(5):
        cloud(d, w * rng.uniform(-0.1, 0.9), h * rng.uniform(0.6, 0.9), w * rng.uniform(0.3, 0.5), rgba(WHITE, 235))
    aircraft(img, w * 0.52, h * 0.44, w * (0.8 if wide else 0.66), NAVY, angle=4, accent=ORANGE)
    if wide:  # a second engine shows under the wing of the wide-body
        d.rounded_rectangle([w * 0.42, h * 0.5, w * 0.5, h * 0.54], radius=h * 0.02, fill=mix(NAVY, NAVY_DEEP, 0.5))
    return img


def a321(size):
    return fleet(size, wide=False, seed=301)


def a330(size):
    return fleet(size, wide=True, seed=302)


def cabin_business(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, (236, 226, 214)), (1, (210, 196, 182))])
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([w * 0.06, h * 0.1, w * 0.3, h * 0.42], radius=w * 0.05, fill=(160, 200, 220))  # window
    d.rounded_rectangle([w * 0.09, h * 0.14, w * 0.27, h * 0.38], radius=w * 0.04, fill=APRICOT)
    d.ellipse([w * 0.14, h * 0.22, w * 0.22, h * 0.3], fill=CORAL)
    d.rounded_rectangle([w * 0.4, h * 0.12, w * 0.62, h * 0.72], radius=w * 0.05, fill=NAVY)  # seat back
    d.rounded_rectangle([w * 0.38, h * 0.62, w * 0.9, h * 0.8], radius=w * 0.04, fill=NAVY)  # seat
    d.rounded_rectangle([w * 0.62, h * 0.5, w * 0.9, h * 0.58], radius=w * 0.02, fill=TEAL)  # armrest
    d.rectangle([w * 0.38, h * 0.8, w * 0.9, h * 0.9], fill=NAVY_DEEP)
    d.rounded_rectangle([w * 0.44, h * 0.18, w * 0.58, h * 0.3], radius=w * 0.02, fill=TEAL)  # headrest
    lantern(img, w * 0.82, h * 0.24, h * 0.14)
    return img


def cabin_economy(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (204, 228, 238))])
    d = ImageDraw.Draw(img, "RGBA")
    for row in range(3):
        for k in range(3):
            x = w * (0.1 + k * 0.28)
            y = h * (0.15 + row * 0.27)
            d.rounded_rectangle([x, y, x + w * 0.22, y + h * 0.22], radius=w * 0.03, fill=TEAL if row != 1 else NAVY)
            d.rounded_rectangle([x + w * 0.04, y + h * 0.04, x + w * 0.18, y + h * 0.1], radius=w * 0.02, fill=rgba(WHITE, 200))
    lantern(img, w * 0.92, h * 0.12, h * 0.1, glow=None)
    return img


def meals(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, CREAM), (1, SAND)])
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([w * 0.12, h * 0.16, w * 0.88, h * 0.84], radius=w * 0.04, fill=NAVY)  # tray, seen from above
    d.ellipse([w * 0.18, h * 0.24, w * 0.52, h * 0.7], fill=WHITE)
    d.ellipse([w * 0.24, h * 0.32, w * 0.46, h * 0.62], fill=SUNSET)
    d.ellipse([w * 0.29, h * 0.4, w * 0.36, h * 0.48], fill=FOREST)
    d.ellipse([w * 0.6, h * 0.24, w * 0.8, h * 0.44], fill=WHITE)
    d.ellipse([w * 0.63, h * 0.27, w * 0.77, h * 0.41], fill=CORAL)
    d.rounded_rectangle([w * 0.58, h * 0.52, w * 0.82, h * 0.74], radius=w * 0.02, fill=TINT)
    d.line([(w * 0.56, h * 0.26), (w * 0.56, h * 0.74)], fill=CREAM, width=S * 6)
    lantern(img, w * 0.9, h * 0.1, h * 0.09, glow=None)
    return img


def seats_map(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (210, 232, 242))])
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([w * 0.2, h * 0.04, w * 0.8, h * 0.96], radius=w * 0.25, fill=WHITE)
    for row in range(9):
        for col in range(6):
            x = w * (0.27 + col * 0.075 + (0.04 if col >= 3 else 0))
            y = h * (0.18 + row * 0.085)
            colour = ORANGE if row < 2 else (TEAL if row in (4,) else NAVY)
            d.rounded_rectangle([x, y, x + w * 0.055, y + h * 0.06], radius=w * 0.012, fill=colour)
    lantern(img, w * 0.5, h * 0.09, h * 0.07, glow=None, string=False)
    return img


def baggage(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, (252, 230, 204)), (1, SUNSET)])
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, h * 0.82, w, h], fill=mix(SUNSET, PLUM, 0.4))
    for x, bw, bh, c in ((0.16, 0.26, 0.5, NAVY), (0.46, 0.2, 0.36, TEAL), (0.7, 0.16, 0.26, ORANGE)):
        x0, y1 = w * x, h * 0.82
        d.rounded_rectangle([x0, y1 - h * bh, x0 + w * bw, y1], radius=w * 0.03, fill=c)
        d.rounded_rectangle([x0 + w * bw * 0.32, y1 - h * bh - h * 0.06, x0 + w * bw * 0.68, y1 - h * bh + h * 0.01],
                            radius=w * 0.015, outline=c, width=S * 8)
        for k in (0.3, 0.7):
            d.line([(x0 + w * bw * k, y1 - h * bh + h * 0.04), (x0 + w * bw * k, y1 - h * 0.03)], fill=rgba(WHITE, 90), width=S * 6)
    d.rectangle([w * 0.2, h * 0.5, w * 0.27, h * 0.56], fill=CREAM)  # luggage tag
    lantern(img, w * 0.88, h * 0.2, h * 0.11)
    return img


def checkin(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (196, 224, 236))])
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle([w * 0.32, h * 0.12, w * 0.68, h * 0.9], radius=w * 0.03, fill=NAVY)  # kiosk
    d.rounded_rectangle([w * 0.37, h * 0.18, w * 0.63, h * 0.48], radius=w * 0.015, fill=TEAL_LIGHT)
    d.rectangle([w * 0.4, h * 0.24, w * 0.6, h * 0.27], fill=WHITE)
    d.rectangle([w * 0.4, h * 0.31, w * 0.53, h * 0.34], fill=WHITE)
    d.rounded_rectangle([w * 0.4, h * 0.39, w * 0.6, h * 0.44], radius=w * 0.01, fill=ORANGE)
    d.rectangle([w * 0.42, h * 0.58, w * 0.58, h * 0.6], fill=NAVY_DEEP)
    d.polygon([(w * 0.6, h * 0.56), (w * 0.9, h * 0.5), (w * 0.94, h * 0.66), (w * 0.64, h * 0.72)], fill=CREAM)  # boarding pass
    d.line([(w * 0.84, h * 0.52), (w * 0.88, h * 0.68)], fill=rgba(NAVY, 160), width=S * 3)
    lantern(img, w * 0.14, h * 0.2, h * 0.11)
    return img


def airport(size):
    img, w, h = canvas(size)
    rng = random.Random(311)
    vgrad(img, [(0, (110, 170, 206)), (0.7, TINT), (1, (252, 226, 196))])
    d = ImageDraw.Draw(img, "RGBA")
    d.rectangle([0, h * 0.72, w, h], fill=(110, 116, 128))
    for i in range(8):
        x = w * (i / 8)
        d.rectangle([x, h * 0.85, x + w * 0.06, h * 0.86], fill=CREAM)
    d.rectangle([w * 0.18, h * 0.3, w * 0.22, h * 0.72], fill=NAVY)  # control tower
    d.polygon([(w * 0.14, h * 0.3), (w * 0.26, h * 0.3), (w * 0.24, h * 0.22), (w * 0.16, h * 0.22)], fill=NAVY)
    d.rectangle([w * 0.16, h * 0.24, w * 0.24, h * 0.27], fill=TEAL_LIGHT)
    d.pieslice([w * 0.34, h * 0.52, w * 0.96, h * 0.92], 180, 360, fill=TEAL)  # terminal roof
    d.rectangle([w * 0.34, h * 0.68, w * 0.96, h * 0.74], fill=NAVY)
    aircraft(img, w * 0.66, h * 0.2, w * 0.3, NAVY, angle=10, accent=ORANGE)
    lantern(img, w * 0.06, h * 0.12, h * 0.08, glow=None)
    return img


def assistance(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (200, 228, 238))])
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse([w * 0.18, h * 0.14, w * 0.82, h * 0.86], fill=TEAL)  # a large disc
    d.ellipse([w * 0.44, h * 0.22, w * 0.54, h * 0.32], fill=WHITE)  # an accessibility-style figure
    d.line([(w * 0.49, h * 0.34), (w * 0.47, h * 0.54), (w * 0.62, h * 0.54), (w * 0.66, h * 0.7)], fill=WHITE, width=S * 18, joint="curve")
    d.line([(w * 0.48, h * 0.42), (w * 0.62, h * 0.42)], fill=WHITE, width=S * 14)
    d.arc([w * 0.32, h * 0.46, w * 0.58, h * 0.74], 60, 300, fill=WHITE, width=S * 14)
    lantern(img, w * 0.86, h * 0.16, h * 0.1, glow=None)
    return img


def story(size):
    img, w, h = canvas(size)
    rng = random.Random(313)
    vgrad(img, [(0, NAVY_DEEP), (0.6, PLUM), (1, CORAL)])
    d = ImageDraw.Draw(img, "RGBA")
    ridge(d, w, h, h * 0.66, h * 0.2, mix(PLUM, NIGHT, 0.5), rng, waves=2)
    sea(d, w, h * 0.7, h, mix(CORAL, PLUM, 0.6), NIGHT, rgba(GOLD, 110), rows=6, rng=rng)
    d.polygon([(w * 0.2, h * 0.8), (w * 0.5, h * 0.8), (w * 0.46, h * 0.85), (w * 0.24, h * 0.85)], fill=NIGHT)  # a junk boat
    d.polygon([(w * 0.3, h * 0.79), (w * 0.3, h * 0.56), (w * 0.42, h * 0.62), (w * 0.4, h * 0.79)], fill=CORAL)
    lantern(img, w * 0.5, h * 0.3, h * 0.2)
    lantern(img, w * 0.8, h * 0.18, h * 0.08)
    return img


def careers(size):
    img, w, h = canvas(size)
    vgrad(img, [(0, TINT), (1, (252, 226, 196))])
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w * 0.5, h * 0.5  # a pair of pilot-style wings around the lantern
    for side in (-1, 1):
        for i in range(5):
            x0 = cx + side * w * 0.08
            x1 = cx + side * w * (0.42 - i * 0.05)
            y = cy - h * 0.08 + i * h * 0.045
            d.line([(x0, y), (x1, y + h * 0.02)], fill=NAVY, width=int(h * 0.03))
    d.ellipse([cx - w * 0.1, cy - h * 0.13, cx + w * 0.1, cy + h * 0.13], fill=NAVY)
    lantern(img, cx, cy, h * 0.18, glow=None, string=False)
    return img


def partner_scene(size, seed, sky, accent):
    img, w, h = canvas(size)
    rng = random.Random(seed)
    vgrad(img, sky)
    d = ImageDraw.Draw(img, "RGBA")
    return img, d, w, h, rng


def partner_hotel(size):
    img, d, w, h, rng = partner_scene(size, 401, [(0, (252, 226, 196)), (1, CORAL)], ORANGE)
    sun(d, w * 0.3, h * 0.4, h * 0.14, GOLD)
    d.rectangle([w * 0.5, h * 0.2, w * 0.74, h * 0.8], fill=NAVY)  # a hotel tower by the harbour
    for row in range(10):
        for col in range(4):
            if rng.random() < 0.7:
                d.rectangle([w * (0.52 + col * 0.055), h * (0.24 + row * 0.052), w * (0.555 + col * 0.055), h * (0.27 + row * 0.052)],
                            fill=rgba(GOLD, 220))
    sea(d, w, h * 0.8, h, mix(CORAL, NAVY, 0.5), NAVY_DEEP, rgba(APRICOT, 120), rows=4, rng=rng)
    lantern(img, w * 0.86, h * 0.2, h * 0.1)
    return img


def partner_card(size):
    img, d, w, h, rng = partner_scene(size, 402, [(0, TINT), (1, (190, 222, 236))], TEAL)
    d.rounded_rectangle([w * 0.18, h * 0.24, w * 0.78, h * 0.76], radius=w * 0.04, fill=NAVY)  # a payment card, no numbers
    d.rounded_rectangle([w * 0.24, h * 0.36, w * 0.34, h * 0.46], radius=w * 0.01, fill=GOLD)
    d.rectangle([w * 0.24, h * 0.6, w * 0.6, h * 0.63], fill=rgba(WHITE, 140))
    d.ellipse([w * 0.62, h * 0.56, w * 0.72, h * 0.7], fill=rgba(ORANGE, 230))
    lantern(img, w * 0.86, h * 0.2, h * 0.1)
    return img


def partner_car(size):
    img, d, w, h, rng = partner_scene(size, 403, [(0, (252, 236, 210)), (1, SUNSET)], TEAL)
    ridge(d, w, h, h * 0.66, h * 0.16, mix(TEAL, NAVY, 0.4), rng, waves=2)
    d.rectangle([0, h * 0.74, w, h], fill=(96, 100, 112))
    for i in range(6):
        d.rectangle([w * (i / 6 + 0.02), h * 0.86, w * (i / 6 + 0.1), h * 0.875], fill=CREAM)
    d.rounded_rectangle([w * 0.3, h * 0.58, w * 0.7, h * 0.76], radius=h * 0.05, fill=TEAL)  # a small car
    d.rounded_rectangle([w * 0.38, h * 0.5, w * 0.6, h * 0.62], radius=h * 0.04, fill=TEAL)
    d.rectangle([w * 0.41, h * 0.53, w * 0.57, h * 0.6], fill=TINT)
    for x in (0.38, 0.62):
        d.ellipse([w * x - h * 0.05, h * 0.71, w * x + h * 0.05, h * 0.81], fill=NAVY_DEEP)
    lantern(img, w * 0.86, h * 0.2, h * 0.1)
    return img


# ---- Logos, partner monograms and icons (PNG, transparent background) ---------------------------

def font(size):
    return ImageFont.load_default(size=size)


def logo(size, light=False):
    """The Skylantern Airways logo: the lantern mark and the wordmark, drawn for a light background
    (light=True: for a dark background)."""
    w, h = size[0] * S, size[1] * S
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    text = TINT if light else NAVY
    lantern(img, h * 0.42, h * 0.5, h * 0.7, body=SUNSET if light else ORANGE, glow=None, cap=text, string=False)
    d = ImageDraw.Draw(img)
    d.text((h * 0.9, h * 0.04), "Skylantern", font=font(int(h * 0.58)), fill=text, stroke_width=int(S * 1.5), stroke_fill=text)
    d.text((h * 0.94, h * 0.66), "A I R W A Y S", font=font(int(h * 0.24)), fill=SUNSET if light else ORANGE,
           stroke_width=1, stroke_fill=SUNSET if light else ORANGE)
    box = img.getbbox()  # trim the empty right-hand side, keep the height
    img = img.crop((0, 0, min(w, box[2] + int(h * 0.08)), h))
    return img.resize((round(img.width * size[1] / h), size[1]), Image.LANCZOS)


def logo_light(size):
    return logo(size, light=True)


def monogram(letters, colour, shape):
    def draw(size):
        w, h = size[0] * S, size[1] * S
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        box = [h * 0.12, h * 0.12, h * 0.88, h * 0.88]
        if shape == "circle":
            d.ellipse(box, fill=colour)
        elif shape == "square":
            d.rounded_rectangle(box, radius=h * 0.16, fill=colour)
        elif shape == "diamond":
            d.polygon([(h * 0.5, h * 0.06), (h * 0.94, h * 0.5), (h * 0.5, h * 0.94), (h * 0.06, h * 0.5)], fill=colour)
        elif shape == "ring":
            d.ellipse(box, outline=colour, width=int(h * 0.1))
        elif shape == "shield":
            d.polygon([(h * 0.14, h * 0.12), (h * 0.86, h * 0.12), (h * 0.86, h * 0.56), (h * 0.5, h * 0.92), (h * 0.14, h * 0.56)], fill=colour)
        f = font(int(h * 0.34))
        fg = colour if shape == "ring" else WHITE
        tw = d.textlength(letters, font=f)
        d.text((h * 0.5 - tw / 2, h * 0.3), letters, font=f, fill=fg, stroke_width=S, stroke_fill=fg)
        d.rounded_rectangle([h * 1.05, h * 0.36, w * 0.94, h * 0.5], radius=h * 0.07, fill=colour)  # name bars
        d.rounded_rectangle([h * 1.05, h * 0.58, w * 0.72, h * 0.66], radius=h * 0.04, fill=(100, 116, 139, 255))
        return img.resize(size, Image.LANCZOS)
    return draw


def icon(glyph, colour=NAVY):
    """A 96 px round icon: a filled disc with a white line glyph (readable on light and dark pages)."""
    def draw(size):
        s = 4
        n = size[0] * s
        img = Image.new("RGBA", (n, n), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.ellipse([0, 0, n - 1, n - 1], fill=colour)
        wh, lw = (255, 255, 255, 255), 6 * s

        def b(*v):
            return [x * s for x in v]

        if glyph == "guide":
            d.rectangle(b(26, 30, 47, 66), outline=wh, width=lw)
            d.rectangle(b(49, 30, 70, 66), outline=wh, width=lw)
        elif glyph == "faq":
            d.arc(b(32, 22, 64, 52), 180, 90, fill=wh, width=lw)
            d.line(b(48, 52, 48, 60), fill=wh, width=lw)
            d.ellipse(b(44, 66, 52, 74), fill=wh)
        elif glyph == "media":
            d.rectangle(b(24, 28, 72, 68), outline=wh, width=lw)
            d.line(b(32, 40, 64, 40), fill=wh, width=lw)
            d.line(b(32, 52, 56, 52), fill=wh, width=lw)
        elif glyph == "advisory":
            d.polygon(b(48, 20, 76, 72, 20, 72), outline=wh, width=lw)
            d.line(b(48, 38, 48, 56), fill=wh, width=lw)
            d.ellipse(b(45, 61, 51, 67), fill=wh)
        elif glyph == "assistance":
            d.ellipse(b(42, 18, 54, 30), fill=wh)
            d.line(b(48, 34, 46, 54, 62, 54, 66, 70), fill=wh, width=lw, joint="curve")
            d.arc(b(26, 44, 56, 74), 60, 300, fill=wh, width=lw)
        elif glyph == "contact":
            d.rounded_rectangle(b(24, 28, 72, 60), radius=8 * s, outline=wh, width=lw)
            d.polygon(b(34, 58, 34, 72, 48, 58), fill=wh)
        elif glyph == "battery":
            d.rectangle(b(26, 34, 66, 62), outline=wh, width=lw)
            d.rectangle(b(68, 42, 74, 54), fill=wh)
            d.rectangle(b(32, 40, 46, 56), fill=wh)
        elif glyph == "lighter":
            d.rectangle(b(36, 44, 60, 74), outline=wh, width=lw)
            d.polygon(b(48, 18, 56, 34, 48, 40, 40, 34), fill=wh)
        elif glyph == "aerosol":
            d.rounded_rectangle(b(36, 34, 60, 76), radius=6 * s, outline=wh, width=lw)
            d.rectangle(b(42, 22, 54, 32), fill=wh)
            for x, y in ((64, 22), (70, 30), (64, 36)):
                d.ellipse(b(x - 2, y - 2, x + 2, y + 2), fill=wh)
        elif glyph == "flame":
            d.polygon(b(48, 18, 66, 50, 60, 70, 36, 70, 30, 50, 40, 36, 44, 48), fill=wh)
        elif glyph == "blade":
            d.polygon(b(26, 66, 66, 26, 72, 32, 34, 70), fill=wh)
            d.line(b(30, 62, 22, 74), fill=wh, width=lw)
        elif glyph == "cylinder":
            d.rounded_rectangle(b(34, 30, 62, 76), radius=12 * s, outline=wh, width=lw)
            d.rectangle(b(42, 18, 54, 28), fill=wh)
        elif glyph == "app":
            d.rounded_rectangle(b(32, 18, 64, 78), radius=6 * s, outline=wh, width=lw)
            d.ellipse(b(45, 66, 51, 72), fill=wh)
        elif glyph == "lounge":
            d.rounded_rectangle(b(24, 44, 72, 64), radius=6 * s, outline=wh, width=lw)
            d.line(b(30, 64, 30, 74), fill=wh, width=lw)
            d.line(b(66, 64, 66, 74), fill=wh, width=lw)
            d.line(b(30, 44, 30, 30, 66, 30, 66, 44), fill=wh, width=lw)
        return img.resize(size, Image.LANCZOS)
    return draw


# ---- Catalogue ---------------------------------------------------------------------------------

def T(en, fr):
    return {"en": en, "fr": fr}


POSTER = (1200, 900)
HERO = (1600, 900)
SQUARE = (1200, 1200)
LOGO = (480, 88)
PARTNER = (240, 120)
ICON = (96, 96)

IMAGES = [
    # Destinations
    {"name": "dest-tokyo.jpg", "size": POSTER, "draw": tokyo, "title": T(
        "Poster-style illustration of a snow-capped peak above a striped red sun, with blossom petals and a glowing lantern",
        "Illustration façon affiche d'un sommet enneigé devant un soleil rouge rayé, avec des pétales de fleurs et une lanterne lumineuse")},
    {"name": "dest-osaka.jpg", "size": POSTER, "draw": osaka, "title": T(
        "Poster-style illustration of a tiered castle on a stone base against a violet and coral evening sky",
        "Illustration façon affiche d'un château à toits étagés sur un socle de pierre, sous un ciel du soir violet et corail")},
    {"name": "dest-sapporo.jpg", "size": POSTER, "draw": sapporo, "title": T(
        "Poster-style illustration of snowy hills and pine trees under a full moon, with falling snow and a lantern",
        "Illustration façon affiche de collines enneigées et de pins sous la pleine lune, avec des flocons et une lanterne")},
    {"name": "dest-fukuoka.jpg", "size": POSTER, "draw": fukuoka, "title": T(
        "Poster-style illustration of a harbour skyline with a slim tower and a dome in front of a large orange sun",
        "Illustration façon affiche d'un port avec une tour élancée et un dôme devant un grand soleil orange")},
    {"name": "dest-seoul.jpg", "size": POSTER, "draw": seoul, "title": T(
        "Poster-style illustration of a palace hall with curved double roofs below green mountain ridges and a hilltop tower",
        "Illustration façon affiche d'un palais aux doubles toits recourbés sous des crêtes vertes et une tour au sommet")},
    {"name": "dest-taipei.jpg", "size": POSTER, "draw": taipei, "title": T(
        "Poster-style illustration of a tall segmented tower above a lit city at dusk, with green hills and lanterns",
        "Illustration façon affiche d'une haute tour à étages au-dessus d'une ville illuminée au crépuscule, avec des collines et des lanternes")},
    {"name": "dest-bangkok.jpg", "size": POSTER, "draw": bangkok, "title": T(
        "Poster-style illustration of temple spires by a river under a pale golden sun, with a long-tail boat",
        "Illustration façon affiche de flèches de temples au bord d'un fleuve sous un soleil doré, avec un bateau à longue queue")},
    {"name": "dest-singapore.jpg", "size": POSTER, "draw": singapore, "title": T(
        "Poster-style illustration of three towers joined by a roof deck and tree-shaped structures over a night bay",
        "Illustration façon affiche de trois tours reliées par une terrasse et de structures en forme d'arbres au-dessus d'une baie de nuit")},
    {"name": "dest-manila.jpg", "size": POSTER, "draw": manila, "title": T(
        "Poster-style illustration of a volcano and a sailing boat on a bay at sunset, with a palm tree",
        "Illustration façon affiche d'un volcan et d'un voilier sur une baie au coucher du soleil, avec un palmier")},
    {"name": "dest-da-nang.jpg", "size": POSTER, "draw": da_nang, "title": T(
        "Poster-style illustration of a sandy beach with palm trees, green limestone hills and a golden bridge arch",
        "Illustration façon affiche d'une plage de sable avec des palmiers, des collines calcaires et l'arche dorée d'un pont")},
    # Heroes
    {"name": "hero-home.jpg", "size": HERO, "draw": hero_home, "title": T(
        "Illustration of an airliner climbing over a harbour city at sunset, surrounded by floating lanterns",
        "Illustration d'un avion de ligne qui grimpe au-dessus d'une ville portuaire au coucher du soleil, entouré de lanternes flottantes")},
    {"name": "hero-offers.jpg", "size": HERO, "draw": hero_offers, "title": T(
        "Illustration of an airliner above a sea of white clouds with a rising sun",
        "Illustration d'un avion de ligne au-dessus d'une mer de nuages blancs avec un soleil levant")},
    {"name": "hero-destinations.jpg", "size": HERO, "draw": hero_destinations, "title": T(
        "Illustrated map of islands in a blue sea, linked to a central lantern by dotted flight routes",
        "Carte illustrée d'îles dans une mer bleue, reliées à une lanterne centrale par des routes aériennes en pointillés")},
    {"name": "hero-book.jpg", "size": HERO, "draw": hero_book, "title": T(
        "Illustration of an aircraft wing seen from the window, above white clouds",
        "Illustration d'une aile d'avion vue du hublot, au-dessus de nuages blancs")},
    {"name": "hero-travel.jpg", "size": HERO, "draw": hero_travel, "title": T(
        "Illustration of an airliner on the apron seen through terminal windows at sunset",
        "Illustration d'un avion de ligne sur le tarmac vu à travers les baies vitrées du terminal au coucher du soleil")},
    {"name": "hero-experience.jpg", "size": HERO, "draw": hero_experience, "title": T(
        "Illustration of a bright aircraft cabin with rows of navy seats along the aisle",
        "Illustration d'une cabine d'avion lumineuse avec des rangées de sièges bleu marine le long de l'allée")},
    {"name": "hero-about.jpg", "size": HERO, "draw": hero_about, "title": T(
        "Illustration of a harbour city at night under dozens of small glowing lanterns",
        "Illustration d'une ville portuaire de nuit sous des dizaines de petites lanternes lumineuses")},
    {"name": "hero-help.jpg", "size": HERO, "draw": hero_help, "title": T(
        "Illustration of a lantern on a post on a green headland above the sea, with birds in the sky",
        "Illustration d'une lanterne sur un poteau, sur un promontoire vert au-dessus de la mer, avec des oiseaux dans le ciel")},
    # Fleet, cabin and services
    {"name": "fleet-a321neo.jpg", "size": POSTER, "draw": a321, "title": T(
        "Illustration of a navy single-aisle airliner with an orange lantern on its tail, above the clouds",
        "Illustration d'un avion monocouloir bleu marine avec une lanterne orange sur la dérive, au-dessus des nuages")},
    {"name": "fleet-a330.jpg", "size": POSTER, "draw": a330, "title": T(
        "Illustration of a long navy twin-aisle airliner with an orange lantern on its tail, above the clouds",
        "Illustration d'un long avion gros-porteur bleu marine avec une lanterne orange sur la dérive, au-dessus des nuages")},
    {"name": "cabin-business.jpg", "size": POSTER, "draw": cabin_business, "title": T(
        "Illustration of a wide navy business seat next to a window showing a sunset",
        "Illustration d'un large siège affaires bleu marine près d'un hublot donnant sur un coucher de soleil")},
    {"name": "cabin-economy.jpg", "size": POSTER, "draw": cabin_economy, "title": T(
        "Illustration of three rows of teal and navy economy seats seen from behind",
        "Illustration de trois rangées de sièges économiques bleu canard et bleu marine vus de dos")},
    {"name": "service-meals.jpg", "size": POSTER, "draw": meals, "title": T(
        "Illustration of a meal tray seen from above, with a main dish, a small bowl and a dessert",
        "Illustration d'un plateau-repas vu de dessus, avec un plat, un petit bol et un dessert")},
    {"name": "service-seats.jpg", "size": POSTER, "draw": seats_map, "title": T(
        "Illustrated seat map of an aircraft cabin, front rows in orange and the other rows in navy and teal",
        "Plan de cabine illustré, les premiers rangs en orange et les autres en bleu marine et bleu canard")},
    {"name": "service-baggage.jpg", "size": POSTER, "draw": baggage, "title": T(
        "Illustration of three suitcases of different sizes, navy, teal and orange, on a warm background",
        "Illustration de trois valises de tailles différentes, bleu marine, bleu canard et orange, sur un fond chaud")},
    {"name": "service-checkin.jpg", "size": POSTER, "draw": checkin, "title": T(
        "Illustration of a self-service check-in kiosk printing a boarding pass",
        "Illustration d'une borne d'enregistrement en libre-service qui imprime une carte d'embarquement")},
    {"name": "service-airport.jpg", "size": POSTER, "draw": airport, "title": T(
        "Illustration of an airport with a control tower, a curved terminal roof and an airliner taking off",
        "Illustration d'un aéroport avec une tour de contrôle, un terminal au toit arrondi et un avion qui décolle")},
    {"name": "service-assistance.jpg", "size": POSTER, "draw": assistance, "title": T(
        "Illustration of a white wheelchair-user figure on a large teal disc",
        "Illustration d'une silhouette blanche en fauteuil roulant sur un grand disque bleu canard")},
    {"name": "story-harbour.jpg", "size": SQUARE, "draw": story, "title": T(
        "Illustration of a large lantern above a sailing junk on a harbour at dusk",
        "Illustration d'une grande lanterne au-dessus d'une jonque sur un port au crépuscule")},
    {"name": "careers-wings.jpg", "size": POSTER, "draw": careers, "title": T(
        "Illustration of a pair of navy crew wings around an orange lantern",
        "Illustration d'une paire d'ailes d'équipage bleu marine autour d'une lanterne orange")},
    {"name": "partner-hotel.jpg", "size": POSTER, "draw": partner_hotel, "title": T(
        "Illustration of a lit hotel tower by a harbour at sunset",
        "Illustration d'une tour d'hôtel illuminée au bord d'un port au coucher du soleil")},
    {"name": "partner-card.jpg", "size": POSTER, "draw": partner_card, "title": T(
        "Illustration of a navy payment card with a gold chip and no number",
        "Illustration d'une carte de paiement bleu marine avec une puce dorée et sans numéro")},
    {"name": "partner-car.jpg", "size": POSTER, "draw": partner_car, "title": T(
        "Illustration of a small teal car on a road below hills",
        "Illustration d'une petite voiture bleu canard sur une route au pied des collines")},
    # Logo (header): the wordmark is in the picture, so its text alternative is the brand name.
    {"name": "skylantern-logo.png", "size": LOGO, "draw": logo, "title": T("Skylantern Airways", "Skylantern Airways")},
    {"name": "skylantern-logo-light.png", "size": LOGO, "draw": logo_light, "title": T("Skylantern Airways", "Skylantern Airways")},
    # Fictional partners (logo strip, pass 2): the alternative is the partner's name.
    {"name": "partner-harbourline.png", "size": PARTNER, "draw": monogram("HH", NAVY, "square"), "title": T("Harbourline Hotels", "Harbourline Hotels")},
    {"name": "partner-lumen.png", "size": PARTNER, "draw": monogram("LC", TEAL, "circle"), "title": T("Lumen Card", "Lumen Card")},
    {"name": "partner-tidewater.png", "size": PARTNER, "draw": monogram("TC", ORANGE, "diamond"), "title": T("Tidewater Car Rental", "Tidewater Car Rental")},
    {"name": "partner-northgate.png", "size": PARTNER, "draw": monogram("NI", (29, 107, 58), "shield"), "title": T("Northgate Travel Insurance", "Northgate Travel Insurance")},
    {"name": "partner-kitefield.png", "size": PARTNER, "draw": monogram("KL", PLUM, "ring"), "title": T("Kitefield Lounges", "Kitefield Lounges")},
    # Icons (icon tiles, pass 2). Tiles carry their own text: the icons are decorative there, but
    # their titles still describe them for the media library.
    {"name": "icon-guide.png", "size": ICON, "draw": icon("guide"), "title": T("Icon of an open book", "Icône d'un livre ouvert")},
    {"name": "icon-faq.png", "size": ICON, "draw": icon("faq", TEAL), "title": T("Icon of a question mark", "Icône d'un point d'interrogation")},
    {"name": "icon-media.png", "size": ICON, "draw": icon("media"), "title": T("Icon of a news page", "Icône d'une page d'actualités")},
    {"name": "icon-advisory.png", "size": ICON, "draw": icon("advisory", ORANGE), "title": T("Icon of a warning triangle", "Icône d'un triangle d'avertissement")},
    {"name": "icon-assistance.png", "size": ICON, "draw": icon("assistance", TEAL), "title": T("Icon of a wheelchair user", "Icône d'une personne en fauteuil roulant")},
    {"name": "icon-contact.png", "size": ICON, "draw": icon("contact"), "title": T("Icon of a speech bubble", "Icône d'une bulle de dialogue")},
    {"name": "icon-lounge.png", "size": ICON, "draw": icon("lounge", TEAL), "title": T("Icon of a sofa", "Icône d'un canapé")},
    {"name": "icon-app.png", "size": ICON, "draw": icon("app"), "title": T("Icon of a mobile phone", "Icône d'un téléphone portable")},
    {"name": "icon-battery.png", "size": ICON, "draw": icon("battery", ORANGE), "title": T("Icon of a battery", "Icône d'une batterie")},
    {"name": "icon-lighter.png", "size": ICON, "draw": icon("lighter", ORANGE), "title": T("Icon of a lighter", "Icône d'un briquet")},
    {"name": "icon-aerosol.png", "size": ICON, "draw": icon("aerosol", ORANGE), "title": T("Icon of an aerosol can", "Icône d'une bombe aérosol")},
    {"name": "icon-flame.png", "size": ICON, "draw": icon("flame", ORANGE), "title": T("Icon of a flame", "Icône d'une flamme")},
    {"name": "icon-blade.png", "size": ICON, "draw": icon("blade", ORANGE), "title": T("Icon of a blade", "Icône d'une lame")},
    {"name": "icon-cylinder.png", "size": ICON, "draw": icon("cylinder", ORANGE), "title": T("Icon of a gas cylinder", "Icône d'une bouteille de gaz")},
]


def render(image):
    """The image's bytes, MIME type and final size (JPEG for pictures, PNG for logos and icons).
    Pictures are drawn at twice their size and downsampled; a logo may come back narrower than
    its nominal size (it is trimmed to its content)."""
    picture = image["draw"](image["size"])
    if picture.width == image["size"][0] * S and picture.height == image["size"][1] * S:
        picture = finish(picture, image["size"])
    buf = io.BytesIO()
    if image["name"].endswith(".png"):
        picture.save(buf, "PNG", optimize=True)
        return buf.getvalue(), "image/png", picture.size
    picture.convert("RGB").save(buf, "JPEG", quality=86, optimize=True)
    return buf.getvalue(), "image/jpeg", picture.size


def generate(out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for image in IMAGES:
        data, _, _ = render(image)
        (out / image["name"]).write_bytes(data)
    return out


def contact_sheet(out_dir):
    out = Path(out_dir)
    thumbs = []
    for image in IMAGES:
        im = Image.open(out / image["name"]).convert("RGBA")
        im.thumbnail((320, 240))
        tile = Image.new("RGBA", (330, 250), (200, 200, 200, 255))
        tile.paste(im, ((330 - im.width) // 2, (250 - im.height) // 2), im)
        thumbs.append(tile)
    cols = 6
    rows = math.ceil(len(thumbs) / cols)
    sheet = Image.new("RGB", (cols * 330, rows * 250), (255, 255, 255))
    for i, t in enumerate(thumbs):
        sheet.paste(t.convert("RGB"), ((i % cols) * 330, (i // cols) * 250))
    sheet.save(out / "contact-sheet.png")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--out", default=str(Path(__file__).with_name("build") / "images"))
    ap.add_argument("--sheet", action="store_true")
    args = ap.parse_args()
    folder = generate(args.out)
    if args.sheet:
        contact_sheet(folder)
    print(f"{len(IMAGES)} images written to {folder}")

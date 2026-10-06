#!/usr/bin/env python3
"""Draws the 32x32 content-type icons of settings/content-types-icons/ (one simple glyph per type).

Run after adding a type: python3 scripts/make-icons.py  (needs Pillow). Existing icons are redrawn.
Icons are drawn at 4x and downsampled, so strokes stay crisp at 32px. Same ink as the
classic-templates icons, so both modules look alike in the content type selector.
"""
from pathlib import Path
from PIL import Image, ImageDraw

INK = (34, 67, 125, 255)
S = 4
OUT = Path(__file__).resolve().parent.parent / "settings" / "content-types-icons"


def icon(name, draw_fn):
    img = Image.new("RGBA", (32 * S, 32 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d, lambda *v: [x * S for x in v])
    img.resize((32, 32), Image.LANCZOS).save(OUT / f"{name}.png")


def w(n=2):
    return n * S


def plane(d, p):
    d.polygon(p(16, 3, 19, 12, 29, 17, 29, 19, 19, 17, 18, 25, 21, 28, 21, 29, 16, 28, 11, 29, 11, 28,
                14, 25, 13, 17, 3, 19, 3, 17, 13, 12), fill=INK)


def pin(d, p):
    d.ellipse(p(8, 3, 24, 19), outline=INK, width=w(3))
    d.polygon(p(9, 15, 23, 15, 16, 29), fill=INK)
    d.ellipse(p(13, 8, 19, 14), fill=INK)


def tag(d, p):
    d.polygon(p(4, 15, 15, 4, 28, 4, 28, 17, 17, 28), outline=INK, width=w(3))
    d.ellipse(p(21, 8, 25, 12), fill=INK)


def fare_list(d, p):
    for y in (6, 14, 22):
        d.rounded_rectangle(p(4, y, 28, y + 6), radius=2 * S, outline=INK, width=w(2))
        d.line(p(20, y + 3, 25, y + 3), fill=INK, width=w(2))


def grid(d, p):
    for x in (4, 18):
        for y in (4, 18):
            d.rounded_rectangle(p(x, y, x + 10, y + 10), radius=2 * S, outline=INK, width=w(2))
    d.ellipse(p(7, 7, 11, 11), fill=INK)


def tabs(d, p):
    d.rectangle(p(3, 10, 29, 28), outline=INK, width=w(2))
    d.rectangle(p(3, 5, 12, 10), fill=INK)
    d.rectangle(p(13, 6, 21, 10), outline=INK, width=w(2))


def tool(d, p):
    d.rounded_rectangle(p(4, 9, 28, 26), radius=3 * S, outline=INK, width=w(3))
    d.rectangle(p(12, 5, 20, 9), outline=INK, width=w(2))
    d.line(p(4, 16, 28, 16), fill=INK, width=w(2))



ICONS = {
    "ctrvmix_component": plane,
    "ctrvmix_pageComponent": plane,
    "ctrv_destination": pin,
    "ctrv_fareOffer": tag,
    "ctrv_fareList": fare_list,
    "ctrv_destinationGrid": grid,
    "ctrv_travelTools": tabs,
    "ctrv_travelTool": tool,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ICONS.items():
        icon(name, fn)
    print(f"{len(ICONS)} icons written to {OUT}")

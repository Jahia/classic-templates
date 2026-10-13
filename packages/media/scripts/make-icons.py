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


def wave(d, p):
    # A signal: three arcs over a dot (the media group).
    for r in (6, 10, 14):
        d.arc(p(16 - r, 18 - r, 16 + r, 18 + r), start=220, end=320, fill=INK, width=w(2))
    d.ellipse(p(14, 22, 18, 26), fill=INK)


def person(d, p):
    d.ellipse(p(11, 4, 21, 14), fill=INK)
    d.rounded_rectangle(p(6, 17, 26, 29), radius=6 * S, fill=INK)


def story(d, p):
    d.rectangle(p(5, 4, 27, 28), outline=INK, width=w(2))
    d.rectangle(p(9, 8, 23, 14), fill=INK)
    for y in (18, 22):
        d.line(p(9, y, 23, y), fill=INK, width=w(2))


def feed(d, p):
    for y in (5, 13, 21):
        d.rectangle(p(4, y, 10, y + 6), fill=INK)
        d.line(p(13, y + 2, 28, y + 2), fill=INK, width=w(2))
        d.line(p(13, y + 5, 22, y + 5), fill=INK, width=w(1))


def session(d, p):
    d.ellipse(p(4, 4, 28, 28), outline=INK, width=w(2))
    d.line(p(16, 9, 16, 16), fill=INK, width=w(2))
    d.line(p(16, 16, 22, 19), fill=INK, width=w(2))


def speaker(d, p):
    d.ellipse(p(9, 5, 17, 13), fill=INK)
    d.rounded_rectangle(p(5, 16, 21, 27), radius=5 * S, fill=INK)
    d.rounded_rectangle(p(22, 8, 28, 20), radius=3 * S, outline=INK, width=w(2))


def agenda(d, p):
    d.rectangle(p(4, 6, 28, 28), outline=INK, width=w(2))
    d.rectangle(p(4, 6, 28, 11), fill=INK)
    for y in (15, 20, 25):
        d.line(p(8, y, 24, y), fill=INK, width=w(2))


def gallery(d, p):
    for x, y in ((5, 5), (17, 5), (5, 17), (17, 17)):
        d.ellipse(p(x + 2, y, x + 8, y + 6), fill=INK)
        d.rectangle(p(x, y + 7, x + 10, y + 10), fill=INK)


def key_dates(d, p):
    d.rectangle(p(4, 6, 28, 28), outline=INK, width=w(2))
    d.line(p(10, 3, 10, 9), fill=INK, width=w(2))
    d.line(p(22, 3, 22, 9), fill=INK, width=w(2))
    d.rectangle(p(12, 15, 20, 23), fill=INK)


def key_date(d, p):
    d.rectangle(p(7, 8, 25, 26), outline=INK, width=w(2))
    d.rectangle(p(12, 14, 20, 21), fill=INK)


ICONS = {
    "ctmdmix_component": wave,
    "ctmdmix_pageComponent": wave,
    "ctmd_person": person,
    "ctmd_story": story,
    "ctmd_storyFeed": feed,
    "ctmd_session": session,
    "ctmd_sessionSpeaker": speaker,
    "ctmd_agenda": agenda,
    "ctmd_speakerGallery": gallery,
    "ctmd_keyDates": key_dates,
    "ctmd_keyDate": key_date,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ICONS.items():
        icon(name, fn)
    print(f"{len(ICONS)} icons written to {OUT}")

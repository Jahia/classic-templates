#!/usr/bin/env python3
"""Draws the 32x32 content-type icons of settings/content-types-icons/ (one simple glyph per type).

Run after adding a type: python3 scripts/make-icons.py  (needs Pillow). Existing icons are redrawn.
Icons are drawn at 4x and downsampled, so strokes stay crisp at 32px.
"""
from pathlib import Path
from PIL import Image, ImageDraw

INK = (34, 67, 125, 255)       # navy, the default theme's accent
S = 4                          # supersampling factor
OUT = Path(__file__).resolve().parent.parent / "settings" / "content-types-icons"


def icon(name, draw_fn):
    img = Image.new("RGBA", (32 * S, 32 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    draw_fn(d, lambda *v: [x * S for x in v])
    img.resize((32, 32), Image.LANCZOS).save(OUT / f"{name}.png")


def w(n=2):
    return n * S


def link(d, p):
    d.rounded_rectangle(p(3, 11, 17, 21), radius=5 * S, outline=INK, width=w(3))
    d.rounded_rectangle(p(15, 11, 29, 21), radius=5 * S, outline=INK, width=w(3))


def link_list(d, p):
    for y in (8, 16, 24):
        d.ellipse(p(4, y - 2, 8, y + 2), fill=INK)
        d.line(p(11, y, 28, y), fill=INK, width=w(3))


def main_navigation(d, p):
    d.rectangle(p(3, 6, 29, 11), fill=INK)
    for x in (5, 13, 21):
        d.line(p(x, 16, x + 6, 16), fill=INK, width=w(2))
    d.rectangle(p(12, 19, 25, 27), outline=INK, width=w(2))


def language_switcher(d, p):
    d.ellipse(p(4, 4, 28, 28), outline=INK, width=w(2))
    d.ellipse(p(11, 4, 21, 28), outline=INK, width=w(2))
    d.line(p(4, 16, 28, 16), fill=INK, width=w(2))


def site_header(d, p):
    d.rectangle(p(3, 4, 29, 28), outline=INK, width=w(2))
    d.rectangle(p(3, 4, 29, 12), fill=INK)


def site_footer(d, p):
    d.rectangle(p(3, 4, 29, 28), outline=INK, width=w(2))
    d.rectangle(p(3, 20, 29, 28), fill=INK)


def footer_columns(d, p):
    for x in (4, 13, 22):
        d.rectangle(p(x, 8, x + 6, 24), outline=INK, width=w(2))


def hero_banner(d, p):
    d.rectangle(p(3, 6, 29, 26), outline=INK, width=w(2))
    d.line(p(7, 13, 21, 13), fill=INK, width=w(3))
    d.line(p(7, 18, 16, 18), fill=INK, width=w(2))
    d.rectangle(p(7, 21, 13, 23), fill=INK)


def image_text(d, p):
    d.rectangle(p(3, 8, 15, 24), outline=INK, width=w(2))
    d.polygon(p(5, 22, 9, 16, 13, 22), fill=INK)
    for y in (10, 15, 20):
        d.line(p(18, y, 29, y), fill=INK, width=w(2))


def rich_text(d, p):
    d.line(p(4, 7, 22, 7), fill=INK, width=w(3))
    for y, x2 in ((13, 28), (18, 26), (23, 28)):
        d.line(p(4, y, x2, y), fill=INK, width=w(2))


def columns(d, p):
    d.rectangle(p(3, 6, 14, 26), outline=INK, width=w(2))
    d.rectangle(p(18, 6, 29, 26), outline=INK, width=w(2))


def column(d, p):
    d.rectangle(p(10, 5, 22, 27), outline=INK, width=w(2))
    d.line(p(13, 11, 19, 11), fill=INK, width=w(2))
    d.line(p(13, 16, 19, 16), fill=INK, width=w(2))


ICONS = {
    "ctpl_heroBanner": hero_banner,
    "ctpl_imageText": image_text,
    "ctpl_richText": rich_text,
    "ctpl_columns": columns,
    "ctpl_column": column,
    "ctpl_link": link,
    "ctpl_linkList": link_list,
    "ctpl_mainNavigation": main_navigation,
    "ctpl_languageSwitcher": language_switcher,
    "ctpl_siteHeader": site_header,
    "ctpl_siteFooter": site_footer,
    "ctpl_footerColumns": footer_columns,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ICONS.items():
        icon(name, fn)
    print(f"{len(ICONS)} icons written to {OUT}")

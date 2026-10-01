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


def news(d, p):
    d.rectangle(p(4, 5, 28, 27), outline=INK, width=w(2))
    d.rectangle(p(8, 9, 16, 16), fill=INK)
    for y in (10, 14):
        d.line(p(19, y, 24, y), fill=INK, width=w(2))
    for y in (20, 24):
        d.line(p(8, y, 24, y), fill=INK, width=w(2))


def article(d, p):
    d.rectangle(p(7, 4, 25, 28), outline=INK, width=w(2))
    d.line(p(11, 10, 21, 10), fill=INK, width=w(3))
    for y in (15, 19, 23):
        d.line(p(11, y, 21, y), fill=INK, width=w(2))


def jcr_query(d, p):
    for y in (6, 14, 22):
        d.rectangle(p(4, y, 10, y + 5), fill=INK)
        d.line(p(13, y + 2, 28, y + 2), fill=INK, width=w(2))


def card_grid(d, p):
    for x in (3, 12, 21):
        d.rectangle(p(x, 8, x + 8, 24), outline=INK, width=w(2))
        d.rectangle(p(x, 8, x + 8, 13), fill=INK)


def card(d, p):
    d.rectangle(p(8, 4, 24, 28), outline=INK, width=w(2))
    d.rectangle(p(8, 4, 24, 13), fill=INK)
    d.line(p(11, 18, 21, 18), fill=INK, width=w(2))
    d.line(p(11, 23, 18, 23), fill=INK, width=w(2))


def content_teaser(d, p):
    card(d, p)
    d.polygon(p(20, 26, 28, 18, 28, 26), fill=INK)


def key_figures(d, p):
    for x, h in ((5, 10), (14, 16), (23, 22)):
        d.rectangle(p(x, 27 - h, x + 5, 27), fill=INK)


def key_figure(d, p):
    d.ellipse(p(5, 5, 27, 27), outline=INK, width=w(3))
    d.line(p(12, 16, 20, 16), fill=INK, width=w(3))
    d.line(p(16, 12, 16, 20), fill=INK, width=w(3))


def quote(d, p):
    for x in (6, 17):
        d.ellipse(p(x, 9, x + 8, 17), fill=INK)
        d.polygon(p(x, 14, x + 8, 14, x + 2, 24), fill=INK)


def site_map(d, p):
    d.rectangle(p(12, 4, 20, 10), fill=INK)
    d.line(p(16, 10, 16, 15), fill=INK, width=w(2))
    d.line(p(7, 15, 25, 15), fill=INK, width=w(2))
    for x in (4, 13, 22):
        d.line(p(x + 3, 15, x + 3, 20), fill=INK, width=w(2))
        d.rectangle(p(x, 20, x + 6, 26), outline=INK, width=w(2))


def free_zone(d, p):
    d.rectangle(p(4, 6, 28, 26), outline=INK, width=w(2))
    for x, y in ((9, 11), (19, 11), (9, 20), (19, 20)):
        d.ellipse(p(x - 2, y - 2, x + 2, y + 2), fill=INK)


def accordion(d, p):
    for y in (5, 13, 21):
        d.rectangle(p(4, y, 28, y + 6), outline=INK, width=w(2))
        d.line(p(22, y + 2, 24, y + 4, 26, y + 2), fill=INK, width=w(2))


def accordion_item(d, p):
    d.rectangle(p(4, 6, 28, 13), fill=INK)
    d.rectangle(p(4, 13, 28, 26), outline=INK, width=w(2))
    for y in (18, 22):
        d.line(p(8, y, 22, y), fill=INK, width=w(2))


def tabs(d, p):
    d.rectangle(p(4, 6, 12, 12), fill=INK)
    d.rectangle(p(13, 7, 20, 12), outline=INK, width=w(2))
    d.rectangle(p(21, 7, 28, 12), outline=INK, width=w(2))
    d.rectangle(p(4, 12, 28, 27), outline=INK, width=w(2))


def tab(d, p):
    d.rectangle(p(6, 6, 16, 12), fill=INK)
    d.rectangle(p(6, 12, 26, 27), outline=INK, width=w(2))
    for y in (17, 22):
        d.line(p(10, y, 22, y), fill=INK, width=w(2))


def notice_bar(d, p):
    d.rectangle(p(2, 11, 30, 21), outline=INK, width=w(2))
    d.ellipse(p(5, 14, 9, 18), fill=INK)
    d.line(p(12, 16, 26, 16), fill=INK, width=w(2))


def hero_carousel(d, p):
    d.rectangle(p(5, 6, 27, 22), outline=INK, width=w(2))
    d.line(p(9, 12, 20, 12), fill=INK, width=w(3))
    d.line(p(9, 17, 16, 17), fill=INK, width=w(2))
    d.polygon(p(1, 14, 3, 12, 3, 16), fill=INK)
    d.polygon(p(31, 14, 29, 12, 29, 16), fill=INK)
    for x in (12, 16, 20):
        d.ellipse(p(x - 1, 25, x + 1, 27), fill=INK)


ICONS = {
    "ctpl_news": news,
    "ctpl_article": article,
    "ctpl_jcrQuery": jcr_query,
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
    "ctpl_cardGrid": card_grid,
    "ctpl_card": card,
    "ctpl_contentTeaser": content_teaser,
    "ctpl_keyFigures": key_figures,
    "ctpl_keyFigure": key_figure,
    "ctpl_quote": quote,
    "ctpl_siteMap": site_map,
    "ctpl_freeZone": free_zone,
    "ctpl_accordion": accordion,
    "ctpl_accordionItem": accordion_item,
    "ctpl_tabs": tabs,
    "ctpl_tab": tab,
    "ctpl_noticeBar": notice_bar,
    "ctpl_heroCarousel": hero_carousel,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in ICONS.items():
        icon(name, fn)
    print(f"{len(ICONS)} icons written to {OUT}")

#!/usr/bin/env python3
"""Checks every page of the live site, as an anonymous visitor, in EN and FR: HTTP 200, exactly one
h1, no heading level jump inside <main>, meta description length, every image answering 200, and
the menu depth. Usage: python3 tools/check-pages.py [--site skylantern]"""
import argparse
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import airline_content as ac  # noqa: E402

URL = os.environ.get("JAHIA_URL", "http://localhost:8080").rstrip("/")


def get(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, b""


ap = argparse.ArgumentParser()
ap.add_argument("--site", default="skylantern")
args = ap.parse_args()
bad, seen_imgs = 0, {}
pages = [""] + [p["path"] for p in ac.PAGE_TREE]
items = {}  # main resources (destinations, fares, news, articles) linked from the pages, per language
for lang in ("", "/fr"):
    queue = [(page, f"{URL}{lang}/sites/{args.site}/home{'/' + page if page else ''}.html") for page in pages]
    while queue:
        page, url = queue.pop(0)
        status, body = get(url)
        html = body.decode("utf-8", "replace")
        if status != 200:
            print(f"FAIL {status} {url}")
            bad += 1
            continue
        for href in re.findall(r'href="([^"]*/sites/%s/contents/[^"#?]+\.html)"' % args.site, html):
            full = href if href.startswith("http") else URL + href
            if full not in items:
                items[full] = True
                queue.append((href.split(f"/sites/{args.site}/")[1][:-5], full))
        main = re.search(r"<main.*?</main>", html, re.S)
        main = main.group(0) if main else ""
        levels = "".join(re.findall(r"<h([1-6])[\s>]", main))
        h1 = len(re.findall(r"<h1[\s>]", html))
        jumps = any(int(b) - int(a) > 1 for a, b in zip(levels, levels[1:]))
        desc = re.search(r'<meta name="description" content="([^"]*)"', html)
        dlen = len(desc.group(1)) if desc else 0
        for src in set(re.findall(r'<img[^>]+src="([^"]+)"', html)):
            src = src.replace("&amp;", "&")
            if src not in seen_imgs:
                seen_imgs[src] = get(src if src.startswith("http") else URL + src)[0]
        broken = [s for s in re.findall(r'<img[^>]+src="([^"]+)"', html) if seen_imgs.get(s.replace("&amp;", "&")) != 200]
        noalt = len(re.findall(r"<img(?![^>]*\balt=)[^>]*>", html))
        ok = h1 == 1 and not jumps and levels.startswith("1") and 120 <= dlen <= 160 and not broken and not noalt
        bad += 0 if ok else 1
        print(f"{'ok  ' if ok else 'FAIL'} {('/fr' if url.startswith(URL + '/fr/') else '/en'):4} {page or 'home':40} h1={h1} outline={levels[:22]:22} "
              f"{'JUMP ' if jumps else ''}desc={dlen} imgs={len(re.findall('<img', html))}{' BROKEN=' + str(len(broken)) if broken else ''}"
              f"{' NOALT=' + str(noalt) if noalt else ''}")
# Menu depth, from the home page: nested lists inside the main navigation.
_, body = get(f"{URL}/sites/{args.site}/home.html")
nav = re.search(r'<nav[^>]*data-testid="ctpl-main-navigation".*?</nav>', body.decode(), re.S) or re.search(r"<nav.*?</nav>", body.decode(), re.S)
depth, d = 0, 0
for tag in re.findall(r"<(/?)ul\b", nav.group(0) if nav else ""):
    d += -1 if tag else 1
    depth = max(depth, d)
print(f"main resources checked: {len(items)}")
print(f"menu depth: {depth} nested lists; images checked: {len(seen_imgs)}, broken: {sum(1 for v in seen_imgs.values() if v != 200)}")
sys.exit(1 if bad else 0)

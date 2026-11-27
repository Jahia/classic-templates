#!/usr/bin/env python3
"""Compares the visible breadcrumb of item pages with the BreadcrumbList of their JSON-LD, in EN and
FR, on the live site. Usage: python3 tools/check-breadcrumbs.py [--site skylantern] [item ...]
(items are paths under contents/, e.g. destinations/tokyo)."""
import argparse
import html as H
import json
import os
import re
import sys
import urllib.request

URL = os.environ.get("JAHIA_URL", "http://localhost:8080").rstrip("/")
ap = argparse.ArgumentParser()
ap.add_argument("--site", default="skylantern")
ap.add_argument("items", nargs="*", default=["destinations/tokyo", "fares/hkg-nrt", "news/power-banks", "news/sapporo-daily",
                                              "articles/cabin-crew-2026", "articles/lumen-card", "offices/tokyo"])
args = ap.parse_args()
bad = 0
for lang in ("", "/fr"):
    for item in args.items:
        page = urllib.request.urlopen(f"{URL}{lang}/sites/{args.site}/contents/{item}.html").read().decode()
        nav = re.search(r'<nav[^>]*data-testid="ctpl-breadcrumb".*?</nav>', page, re.S)
        crumbs = [H.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<li[^>]*>(.*?)</li>", nav.group(0), re.S)] if nav else []
        ld = []
        for blob in re.findall(r'<script type="application/ld\+json">(.*?)</script>', page, re.S):
            data = json.loads(blob)
            for node in data.get("@graph", [data]):
                if node.get("@type") == "BreadcrumbList":
                    ld = [e.get("name") for e in node["itemListElement"]]
        ok = crumbs == ld and len(crumbs) > 2
        bad += 0 if ok else 1
        print(f"{'ok  ' if ok else 'FAIL'} {lang or '/en':4} {item:28} trail={' > '.join(crumbs)}"
              + ("" if crumbs == ld else f"  json-ld={' > '.join(ld)}"))
sys.exit(1 if bad else 0)

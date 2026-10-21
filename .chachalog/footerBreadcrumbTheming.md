---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

Themes can colour the breadcrumb and the footer on their own: the breadcrumb sits in a full-width band (`--ctpl-breadcrumb-*` tokens: surface, text, link, current page, padding) and the footer maps `--ctpl-footer-*` tokens (surface, text, muted text, rules, link hover, a bottom edge) onto the page roles inside it, so a theme can draw a dark breadcrumb band or a dark footer. The defaults repeat the page colours: nothing changes for existing themes. The site footer gets a **Footer logo** (shown instead of the site name, which becomes its text alternative), and its tagline keeps its line breaks, for an address.

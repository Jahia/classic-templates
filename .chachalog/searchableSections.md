---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

Page sections, and the items holding their text (cards, accordion entries, tabs, key figures, key dates), are now editorial content (`jmix:editorialContent`). With its default settings Augmented Search indexes their text with their page, so a search finds a word of a section body, a card or an FAQ answer; before, only titles and descriptions were searchable unless the site's Augmented Search configuration listed classic-templates types. jContent also lists them in a page's content and offers Translate on them. The header, the footer and the consent banner are not editorial content: their labels are not indexed with every page. No content needs changing; run one full Augmented Search reindex after the upgrade.

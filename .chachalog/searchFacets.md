---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

classic-media's search section gets faceted search with autocomplete: filters for topics (a tree), tags, format, type and, for a network search, site, with counts, removable chips and paging without a reload (Elastic Search UI core behind a connector of our own to Augmented Search; without JavaScript the same filters are a GET form); tags on item pages now link to the search page's tag filter (`?tag=`); each result shows its own summary (SEO description, else teaser) with the searched words highlighted, the index excerpt only for items without one; the story format and the session type become facetable: Augmented Search needs `content.mappedNodeTypes` to list `ctmd:story,ctmd:session,ctmd:person,ctplmix:editorialItem.teaser` and a full reindex after upgrading. The site header gets an optional search box with suggestions

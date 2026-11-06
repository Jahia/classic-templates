---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

The language switcher lists the languages of the page's own site. In live, Jahia takes the site named after the request host as the request's site, so where several sites are served under one host (Jahia Cloud) a page could list another site's languages, and lose its switcher when it had fewer translations in common.

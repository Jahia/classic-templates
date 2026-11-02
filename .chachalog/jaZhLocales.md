---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

The labels built into the template set's views (skip link, menu, sign-in, members-only notices, breadcrumb, list panels, carousel, search, consent banner and the edit-mode notes) now come in Japanese (`ja`) and Simplified Chinese (`zh`), checked against `en.json` by the locale test. Before, a page in either language rendered the English labels on the server and raw keys (`search.submit`, `account.signIn`) once the header's islands loaded in the browser.

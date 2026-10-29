---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

A theme can now come from another module: a module that declares a site mixin extending `ctplmix:themeProvider` adds its theme as an option of the site's edit form once it is enabled on the site. Switched on, it replaces the theme chosen in Site look (light or dark still applies): the page carries the mixin's local name as `data-ctpl-theme` and loads that module's stylesheet after the template set's. A brand theme no longer needs a release of the template set.

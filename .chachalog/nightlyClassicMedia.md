---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

The nightly integration tests install classic-media too: without it the editorial-types spec, which checks `ctmd:keyDate`, failed every night against the release and snapshot Jahia images.

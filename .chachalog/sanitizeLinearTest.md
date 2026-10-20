---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

The sanitizer's linear-time unit test (template set, classic-media, classic-travel) compares the time taken on an input and on one 8 times as long instead of holding each input under one second: it failed once on a slow GitHub Actions runner (1012 ms) although the code was fine, and it still fails a sanitizer that turns quadratic

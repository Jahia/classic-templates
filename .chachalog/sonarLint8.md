---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

`yarn lint` in the template set and classic-travel now checks the SonarQube rules that kept failing pull requests (sort comparators, unnecessary type assertions, object stringification, globalThis, replaceAll, code points, String.raw, at, re-exports, single push, cognitive complexity, nested conditionals and template literals), so the Static checks job fails before Sonar does; the rules ESLint cannot check, and how to write each case, are listed in `.agents/context/sonar-rules.md`. The few existing cases were fixed with no change to the rendered pages

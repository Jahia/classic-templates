# SonarQube rules: write them right the first time

Every pull request that changes a package runs the SonarQube gate (`SonarQube Code Analysis`), and
the gate fails on **any** new issue (0 new maintainability issues, 0 added debt). Fixing them after
the fact costs another commit and another 20-minute CI run. Read this page before writing
TypeScript in `packages/template-set` or `packages/travel`.

The generic version of this list, for every Jahia JavaScript module, is in AIStartupKit
(`.agents/context/jahia-release-and-ci.md`, "SonarQube gate").

## Checked by `yarn lint`

`eslint.config.js` in both packages carries the rules below (keep the two blocks alike). `yarn lint`
and the "Static checks" job fail on them before Sonar runs. The three `@typescript-eslint` rules use
type information (`projectService`).

| Sonar rule | ESLint rule                                        | Write                                                                                     |
| ---------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| S2871      | `@typescript-eslint/require-array-sort-compare`    | `sort` always with a compare function: `(a, b) => a - b`, `a.localeCompare(b)`            |
| S4325      | `@typescript-eslint/no-unnecessary-type-assertion` | no `as T` when the expression already has type `T` (`getChildNodes`, `getNode` are typed) |
| S6551      | `@typescript-eslint/no-base-to-string`             | no `String(x)` on an `Object`: `typeof x === "string" ? x : ""` (module parameters)       |
| S7764      | `unicorn/prefer-global-this`                       | `globalThis.location`, never `window.location` (client islands)                           |
| S7781      | `unicorn/prefer-string-replace-all`                | `replaceAll` (a regex argument needs the `g` flag)                                        |
| S7758      | `unicorn/prefer-code-point`                        | `codePointAt`, `String.fromCodePoint`                                                     |
| S7780      | `unicorn/prefer-string-raw`                        | `String.raw` for strings with backslashes                                                 |
| S7755      | `unicorn/prefer-at`                                | `.at(-1)` instead of `[x.length - 1]`                                                     |
| S7763      | `unicorn/prefer-export-from`                       | `export { x } from "./y.js"` to re-export                                                 |
| S7778      | `unicorn/prefer-single-call`                       | one `push(a, b)` instead of two pushes                                                    |
| S3776      | `sonarjs/cognitive-complexity` (15)                | split long functions into named steps                                                     |
| S3358      | `sonarjs/no-nested-conditional`                    | no nested ternaries: named constants first                                                |
| S4624      | `sonarjs/no-nested-template-literals`              | compute the inner string first                                                            |

Module parameters (`currentResource.getModuleParams().get(...)`) are typed `Object` but arrive as
JavaScript strings (the views pass `parameters={{ headingLevel: String(level) }}`): read them with
`typeof value === "string"`, as `membersGate`, the card views and `useParamHeadingLevel` do.

## Not checked by `yarn lint`: write them by hand

| Sonar rule        | Why ESLint cannot check it                                                                                                | Write                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| S4623             | Sonar flags `undefined` passed to an **optional** parameter only; ESLint sees no types and flags required ones too        | never pass a trailing `undefined` to a `param?:` parameter (tests included: `destinationOf("")`, not `destinationOf("", undefined)`)      |
| S1192             | counts every literal of the file, old lines included (threshold 3): a lint rule would flag lines Sonar treats as old code | a string used three times in a file you touch becomes a constant; never rewrite literals on untouched lines (it moves them into new code) |
| S5852 (hotspot)   | regular-expression backtracking needs a review                                                                            | no two adjacent quantified groups that can match the same characters; add `(?![a-z0-9])` after a tag name                                 |
| S1523/S5332 (hot) | `javascript:` or `http:` in sanitiser tests is expected                                                                   | leave the test; the user marks the hotspot Safe in SonarQube                                                                              |

## When the gate still fails

The check-run summary names the failed conditions, never the issues. Ask the user to open
[sonarqube.jahia.com](https://sonarqube.jahia.com) in Chrome (SSO), then from a tab on that origin:

```js
await fetch(
  "/api/issues/search?componentKeys=org.jahia.modules.javascript:classic-templates&pullRequest=<n>&resolved=false&ps=100",
).then((r) => r.json());
```

Fix every issue in one commit, add the rule to this page (and to the ESLint block when a rule
exists that matches Sonar without false positives), then push.

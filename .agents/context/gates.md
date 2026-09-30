# Gates

A change is done when every gate below passes. Run them from the module root.

| Gate                | Command                                                                                                                                                                                                                                                                                                  | Passes when                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Type-check + build  | `yarn build`                                                                                                                                                                                                                                                                                             | exit 0, `dist/package.tgz` produced                  |
| Maven build (as CI) | `JAVA_HOME=$(/usr/libexec/java_home -v 17) mvn -B clean package`                                                                                                                                                                                                                                         | `target/classic-templates-<version>.tgz` exists      |
| Lint + format       | `yarn lint && yarn prettier --check .` (and the same in `tests/`: `yarn lint`)                                                                                                                                                                                                                           | no error                                             |
| CND                 | `node $AISTARTUPKIT/.claude/skills/jahia-dev-review-cnd/scripts/check-cnd.mjs .` (one path argument; it walks the tree)                                                                                                                                                | PASS                                                 |
| No literal colours  | `yarn check:tokens`                                                                                                                                                                                                                                                                                      | no literal colour outside `src/templates/tokens.css` |
| Contrast            | `yarn check:contrast`                                                                                                                                                                                                                                                                                    | every theme × scheme pair meets WCAG 2.1 AA          |
| i18n                | `/jahia-i18n-check` (every locale key in `en.json` and `fr.json`, every CND label and `ui.tooltip` in both `.properties`)                                                                                                                                                                                | no missing key                                       |
| Security scan       | `semgrep scan --config $JAHIA_SECURITY_SCAN/tools/semgrep-harness/rules/jahia --optimizations none --exclude '**/node_modules/**' --exclude '**/dist/**' --exclude '**/target/**' --exclude '**/.yarn/**' --no-git-ignore --metrics=off --error .`                     | only the documented R10 hit in `RichText`            |
| Deploy              | `yarn deploy`, then the bundle is `ACTIVE`/`STARTED`: `curl -s -u root:root1234 http://localhost:8080/modules/api/bundles/org.jahia.modules.javascript/classic-templates/*/_info`                                                                                                                        | state `STARTED`                                      |
| End-to-end          | `cd tests && JAHIA_URL=http://localhost:8080 SUPER_USER_PASSWORD=root1234 yarn e2e:ci`                                                                                                                                                                                                                   | all specs pass                                       |
| Site review         | `/jahia-review-site`: the review script (AIStartupKit `.claude/skills/jahia-review-site/scripts/review-pages.mjs`, with its deps installed outside the module) run from the module root on `pages-to-review.json` (local `classic-dev` site), once per theme × scheme whenever a change affects the look | `pages.json` written (axe + Lighthouse SEO clean)    |

## Local traps met while setting up

- `0.Modules/` has its own `package.json`, so Yarn treats the module as a workspace member. The
  committed empty-at-creation `yarn.lock` marks it as a standalone project; run Yarn from the module
  root.
- `tests/` uses ESLint 8 with `.eslintrc.json`; the root flat config is found first unless
  `ESLINT_USE_FLAT_CONFIG=false` (set in `tests/package.json`).
- `tests/cypress/support/e2e.js` binds `fetch` to `window`. Without it every `@jahia/cypress`
  GraphQL helper fails with "Illegal invocation", surfacing as `Cannot read properties of undefined
(reading 'filter')` in `waitAllJobsFinished`.
- Changing `jahia.maven.groupId` does not replace an installed bundle with the same symbolic name and
  version: uninstall the old one first (`POST .../_uninstall` with form encoding).
- `semgrep --error` exits 1 because of the one documented R10 finding in `src/lib/RichText.tsx`;
  the gate passes when that is the only finding.
- The site review under zsh: `for pair in "ocean dark"` does not split into two arguments
  (zsh does not word-split unquoted variables). Drive theme switches from a bash script.

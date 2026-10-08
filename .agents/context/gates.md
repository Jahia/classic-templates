# Gates

A change is done when every gate below passes, with `AISTARTUPKIT` and `JAHIA_SECURITY_SCAN` set
to the checkouts of those two repositories. Run the Yarn gates from `packages/template-set` (Node
22), the Maven build and the site review from the repository root, the end-to-end tests from
`tests/`. classic-travel's gates are in [`travel.md`](travel.md#gates); a change to the
pre-packaged site passes `python3 scripts/export-prepackaged.py --check` and the import check
below.

| Gate                | Command                                                                                                                                                                                                                                                                                                      | Passes when                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Type-check + build  | `yarn build`                                                                                                                                                                                                                                                                                                 | exit 0, `dist/package.tgz` produced                          |
| Unit tests          | `TZ=UTC yarn test:unit` (also run under another time zone when touching dates)                                                                                                                                                                                                                               | all pass                                                     |
| Maven build (as CI) | `JAVA_HOME=$(/usr/libexec/java_home -v 17) mvn -B clean install` (repository root, the four packages)                                                                                                                                                                                                        | `packages/*/target/` holds the two `.tgz` and the two `.jar` |
| Lint + format       | `yarn lint && yarn prettier --check .` (and in `tests/`: `yarn lint`)                                                                                                                                                                                                                                        | no error                                                     |
| CND                 | `node $AISTARTUPKIT/.claude/skills/jahia-dev-review-cnd/scripts/check-cnd.mjs .` (one path argument; it walks the tree)                                                                                                                                                                                      | PASS                                                         |
| No literal colours  | `yarn check:tokens`                                                                                                                                                                                                                                                                                          | no literal colour outside `src/templates/tokens.css`         |
| Contrast            | `yarn check:contrast`                                                                                                                                                                                                                                                                                        | every theme × scheme pair meets WCAG 2.1 AA                  |
| i18n                | `/jahia-i18n-check` (every locale key in `en.json` and `fr.json`, every CND label and `ui.tooltip` in both `.properties`)                                                                                                                                                                                    | no missing key                                               |
| Security scan       | `semgrep scan --config $JAHIA_SECURITY_SCAN/tools/semgrep-harness/rules/jahia --optimizations none --exclude '**/node_modules/**' --exclude '**/dist/**' --exclude '**/target/**' --exclude '**/.yarn/**' --no-git-ignore --metrics=off --error .`                                                           | only the documented R10 hit in `RichText`                    |
| Deploy              | `yarn deploy`, then the bundle is `ACTIVE`/`STARTED`: `curl -s -u root:root1234 http://localhost:8080/modules/api/bundles/org.jahia.modules.javascript/classic-templates/*/_info`                                                                                                                            | state `STARTED`                                              |
| End-to-end          | `cd tests && JAHIA_URL=http://localhost:8080 SUPER_USER_PASSWORD=root1234 yarn e2e:ci`                                                                                                                                                                                                                       | all specs pass                                               |
| Site review         | `/jahia-review-site`: the review script (AIStartupKit `.claude/skills/jahia-review-site/scripts/review-pages.mjs`, with its deps installed outside the module) run from the repository root on `pages-to-review.json` (local `classic-dev` site), once per theme × scheme whenever a change affects the look | `pages.json` written (axe + Lighthouse SEO clean)            |

## Demo site

`python3 scripts/seed-demo.py --recreate` rebuilds the local `classic-dev` site from the template
set (so `import.xml` runs) and fills it: 3-level EN/FR page tree, two pages hidden from the menu,
header utility links, footer columns, legal and social links, published. `pages-to-review.json`
lists its pages for the site review. Against a cluster (Jahia Cloud) the script keeps one session
through the `DISTRIBUTED_JSESSIONID` cookie; publish calls always pass the site's languages, since a
publication without languages answers true and publishes nothing.

## Pre-packaged site

`python3 scripts/export-prepackaged.py` rewrites `packages/prepackaged-site/src/main/classic-dev/`
from the local `classic-dev` site (seeded and published first), and with `--site skylantern`
`packages/prepackaged-skylantern/src/main/skylantern/` from the local `skylantern` site; `--check`
exits 1 when the committed export is not up to date. The script refuses an export that carries a
user: a user added to a site group travels with the site, profile included; remove them from the
group first. After a change, import the built zip under another site key on a local instance (copy
`target/prepackaged/<site>.zip`, rename `/sites/<site>/` paths, the site's root element (found by
its indentation, a nested `<sites>` sits under the groups) and `sitekey` in the inner zip, keep
folders that share the site's name such as `files/skylantern`, `importSite` through the provisioning
API), check every page EN and FR answers 200 with one `<h1>` (Skylantern: `tools/check-pages.py
--site <key>` and `tools/check-breadcrumbs.py` of the skylantern-demo repository), the theme and
the Open Graph tags, then delete that site. Never import over the real site itself.

## Images in tests

Upload test images with the `uploadImage` Cypress task (`tests/cypress/plugins/upload-image.js`,
helper `uploadTestImage`), not `@jahia/cypress` `uploadFile`: the latter sends the binary through
GraphQL-multipart's `map` indirection, the route known to store a Java object name instead of the
bytes. The task sets `jcr:data` from a named multipart part and reads the stored value back.

## Local traps met while setting up

- `0.Modules/` has its own `package.json`, so Yarn treats a package as a workspace member. Each
  package's committed `yarn.lock` marks it as a standalone project; run Yarn from the package
  folder (`packages/template-set`, `packages/travel`, `tests`). The root `.yarnrc.yml` (Yarn 4
  `yarnPath`, `nodeLinker: node-modules`) applies to all of them, and the Maven build's Yarn 1
  bootstrap hands over to it too.
- `tests/` uses ESLint 8 with `.eslintrc.json`; the root flat config is found first unless
  `ESLINT_USE_FLAT_CONFIG=false` (set in `tests/package.json`).
- `tests/cypress/support/e2e.js` binds `fetch` to `window`. Without it every `@jahia/cypress`
  GraphQL helper fails with "Illegal invocation", surfacing as `Cannot read properties of undefined
(reading 'filter')` in `waitAllJobsFinished`.
- Changing `jahia.maven.groupId` does not replace an installed bundle with the same symbolic name and
  version: uninstall the old one first (`POST .../_uninstall` with form encoding).
- `semgrep --error` exits 1 because of the one documented R10 hit in
  `packages/template-set/src/lib/RichText.tsx`;
  the gate passes when that is the only finding.
- The site review under zsh: `for pair in "ocean dark"` does not split into two arguments
  (zsh does not word-split unquoted variables). Drive theme switches from a bash script.

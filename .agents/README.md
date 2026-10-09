# Agent harness: classic-templates

How to work on this repository with an AI agent. It holds four packages, built by the root
`pom.xml` and released at one version:

| Package                           | What it is                                                                 | Work from                                         |
| --------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| `packages/template-set`           | The classic-templates template set (`ctpl`, `ctplmix`)                     | `packages/template-set`                           |
| `packages/travel`                 | classic-travel (`ctrv`, `ctrvmix`), a module depending on the template set | `packages/travel`                                 |
| `packages/prepackaged-site`       | The `classic-dev` demo site as a pre-packaged project                      | `scripts/export-prepackaged.py`                   |
| `packages/prepackaged-skylantern` | The `skylantern` demo site (a fictional airline) as a pre-packaged project | `scripts/export-prepackaged.py --site skylantern` |

Demo seeding scripts (`scripts/`), Cypress tests (`tests/`), documentation (`docs/`) and CI are
shared at the root.
The generic Jahia knowledge (CND authoring, views,
page templates, reviews, Cypress, content via MCP) lives in the AIStartupKit harness
(`$AISTARTUPKIT`, a checkout of AIStartupKit, skills under `.claude/skills/`). This folder only
holds what is specific to these packages: their decisions, their conventions and their gates. Commands that
use the harness or the Jahia security scan read two variables: `AISTARTUPKIT` and
`JAHIA_SECURITY_SCAN` (a checkout of jahia-security-scan).

## Read first

| File                                                                       | What it holds                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`context/architecture.md`](context/architecture.md)                       | Decisions, type inventory, layout, theming, heading policy, open questions                                   |
| [`context/travel.md`](context/travel.md)                                   | classic-travel: types, contract with the template set, rules and gates                                       |
| [`context/gates.md`](context/gates.md)                                     | The checks a change must pass before it is done, with the exact commands                                     |
| [`context/release.md`](context/release.md)                                 | Releasing: changelog and version, the GitHub release, then the replication kit and the Store submission pack |
| [`skills/ctpl-add-component/SKILL.md`](skills/ctpl-add-component/SKILL.md) | The module-specific checklist for adding a component                                                         |

## Skill map (AIStartupKit skills, in the order they are used)

| Task                                         | Skill                                                           |
| -------------------------------------------- | --------------------------------------------------------------- |
| New content type (CND + `types.ts` + labels) | `/jahia-cnd-author`, then `/jahia-dev-review-cnd` until PASS    |
| View + CSS module                            | `/jahia-dev-create-view` (Step 1b: accessibility and SEO rules) |
| Whole component in one go                    | `/jahia-dev-build-component`                                    |
| Page templates, header/footer areas          | `/jahia-dev-create-page-template`                               |
| Listings (jcrQuery)                          | `/jahia-dev-query-content`, `/jahia-jcr-sql2`                   |
| Tests                                        | `/jahia-dev-cypress`                                            |
| Seed or edit content                         | `/jahia-content-create-content` (MCP first)                     |
| Review after a deploy                        | `/jahia-review` (code + site: axe + Lighthouse)                 |
| Build or deploy error                        | `/jahia-dev-debug`                                              |

## Non-negotiables for the template set (classic-travel: see `context/travel.md`)

1. Namespaces are `ctpl` (types) and `ctplmix` (mixins). Never rename them once content exists.
2. Every visible string is contributed content or a locale key, in EN and FR.
3. No literal colour, font stack or shadow outside `packages/template-set/src/templates/tokens.css` (`yarn check:tokens`).
4. The page template renders the page's only `<h1>`. Components start at `<h2>`.
5. Header and footer are owned by the home page (`AbsoluteArea parent={home}`, `readOnly="children"`).
6. Every component ships with `data-testid` on its root and Cypress specs under `tests/cypress/e2e/<component>/`.
7. Deploy after each component: `yarn build && yarn deploy` from the package folder. Never run `yarn dev` from an agent.
8. The four packages share the version of the root `pom.xml`; never give one package its own version.
9. A pre-packaged site holds the content of this repository's modules only (classic-dev: the template set; skylantern: the template set and classic-travel): regenerate it with `scripts/export-prepackaged.py [--site skylantern]`, never edit its XML by hand. What each site keeps, converts and rewrites is its profile in that script.

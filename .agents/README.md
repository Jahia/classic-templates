# Agent harness: classic-templates

How to work on this module with an AI agent. The generic Jahia knowledge (CND authoring, views,
page templates, reviews, Cypress, content via MCP) lives in the AIStartupKit harness
(`$AISTARTUPKIT`, skills under `.claude/skills/`). This folder only
holds what is specific to this module: its decisions, its conventions and its gates.

## Read first

| File                                                                       | What it holds                                                              |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`context/architecture.md`](context/architecture.md)                       | Decisions, type inventory, layout, theming, heading policy, open questions |
| [`context/gates.md`](context/gates.md)                                     | The checks a change must pass before it is done, with the exact commands   |
| [`skills/ctpl-add-component/SKILL.md`](skills/ctpl-add-component/SKILL.md) | The module-specific checklist for adding a component                       |

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

## Non-negotiables for this module

1. Namespaces are `ctpl` (types) and `ctplmix` (mixins). Never rename them once content exists.
2. Every visible string is contributed content or a locale key, in EN and FR.
3. No literal colour, font stack or shadow outside `src/templates/tokens.css`.
4. The page template renders the page's only `<h1>`. Components start at `<h2>`.
5. Header and footer are owned by the home page (`AbsoluteArea parent={home}`, `readOnly="children"`).
6. Every component ships with `data-testid` on its root and Cypress specs under `tests/cypress/e2e/<component>/`.
7. Deploy after each component: `yarn build && yarn deploy`. Never run `yarn dev` from an agent.

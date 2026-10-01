# Agent harness: classic-travel

How to work on this module with an AI agent. The generic Jahia knowledge (CND authoring, views,
listings, reviews, content via MCP) lives in the AIStartupKit harness (`$AISTARTUPKIT`, a checkout
of AIStartupKit; skills under `.agents/skills/`, also exposed as `.claude/skills/`). This folder
only holds what is specific to this module: its decisions, its integration with classic-templates
and its gates.

## Read first

| File                                                 | What it holds                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`context/architecture.md`](context/architecture.md) | Decisions, type inventory, the contract with classic-templates, open questions |
| [`context/gates.md`](context/gates.md)               | The checks a change must pass before it is done, with the exact commands       |

The module follows the classic-templates conventions (heading policy, theming tokens, link and
media mixins, rich-text sanitizer): read classic-templates' `.agents/context/architecture.md` too
before changing a view.

## Skill map (AIStartupKit skills, in the order they are used)

| Task                                         | Skill                                                           |
| -------------------------------------------- | --------------------------------------------------------------- |
| New content type (CND + `types.ts` + labels) | `/jahia-cnd-author`, then `/jahia-dev-review-cnd` until PASS    |
| View + CSS module                            | `/jahia-dev-create-view` (Step 1b: accessibility and SEO rules) |
| Whole component in one go                    | `/jahia-dev-build-component`                                    |
| Listings (fare list, destination grid)       | `/jahia-dev-query-content`, `/jahia-jcr-sql2`                   |
| Seed or edit content                         | `/jahia-content-create-content` (MCP first)                     |
| Review after a deploy                        | `/jahia-review` (code + site: axe + Lighthouse)                 |
| Build or deploy error                        | `/jahia-dev-debug`                                              |
| Release and CI                               | `context/jahia-release-and-ci.md` of AIStartupKit (add-on path) |

## Non-negotiables for this module

1. Namespaces are `ctrv` (types) and `ctrvmix` (mixins), URIs `http://www.jahia.org/classic-travel/{nt,mix}/1.0`. Never rename them once content exists.
2. classic-templates is a declared dependency: reuse its mixins (`ctplmix:listable`, `ctplmix:media`, `ctplmix:cta`, `ctplmix:sectionStyle`, `ctplmix:pageComponent`), never redeclare their fields.
3. No TypeScript import from classic-templates (separate bundle): small helpers are copied into `src/lib` and kept in step (`sanitize.ts` is the classic-templates sanitizer with the `ctrv-` prefixes).
4. Views read classic-templates semantic tokens only (`var(--ctpl-color-*)`...), never a literal or a primitive (`yarn check:tokens`).
5. Every visible string is contributed content or a locale key in `settings/locales` (EN and FR); every type and field has an EN and FR label and tooltip.
6. The page's only `<h1>` is the title of a main resource in its `fullPage` view (as classic-templates news); sections start at `h2` and follow the column / tab / free-zone rule.
7. Deploy after each change: `yarn build && yarn deploy`. Never run `yarn dev` from an agent. Never touch the `classic-dev` site.

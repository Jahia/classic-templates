# Classic Templates

A themeable Jahia JavaScript template set with the standard building blocks of a corporate site:
a header (logo, three-level main navigation, a utility link list), a footer, contribution areas,
and reusable components (hero banner, image and text, columns, rich text, link list, content
query), plus news and articles with their own full-page views.

Everything a visitor reads is contributed content, editable in jContent and Page Builder. The look
is driven entirely by CSS design tokens, so a site switches theme (or light and dark) from its
settings, with no code change.

> Status: early development. The scaffold, build and CI are in place; components are being added.

## Requirements

- Jahia 8.2.1.0 or later with `javascript-modules-engine` 1.1 or later
- Node.js 22 and Yarn 4 (Yarn is pinned in `.yarn/releases`, enable it with `corepack enable`)
- For the Maven build: Java 17 and Maven 3.9

## Getting started

```bash
yarn install
docker compose up --wait   # or use any local Jahia on http://localhost:8080
yarn build && yarn deploy  # build dist/package.tgz and install it on Jahia
```

`yarn deploy` reads `JAHIA_HOST` and `JAHIA_USER` from `.env` (defaults:
`http://localhost:8080`, `root:root1234`).

Then create a site in Jahia on the **classic-templates** template set, with English and French.

## Commands

| Script                                    | Description                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------- |
| `yarn build`                              | Type-check, build with Vite, pack `dist/package.tgz`                                   |
| `yarn deploy`                             | Install `dist/package.tgz` on the Jahia instance                                       |
| `yarn dev`                                | Watch mode: rebuild and redeploy on every change (for developers, in a terminal)       |
| `yarn lint`                               | ESLint                                                                                 |
| `yarn format`                             | Prettier                                                                               |
| `mvn clean package`                       | Same build through Maven, as the CI runs it (`target/classic-templates-<version>.tgz`) |
| `yarn check:tokens`                       | Fails on any literal colour outside `src/templates/tokens.css`                         |
| `yarn check:contrast`                     | Checks WCAG AA contrast of every theme in light and dark                               |
| `python3 scripts/seed-demo.py --recreate` | Rebuilds and fills the local `classic-dev` demo site                                   |
| `python3 scripts/make-icons.py`           | Redraws the content-type icons (Pillow)                                                |

## Project layout

```
src/
  components/<Category>/<Name>/   one folder per content type: definition.cnd, types.ts, views, CSS module
  templates/                      Layout, page templates, main-resource template, design tokens
settings/
  definitions.cnd                 namespaces (ctpl, ctplmix), base and shared mixins
  import.xml                      pages and folders seeded when a site is created
  locales/                        visitor-facing strings (en.json, fr.json)
  resources/                      editor labels and tooltips (.properties, EN and FR)
  content-types-icons/            one icon per content type
tests/                            Cypress end-to-end tests (separate npm project)
.agents/                          notes and skills for AI-assisted development of this module
```

## Theming

Components never contain a colour, font or shadow value. They read semantic CSS custom properties
(`--ctpl-color-text`, `--ctpl-color-accent`, …) defined in `src/templates/tokens.css`. A theme is a
set of overrides of those tokens. The theme and colour scheme (light, dark or automatic) are chosen
on the site node in jContent.

## Tests

```bash
cd tests
yarn install
JAHIA_URL=http://localhost:8080 SUPER_USER_PASSWORD=root1234 yarn e2e:ci
```

Each suite creates its own site on the template set and deletes it afterwards. In CI the suites run
through the shared Jahia integration-test workflow (`tests/provisioning-manifest-build.yml`).

## Contributing

- Pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/).
- A user-facing change adds a changelog fragment under `.chachalog/` (see
  `.github/instructions/changelog.instructions.md`). Never edit a CHANGELOG file by hand.
- Source files carry no license header; the root `LICENSE` applies to the whole repository.

## License

See [LICENSE](LICENSE).

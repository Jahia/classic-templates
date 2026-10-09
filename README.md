# Classic Templates

A themeable Jahia JavaScript template set with the standard building blocks of a corporate or
institutional website, a companion module for travel content, and two pre-packaged demo sites. Every
text a visitor reads is contributed content, in every language of the site, and the look comes
entirely from CSS design tokens: a site switches theme, or light and dark, from its settings. Pages
are accessible (WCAG 2.1 AA, RGAA 4.1.2), describe themselves to search engines (JSON-LD) and show a
preview with an image when they are shared (Open Graph, Twitter card).

![The demo home page in the Classic theme](docs/images/home.png)

> **Latest release:** [0.6.0](https://github.com/Jahia/classic-templates/releases/tag/0_6_0) (October 2026).
> Every version is described in the [changelog](CHANGELOG.md); `main` holds the next version in
> development.

## What is in this repository

The repository holds four packages, built together and released at the same version.

| Package                                                               | Maven coordinates                                                                            | What it is                                                                                                                                                                                                              |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`packages/template-set`](packages/template-set/)                     | `org.jahia.modules.javascript:classic-templates` (`.tgz`)                                    | The **classic-templates** template set: header, footer, breadcrumb, page templates, reusable sections, news and articles, seven themes in light and dark                                                                |
| [`packages/travel`](packages/travel/)                                 | `org.jahia.modules.javascript:classic-travel` (`.tgz`)                                       | The **classic-travel** module: destinations, fare offers, fare lists, destination grids and travel tools, for sites built on the template set                                                                           |
| [`packages/prepackaged-site`](packages/prepackaged-site/)             | `org.jahia.community:classic-templates-prepackaged-website` (`.jar`, and an `import` `.zip`) | The `classic-dev` demo site as a **pre-packaged project**: 19 pages in English and French using every section of the template set, ready to import from Administration                                                  |
| [`packages/prepackaged-skylantern`](packages/prepackaged-skylantern/) | `org.jahia.community:skylantern-prepackaged-website` (`.jar`, and an `import` `.zip`)        | The `skylantern` demo site (Skylantern Airways, a fictional airline) as a **pre-packaged project**: 36 pages in English and French with destinations and fares from classic-travel, ready to import from Administration |

Shared at the root: the documentation for editors and administrators ([`docs/`](docs/README.md)),
the demo seeding scripts ([`scripts/`](scripts/)), the Cypress end-to-end tests ([`tests/`](tests/)),
the CI workflows, the changelog and the agent harness ([`.agents/`](.agents/README.md)).

## Install

Jahia 8.2.1.0 or later with `javascript-modules-engine` 1.2 or later.

- **Template set.** Download `classic-templates-<version>.tgz` from the
  [GitHub releases](https://github.com/Jahia/classic-templates/releases) and install it in Jahia
  (Administration > Modules, or the provisioning API). Then create a site on the
  **classic-templates** template set: it starts with a home page, its header and its footer. See
  [getting started](docs/guides/getting-started.md) and the [template set README](packages/template-set/README.md).
- **classic-travel.** Install `classic-travel-<version>.tgz` next to the template set, then enable
  **classic-travel** on a site that uses the template set. See the [classic-travel README](packages/travel/README.md).
- **Pre-packaged demo site.** Install the template set and
  `classic-templates-prepackaged-website-<version>.jar` (both on the
  [GitHub releases](https://github.com/Jahia/classic-templates/releases)), then in Administration >
  Projects choose **Import prepackaged project** > **Classic Templates demo site (classic-dev) -
  pre-packaged**. With the provisioning API, unzip
  `classic-templates-prepackaged-website-<version>-import.zip` from the release and pass its
  `classic-dev.zip` to `importSite` as an attached file. See the
  [pre-packaged site README](packages/prepackaged-site/README.md).
- **Pre-packaged airline site.** The same way with classic-travel installed too and
  `skylantern-prepackaged-website-<version>.jar`: **Skylantern Airways demo site (skylantern) -
  pre-packaged**, or `skylantern.zip` from `skylantern-prepackaged-website-<version>-import.zip`
  with the provisioning API. See the [Skylantern package README](packages/prepackaged-skylantern/README.md).

## Demo sites

The scripts in [`scripts/`](scripts/) build demonstration sites on a local Jahia, or on a Jahia Cloud
instance. They need Python 3 and Pillow, and read `JAHIA_URL` and `JAHIA_USER` (defaults
`http://localhost:8080`, `root:root1234`). Each one reuses a single HTTP session, also on a cluster
(where the session cookie is `DISTRIBUTED_JSESSIONID`), so a run never opens one session per call.

| Script                                                             | What it does                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `python3 scripts/seed-demo.py`                                     | Builds the `classic-dev` demo site: a fictional web studio with 18 pages in English and French, every component in use, news and articles with full texts, a demo taxonomy, a site map, a contact form, a legal notice, a privacy policy and an example accessibility statement (content in `scripts/demo_content.py`) |
| `python3 scripts/seed-demo.py --sections-only`                     | Adds the demo content to an existing site without changing what editors wrote, and publishes only what it added                                                                                                                                                                                                        |
| `python3 scripts/seed-demo.py --recreate`                          | Deletes and rebuilds the demo site (loses any edits made on it)                                                                                                                                                                                                                                                        |
| `python3 scripts/seed-addons.py`                                   | Builds the `classic-addons` demo site with the four add-on modules, each in a free zone                                                                                                                                                                                                                                |
| `python3 scripts/seed-addons.py --contact-only --site classic-dev` | Enables Formidable on a site and adds a contact form to its contact page                                                                                                                                                                                                                                               |
| `python3 scripts/seed-travel-test-site.py`                         | Builds the `ctrv-test` site: classic-travel destinations, fare offers, a fare list, a destination grid and travel tools, in English and French                                                                                                                                                                         |
| `python3 scripts/export-prepackaged.py`                            | Exports `classic-dev` into `packages/prepackaged-site/src/main/classic-dev/`, keeping the template set's content only (`--check` tells whether the committed export is up to date)                                                                                                                                     |
| `python3 scripts/export-prepackaged.py --site skylantern`          | Exports `skylantern` into `packages/prepackaged-skylantern/src/main/skylantern/`, keeping the content of the template set and classic-travel (the site itself is seeded from its own demo repository)                                                                                                                  |

## Documentation

The documentation for editors and site administrators is in [`docs/`](docs/README.md):

- **Guides:** [getting started](docs/guides/getting-started.md),
  [pages and templates](docs/guides/pages-and-templates.md),
  [editing content](docs/guides/editing-content.md),
  [themes and appearance](docs/guides/themes-and-appearance.md),
  [accessibility](docs/guides/accessibility.md), [search engines](docs/guides/seo.md),
  [add-on modules](docs/guides/add-ons.md), [questions and answers](docs/guides/faq.md).
- **Component reference:** [all components](docs/components/index.md).
- **Packages:** [template set](packages/template-set/README.md),
  [classic-travel](packages/travel/README.md), [pre-packaged site](packages/prepackaged-site/README.md),
  [Skylantern pre-packaged site](packages/prepackaged-skylantern/README.md).

## Build and develop

To build: Node.js 22 and Yarn 4 (pinned in `.yarn/releases`; enable it with `corepack enable`),
and for the Maven build Java 17 and Maven 3.9.

```bash
mvn clean install   # the four packages, as the CI builds them
```

| Artifact                                                                                  | Package                    |
| ----------------------------------------------------------------------------------------- | -------------------------- |
| `packages/template-set/target/classic-templates-<version>.tgz`                            | template set               |
| `packages/travel/target/classic-travel-<version>.tgz`                                     | classic-travel             |
| `packages/prepackaged-site/target/classic-templates-prepackaged-website-<version>.jar`    | pre-packaged site (module) |
| `packages/prepackaged-site/target/prepackaged/classic-dev.zip` (classifier `import`)      | pre-packaged site (import) |
| `packages/prepackaged-skylantern/target/skylantern-prepackaged-website-<version>.jar`     | Skylantern site (module)   |
| `packages/prepackaged-skylantern/target/prepackaged/skylantern.zip` (classifier `import`) | Skylantern site (import)   |

Each JavaScript package is a standalone Yarn project: run Yarn from its folder.

```bash
docker compose up --wait                       # or use any local Jahia on http://localhost:8080
cd packages/template-set
yarn install
yarn build && yarn deploy                      # build dist/package.tgz and install it on Jahia
```

`yarn deploy` reads `JAHIA_HOST` and `JAHIA_USER` from the package's `.env` (copy `.env.example`;
defaults: `http://localhost:8080`, `root:root1234`). The commands of each package (lint, unit tests,
token and contrast checks) are listed in its README.

### Repository layout

```
packages/
  template-set/       classic-templates: src/, settings/, static/, its build checks (scripts/), pom.xml
  travel/             classic-travel: src/, settings/, static/, its build checks (scripts/), pom.xml
  prepackaged-site/   the classic-dev export (src/main/classic-dev/), its label, pom.xml
  prepackaged-skylantern/  the skylantern export (src/main/skylantern/), its label, pom.xml
scripts/              demo seeding and the pre-packaged site export
docs/                 documentation for editors and administrators
tests/                Cypress end-to-end tests (separate npm project)
.agents/              decisions, gates and skills for AI-assisted development
pom.xml               Maven aggregator: shared version, Node and Yarn settings, release configuration
```

### Quality gates

A change is done when every gate in [`.agents/context/gates.md`](.agents/context/gates.md) passes:
build, Maven build, unit tests, lint, Prettier, CND lint, tokens, contrast, static analysis
(Semgrep), Cypress, and the accessibility and SEO review of the demo pages in every theme and
scheme. The design decisions are recorded in
[`.agents/context/architecture.md`](.agents/context/architecture.md) (template set) and
[`.agents/context/travel.md`](.agents/context/travel.md) (classic-travel).

### Tests

```bash
cd tests
yarn install
JAHIA_URL=http://localhost:8080 SUPER_USER_PASSWORD=root1234 yarn e2e:ci
```

Each suite (smoke, foundations, chrome, content, sections, editorial) creates its own site on the
template set, covers the happy path, authorization and edge cases, and deletes the site afterwards.
In CI the suites run through the shared Jahia integration-test workflow, which installs every
SNAPSHOT package the build produced (`tests/provisioning-manifest-build.yml`), on every change to the
code, and nightly against the release and snapshot Jahia images with the latest published snapshots
(`tests/provisioning-manifest-snapshot.yml`).

A pull request that changes no package skips the build, Sonar and the integration tests (about 23
minutes); only the light checks run. That covers Markdown, `docs/`, the changelog, the agent harness
(`.agents/`), the demo scripts (`scripts/`) and the demo deployment workflow. A new push to a pull
request cancels its previous run, and a newer push to `main` cancels the older `main` run, except the
commit that moves `main` to the next SNAPSHOT after a release (message starting with
`chore: next development version`): the release packages come from the release commit's run. That
exception protects a release run that has started, not one still waiting: GitHub keeps one waiting
run per group and replaces it with the newer one. Push the next-SNAPSHOT commit only once the release
commit's run is in progress (or re-run it if it was replaced).

### Demo instance

`.github/workflows/demo-deploy.yml` builds classic-travel (and classic-weather, when its Java sources
exist) and deploys them to the demo cloud instance named by the repository variable
`DEMO_JAHIA_HOST`. It runs on pushes to the demo branches (`demo-live`, `demo-fallback`) and on
demand, never on pushes to `main`: a `main` build carries a higher version and would replace the demo
branch's build, which Jahia then refuses to start again.

## Releases

The four packages share one version, set in the root `pom.xml`; a release publishes all four.
The changelog is written with chachalog: every change
adds a fragment under `.chachalog/` (see `.github/instructions/changelog.instructions.md`), and the
release turns the fragments into a section of [CHANGELOG.md](CHANGELOG.md). classic-travel's history
before it joined this repository is in [its own changelog](packages/travel/CHANGELOG.md).

The release steps, from the changelog to the Jahia Store submission pack, are in
[`.agents/context/release.md`](.agents/context/release.md).

## Contributing

- Pull request titles follow [Conventional Commits](https://www.conventionalcommits.org/).
- Every change adds a changelog fragment under `.chachalog/`, and updates the README, `docs/` and
  `.agents/` lines that describe it. Never edit a CHANGELOG file by hand.
- New template set components follow
  [`.agents/skills/ctpl-add-component/SKILL.md`](.agents/skills/ctpl-add-component/SKILL.md): EN and
  FR labels with tooltips, tokens only, a Cypress suite, and a documentation page under
  `docs/components/`.
- Source files carry no license header; the root `LICENSE` applies to the whole repository.

## License

[MIT](LICENSE), copyright Jahia.

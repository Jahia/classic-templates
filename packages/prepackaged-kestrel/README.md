# Kestrel Bay Wealth pre-packaged website

The `kestrel-bay` demo site, a fictional wealth manager based in Hong Kong, built with the
[classic-templates](../template-set/README.md) template set alone and packaged as a Jahia module so
that a populated site in three languages can be created in a few clicks. Back to the
[repository README](../../README.md).

| Artifact                                                                        | What it is                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.jahia.community:kestrel-bay-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:kestrel-bay-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

Kestrel Bay Wealth in English (default), Traditional Chinese (`zh_HK`) and Simplified Chinese
(`zh_CN`), in the Slate theme, built only with the components of the template set, so it imports on
an instance that has classic-templates and the platform modules `default`, `siteSettings` and
`site-settings-seo`, nothing else:

- 12 pages, each in the three languages: home, wealth management (private wealth, family office),
  funds (three fund pages with key figures, strategy, risk disclosure and fees), market insights,
  about, contact and an important information page linked from the footer;
- 4 articles in the `insights` content folder, each with its own page, listed on the home page and
  on Market insights. Three are published in the three languages; the fourth, _Weekly market view_,
  is written in English only and **not published**: it is the work in hand of an authoring
  demonstration (edit, request publication, approve, translate);
- **blocks that differ by language** on the home page: a seminar announcement shown in English and
  Traditional Chinese only, and a Wealth Management Connect block shown in Simplified Chinese only
  (_Content visibility by language_). No language is mandatory, so one language can be published
  before the others;
- **rights by section**: three empty site groups with their roles, `kestrel-insights` (editor on the
  Market insights page and the insights folder), `kestrel-products` (editor on Funds) and
  `kestrel-compliance` (reviewer on the whole site). An editor requests publication, a reviewer
  approves it. The package carries no user: add yours to the groups (Site Settings > Groups);
- the shared header (logo, menu, utility links, language switcher) and footer (link columns, legal
  link) owned by the home page;
- 12 generated illustrations with their text alternatives in the three languages, and a logo for
  light and dark surfaces.

Every name, fund, figure, address and quote is invented. The site is published (the export carries
the live workspace). It is not marked as the default site of the instance (`defaultSite=false` in
`site.properties`), and its server name is `localhost`, so on a shared instance it renders from its
`/sites/kestrel-bay/` URLs; set your own server name in the site settings when the site gets its own
host.

The `kestrel-bay` site of its demonstration stack has more: the home page hero is personalised with
jExperience (a second version for a visitor who read two fund pages). This package carries the
version every visitor gets by default; see [regenerating](#regenerating-the-package).

## Installing

### From a release

1. Install `classic-templates` and this module, at the same version, in Administration > Modules.
2. Open Administration > Projects
   ([localhost:8080/jahia/administration/webProjectSettings](http://localhost:8080/jahia/administration/webProjectSettings)),
   and under **Import prepackaged project** choose
   **Kestrel Bay Wealth demo site (kestrel-bay) - pre-packaged**.

### With the provisioning API

Download the release files from the
[GitHub releases](https://github.com/Jahia/classic-templates/releases), unzip
`kestrel-bay-prepackaged-website-<version>-import.zip` (it holds `kestrel-bay.zip` and
`export.properties`), then send the package and the site with the files attached:

```bash
curl -u root -H "Origin: https://<host>" -X POST https://<host>/modules/api/provisioning \
  --form 'script=[{"installOrUpgradeBundle":"classic-templates-<version>.tgz","forceUpdate":true},{"importSite":"kestrel-bay.zip"}];type=application/json' \
  --form "file=@classic-templates-<version>.tgz" \
  --form "file=@kestrel-bay.zip"
```

`importSite` takes the site zip itself (`kestrel-bay.zip`), never the outer zip. The site key is
`kestrel-bay`: an instance can hold the site only once. A site imported through the provisioning
API has the importing user in its `site-administrators` group.

## Regenerating the package

The site export is committed unzipped under [`src/main/kestrel-bay/`](src/main/kestrel-bay/)
(`site.properties`, `repository.xml`, `live-repository.xml`, `content/`, `live-content/`), so a
content change reads as a diff. It is written by
[`scripts/export-prepackaged.py`](../../scripts/export-prepackaged.py) from the `kestrel-bay` site
of a running Jahia, seeded by its own demo repository (`kestrel-demo`: `tools/seed_site.py`,
`tools/seed_staff.py`, then `tools/reset_demo.py` so the site is in its starting state):

```bash
JAHIA_URL=http://localhost:8087 python3 scripts/export-prepackaged.py --site kestrel-bay           # export, convert, strip, write
JAHIA_URL=http://localhost:8087 python3 scripts/export-prepackaged.py --site kestrel-bay --check   # exit 1 when not up to date
```

The script uses one HTTP session and keeps the content of the template set only:

- the personalised hero (a jExperience wrapper holding its variants) becomes its default variant,
  in its place and with the same identifier;
- the users of the source site are left out, with their memberships; the site groups and the roles
  granted to them stay;
- what the content-governance module writes on a site it ran on (its settings node, the glossaries
  folder of its compliance scan) is removed, like any node of a type or mixin that neither the
  platform nor classic-templates declares;
- the script fails if a remaining value still names a removed node, or if the export carries a user;
- `site.properties` lists classic-templates, `default`, `siteSettings` and `site-settings-seo` as
  the installed modules.

The output depends only on the site content: running the script twice gives the same files.

## Building

From the repository root, `mvn clean install` builds
`target/kestrel-bay-prepackaged-website-<version>.jar` (the site zip is in
`META-INF/prepackagedSites/kestrel-bay.zip`) and `target/prepackaged/kestrel-bay.zip`, attached with
the classifier `import`.

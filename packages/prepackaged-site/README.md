# Classic Templates pre-packaged website

The `classic-dev` demo site of the [classic-templates](../template-set/README.md) template set,
packaged as a Jahia module so that a populated site can be created in a few clicks. Back to the
[repository README](../../README.md).

| Artifact                                                                              | What it is                                                       |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.jahia.community:classic-templates-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:classic-templates-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

A fictional web studio in Lyon, in English and French, built only with the template set's own
components, so it imports on an instance that has classic-templates and the platform modules
`default`, `siteSettings` and `site-settings-seo`, nothing else:

- 19 pages, three levels deep: home, about us (team, history), services (consulting with strategy
  and operations, training with workshops, support), news, contact, a help centre, a landing page
  hidden from the menu, a legal notice, a privacy policy, a site map and an example accessibility
  statement;
- 6 news items and 3 articles in content folders, each with its own page, listed by content lists
  and a notice bar;
- the shared header (logo, three-level menu, utility links, language switcher) and footer (link
  columns, legal and social links) owned by the home page;
- every section of the template set in use: hero banners, image and text, rich text with tables,
  columns, card grids (cards, icon tiles, logos), accordions, tabs, key figures, quotes, link lists,
  content lists and the site map;
- 22 generated images with their text alternatives, and a small demo taxonomy
  (`classic-templates-demo`: product, features, events) used by the content lists.

The site is published (the export carries the live workspace). It is not marked as the default site
of the instance (`defaultSite=false` in `site.properties`): imported next to other sites, it must
not take over the server's root address. Its server name is `localhost`; set your own in the site
settings after the import.

The `classic-dev` site of a development instance has more: a Practical information page and a
contact form that show the add-on modules (Formidable, jsfaq, js-media-gallery,
js-store-locator). They are left out of this package, see [regenerating](#regenerating-the-package).

## Installing

### From the Jahia Store or a release

1. Install `classic-templates` (0.4.0 or later) and this module, at the same version, in
   Administration > Modules (or from the Store).
2. Open Administration > Projects
   ([localhost:8080/jahia/administration/webProjectSettings](http://localhost:8080/jahia/administration/webProjectSettings)),
   and under **Import prepackaged project** choose
   **Classic Templates demo site (classic-dev) - pre-packaged**.

### With the provisioning API

```yaml
- installOrUpgradeBundle:
    - "js:mvn:org.jahia.modules.javascript/classic-templates/<version>/tgz"
    - "mvn:org.jahia.community/classic-templates-prepackaged-website/<version>"
  autoStart: true
- importSite: "jar:mvn:org.jahia.community/classic-templates-prepackaged-website/<version>/zip/import!/classic-dev.zip"
```

The site key is `classic-dev`: an instance can hold the site only once.

## Regenerating the package

The site export is committed unzipped under [`src/main/classic-dev/`](src/main/classic-dev/)
(`site.properties`, `repository.xml`, `live-repository.xml`, `content/`, `live-content/`), so a
content change reads as a diff. It is written by
[`scripts/export-prepackaged.py`](../../scripts/export-prepackaged.py) from the `classic-dev` site
of a running Jahia, after the site has been seeded and published (`python3 scripts/seed-demo.py`):

```bash
python3 scripts/export-prepackaged.py           # export, strip and write src/main/classic-dev/
python3 scripts/export-prepackaged.py --check   # exit 1 when the committed files are not up to date
```

The script reads `JAHIA_URL` and `JAHIA_USER` (defaults `http://localhost:8080`, `root:root1234`)
and uses one HTTP session. It keeps the content of the template set only:

- nodes of a type or mixin from any namespace that neither the platform nor classic-templates
  declares (read from the template set's CND files) are removed, with the Practical information
  page, the `forms` and `places` content folders and the free zone that held the contact form;
- references to removed nodes are removed too (a link item without a target goes, another internal
  link becomes "none"), and the script fails if any remaining value still names a removed node;
- the sentences that described the contact form (accessibility statement, contact page
  description) are adjusted;
- `site.properties` lists the template set, `default`, `siteSettings` and `site-settings-seo` as
  the installed modules.

The output depends only on the site content: running the script twice gives the same files. The
categories used by the site travel inside `repository.xml` under `systemsite`, as in any Jahia site
export.

## Building

From the repository root, `mvn clean install` builds
`target/classic-templates-prepackaged-website-<version>.jar` (the site zip is in
`META-INF/prepackagedSites/classic-dev.zip`) and `target/prepackaged/classic-dev.zip`, attached
with the classifier `import`.

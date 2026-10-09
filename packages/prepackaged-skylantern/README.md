# Skylantern Airways pre-packaged website

The `skylantern` demo site, a fictional airline based in Hong Kong, built with the
[classic-templates](../template-set/README.md) template set and the
[classic-travel](../travel/README.md) module, packaged as a Jahia module so that a populated site
can be created in a few clicks. Back to the [repository README](../../README.md).

| Artifact                                                                       | What it is                                                       |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `org.jahia.community:skylantern-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:skylantern-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

Skylantern Airways in English and French, in the Horizon theme (light scheme), built only with the
components of the template set and classic-travel, so it imports on an instance that has
classic-templates, classic-travel and the platform modules `default`, `siteSettings` and
`site-settings-seo`, nothing else:

- 36 pages, three levels deep: home, offers (current deals, partner offers), destinations, booking
  (fare options, children and infants, extras with baggage, seats and meals), travel information
  (baggage, travel documents, check-in, airport, special assistance, travel advisories), the
  experience (fleet, in flight), about (story, media room, careers, contact), a help centre with
  its questions and answers, manage booking, flight status, a legal notice, a privacy policy,
  conditions of carriage, an example accessibility statement and a site map;
- in content folders, each item with its own page: 10 destinations and 6 fare offers
  (classic-travel), 10 news items (travel advisories and press releases) and 6 articles (careers
  and partner offers), listed by fare lists, a destination grid and content lists, and shown in a
  notice bar;
- a hero carousel, travel tools (book, manage, check in, flight status) and the sections of the
  template set: hero banners, image and text, rich text with tables, columns, card grids, tabs,
  accordions, key figures, quotes and link lists;
- the shared header (logo, three-level menu, utility links, language switcher, notice bar) and
  footer (link columns, legal and social links) owned by the home page;
- 54 generated images with their text alternatives, a share image for social networks, and a small
  taxonomy (`skylantern-demo`: careers, partner offers, press releases, travel advisories) used by
  the content lists.

Every name, fare, phone number and text is invented. The site also declares Chinese (`zh`),
inactive and with no translation in the package: activate it in the site languages to translate
the site. The site is published (the export carries the
live workspace). It is not marked as the default site of the instance (`defaultSite=false` in
`site.properties`): imported next to other sites, it must not take over the server's root address.
Its server name is `localhost`, so on a shared instance it renders from its `/sites/skylantern/`
URLs; set your own server name in the site settings when the site gets its own host.

The `skylantern` site of a development instance has more: a fare alerts newsletter and a contact
form (Formidable), the sales offices on a map (js-store-locator), and its questions and answers in
the jsfaq module. This package leaves the forms and the offices out, and carries the questions and
answers as accordions of the template set; see [regenerating](#regenerating-the-package).

## Installing

### From the Jahia Store or a release

1. Install `classic-templates` and `classic-travel` (0.5.0 or later) and this module, at the same
   version, in Administration > Modules (or from the Store).
2. Open Administration > Projects
   ([localhost:8080/jahia/administration/webProjectSettings](http://localhost:8080/jahia/administration/webProjectSettings)),
   and under **Import prepackaged project** choose
   **Skylantern Airways demo site (skylantern) - pre-packaged**.

### With the provisioning API

Download the release files from the
[GitHub releases](https://github.com/Jahia/classic-templates/releases), unzip
`skylantern-prepackaged-website-<version>-import.zip` (it holds `skylantern.zip` and
`export.properties`), then send the packages and the site with the files attached:

```bash
curl -u root -H "Origin: https://<host>" -X POST https://<host>/modules/api/provisioning \
  --form 'script=[{"installOrUpgradeBundle":"classic-templates-<version>.tgz","forceUpdate":true},{"installOrUpgradeBundle":"classic-travel-<version>.tgz","forceUpdate":true},{"importSite":"skylantern.zip"}];type=application/json' \
  --form "file=@classic-templates-<version>.tgz" \
  --form "file=@classic-travel-<version>.tgz" \
  --form "file=@skylantern.zip"
```

`importSite` takes the site zip itself (`skylantern.zip`), never the outer zip. When the release
is also published to Nexus, the Maven forms work too:
`importSite: "jar:mvn:org.jahia.community/skylantern-prepackaged-website/<version>/zip/import!/skylantern.zip"`.

The site key is `skylantern`: an instance can hold the site only once.

## Regenerating the package

The site export is committed unzipped under [`src/main/skylantern/`](src/main/skylantern/)
(`site.properties`, `repository.xml`, `live-repository.xml`, `live-content/`), so a content change
reads as a diff. It is written by
[`scripts/export-prepackaged.py`](../../scripts/export-prepackaged.py) from the `skylantern` site of
a running Jahia, after the site has been seeded and published:

```bash
python3 scripts/export-prepackaged.py --site skylantern           # export, convert, strip, write
python3 scripts/export-prepackaged.py --site skylantern --check   # exit 1 when not up to date
```

The script reads `JAHIA_URL` and `JAHIA_USER` (defaults `http://localhost:8080`, `root:root1234`)
and uses one HTTP session. It keeps the content of the template set and classic-travel only:

- the jsfaq questions and answers become one accordion per topic (the topic is the heading, each
  question an entry, its answer the entry text), in place of the free zone that held them;
- nodes of a type or mixin from any namespace that neither the platform, classic-templates nor
  classic-travel declares are removed, with the `forms` and `offices` content folders and the free
  zones that held the newsletter, the contact form and the map of the offices;
- references to removed nodes are removed too, and the script fails if any remaining value still
  names a removed node, or if the export carries a user (a member of a site group comes with their
  profile);
- the texts that described the forms, the offices or the search of the questions (contact and
  privacy pages, the help and about cards, the privacy policy, the accessibility statement, the
  questions introduction) are adjusted;
- `site.properties` lists classic-templates, classic-travel, `default`, `siteSettings` and
  `site-settings-seo` as the installed modules.

The output depends only on the site content: running the script twice gives the same files. The
categories used by the site travel inside `repository.xml` under `systemsite`, as in any Jahia site
export.

## Building

From the repository root, `mvn clean install` builds
`target/skylantern-prepackaged-website-<version>.jar` (the site zip is in
`META-INF/prepackagedSites/skylantern.zip`) and `target/prepackaged/skylantern.zip`, attached with
the classifier `import`.

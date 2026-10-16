# Orvane Live pre-packaged website

The `orvane-live` demo site, the annual convention of **Orvane**, a fictional media group, built with the
[classic-templates](../template-set/README.md) template set and the [classic-media](../media/README.md)
module, packaged as a Jahia module. It goes with its sister site
[Orvane Signal](../prepackaged-orvane-signal/README.md). Back to the [repository README](../../README.md).

| Artifact                                                                        | What it is                                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.jahia.community:orvane-live-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:orvane-live-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

Orvane Live in English and French:

- 27 pages: home, Attend (why attend, passes, plan your trip with the venue and partner hotels
  on a map, FAQ), Exhibit (why exhibit, sponsorship with the partners' logos, book a stand),
  Programme (a four-day agenda in the Lisbon time zone, speakers with an A-Z index, awards),
  Media (press releases, photo gallery), About (organisers, sustainability, contact), search,
  sign-in, legal notice, privacy policy, accessibility statement and site map;
- the event folder (`ctmdmix:eventFolder`, Europe/Lisbon) with 22 sessions over 8 to 11 June 2027
  and their speakers: the 8 speakers of the site and the Signal editors who moderate;
- key dates with a countdown, a highlights video, key figures, testimonials, 3 press releases, the
  FAQ (jsfaq), the venue and 3 hotels (js-store-locator), a stand enquiry and a contact form
  (Formidable);
- the `live` theme in dark, the network bar linking Orvane Signal, the header with search,
  sign-in, Register and Book a stand.

Every person, company, figure, quote and contact is invented (`@orvane.example`, `+351 000 000 000`
numbers); the footer, the legal pages and the home page say so. The structure was inspired by the
information architecture of a real media organisation's sites; none of its names, logos or texts is
reused. The site is published (the export carries the live workspace), is not the default site of
the instance (`defaultSite=false`) and has the server name `localhost`.

Unlike the classic-dev and Skylantern packages, this one keeps the content of add-on modules on
purpose (the showcase demonstrates them): it declares `jsfaq`, `js-media-gallery`,
`js-store-locator` and `formidable-elements` as dependencies.

## Personalisation (jExperience)

Orvane Live shares the personalisation of Orvane Signal (consent banner, personalised hero and
Signal feed, the A/B test of the hero's call to action, the registration form mapped to the visitor
profile): what to install and configure, and how to load the segments, goals, personas and the
dashboard shipped with Orvane Signal, are in the
[Orvane Signal README](../prepackaged-orvane-signal/README.md#personalisation-jexperience).

## Installing

The two Orvane sites link to each other (the network bar in each header, the Signal editors who
moderate Live sessions, the latest Signal stories on the Live home page): **import both**. Jahia
keeps a reference to a site that is not there yet and resolves it when that site arrives, so the
order does not matter.

1. Install, at the same version, `classic-templates` and `classic-media` (0.8.0 or later), then the
   add-on modules the sites show: `jsfaq` (1.1.1), `js-media-gallery` (1.1.0),
   `js-store-locator` (1.1.0) and Formidable 0.6 and `formidable-extended-actions` (accounts; not released yet,
   see the Orvane Signal package's README), and these two modules.
2. Open Administration > Projects
   ([localhost:8080/jahia/administration/webProjectSettings](http://localhost:8080/jahia/administration/webProjectSettings)),
   and under **Import prepackaged project** import both Orvane sites.
3. For the search pages: install Augmented Search (4.1.0, with its Elasticsearch connector), set its
   mapped node types and run one full reindex as the Orvane Signal package's README says (step 4).
   Without it every page works and the search page shows its box with no result.

With the provisioning API, attach the modules and both site zips (`importSite` takes the inner
`<site>.zip` of the `-import.zip`, never the outer zip):

```bash
curl -u root -H "Origin: https://<host>" -X POST https://<host>/modules/api/provisioning \
  --form 'script=[{"installOrUpgradeBundle":"classic-templates-<version>.tgz","forceUpdate":true},{"installOrUpgradeBundle":"classic-media-<version>.tgz","forceUpdate":true},{"importSite":"orvane-signal.zip"},{"importSite":"orvane-live.zip"}];type=application/json' \
  --form "file=@classic-templates-<version>.tgz" --form "file=@classic-media-<version>.tgz" \
  --form "file=@orvane-signal.zip" --form "file=@orvane-live.zip"
```

## Regenerating the package

Seed the site locally (the `orvane-demo` seeder), then from the repository root:

```bash
python3 scripts/export-prepackaged.py --site orvane-live
```

Its profile keeps the content of the template set, classic-media and the four add-on modules
(`addon_prefixes`); `--check` says whether the committed export is up to date. Never edit the XML.

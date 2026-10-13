# Orvane Signal pre-packaged website

The `orvane-signal` demo site, the editorial hub of **Orvane**, a fictional media group, built with the
[classic-templates](../template-set/README.md) template set and the [classic-media](../media/README.md)
module, packaged as a Jahia module. It goes with its sister site
[Orvane Live](../prepackaged-orvane-live/README.md). Back to the [repository README](../../README.md).

| Artifact                                                                          | What it is                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.jahia.community:orvane-signal-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:orvane-signal-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

Orvane Signal in English and French:

- 45 pages, three levels deep: home, topics (6 topics, each with 4 sub-topics, every one a feed
  of the stories filed under it), Watch (a video gallery and video stories), Podcasts, Reports
  (members only), About (team, contact), a newsletter page, search, sign-in, legal notice, privacy
  policy, accessibility statement and site map;
- 30 stories in 7 formats (10 news, 5 features, 3 opinions, 3 interviews, 3 reports of which 2 for
  members only, 3 videos, 3 podcasts) by the 6 people of the editorial team, filed under the
  `orvane` categories (6 topics, 24 sub-topics, carried in `systemsite`);
- 4 generated videos with English and French captions (js-media-gallery), 3 podcast episodes with
  their transcripts, a newsletter and a contact form (Formidable);
- the `signal` theme, the network bar linking Orvane Live, the header with search and sign-in.

Every person, company, figure, quote and contact is invented (`@orvane.example`, `+351 000 000 000`
numbers); the footer, the legal pages and the home page say so. The structure was inspired by the
information architecture of a real media organisation's sites; none of its names, logos or texts is
reused. The site is published (the export carries the live workspace), is not the default site of
the instance (`defaultSite=false`) and has the server name `localhost`.

Unlike the classic-dev and Skylantern packages, this one keeps the content of add-on modules on
purpose (the showcase demonstrates them): it declares `jsfaq`, `js-media-gallery`,
`js-store-locator` and `formidable-elements` as dependencies.

## Personalisation (jExperience)

Both Orvane sites also show personalisation with jExperience, built on what a visitor reads and
answers, and only after they accept tracking:

- a consent banner (`ctpl:consentBanner`) in the shared footer; tracking is off by default on the
  site node (`wemmix:deactivateJSExecution` = all) until the visitor accepts;
- personalised sections: the Signal hero (registered attendee, exhibitor prospect, the reader of
  each topic), a "For you" rail (the reader's topic, else editors' picks), the newsletter band
  (exhibitor prospect, subscriber); on Orvane Live the hero (exhibitor prospect, registered
  attendee, streaming reader) and the latest Signal stories by the reader's topic;
- an A/B test of the Live hero's call to action ("Register now" or "Get your pass") for the
  visitors no variant matched, measured by the registration goal;
- form answers (newsletter, Live registration, stand enquiry) written to the visitor profile by
  formidable-jexperience-engine, and story plays, shares, filters and searches recorded by
  classic-media.

Segments, rules, the scoring plan, goals, personas and the audience dashboard live in jCustomer and
Kibana, not in the site export: they ship in [`personalisation/`](personalisation) (JSON per jCustomer
endpoint, the dashboard as `.ndjson`) and are loaded after the import by
`scripts/load-jcustomer.py`, which also resolves the goals' forms on the target (an import gives
every node a new identifier).

## Installing

The two Orvane sites link to each other (the network bar in each header, the Signal editors who
moderate Live sessions, the latest Signal stories on the Live home page): **import both**. Jahia
keeps a reference to a site that is not there yet and resolves it when that site arrives, so the
order does not matter.

1. Install, at the same version, `classic-templates` and `classic-media` (0.8.0 or later), then the
   add-on modules the sites show: `jsfaq` (1.1.1), `js-media-gallery` (1.1.0),
   `js-store-locator` (1.1.0) and `formidable-elements` (0.5.0), and these two modules. For the
   personalisation, a jCustomer (3.0.0) and, from the Jahia store, `jexperience` (3.9.1),
   `formidable-engine` and `formidable-jexperience-engine` (0.5.0), `kibana-dashboards-provider` and
   `jexperience-dashboards` (2.1.0), configured BEFORE the import: one jExperience settings entry
   `global` and one per site (`org.jahia.modules.jexperience.settings`, the jCustomer connection,
   `jexperience.siteKey` on the site entries), and the Kibana proxy
   (`org.jahia.modules.kibana_dashboards_provider`: the URL and the four user fields, placeholders
   on a Kibana without security). Never install a development build of a Formidable or jExperience
   module next to these: the add-ons would stay wired to it.
2. Open Administration > Projects
   ([localhost:8080/jahia/administration/webProjectSettings](http://localhost:8080/jahia/administration/webProjectSettings)),
   and under **Import prepackaged project** import both Orvane sites.
3. Load the personalisation into jCustomer and Kibana:
   `JAHIA_URL=... JCUSTOMER_URL=... KIBANA_URL=... python3 scripts/load-jcustomer.py packages/prepackaged-orvane-signal/personalisation`.
   Without it the sites work and show their default content to everyone.
4. For the search pages: install Augmented Search (4.1.0, with its Elasticsearch connector), then
   register and index the two sites:
   `mutation { admin { search { a: addSite(siteKey: "orvane-signal") b: addSite(siteKey: "orvane-live") } } }`
   and `startIndex(siteKeys: ["orvane-signal", "orvane-live"], workspace: LIVE)`. Without it every
   page works and the search page shows its box with no result.

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
python3 scripts/export-prepackaged.py --site orvane-signal
```

Its profile keeps the content of the template set, classic-media and the four add-on modules
(`addon_prefixes`); `--check` says whether the committed export is up to date. Never edit the XML.

# classic-templates Changelog

## 0.9.0

### New Features

* Images render through `JImage` of javascript-modules 1.3.1: each one lists resized versions (`srcset` and `sizes`) so a phone can load a smaller file, which takes effect with a DAM or an image resizer. The template set, classic-media and classic-travel now require `javascript-modules-engine` 1.3. A Cloudinary 3D model chosen as an image shows in its own viewer

### Bug Fixes

* The release checklist counts the packages, version files and release assets added since 0.7.0 (classic-media, the Orvane portal site)

## 0.8.0

### New Features

* New consent banner (`ctpl:consentBanner`) for the footer area of the home page: visitors accept or refuse tracking once, a Privacy settings button after the footer opens it again, and on a site running jExperience the choice switches its tracking on or off for the visitor

* A call to action can be shown to everyone, only to visitors who are not signed in (a "Sign in" button disappears once the visitor signs in) or only to signed-in visitors ("Show the button to", on every call to action); the section around it stays cached for everybody

* Page Builder says what the page cannot show: one shared edit note in three looks (explains, not shown on live, accessibility with a label) for every component of classic-templates, classic-media and classic-travel; above the page, that the header and footer are edited on the home page, a missing page description, a browser title longer than search results show, a site hidden from search engines, a hidden page title; on content pasted as a reference, where it comes from and how many places reuse it, or that it is unpublished or gone; in rich text, headings renumbered because they used level 1 or skipped a level; a content list's panel and the news ticker's summary link the folder they list to jContent (new tab)

* Themes can colour the breadcrumb and the footer on their own: the breadcrumb sits in a full-width band (`--ctpl-breadcrumb-*` tokens: surface, text, link, current page, padding) and the footer maps `--ctpl-footer-*` tokens (surface, text, muted text, rules, link hover, a bottom edge) onto the page roles inside it, so a theme can draw a dark breadcrumb band or a dark footer. The defaults repeat the page colours: nothing changes for existing themes. The site footer gets a **Footer logo** (shown instead of the site name, which becomes its text alternative), and its tagline keeps its line breaks, for an address.

* Members-only items show the opening paragraphs of their body before the members notice (2 by default, set per item, never the whole body; the rest is not sent), and the notice offers "Create an account" when the site header names a registration page; classic-media stories and sessions can be switched to "Members only" too

* The site header gets a **Header layout** (one row as before, or two rows: the brand, the search box, the utility links, the account entry and the languages on top, the menu on its own full-width row below) and a **Brand caption** (a short line beside the logo, such as the company's tagline, part of the link to the home page, shown from 768 pixels wide). The account entry offers **Register** beside **Sign in** to visitors who are not signed in when the header names a registration page.

* Item pages (news, articles, stories, sessions) list their categories under Topics and their tags under Tags; each tag links to the site's search results for it when the site header names a Search page (new setting); sessions show their topics and tags too

* The labels built into the template set and classic-media views (skip link, menu, sign-in, members-only notices, breadcrumb, list panels, carousel, share, agenda, search and more) now come in European Portuguese (`pt`) besides English and French, and a unit test keeps each `pt.json` and `fr.json` on exactly the keys of `en.json`; editor labels stay English and French

* classic-media: a brief gets a **Submission form** (a Formidable form, shown on the brief's page while the brief is open and replaced by "This brief is closed." once it is closed), and any picture or video of the media library can carry a **Credit** (`ctmdmix:credited`, offered by jContent on every file) that stories and briefs show as a "Photo: ..." caption under the image (EN, FR, PT)

* classic-media gets the content of a supplier portal: briefs (a page with description, deadline, media wanted, quantity, intended use and a mood picture, and a card), submissions (a supplier's files with caption, credit, licence and the picture desk's follow-up, shown as a status card with the status as text and a mark), and two lists computed for the visitor who reads them (a brief that a visitor may not read is absent from their list, and each supplier sees their own submissions); the lists and the status card are cached per user

* New package classic-media (ctmd): people, stories in seven formats (news, feature, opinion, interview, report, video, podcast) with byline, share, transcript, related stories and members-only reports, story feeds by topic and format, event sessions with an agenda (day tabs, filters, event time zone), a speaker gallery with an A-Z index and the key dates of an event, and a search results section on Augmented Search, for media groups running an editorial hub and an event site

* classic-media sends standard jCustomer events when jExperience tracks the visitor (after consent where the site asks for it): video and podcast plays, shares, feed and agenda filters, and search queries, so segments and dashboards can use them; nothing is sent without jExperience or before consent

* New mega menu style for the main navigation ("Menu style" in the header's navigation: Dropdown or Mega menu). On large screens a top-level page opens a full-width panel with its subpages in columns, their own subpages listed under each, and the page's new **Menu promotion** (`ctplmix:navPromo`, an option of the page's edit form: image, title, text and a call to action) beside them; on small screens it works like the dropdown, the promotion under the list. Same markup, script and keyboard behaviour as the dropdown.

* New network bar (ctpl:networkBar) for sites that belong to a group: in the home page's header area, above the site header, it shows the group's name and a link to each site of the group, the current site marked for everyone, screen readers included

* A `ctplShell` view of a page renders the template set's page shell (header, breadcrumb, page title, footer, theme, members-only gate) around a body view that another module names, so a project can offer a structured template next to the free ones

* Two new pre-packaged sites, Orvane Signal and Orvane Live, the editorial hub and the annual convention of a fictional media group, built with the template set and classic-media; unlike the other pre-packaged sites they keep the content of the add-on modules they show (jsfaq, js-media-gallery, js-store-locator, formidable-elements), declared as dependencies, and they link to each other

* The Orvane pre-packaged sites take their form actions from the formidable-extended-actions modules, outside the Formidable core: Signal and Live enable `formidable-accounts` (Create account, Sign in), the portal enables `formidable-content` (Create content, its mapping stored as one document) and `formidable-redirect` (the redirect to My submissions after an answer)

* A third pre-packaged Orvane site, **Orvane Portal**: the gated portal where the group's photo and video suppliers answer its briefs, with its access rules (closed pages and per-company folders), briefs, earlier submissions and the submission form (Formidable's Create content action). Orvane Signal and Orvane Live are re-exported with the "Work with us" link to it, the header's account entry and Signal's Supplied library.

* The Orvane pre-packaged sites now show personalisation with jExperience: a consent banner, personalised sections on both home pages, an A/B test of the Live hero's call to action and form answers written to the visitor profile; their segments, rules, scoring, goals, personas and audience dashboard ship alongside and load with `scripts/load-jcustomer.py`, which resolves the goals' forms on the target instance

* The pre-packaged Orvane sites carry the showcase's v3 and v4 content: tags and interests, members-only teasers on reports, features and sessions, register pages (Formidable accounts), Orvane Live in Portuguese, Signal stories reused on Live's home, the header search box, the members' "Welcome back" variant and the Reports page A/B test; the jCustomer items gain the account goals (in the shape jExperience's Goals screen lists), the sign-in counter and the member segment. The export leaves out global groups and users, which a granted role pulls into `site-privileged`, and Augmented Search's indexation timestamps on the site node, which made the import of a site fail on an instance running Augmented Search.

* classic-media's search section gets faceted search with autocomplete: filters for topics (a tree), tags, format, type and, for a network search, site, with counts, removable chips and paging without a reload (Elastic Search UI core behind a connector of our own to Augmented Search; without JavaScript the same filters are a GET form); tags on item pages now link to the search page's tag filter (`?tag=`); each result shows its own summary (SEO description, else teaser) with the searched words highlighted, the index excerpt only for items without one; the story format and the session type become facetable: Augmented Search needs `content.mappedNodeTypes` to list `ctmd:story,ctmd:session,ctmd:person,ctplmix:editorialItem.teaser` and a full reindex after upgrading. The site header gets an optional search box with suggestions

* Page sections, and the items holding their text (cards, accordion entries, tabs, key figures, key dates), are now editorial content (`jmix:editorialContent`). With its default settings Augmented Search indexes their text with their page, so a search finds a word of a section body, a card or an FAQ answer; before, only titles and descriptions were searchable unless the site's Augmented Search configuration listed classic-templates types. jContent also lists them in a page's content and offers Translate on them. The header, the footer and the consent banner are not editorial content: their labels are not indexed with every page. No content needs changing; run one full Augmented Search reindex after the upgrade.

* New site setting "Hide from search engines" (ctplNoIndex, off by default) in the Site look section: when ticked, every page of the site carries a robots meta tag with noindex and nofollow, read from the page's own site, so a private or gated site stays out of search results. Nothing changes in the output while it is off. English and French labels and tooltips

* The footer's social links show the network's icon (LinkedIn, YouTube, X, Facebook, Instagram, GitHub, TikTok, Bluesky, Threads, Pinterest, Vimeo, WhatsApp), recognised from the link's address: a new `icon` view of `ctpl:link` and `social` view of `ctpl:linkList`. The link's title, else the network's name, stays its accessible name; a link to another address shows as text. Icons from Bootstrap Icons 1.13.1 (MIT).

* classic-media: a submission has a page of its own, opened from the title of its status card (every fact, the caption, the photos and the other files sent, the picture desk's note), readable only by the supplier's company and the desk; before, the card's only link opened the brief's page and its answer form

* New theme Portal for gated work portals (a supplier or partner area): cool light greys, sans-serif headings, sharp corners and almost flat shadows, a restrained petrol blue for links and buttons and the group's vermilion kept for key values only, checked for WCAG 2.1 AA contrast in light and dark. The site settings gain a Portal choice, with English and French labels

* A theme can now come from another module: a module that declares a site mixin extending `ctplmix:themeProvider` adds its theme as an option of the site's edit form once it is enabled on the site. Switched on, it replaces the theme chosen in Site look (light or dark still applies): the page carries the mixin's local name as `data-ctpl-theme` and loads that module's stylesheet after the template set's. A brand theme no longer needs a release of the template set.

* Two new themes: Signal (warm paper neutrals, serif headings, cobalt links, vermilion buttons, sharp corners) for news and magazine sites, and Live (dusk neutrals, heavy sans-serif headings, violet links, jade buttons, round shapes) for event sites, both checked for WCAG 2.1 AA contrast in light and dark

### Bug Fixes

* The header's account entry now shows the signed-in visitor's name and "Sign out" for site members and other visitors without a back-office role. On a stock Jahia, GraphQL is open to privileged users only, so their entry kept saying "Sign in"; the template set ships a scope (`org.jahia.bundles.api.authorization-classic-templates.yml`) that lets the site's pages ask `currentUser`, on no node: no content becomes readable through GraphQL.

* A brief's answer form is easy to find and styled like the site's other forms: the brief page has an "Answer this brief" button under its facts that leads to the form, each open brief card links to it, and the form is rendered in the template set's add-on scope (it kept the browser's default fields). Radios and checkboxes of a Formidable form now sit beside their labels instead of being drawn as full-width text boxes.

* After Accept or Refuse in the consent banner, the page's copy of jExperience's tracking switch (`digitalData.wemInitConfig.activateWem`) now follows the choice at once. It kept its page-load value until the next page, so a visitor who accepted on a page holding a Formidable form mapped to the jExperience profile sent the form without its answers reaching the profile.

* classic-media: in edit mode, a story feed's summary names the categories it filters on, the ones picked on the feed and the page's own ("Only the stories filed under AI and automation or their subcategories"); before, a feed filtered on a picked category read like one that lists everything

* The release checklist says the demo replication kit leaves every running development build (SNAPSHOT) in place, whatever its version, so a release never replaces the demo instance's build from a demo branch; it also says that the release commit's integration tests fail by design (the test provisioning installs development builds only) and that the next development version's run is the check

* The link of a page's menu promotion can now be set from the page's edit form: **Page of this site** and **Web address** fields come with the promotion, and **Link** says which one the button uses. Before, choosing a link type on a page saved the choice and showed no field to pick the page or type the address (Jahia's link fields attach to content only, not to pages).

* The release checklist names the next development version as the next minor (X.(Y+1).0-SNAPSHOT), as every release so far has done

* The sanitizer's linear-time unit test (template set, classic-media, classic-travel) compares the time taken on an input and on one 8 times as long instead of holding each input under one second: it failed once on a slow GitHub Actions runner (1012 ms) although the code was fine, and it still fails a sanitizer that turns quadratic

* The sign-in form asks for an "E-mail or username" with a hint under the label, instead of a "Username" visitors who registered with their e-mail did not recognise; the refusal message names all three

* A story feed set to "Stories of this page's topics" now lists the stories filed under the page's categories and under their subcategories, as picked categories already did. A topic page whose stories are all filed under its sub-topics listed nothing.

## 0.7.0

### New Features

* Members-only content: news items and articles can be reserved for signed-in visitors (the optional "Members only" section of their edit form), and pages and their sub-pages through a new "Members only" page option. Visitors who are not signed in get the title, teaser and image (item) or the title (page), a notice and a sign-in form instead of the body or the sections, and cards and lists show a "Members only" badge. New "Sign-in form" section (`ctpl:signIn`) that signs visitors in without leaving the site, and a new "Sign-in page" option on the site header so the sign-in entry opens that page instead of the platform's login screen

### Bug Fixes

* The package READMEs describe what each package holds today: the four packages, the page templates and page options, members-only content and the sign-in form, the title shown in the default language for untranslated pages, every progressive-enhancement script and the sign-in island, the unit-tested helpers, both pre-packaged sites (their theme, what each leaves out, Skylantern's inactive Chinese language) and the Skylantern example for classic-travel

* The release checklist is documented, from the changelog and the version to the GitHub release, the demo replication kit and the Jahia Store submission pack

* The release documentation now says when to push the next development version after a release: once the release build has started, since a build still waiting would be replaced

* `yarn lint` in the template set and classic-travel now checks the SonarQube rules that kept failing pull requests (sort comparators, unnecessary type assertions, object stringification, globalThis, replaceAll, code points, String.raw, at, re-exports, single push, cognitive complexity, nested conditionals and template literals), so the Static checks job fails before Sonar does; the rules ESLint cannot check, and how to write each case, are listed in `.agents/context/sonar-rules.md`. The few existing cases were fixed with no change to the rendered pages

## 0.6.0

### New Features

* Added a Graphite theme (true charcoal neutrals with crimson call-to-action buttons and emphasis, sans-serif headings and squared corners), in light and dark and checked for WCAG 2.1 AA contrast; choose it under Site look > Theme

### Bug Fixes

* Pull requests that change no package (documentation, changelog, harness, demo scripts) no longer wait for the build and the integration tests, and a newer run cancels an obsolete one

* The demo instance deployment runs only from the demo branches, so a change merged into main no longer replaces the build shown on the demo instance

* The demo seeding script works against a Jahia Cloud cluster with a single session, and on a newly created site it now sets the default share image and publishes it in every site language

## 0.5.0

### New Features

* Added a sign-in / sign-out entry to the site header: switch on "Show a sign-in entry" in the header's edit form and the utility bar offers "Sign in" to guests and the visitor's name with "Sign out" once signed in. Its addresses are the platform's own login and logout routes, built from the request's context path with a site-relative redirect (the page being viewed, or the new optional "Page after sign-in"), so nothing is tied to one server and nothing needs to be contributed as an external link. The header stays one cached fragment: a small island asks the platform who the visitor is. Also fixed: a link to a page that guests cannot read stayed cached as a plain label after the page was published or opened to everyone

* Added two themes, Sage (deep green-teal on soft green surfaces, with coral buttons and emphasis) and Slate (deep slate ink on cool neutral surfaces, with green buttons and emphasis), each in light and dark and checked for WCAG 2.1 AA contrast; choose them under Site look > Theme. Themes can now colour call-to-action buttons separately from links and navigation (new action colour role, equal to the accent in the other themes, so they look the same)

* New pre-packaged Skylantern Airways demo site (skylantern-prepackaged-website): a fictional airline in English and French, ready to import from Administration > Projects once classic-templates and classic-travel are installed

### Bug Fixes

* Menus, links, cards, the site map and the breadcrumb show a page's title in the site's default language while that page is not translated yet, instead of its system name or address

## 0.4.0

* classic-travel and a pre-packaged demo site now ship from this repository with the template set, at the same version: install classic-templates-prepackaged-website and import the classic-dev demo site from Administration > Projects, with no other module needed

* Every page carries Open Graph and Twitter card tags (title, description, image) so shared links show a preview; the image falls back from the page's SEO image to its item or hero image, then to a new Default share image site setting and the logo

## 0.3.1

* Pages take their theme, title, header, footer, breadcrumb and structured data from their own site, also on an instance where several sites keep the server name localhost (Jahia Cloud)

## 0.3.0

### New Features

* The breadcrumb of news items, articles and other items stored in content folders goes through the page that lists them (Home > News > item), once that page is named on the folder with the new Listing page setting, and its first crumb reads Home whatever the home page title; the structured data follows the same trail

* Added the hero carousel: hero banners shown one at a time with previous, next and slide buttons, stacked without JavaScript and in edit mode, autoplay off by default with a pause button

* Content lists and notice bars can label each item with its first category instead of its content type, so two kinds of news no longer read the same

* Added the notice bar: a slim band of the latest news items or articles as dated links, for the shared header or the top of a page, with an optional label, "view all" link and close button

### Bug Fixes

* Labels of the template set no longer show their raw key on pages that also show components of other modules (item pages of other modules, free zones)

## 0.2.0

### New Features

* Added an accordion section (entries that open and close, built on native disclosure), with expand all and collapse all, and links that open an entry

* Card grids can be shown as outlined icon tiles or as a logo strip, besides cards

* Added the Horizon theme (navy, teal and orange, light first, with its dark version) and an emphasis colour in every theme, used by key figures

* Tables in rich text scroll sideways on small screens inside a keyboard-reachable area named after their caption, instead of widening the page

* Added a tabs section whose tabs hold any page sections, shown one at a time with keyboard support, and as headed blocks without JavaScript or in edit mode

### Bug Fixes

* A text section set to "Wide" now uses the full content width, as its option says

## 0.1.2

* Rich text keeps links to other parts of the page as written, stays fast on very long tags, always closes its elements (a heading inside a heading included) and no longer shows "\[removed]" where an embedded object was left out

## 0.1.0

### New Features

* Content lists can be filtered by category, and show editors what they query and find; any section can end with a call to action; rich text is cleaned before it is rendered

* Every page and news or article page describes itself in schema.org JSON-LD; images can have a text alternative for each use or be marked decorative; accessibility improvements for RGAA 4.1.2 (focus over photos, small-screen menu, language links, heading order, rich-text structure)

* Added a free zone section for components of other modules (Formidable forms, FAQ, media gallery, store locator), which follow the site theme in light and dark mode

* Added card grids (written cards and teasers of news or articles), key figures, quotes, a site map and a breadcrumb trail that the site settings or a page can turn off

### Bug Fixes

* Edit mode now says which half of a call to action is missing (its label or its link), and a content list sorted by title reads "A to Z" or "Z to A"

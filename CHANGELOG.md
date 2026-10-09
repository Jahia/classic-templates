# classic-templates Changelog

## 0.7.1

* The release checklist says the demo replication kit leaves every running development build (SNAPSHOT) in place, whatever its version, so a release never replaces the demo instance's build from a demo branch; it also says that the release commit's integration tests fail by design (the test provisioning installs development builds only) and that the next development version's run is the check

* The release checklist names the next development version as the next minor (X.(Y+1).0-SNAPSHOT), as every release so far has done

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

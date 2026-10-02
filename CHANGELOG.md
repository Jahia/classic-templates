# classic-templates Changelog

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

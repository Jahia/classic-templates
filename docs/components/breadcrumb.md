# Breadcrumb

Not a component: the breadcrumb is part of the page templates. For administrators: it is switched on the site with `ctplShowBreadcrumb` (Site look) and per page with `ctplHideBreadcrumb` (Page options).

![A breadcrumb trail: Home, Services, Consulting, then the current page Strategy in bold](../images/breadcrumb.png)

## What it is

The breadcrumb is the trail of links that shows where the current page sits in the site, for example Home > Services > Consulting > Strategy. You do not add it or fill it in: the site builds it from the page titles.

## Where you can add it

Nowhere: you do not drop it on a page. It appears by itself on every page except the home page, between the header and the page content. The skip link at the top of every page ("Skip to main content") jumps over it.

You control it with two switches:

| Where                                | Label as shown in the editor | What it does                                                                                                                         |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The site, in jContent: **Site look** | Show the breadcrumb          | Shows the breadcrumb on every page except the home page. On by default.                                                              |
| A page: **Page options**             | Hide the breadcrumb          | Removes the breadcrumb from this page only, for example a landing page. Has no effect when the breadcrumb is off for the whole site. |

## How it behaves

- The trail starts with the home page, then lists the pages between the home page and the current page, and ends with the current page. The current page is not a link.
- Each entry uses the page's title in the current language. A parent page with no title in that language is left out of the trail.
- Pages hidden from the navigation still appear in the trail of their subpages.
- **News items and articles** get the trail Home > the item's title. The content folder that stores them is not shown.
- **Home page:** no breadcrumb.
- The separators between entries are drawn, not written, so screen readers do not read them out. They announce the trail as a "Breadcrumb" navigation.
- Sites created before the "Show the breadcrumb" setting existed show the breadcrumb, as if the setting were on.
- The same trail is described to search engines in the page's structured data, so both always agree.

## Good practice

- Keep the breadcrumb on: it helps visitors who arrive from a search engine on a deep page.
- Hide it only on pages built to stand alone, such as a campaign landing page.
- Keep page titles short: long titles make a long trail, especially on phones.

## In other languages

The trail uses the page titles of each language. Translate the titles of all parent pages: an untranslated page drops out of the trail in that language.

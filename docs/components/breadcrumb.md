# Breadcrumb

Not a component: the breadcrumb is part of the page templates. For administrators: it is switched on the site with `ctplShowBreadcrumb` (Site look) and per page with `ctplHideBreadcrumb` (Page options). The trail of news items, articles and other items stored in content folders goes through the page named on their folder (`ctplmix:listingPage`, property `ctplListingPage`).

![A breadcrumb trail: Home, Services, Consulting, then the current page Strategy in bold](../images/breadcrumb.png)

## What it is

The breadcrumb is the trail of links that shows where the current page sits in the site, for example Home > Services > Consulting > Strategy. You do not add it or fill it in: the site builds it from the page titles.

## Where you can add it

Nowhere: you do not drop it on a page. It appears by itself on every page except the home page, between the header and the page content. The skip link at the top of every page ("Skip to main content") jumps over it.

You control it with two switches, and one setting on content folders:

| Where                                | Label as shown in the editor | What it does                                                                                                                         |
| ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| The site, in jContent: **Site look** | Show the breadcrumb          | Shows the breadcrumb on every page except the home page. On by default.                                                              |
| A page: **Page options**             | Hide the breadcrumb          | Removes the breadcrumb from this page only, for example a landing page. Has no effect when the breadcrumb is off for the whole site. |
| A content folder: **Listing page**   | Page that lists this folder  | The page where visitors find the items of the folder. Their trail then goes through it, see below.                                   |

## How it behaves

- The trail starts with the home page, then lists the pages between the home page and the current page, and ends with the current page. The current page is not a link.
- The first entry always reads **Home** (**Accueil** in French), whatever the home page's title: that title is often written for search engines ("Flights from Hong Kong across Asia") and would make every trail long. It still links to the home page.
- Each other entry uses the page's title in the current language, or its title in the site's default language while the page is not translated. A parent page with no title in either language is left out of the trail.
- Pages hidden from the navigation still appear in the trail of their subpages.
- **News items, articles and other items stored in content folders** have no place in the page tree. Their trail goes through the page that lists them, when their folder names it (see below): Home > News > the item, or Home > About > Media room > the item. Otherwise it reads Home > the item. The content folders themselves are never shown.
- **Home page:** no breadcrumb.
- The separators between entries are drawn, not written, so screen readers do not read them out. They announce the trail as a "Breadcrumb" navigation.
- Sites created before the "Show the breadcrumb" setting existed show the breadcrumb, as if the setting were on.
- The same trail is described to search engines in the page's structured data, so both always agree.

## The page that lists a folder

A news item lives in a content folder, not under a page, so the site cannot tell on its own which page shows it: several content lists may show the same folder. You tell it once, on the folder:

1. In **jContent**, open the content folder, for example **contents > News**, and edit it.
2. Switch on **Listing page**.
3. In **Page that lists this folder**, pick the page where visitors find these items, for example your News page.
4. Save, then publish the folder.

Every item of the folder now gets the trail Home > the pages above that page > that page > the item, in every language. Sub-folders use the same page, unless they name their own: the nearest folder that names a page wins.

- Only a page of the same site counts. A page of another site, or one that is not published yet, is ignored, and the trail reads Home > the item.
- When the home page lists the folder, the trail stays Home > the item.
- A listing page with no title, neither in that language nor in the site's default language, is left out of the trail, like any page.
- Publish the listing page before or with the folder: the item pages follow as soon as the folder is published, without republishing each item.
- **In edit mode**, the page of an item whose folder names no listing page shows a short reminder under the breadcrumb. Visitors never see it.

## Good practice

- Keep the breadcrumb on: it helps visitors who arrive from a search engine on a deep page.
- Hide it only on pages built to stand alone, such as a campaign landing page.
- Keep page titles short: long titles make a long trail, especially on phones.
- Give each folder of news items or articles its listing page as soon as the page that lists it exists.

## In other languages

The trail uses the page titles of each language. A parent page not translated yet shows its title in the site's default language: translate the titles of all parent pages so the trail reads in one language.

# Search engines

This guide explains what the template set does for search engines and what you control. Most of it
comes down to good titles, descriptions and text alternatives.

## Page title

Each page's title is used for its main heading, its menu entry and the browser tab, shown as
"Page title | Site title". Search engines usually show this browser title in their results.

- Keep titles short and specific: "Home insurance" rather than "Our offer".
- Give every page a title in every language.

See [Page title and description](pages-and-templates.md#page-title-and-description).

## Page description

The page's description becomes its meta description: the short text search engines usually show
under the title in their results.

- Write one or two sentences per page, in every language, that say what the visitor will find.
- A page without a description uses the site's description, so every page has one. That fallback
  is the same on every page, which helps nobody choose: write your own.
- A news item or an article uses its **Teaser** as its description.

## Sharing on social networks

When a page is shared on a social network or in a messaging app, the link preview shows its title,
its description and an image. The template set writes these Open Graph and Twitter card tags on
every page: the title and description are the page's own, as above.

The image is the first that exists of:

1. the page's own share image, set in the **SEO** panel of the page or item (the Open Graph
   image field of Jahia's SEO module);
2. the image of the news item, article or other item the page shows;
3. the image of the page's first hero banner;
4. the site's **Default share image** (site settings);
5. the site logo.

Set a **Default share image** on the site so pages without a hero still share a picture. A
landscape image of about 1200 by 630 pixels suits most networks. The image's text alternative is
sent with it.

## One main heading

Every page has exactly one main heading, its title, placed by the template. Search engines read it
as the subject of the page. You do not add it yourself, and hiding the page title keeps it in the
page. See [One main heading per page](pages-and-templates.md#one-main-heading-per-page).

## Image text alternatives

Search engines read text alternatives to understand images. Give every image a meaningful title in
the media library, in every language, or a **Text alternative** on the component. See
[Images](../components/images.md) and [Accessibility](accessibility.md#what-you-are-responsible-for).

## Breadcrumb

The breadcrumb shows the path from the home page to the current page. It helps visitors, and the
same path is described to search engines in the structured data below. It is on by default, and you
can turn it off for the whole site or for one page. See [Breadcrumb](../components/breadcrumb.md).

## Structured data

Every page carries structured data (schema.org, in JSON-LD format): a machine-readable description
of the page that search engines use to understand it and, sometimes, to show richer results. It is
generated automatically from your content. There is nothing to fill in.

It describes:

- **your organisation**: the brand name and logo of the site header (the site title when there is
  no brand name);
- **the website**: its name and home page;
- **the page**: its title, description and language;
- **the breadcrumb** of the page, when the page shows one;
- on a news item or article page, **the item**: its title, teaser, publication and last
  modification dates, the image shown, the article's author (or your organisation when there is
  none, and for news items), and its tags as keywords.

Only what the page shows is described. To get the best of it:

- write good titles and teasers. Titles longer than 110 characters are cut in the structured data;
- set the **Publication date** of news items and articles (otherwise the creation date is used);
- fill in the **Author** of articles;
- tag news items and articles with Jahia's tag field;
- set the logo and brand name in the site header.

## sitemap.xml for search engines

A `sitemap.xml` file lists the pages of your site for search engines. The template set does not
generate it: Jahia's **sitemap** module does.

1. Make sure the sitemap module is installed on your Jahia (it was checked with version 5.5.0).
2. Enable it on your site, and configure it in the site's SEO settings. See the sitemap module's
   own documentation for its options.

The sitemap module also lets you mark individual pages as **not to be indexed** (noIndex). Pages
marked this way are also left out of the visitor [Site map](../components/site-map.md) component,
so both maps agree. They still appear in the main menu unless you also tick **Hide from
navigation** in their page options.

The [Site map](../components/site-map.md) component is something else: a page of links for
visitors, which accessibility rules require. You need both. See
[Accessibility](accessibility.md#what-the-template-set-does).

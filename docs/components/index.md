# Component reference

This reference describes every component of the classic-templates template set, as you see it in jContent and Page Builder: what it is for, where you can add it, its fields with their exact labels, and how it behaves for visitors and in edit mode.

Every text a visitor reads on the site is content you can edit, per language: headings, button labels, link texts, copyright line, "no result" texts. The only fixed wording is a handful of labels built into the template set and translated for each language (for example "Menu", "Skip to main content", and the "News", "Article" and "Topics" labels of news and articles).

## Page sections

You add these to a page's main area, inside a [Columns](columns.md) column, a [Tabs](tabs.md) tab, or inside a [Free zone](free-zone.md).

| Component      | What it is for                                                                | Where it goes                                                | Page                                               |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| Hero banner    | A large banner with a heading, a short text, a photo and a button.            | Hero area at the top of a page, main area, column, free zone | [hero-banner.md](hero-banner.md)                   |
| Hero carousel  | Several hero banners shown one at a time, with buttons to move between them.  | Hero area at the top of a page, main area, column, free zone | [hero-carousel.md](hero-carousel.md)               |
| Image and text | An image beside a heading, a text and a button.                               | Main area, column, free zone                                 | [image-and-text.md](image-and-text.md)             |
| Text           | Formatted text with an optional title. Also the call-to-action banner.        | Main area, column, free zone                                 | [rich-text.md](rich-text.md)                       |
| Columns        | A row of 2 to 4 columns, each holding its own sections.                       | Main area, free zone                                         | [columns.md](columns.md)                           |
| Card grid      | Hand-picked cards, icon tiles or a logo strip.                                | Main area, column, free zone                                 | [card-grid.md](card-grid.md)                       |
| Accordion      | Entries that open and close, such as questions and answers.                   | Main area, column, free zone                                 | [accordion.md](accordion.md)                       |
| Key figures    | A row of figures with their labels ("98% satisfied customers").               | Main area, column, free zone                                 | [key-figures.md](key-figures.md)                   |
| Quote          | A quotation with the name, role and portrait of the person quoted.            | Main area, column, free zone                                 | [quote.md](quote.md)                               |
| Content list   | News items or articles listed automatically, with a "see all" button.         | Main area, column, free zone                                 | [content-list.md](content-list.md)                 |
| Notice bar     | A slim band of the latest news or articles as dated links.                    | Header area of the home page, hero area, main area           | [notice-bar.md](notice-bar.md)                     |
| Link list      | An ordered list of links with an optional title.                              | Main area, column, free zone; also in the header and footer  | [links-and-link-lists.md](links-and-link-lists.md) |
| Site map       | Every page of the site as nested lists of links.                              | Main area, usually on a page of its own                      | [site-map.md](site-map.md)                         |
| Tabs           | Tabs, each holding its own sections; one tab shows at a time.                 | Main area, column, free zone                                 | [tabs.md](tabs.md)                                 |
| Free zone      | A frame for components of other modules (forms, FAQ, gallery, store locator). | Main area, column                                            | [free-zone.md](free-zone.md)                       |

## Shared header and footer

Both already exist on every site and appear on every page. You edit them from the home page only.

| Component   | What it is for                                                                                        | Where it goes                                | Page                             |
| ----------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------- |
| Site header | Logo, utility links, language switcher, optional sign-in / sign-out entry and the main navigation.    | Header area of the home page                 | [site-header.md](site-header.md) |
| Site footer | Site name, tagline, link columns, copyright, legal and social links.                                  | Footer area of the home page                 | [site-footer.md](site-footer.md) |
| Breadcrumb  | The trail from the home page to the current page. Not a component: switched on the site and per page. | Every page except home, set by the templates | [breadcrumb.md](breadcrumb.md)   |

## Editorial content

| Component          | What it is for                                          | Where it goes                                                     | Page                                         |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| News item, Article | Dated news and longer articles, each with its own page. | Content folders in jContent: contents > News, contents > Articles | [news-and-articles.md](news-and-articles.md) |

## Shared fields

These groups of fields appear in several components. Each page explains them once.

| Fields                                           | What they are for                                                                      | Used by                                                                   | Page                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| Call to action (Button label, Link)              | One button with its link. Built into some components, optional on every other section. | Hero banner, Image and text, Content list; optional on the other sections | [call-to-action.md](call-to-action.md)             |
| Link (No link / Page of this site / Web address) | Where a link goes, set per language.                                                   | Links, cards, calls to action                                             | [links-and-link-lists.md](links-and-link-lists.md) |
| Background                                       | Page background, light band or accent tint.                                            | Every section except the hero banner and link lists                       | [section-style.md](section-style.md)               |
| Image, Text alternative, Decorative image        | An image from the media library and what it means for people who cannot see it.        | Hero banner, Image and text, cards, quotes, news and articles             | [images.md](images.md)                             |

## Page and site options

Two groups of options are not components but change how pages show:

- **Page options**, in a page's edit form: **Hide from navigation** (see [Site header](site-header.md)), **Hide the page title** (see [Hero banner](hero-banner.md)) and **Hide the breadcrumb** (see [Breadcrumb](breadcrumb.md)).
- **Site look**, in the site's edit form in jContent: **Theme**, **Light or dark** and **Show the breadcrumb**. Changing them alters no content: every component follows.

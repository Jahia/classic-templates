# Pages and templates

This guide explains the page templates, what each page area accepts, the page options, how page
titles and descriptions are used, and how the main menu is built from your pages.

## The three page templates

You pick the template when you create a page, and you can change it later in the page's edit form.
The template names are shown in English in every language of the editing interface.

| Template            | Layout, top to bottom                                | Use it for                                         |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| **Home**            | page title (hidden by default), hero area, main area | the home page                                      |
| **Content page**    | page title, hero area, main area                     | most pages: about, services, contact, legal notice |
| **Full-width page** | page title, main area                                | landing pages built entirely from sections         |

Every template also shows the shared site header, the breadcrumb (on every page except home) and
the shared site footer. You do not add them yourself.

On a **Content page**, the page title comes first, then the hero banner. If the banner already
says what the page is, tick **Hide the page title** (see [Page options](#page-options)).

The **Full-width page** has no hero area. You can still put a hero banner at the top of its main
area.

## Page areas and what they accept

| Area          | Accepts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hero area** | a [Hero banner](../components/hero-banner.md). It is meant for one banner at the top of the page.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Main area** | the page sections, in order: [Hero banner](../components/hero-banner.md), [Image and text](../components/image-and-text.md), [Text](../components/rich-text.md), [Columns](../components/columns.md), [Card grid](../components/card-grid.md), [Key figures](../components/key-figures.md), [Quote](../components/quote.md), [Content list](../components/content-list.md), [Link list](../components/links-and-link-lists.md), [Site map](../components/site-map.md) and [Free zone](../components/free-zone.md) |

Components of other modules (a form, a FAQ, a gallery) do not go directly in a page area. Put them
in a **Free zone** section. See [Add-ons](add-ons.md).

The full list of components is in the [component index](../components/index.md).

## News and articles have their own page

News items and articles are not pages. They live in the `contents/news` and `contents/articles`
folders in jContent, and each one gets its own address on the site. Pages show them through a
[Content list](../components/content-list.md) or a card in a [Card grid](../components/card-grid.md).

When a visitor opens a news item or an article, it is displayed with the **Full page** template:
the shared header and footer, a breadcrumb (Home, then the item), and the item itself: its type and
date, its title as the page's main heading, the teaser, the image, the body, and its tags and
categories under "Topics". An article also shows its author and an estimated reading time.

See [News and articles](../components/news-and-articles.md).

## Page options

Every page's edit form offers a **Page options** section. Switch it on to use these options:

- **Hide from navigation**: the page stays online and reachable at its address, but it does not
  appear in the main menu. Its sub-pages do not appear either. It still appears in the
  [site map](../components/site-map.md). Use it for the legal notice, the privacy policy, the site
  map page, the accessibility statement, or a campaign page you only link to.
- **Hide the page title**: removes the page title from the screen when a banner already shows it.
  The title stays in the page for screen readers and search engines. Use it on the home page (it
  is already ticked there) and on pages that open with a hero banner whose heading says the same
  thing as the title. Do not use it on a page without such a banner: sighted visitors would then
  see no title at all.
- **Hide the breadcrumb**: removes the breadcrumb trail from this page only, for example on a
  landing page. It has no effect when the breadcrumb is turned off for the whole site (see
  [Themes and appearance](themes-and-appearance.md#breadcrumb)).
- **Members only**: reserves the page, and every page below it, for signed-in visitors. Visitors who
  are not signed in get the header, the page title, a notice and a sign-in form instead of the page's
  sections. Restrict the page's areas to registered users too if their content must not be readable
  through other addresses: see [Members-only content](members-only-content.md).

## Page title and description

Each page has a **title** and a **description**, in every language.

The **title** is used:

- as the page's main heading on screen (unless you hide it);
- as the page's entry in the main menu, the breadcrumb and the site map;
- in the browser tab, as "Page title | Site title" (only the site title when both are the same);
- as the title search engines usually show in their results.

Keep titles short and specific: the same text serves as the menu entry.

The **description** becomes the page's meta description, the short text search engines usually
show under the title in their results. Write one or two sentences in every language. A page
without a description uses the site's description. A news item or an article without a
description uses its teaser.

See [Search engines](seo.md) for more.

## One main heading per page

Every page has exactly one main heading (an `<h1>`), and it is always the page title. The template
places it, so you never add it yourself:

- Components start at the next level: a hero banner heading, a section title and a card grid title
  are all second-level headings, even when they look big.
- On a news item or article page, the item's title is the main heading.
- When you hide the page title, the heading is still there for screen readers and search engines.

This matters because screen reader users jump from heading to heading, and search engines read the
main heading as the subject of the page. Two main headings, or none, make both less reliable.

## Building the menu from the page tree

The main menu shows the pages under the home page. There is no separate menu to edit: to change the
menu, change the pages.

- **Level 1** of the menu is the pages directly under the home page. **Level 2** is their
  sub-pages, **level 3** the sub-pages of those.
- **Order**: the menu follows the order of the pages in jContent's page tree. Reorder the pages to
  reorder the menu.
- **Depth**: the menu shows three levels by default. To show fewer, open the home page in Page
  Builder, select the main navigation in the site header and change **Menu depth** (1 to 3). The
  menu never shows more than three levels.
- **Menu entry text**: the page title, in the visitor's language.
- **Hidden pages**: a page with **Hide from navigation** is left out, together with its sub-pages.
- **Unpublished pages** show in the menu in edit mode and preview only. Visitors see them once
  they are published.

Besides pages, the page tree can hold Jahia's other navigation items, and the menu shows them too:

- a **menu label**: an entry without a link, for grouping sub-pages under a heading;
- an **internal link**: an entry that points to another page or content item;
- an **external link**: an entry that points to another site. Its address must start with
  `http://`, `https://`, `mailto:` or `tel:`, otherwise the entry is shown as plain text without a
  link.

On small screens the menu collapses behind a **Menu** button. Sub-menus open with a button next to
their parent entry, with the mouse, by touch or with the keyboard.

![The menu on a small screen, open](../images/menu-mobile.png)

See [Site header](../components/site-header.md).

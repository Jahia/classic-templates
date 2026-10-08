# Editing content

This guide is for content editors. It covers where to work, how to add and arrange components, the
shared header and footer, languages, the hints you may see while editing, and publishing.

## Page Builder or jContent

Both are part of Jahia's jContent. Use each for what it does best:

- **Page Builder** shows the page as visitors will see it. Use it to add sections to a page, edit
  them in place, and see the result straight away.
- **jContent's other views** show your content as trees and lists. Use them to create and order
  pages, to manage news items and articles in their folders, to upload and title images in the
  media library, and to translate.

Whichever you use, a component opens the same edit form.

## Adding, ordering and editing components

- **Add**: in Page Builder, use the add button of the area where the section should go (the hero
  area or the main area). You are only offered the components that area accepts. See
  [Page areas](pages-and-templates.md#page-areas-and-what-they-accept).
- **Order**: sections are shown in the order of the area. Move a section to change its place on the
  page.
- **Edit**: select a section and open its edit form. Every field has a short help text: read it
  the first time you use a component.
- **Nested content**: some sections hold items of their own, for example the cards of a card grid,
  the figures of a key figures section, the links of a link list, or the sections inside each
  column of a columns row. Add, order and edit those items the same way, inside their section.
- **Columns**: when you switch a [Columns](../components/columns.md) row to fewer columns, the
  content of the hidden columns is kept. It comes back if you switch back.

Most sections have a **Background** field and an optional **Call to action**. See
[Section style](../components/section-style.md) and
[Call to action](../components/call-to-action.md).

## The shared header and footer

The site header (logo, utility links, language switcher, main menu) and the site footer are the
same on every page. They are stored once, under the home page.

- **Edit them on the home page.** Open the home page in Page Builder: the header, the footer and
  everything inside them can be selected and edited there.
- **On every other page they are locked.** You see them, but you cannot select or change them.
  This is on purpose: a change there would change every page of the site, so it is only offered
  in one place, where it is clear that you are editing the shared version.

See [Site header](../components/site-header.md) and [Site footer](../components/site-footer.md).

## Languages

### Everything is translatable

Every text a visitor reads is content: page titles, headings, button labels, link labels, image
text alternatives, the footer copyright. Switch the editing language in jContent and translate each
item. Names of people (a quote's author, an article's author) are the same in every language.

### Link targets are set per language

The target of a link (the page it points to, or the web address) is stored **per language**. A link
you set up in English has no target in French until you set it in French too.

When a link has no target in the page's language:

- a link in a link list, the footer or a card is shown as plain text, without a link;
- a call-to-action button is not shown at all;
- in edit mode, you see the hint "No link target in this language".

So after translating a page, open each link and call to action in the new language and pick its
target again.

### Untranslated items are left out

When an item has no translation in the page's language, it does not show in that language:

- a [Content list](../components/content-list.md) leaves out news items and articles that are not
  translated into the page's language;
- a key figure without a value, or a quote without text, in that language is not shown;
- a card without a title in that language shows no heading.

### The language switcher

The language switcher in the header only offers the languages the current page exists in. If a
page is not translated into French, the French link does not appear on that page. On a site with
a single language, the switcher is not shown.

## Edit-mode hints

In Page Builder, some components show a short hint when something is missing. Visitors never see
these hints. Each one tells you what to fix:

| Hint                                                                                                                                             | Where                         | What to do                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No link target in this language                                                                                                                  | links, cards, calls to action | Set the link's target in this language. For a web address, check that it starts with `http://`, `https://`, `mailto:` or `tel:`. Also shown when the target page was deleted. |
| Untitled link                                                                                                                                    | links in a link list          | Give the link a title. An internal link without a title uses the target page's title (in the site's default language while that page is not translated).                      |
| Button label missing                                                                                                                             | calls to action               | The button has a link but no label, and its target has no title to fall back on. Fill in **Button label**.                                                                    |
| This button has a label but no link: choose a page or a web address, or clear the label.                                                         | calls to action               | Set **Link** to a page of the site or a web address, or empty **Button label** if you do not want a button.                                                                   |
| No image selected                                                                                                                                | image and text                | Pick an image in the **Image** field.                                                                                                                                         |
| This image has no title in the media library, so it has no alternative text.                                                                     | any image                     | Give the image a title in the media library (in every language), or fill in **Text alternative**, or tick **Decorative image** if it only decorates.                          |
| An image in this text has no text alternative: edit the image in the rich-text editor and describe it, or mark it decorative with an empty text. | text sections                 | Do what the hint says. Until then the image is treated as decorative.                                                                                                         |
| No title in this language: this item is left out of lists.                                                                                       | news items and articles       | Translate the item's title into this language.                                                                                                                                |
| Pick a news item or article to show in this card.                                                                                                | card of an existing item      | Fill in **Item to show**.                                                                                                                                                     |
| This card has no title in this language: it shows no heading.                                                                                    | written cards                 | Translate the card's title.                                                                                                                                                   |
| This figure has no value in this language: it is not shown.                                                                                      | key figures                   | Fill in **Figure** in this language.                                                                                                                                          |
| This quote has no text in this language: it is not shown.                                                                                        | quotes                        | Fill in **Quotation** in this language.                                                                                                                                       |
| Nothing to show yet.                                                                                                                             | content lists                 | The list found nothing. On the live site the section is hidden, unless you fill in **Text when empty**.                                                                       |
| The start folder is set but cannot be found here (deleted, or not published yet): the list shows nothing on the live site.                       | content lists                 | Pick an existing folder in **Look under**, or publish it.                                                                                                                     |
| This content type cannot be listed.                                                                                                              | content lists                 | Pick another value in **Content to list**.                                                                                                                                    |

A content list also shows, in edit mode only, a summary of its settings, for example "Lists News
item under contents/news, newest first, up to 3.", followed by what it found and what it left out
(excluded items, items not translated into the page's language). See
[Content list](../components/content-list.md).

## Publishing

Visitors only see what is published. Editing happens in a working copy, and nothing changes on the
live site until you publish.

- **Publish the page** after editing it, in every language you changed.
- **Publish the images too.** Publishing a page does not publish the images it uses. An image that
  is not published is simply missing on the live site: there is no error message. Publish the
  images in the media library, or the folder that holds them.
- **Publish news items and articles** in their folders. A content list on a published page only
  shows items that are published themselves.
- **Header and footer**: publish the home page after changing them. The change then shows on every
  page.
- **Site settings** (theme, colour scheme, breadcrumb) apply once the site itself is published. See
  [Themes and appearance](themes-and-appearance.md).

## News and articles

News items and articles are kept in two folders in jContent, created with the site:

- `contents/news` ("News"): only accepts **News item**.
- `contents/articles` ("Articles"): only accepts **Article**.

Open the folder in jContent and create the item there. Fill in:

- the **title**: it becomes the main heading of the item's page and the title of its card;
- the **Teaser**: one or two sentences shown on cards and under the title of the item's page, and
  used as its description for search engines;
- the **Body**: the full text;
- the **Publication date**: shown to visitors and used to sort lists, newest first. Leave it empty
  to use the creation date;
- an **Image**, and for an article the **Author**;
- tags and categories, with Jahia's own tag and category fields. They are shown under "Topics" on
  the item's page, and a content list can filter on categories.

Then publish the item. It appears in the content lists that look for its type in its folder. See
[News and articles](../components/news-and-articles.md) and
[Content list](../components/content-list.md).

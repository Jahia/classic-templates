# Frequently asked questions

## Header, footer and menu

### Why can't I edit the header on this page?

The header and the footer are shared by every page and stored once, under the home page. They are
locked on every other page so that nobody changes the whole site while thinking they are editing
one page. Open the home page in Page Builder to edit them. See
[The shared header and footer](editing-content.md#the-shared-header-and-footer).

### Where do I change the logo?

On the home page, select the site header and fill in **Logo**, and optionally **Logo for dark
mode**. Upload the images to the media library first. See
[Brand name and logo](getting-started.md#1-brand-name-and-logo).

### How do I add a page to the menu, or reorder it?

The menu is built from the pages under the home page. Create the page in the page tree and it
appears in the menu, at the place it has in the tree. Reorder the pages in jContent to reorder the
menu. See [Building the menu](pages-and-templates.md#building-the-menu-from-the-page-tree).

### How do I keep a page out of the menu?

In the page's **Page options**, tick **Hide from navigation**. The page stays online and appears in
the site map, but not in the menu, and neither do its sub-pages. See
[Page options](pages-and-templates.md#page-options).

### Why does the menu stop at three levels?

The menu shows at most three levels of pages. Deeper pages are reachable from their parent page and
from the [site map](../components/site-map.md). To show fewer levels, change **Menu depth** on the
main navigation, in the header of the home page.

## Languages

### Why is my link missing in French?

A link's target is stored per language. If you set it in English only, the French version has no
target: a link is shown as plain text and a button is not shown at all. Open the link in French and
pick its target again. See [Languages](editing-content.md#link-targets-are-set-per-language).

### Why doesn't the language switcher offer French on this page?

The switcher only offers the languages the current page exists in. Translate the page into French
and publish it, and the French link appears. See
[The language switcher](editing-content.md#the-language-switcher).

## Content

### Why doesn't my news item appear in the list?

Check, in this order: that the item is published; that it has a title in the page's language
(untranslated items are left out); that it is under the folder set in **Look under**; and that it
is not in **Items to leave out** or outside the **Categories** filter. Also check **Number of
items**: the list may be full. In edit mode, the list's summary tells you what it found and what it
left out. See [Content list](../components/content-list.md).

### How do I make a call-to-action banner?

There is no separate banner component. Add a [Text](../components/rich-text.md) section, set its
**Background** to **Accent tint**, and switch on its **Call to action** with a **Button label** and
a **Link**. See [Call to action](../components/call-to-action.md).

### Why does my page title appear twice?

On a page that opens with a hero banner, the page title and the banner heading can say the same
thing. Tick **Hide the page title** in the page options: the title disappears from the screen but
stays for screen readers and search engines. See [Page options](pages-and-templates.md#page-options).

### Why did my heading level change in a text section?

Headings you type in a text section are renumbered under the section's own heading, so that no
level is skipped. When the section has a title, your first heading becomes a level 3 heading. See
[Accessibility](accessibility.md#what-the-template-set-does).

### Why doesn't my link in a text section open in a new tab?

Links inside a text section always open in the same tab, because a new tab that is not announced
disorients screen reader users. If a link must open in a new tab, put it in a
[Link list](../components/links-and-link-lists.md) and tick **Open in a new tab**.

### Where do I put a form?

Forms come from the Formidable module. Enable it on your site, add a **Free zone** section to the
page, and place a form reference to your form inside it. See
[Place a Formidable form](add-ons.md#place-a-formidable-form).

## Images and publishing

### Why is my image not shown on the live site?

Publishing a page does not publish the images it uses. Publish the image in the media library (or
its folder) too. An unpublished image is simply missing on the live site, with no error. See
[Publishing](editing-content.md#publishing).

### What should I write as an image's text alternative?

What the image shows or means on this page, in a short sentence. By default, the image's title in
the media library is used, so give images meaningful titles in every language. Tick **Decorative
image** when it only decorates. See [Images](../components/images.md).

## Look and settings

### How do I change the theme?

In jContent, edit the site node and switch on **Site look**. Pick a **Theme** (Classic (navy),
Ocean (teal) or Terracotta (warm)) and a **Light or dark** setting, save, and publish the site. See
[Themes and appearance](themes-and-appearance.md).

### Why does the site look dark for some visitors and light for others?

With **Light or dark** set to **Automatic**, each visitor sees the scheme their own device or
browser asks for. Choose **Always light** or **Always dark** to show the same scheme to everybody.
See [Light or dark](themes-and-appearance.md#light-or-dark).

### How do I remove the breadcrumb?

For one page, tick **Hide the breadcrumb** in its page options. For the whole site, untick **Show
the breadcrumb** in the site's **Site look** settings. See
[Breadcrumb](themes-and-appearance.md#breadcrumb).

### Why does the breadcrumb of a news item read Home > the item?

News items and articles live in content folders, outside the page tree. Name the page that lists
them on their folder: in jContent, edit the folder, switch on **Listing page** and pick the page.
See [The page that lists a folder](../components/breadcrumb.md#the-page-that-lists-a-folder).

### Why are the template names in English when I edit in French?

The names of the page templates (Home, Content page, Full-width page) are not translatable in the
current version of Jahia's JavaScript modules engine, so they are shown in English in every
language. See [Pages and templates](pages-and-templates.md#the-three-page-templates).

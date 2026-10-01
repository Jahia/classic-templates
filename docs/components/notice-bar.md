# Notice bar

Type: `ctpl:noticeBar`

## What it is

A slim band that lists the latest news items or articles as dated links, newest first: service updates, opening hours that change, a recall, a deadline. It can start with a short label ("Service updates") and end with a "view all" link. New items appear in the band as soon as they are published: you never update it by hand.

The band is a static list. It never scrolls or rotates, so visitors read it at their own pace and nothing needs pausing.

## Where you can add it

- The **header area of the home page**, above or below the [site header](site-header.md): the band then shows on every page of the site. Open the home page in Page Builder, add the notice bar to the header area and move it above or below the header. Like the header, it is edited from the home page only.
- The **hero area** or the **main area** of one page, usually at the top.

## Fields

| Label as shown in the editor | What it does                                                                                  | Notes                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Label                        | Short name shown at the start of the band, for example "Service updates".                     | Per language. Optional. Without it no label shows and screen readers announce "Latest updates". |
| Content to list              | Type of content the band shows: news items, articles, or both.                                | Default: News item. The newest come first (publication date).                                   |
| Look under                   | Folder or page under which to look for content, for example a folder that only holds notices. | Optional. Empty: the whole site.                                                                |
| Categories                   | Only list items in one of these categories, or in one of their subcategories.                 | Optional. Empty: every category.                                                                |
| Number of items              | How many of the latest items the band shows.                                                  | Default: 3. From 1 to 10.                                                                       |
| Visitors can hide it         | Adds a close button to the band.                                                              | Default: off. See "Hiding the band" below.                                                      |
| Button label                 | Text of the "view all" link at the end of the band.                                           | Per language. Optional. See [Call to action](call-to-action.md).                                |
| Link                         | Where the "view all" link goes, usually the page that lists every notice.                     | Per language target. See [Call to action](call-to-action.md).                                   |

## How it behaves

### What visitors see

- The label, then each item's title as a link to the item's page, followed by its date in the page's language. The "view all" link sits at the end of the band.
- Items not translated into the page's language are left out.
- With no item to show (nothing published yet, or nothing in the chosen categories), the band does not show at all.
- On phones the items wrap onto several lines.
- The band uses the theme's accent tint, in light and dark mode, and every link is at least 44 pixels tall, so it is easy to tap.

### Hiding the band

With **Visitors can hide it** ticked, the band gets a close button. A visitor who closes it no longer sees it until they close their browser, or until a new item appears in the band: a new notice always shows. The close button only appears when the visitor's browser runs JavaScript; without it the band simply stays.

### In edit mode

The band always shows in edit mode, even when you closed it while browsing the site, and it shows no close button. A line above the items says what the band lists ("Lists News item under contents/notices, newest first, up to 3"), or why it lists nothing.

### For screen reader users

The band is a region named after its label (or "Latest updates"). It is not part of the site header's landmark, so the page keeps a single banner.

## Good practice

- **Keep it short.** Three items is a good default: the band sits at the top of every page.
- **Use a folder of its own.** Store notices in a dedicated content folder (or give them a category) and point **Look under** (or **Categories**) at it, so ordinary news items do not end up in the band.
- **Give it a label** when the page has several bands or lists, so each region has its own name.
- Unpublish (or move out of the folder) a notice that no longer applies: the band updates by itself.

## In other languages

The label, the "view all" label and its link target are per language. Items show in the page's language; an item with no translation is left out of the band in that language.

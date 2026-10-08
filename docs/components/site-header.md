# Site header

Types: `ctpl:siteHeader` (Site header), with its parts `ctpl:linkList` (utility links), `ctpl:languageSwitcher` (Language switcher) and `ctpl:mainNavigation` (Main navigation)

![The site header: a thin bar at the top with the links News, Contact and Jahia Academy and the language buttons EN and FR, then the brand name on the left and the menu About us, Services, News, Contact on the right](../images/site-header.png)

## What it is

The header shared by every page of the site. From top to bottom:

- a thin **utility bar**, aligned to the right, with a few utility links, the **language switcher** and, if you switch it on, the **sign-in entry**;
- the **logo** (or brand name), linking to the home page;
- the **main navigation**, the site menu, built from the pages of the site.

Every site created with this template set gets a header ready to fill in.

## Where you can add it

You do not add the header: it already exists, in the header area of the home page, and appears on every page.

**You edit it from the home page only.** Open the home page in Page Builder and select the header or one of its parts. On every other page the header is locked, so nobody changes it by accident while editing another page.

The header area can also hold a [notice bar](notice-bar.md), above or below the header, to show the latest notices on every page.

## Fields

### Site header

| Label as shown in the editor | What it does                                                                                       | Notes                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Logo                         | Logo shown at the top left, linking to the home page.                                              | Optional. An SVG or a PNG about 44 pixels high works best.      |
| Logo for dark mode           | A light-coloured version of the logo, used when the site shows in dark mode.                       | Optional. Only used when **Logo** is set too.                   |
| Brand name                   | Name shown next to the logo.                                                                       | Per language. Leave empty to use the site title.                |
| Show the brand name          | Shows the brand name next to the logo.                                                             | Default: on. Untick it when the logo already contains the name. |
| Show a sign-in entry         | Adds "Sign in" to the utility bar; signed-in visitors see their name and "Sign out" instead.       | Default: off. See [Sign-in entry](#sign-in-entry).              |
| Page after sign-in           | The page visitors land on once signed in, for example a members area.                              | Optional. Empty: the page the visitor was on.                   |
| Sign-in page                 | A page of the site with a [Sign-in form](sign-in.md), used instead of the platform's login screen. | Optional. Empty: the platform's login screen.                   |

### Utility links

A [Link list](links-and-link-lists.md) shown as a row in the utility bar. Its **Title** (for example "Quick links") is not shown on screen: it names the group for screen readers. Add, remove and reorder its links like in any link list.

### Language switcher

It has no fields. It shows a link to the current page in each other language of the site.

### Main navigation

| Label as shown in the editor | What it does                             | Notes                                           |
| ---------------------------- | ---------------------------------------- | ----------------------------------------------- |
| Menu depth                   | How many levels of pages the menu shows. | Default: 3. From 1 (top-level pages only) to 3. |

The menu stores no links of its own. You shape it by creating, ordering, renaming and hiding pages.

## How it behaves

### Logo and brand name

- The logo always links to the home page.
- With the brand name shown, the logo is treated as decoration and screen readers read the brand name. With the brand name hidden, the brand name becomes the logo's text alternative, so the link still has a name.
- Without a logo, the brand name is always shown.
- With a **Logo for dark mode**, visitors who see the site in dark mode (because the site forces it, or because their system is set to dark) get the light-coloured logo.

### Language switcher

- It lists only the languages the current page is translated into, each with its short code on screen ("EN", "FR") and the full language name for screen readers. The current language is marked.
- On a site with one language, or on a page available in only one language, it is hidden.

### Main navigation

- **Level 1** is the pages directly under the home page, in the order of the page tree. **Level 2** and **level 3** are their subpages.
- Besides pages, the menu shows the other items you can create in the page tree: menu labels (text without a link), links to another page or content, and external links. An external link whose address does not start with `http`, `https`, `mailto` or `tel` shows as plain text.
- Menu entries use the page title in the current language.
- Pages that are not published yet appear only in edit mode and preview.
- **Hide from navigation:** in a page's **Page options**, tick **Hide from navigation** to remove it from the menu. The page stays online and reachable by its address, and it still appears in the [site map](site-map.md). Its subpages leave the menu with it.
- Changes to the page tree (a new page, a new title, a new order, a hidden page) show in the menu once published.

On large screens:

- Level 1 entries sit in a row. An entry with subpages has a small arrow button next to it.
- Its panel of level 2 pages opens when the visitor points at the entry or presses the arrow button. Level 3 pages are listed under their level 2 page inside the panel.
- The Escape key closes the panel and returns to its arrow button. A click elsewhere, or moving the focus out of the entry, closes it too.
- The entry of the current page (and its parent entries) is highlighted.

### Sign-in entry

Switch on **Show a sign-in entry** (in the header's edit form, from the home page) when your site has a members area, an intranet or any content for signed-in visitors. Leave it off for a fully public site.

- A visitor who is not signed in sees **Sign in** (in French, **Se connecter**). It opens the platform's own login page, or your own sign-in page when you pick one in **Sign-in page**, and brings the visitor back to the page they were on once signed in.
- A signed-in visitor sees their **name** and **Sign out** instead, on every page. After signing out they come back to the page they were on, or to the home page when that page is not open to the public.
- **Sign-in page** keeps visitors in your design: create a page with a [Sign-in form](sign-in.md) section, pick it here, and the entry opens it with the page to come back to in its address. The page must be published, or the entry falls back to the platform's login screen. See [Members-only content](../guides/members-only-content.md).
- **Page after sign-in** overrides the page to come back to: pick your members area and every sign-in lands there. The page can be restricted to signed-in users: that is the point.
- There is **no link to maintain**: the sign-in and sign-out addresses belong to the platform, not to your content. Do not add a "Sign in" link to the utility links, and do not paste the address of your Jahia login page into an external link: it only works on that one server, and breaks when the site is copied to another environment. Switch this option on instead.
- The header is the same for everybody (it is cached as one piece): a small script asks the platform who the visitor is and swaps "Sign in" for the name. For a split second a signed-in visitor can still see "Sign in". Without JavaScript the visitor always sees "Sign in", which is always correct for someone the site does not recognise.
- In Page Builder the entry shows as plain text "Sign in": editors are signed in, and clicking it would take them away from the editing frame.

**Links to pages that are not open to everyone.** A guest never gets a working link to a page they may not open (it would lead to "page not found"). In the main menu such a page is left out for that guest. A utility link to it shows its title as plain text, without a link; a utility link without a title shows nothing. Signed-in visitors who may open the page see the real link, and the header is cached separately for each kind of visitor, so one never receives the other's version. To show a **Members area** link only to signed-in visitors, restrict the link node itself to the **Users** group (its access rights in jContent): guests then do not see it at all.

### Mobile menu

![The header on a phone: the utility links and language buttons on top, the brand name and a "Menu" button, and the open menu listing About us, Services, News and Contact, with arrow buttons next to the entries that have subpages](../images/menu-mobile.png)

On small screens the menu collapses behind a **Menu** button. The menu opens below the header, over the page. Entries with subpages have an arrow button that opens their subpages in place. Escape closes the menu and returns to the Menu button. Moving the focus out of the menu closes it too.

If a visitor's browser does not run JavaScript, the menu still works: on small screens every level is listed, on large screens the panels open on pointer and keyboard focus.

## Good practice

- Keep level 1 short: five to seven entries read well on a laptop. Group the rest under them.
- Give pages short menu-friendly titles. The page title is also the menu entry.
- Use the utility links for a handful of shortcuts (contact, customer area). They are not a second menu.
- Use the sign-in entry rather than a link to a login page, and set **Page after sign-in** to your members area.
- Upload a logo about 44 pixels high, and a light version for dark mode if your logo is dark.
- Untick **Show the brand name** only if the name is readable in the logo itself.

## In other languages

- The brand name and the utility link titles and targets are per language. The logos, the menu depth, the sign-in switch and the page after sign-in are shared. The words "Sign in", "Sign out" and "Signed in as" follow the visitor's language.
- The menu shows each page's title in the visitor's language. A page with no title in that language shows its title in the site's default language until it is translated; only a page with no title at all shows its technical name.
- The language switcher only offers a language once the current page is translated into it.

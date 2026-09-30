# Links and link lists

Types: `ctpl:link` (Link), `ctpl:linkList` (Link list), shared link field `ctplmix:linkTo`

## What it is

A **Link list** is an ordered list of **Link** items with an optional title. The same component builds the header utility links, the footer columns, the footer legal and social links, and any list of links you drop in a page. A **Link** is one entry of such a list: a label and a target, which is either a page of this site or a web address.

The **Link** field itself (No link / Page of this site / Web address) is also used by the [call to action](call-to-action.md) and by [written cards](card-grid.md).

## Where you can add it

- **Link list:** in a page's main area, inside a [Columns](columns.md) column, or inside a [Free zone](free-zone.md). The header and footer already contain their own link lists: you edit those from the home page (see [Site header](site-header.md) and [Site footer](site-footer.md)).
- **Link:** inside a link list only.

## Fields

### Link list

| Label as shown in the editor | What it does       | Notes                                                                |
| ---------------------------- | ------------------ | -------------------------------------------------------------------- |
| Title                        | Title of the list. | Optional. Per language. How it shows depends on the view, see below. |

Add, remove and reorder the links of the list in Page Builder or jContent. The order you set is the order visitors see.

### Link

| Label as shown in the editor | What it does                                                                | Notes                                                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title                        | The text of the link.                                                       | Per language. Optional for a page of this site: the link then shows the page's title.                                                                |
| Link                         | Where the link goes: **No link**, **Page of this site** or **Web address**. | Default: No link. Choosing **Page of this site** adds a page picker; choosing **Web address** adds an address field. The target is set per language. |
| Open in a new tab            | Opens the link in a new browser tab.                                        | Default: off. Screen readers hear "(opens in a new tab)" after the link text.                                                                        |

## How it behaves

### The three views of a link list

| View    | Where it is used                                              | What visitors see                                                                                                                                                                 |
| ------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default | A link list dropped in a page                                 | A section with the title as a heading (level 2, or level 3 inside a titled columns row) and the links one under the other.                                                        |
| Inline  | Header utility links, footer legal links, footer social links | A horizontal row of links. The title is **not shown on screen**: it names the group for screen readers (for example "Quick links"). Without a title, the group is called "Links". |
| Column  | Footer columns                                                | A titled column of links, the title shown above the links.                                                                                                                        |

### Link targets

- **Page of this site:** the link follows the page. If the page is renamed or moved, the link still works and shows the page in the visitor's language.
- **Web address:** only addresses that start with `http://`, `https://`, `mailto:` or `tel:` are used. Any other address is refused and treated as missing. With no title, the link shows the title entered with the address or, failing that, the address itself.
- **No link:** the title shows as plain text.

### Missing targets and empty lists

- **Target missing in this language, or target page deleted or not published:** visitors see the title as plain text, not a broken link. In edit mode the link shows the hint "No link target in this language". A link with neither a title nor a target shows "Untitled link" in edit mode and nothing on the live site.
- **Empty list:** a link list with no link shows nothing on the live site. It stays visible in edit mode so you can fill it.

## Good practice

- Write link text that makes sense on its own: "Accessibility statement", not "Read here".
- Leave **Open in a new tab** off for pages of this site. Use it sparingly, for documents or other sites. Visitors who rely on the back button lose their way when a tab opens unexpectedly.
- Prefer **Page of this site** over a pasted web address for your own pages.
- Give inline lists a title even though it is not shown: it tells screen reader users what the group is ("Legal information", "Follow us").
- For social links, write the name of the network as the link text ("LinkedIn"). The lists show text only, no icons.

## In other languages

The link title and the link target are both per language. The link type (No link, Page of this site, Web address) is shared by all languages. After adding a language, set the target of each link in that language: the edit-mode hint "No link target in this language" points to the links still missing one.

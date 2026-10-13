# Network bar

Type: `ctpl:networkBar`

## What it is

A slim band at the very top of every page, for a site that belongs to a group of sites: a news site and the event its publisher organises, the brands of one company, the regional sites of a federation. It shows the group's name ("Orvane network") and a link to each site of the group, this site included. The link to the site the visitor is on is underlined and announced as the current one.

## Where you can add it

The **header area of the home page**, above the [site header](site-header.md): the band then shows on every page of the site. Open the home page in Page Builder, add the network bar to the header area and move it above the header. Like the header, it is edited from the home page only. Each site of the group has its own bar, with the same links.

## Fields

| Label as shown in the editor | What it does                                                       | Notes                                                                                     |
| ---------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Group name                   | Name shown at the start of the band, for example "Orvane network". | Per language. Optional. Without it no name shows and screen readers announce "Our sites". |

Then add one **link** per site, in the order visitors should read them (see [Links and link lists](links-and-link-lists.md)):

- **Internal link** to the home page of each site. The page picker lists every site: choose the site at the top of the picker, then its home page. Set the link in every language of the site.
- **External link** to a site that is not on this Jahia, with its full address.

## How it behaves

### What visitors see

- The group's name, then the sites, on one row on a wide screen; on phones the links wrap under the name.
- The link to the site being viewed is underlined and in bold. An external link is never marked as the current one.
- The band uses the theme's dark (inverse) surface, in light and dark mode, and every link is at least 44 pixels tall.
- With no link, the band does not show at all.

### In edit mode

An empty band shows in edit mode with a line saying what to add. A link with no target in the page's language shows its label with a warning.

### For screen reader users

The band is a navigation named after the group (or "Our sites"). It is not part of the site header's landmark, so the page keeps a single banner. The current site is announced as current.

## Good practice

- **Same links, same order, on every site** of the group, so visitors find their way back.
- **Use the sites' names** as link labels, not "Home".
- Keep the band to the sites of the group: for other links use the header's utility links.

## In other languages

The group name and each link's label and target are per language. A link without a target in a language shows as plain text there, never as a broken link.

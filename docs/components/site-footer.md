# Site footer

Types: `ctpl:siteFooter` (Site footer), with its parts `ctpl:footerColumns` (Footer columns) and `ctpl:linkList` (link lists)

![The site footer: the site name "Classic Dev" and a tagline, three columns of links titled Company, Services and Resources, then a bottom bar with "© 2026. All rights reserved.", the legal links (Legal notice, Privacy policy, Site map, Accessibility: partially compliant) and the social links LinkedIn and GitHub](../images/site-footer.png)

## What it is

The footer shared by every page of the site. It has two parts:

- **the top**, with the site name, a tagline, and columns of links;
- **a bottom bar**, with the copyright line, the legal links and the social links.

Every site created with this template set gets a footer with a copyright line and empty legal and social link lists, ready to fill in.

## Where you can add it

You do not add the footer: it already exists, in the footer area of the home page, and appears on every page.

**You edit it from the home page only.** Open the home page in Page Builder and select the footer or one of its link lists. On every other page the footer is locked.

## Fields

### Site footer

| Label as shown in the editor | What it does                                        | Notes                                                     |
| ---------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Tagline                      | One or two sentences under the site name.           | Per language. Optional.                                   |
| Copyright                    | The copyright line, for example "© {year} Company". | Per language. `{year}` is replaced with the current year. |

The site name at the top of the footer is the **site title**, set in the site's settings. It is not a field of the footer.

### Footer columns

The **Footer columns** hold the columns of links. Each column is a [Link list](links-and-link-lists.md) with a title: add a link list to add a column, and reorder the lists to reorder the columns.

### Legal links and social links

Two [link lists](links-and-link-lists.md) in the bottom bar. New sites get them with the titles "Legal information" and "Follow us". These titles are not shown on screen: they name each group for screen readers.

## How it behaves

- The site name always shows, so the footer is never empty.
- `{year}` in the copyright becomes the current year, and turns over by itself on 1 January. Write "© {year} Company" once and never update it.
- **Columns:** each link list shows as a column, its title as a heading above its links. On narrower screens the columns wrap to fewer per row.
- **Bottom bar:** the legal links and the social links show as rows of links after the copyright.
- A link list with no link shows nothing on the live site. It stays visible in edit mode so you can fill it.
- Links follow the [link rules](links-and-link-lists.md): a link with no target in the current language shows as plain text, and edit mode shows "No link target in this language".

## Good practice

- Put in the **legal links** the pages visitors expect in every footer: legal notice, privacy policy, [site map](site-map.md), and the accessibility statement.
- **Accessibility statement:** create a page for it (a [Text](rich-text.md) section is enough) and link to it from the legal links. Write the site's compliance status in the link text itself, for example "Accessibility: partially compliant". The statement and this mention are site content: you write them from your own audit. The template set does not provide them.
- Hide these pages from the main menu with **Hide from navigation** in their **Page options**: they stay reachable from the footer and the site map.
- Keep each footer column to a handful of links, under a short title ("Company", "Services").
- For social links, write the name of the network as the link text ("LinkedIn").
- Keep the tagline to one or two sentences.

## In other languages

The tagline, the copyright line, and every link list title, link title and link target are per language. Fill in the copyright for each language (for example "© {year}. All rights reserved." and "© {year}. Tous droits réservés.") and set each link's target in each language.

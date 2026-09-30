# Section style

Type: `ctplmix:sectionStyle` (a shared field, not a component on its own)

## What it is

The **Background** field sets the background of a page section. It offers three backgrounds taken from the site theme. Alternating them separates consecutive sections and gives long pages a rhythm, without any colour to pick by hand.

## Where you can add it

The field appears in the edit form of these sections: [Image and text](image-and-text.md), [Text](rich-text.md), [Columns](columns.md), [Card grid](card-grid.md), [Key figures](key-figures.md), [Quote](quote.md), [Content list](content-list.md), [Site map](site-map.md) and [Free zone](free-zone.md).

The [Hero banner](hero-banner.md) has no Background field: its **Layout** sets its look. A [Link list](links-and-link-lists.md) has none either.

## Fields

| Label as shown in the editor | What it does                                                                       | Notes                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Background                   | Background of the section: **Page background**, **Light band** or **Accent tint**. | Default: Page background. Shared by all languages. |

## How it behaves

- **Page background:** the section sits directly on the page, with the page's normal spacing.
- **Light band:** a quiet grey band across the full width of the page, with its own spacing above and below.
- **Accent tint:** a band tinted with the theme's accent colour, across the full width of the page.

The colours come from the site theme and follow it. When an administrator changes the theme, or when a visitor sees the site in dark mode, every background changes with it. You never need to edit the section. Text contrast is checked for every theme, in light and dark mode.

## Good practice

- Alternate backgrounds between neighbouring sections: for example Page background, then Light band, then Page background. Two neighbouring sections on the same band read as one block.
- Keep **Accent tint** for the section you want visitors to notice, such as a call-to-action banner (see [Call to action](call-to-action.md)). Used on every other section, it loses its effect.
- A background is decoration only. Do not rely on it to carry meaning ("the offers in the tinted band are new"): say it in the text.

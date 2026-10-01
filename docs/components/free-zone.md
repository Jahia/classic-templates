# Free zone

Type: `ctpl:freeZone`

![A free zone titled "Questions and answers" holding an FAQ: a search field and three collapsed questions](../images/free-zone-faq.png)

## What it is

A section for components that do not belong to this template set: components of other Jahia modules (an FAQ, a media gallery, a store locator, a Formidable form) and Jahia's own core content. The free zone gives them what every section of the site has: a background, an optional heading, a width, and the colours of the site theme.

Page areas only accept the sections of this template set. The free zone is the one place where other components go.

## Where you can add it

- The page's **main area**.
- Inside a [Columns](columns.md) column.

Inside the free zone you can add any component that can be dropped in a page, from any module enabled on the site, and several of them in order.

## Fields

| Label as shown in the editor | What it does                                                                                                                                       | Notes                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Title                        | The section heading.                                                                                                                               | Per language. Optional. Level 2 heading. |
| Width                        | **Page width** (aligned with the other sections), **Reading width** (for text and forms) or **Full width** (edge to edge, for maps and galleries). | Default: Page width.                     |
| Background                   | Page background, Light band or Accent tint.                                                                                                        | See [Section style](section-style.md).   |
| Call to action               | Optional toggle. Adds a button after the content.                                                                                                  | See [Call to action](call-to-action.md). |

## How it behaves

- The zone shows its title, then the components you added, in order, at the chosen width, then its button if switched on.
- **Theme bridge:** the add-on modules below have their colours mapped onto the site theme. Inside a free zone they take the theme's colours, in light and in dark mode, and change with it when the theme changes.

### Add-on modules

These modules have been tried in free zones and styled to match the site. They are **separate modules**: a site administrator must enable each one on the site before you can use it.

| Module                             | What you add in the free zone               | Notes                                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formidable (`formidable-elements`) | A **Form reference** that points to a form. | Create the form first (for example in a content folder), then add a form reference to the free zone. Fields, labels, help texts and messages follow the site's look, with visible labels and the site's focus outline. |
| FAQ (`jsfaq`)                      | An FAQ with its questions.                  | It adds its own description of the questions for search engines.                                                                                                                                                       |
| Media gallery (`js-media-gallery`) | An image gallery.                           |                                                                                                                                                                                                                        |
| Store locator (`js-store-locator`) | A map with a list of stores.                | Keeps its own light panel, readable in dark mode too. Its map tiles come from OpenStreetMap: if the site has a Content Security Policy, your administrator must allow that tile server.                                |

![A free zone titled "Write to us" holding a Formidable form with the required fields Your name, Your email address and Your message, and a Submit button](../images/free-zone-form.png)

## Limits

- **Add-ons keep their own behaviour and headings.** The free zone gives them a frame and colours. It does not change how they work, and it does not renumber their headings.
- **Accessibility:** the site's accessibility work covers the template set's own components. Components of other modules are **not covered** by the site's accessibility statement. Check them yourself, and list them in the statement's "content that is not accessible" section if needed.
- Other modules than the four above can go in a free zone too, but they have not been styled for the theme: their colours may not follow the site theme or dark mode.

## Good practice

- Give the free zone a title that says what the visitor finds there ("Write to us", "Find a store"). If the add-on shows its own title too, avoid two headings that say the same thing.
- Use **Reading width** for forms and FAQs, **Full width** for maps and galleries.
- Keep one add-on per free zone, so each gets its own heading and background.
- Test the page with the keyboard and in dark mode after adding an add-on.

## In other languages

The zone's title is per language; width and background are shared. The components inside follow the language rules of their own module: translate them in each language of the site.

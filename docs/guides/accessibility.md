# Accessibility

An accessible site is one that everybody can use: people who cannot see the screen and use a screen
reader, people who only use a keyboard, people who zoom in or change text spacing, people with
colour vision deficiencies. The template set takes care of the structure. The content, which you
write, is your part.

## What the template set does

The template set targets **WCAG 2.1 level AA**. It was also audited by hand against **RGAA 4.1.2**,
the French standard built on WCAG 2.1 AA, on twelve pages in six looks (three themes, light and
dark), and the defects found were fixed. Screen-reader testing was not part of that audit.

What you get on every page, without doing anything:

- **Skip link**: the first thing a keyboard user reaches is a "Skip to main content" link, which
  jumps over the header, the menu and the breadcrumb.
- **Landmarks**: one header, one main content area, one footer, and every navigation area (main
  menu, utility links, language switcher, breadcrumb, footer link lists) is labelled, so screen
  reader users can jump between them. Link lists are labelled with their title, so give them one.
- **Heading order**: one main heading per page, the page title, and components one level below.
  Headings you type in a text section are renumbered under the section's own heading, so no level
  is skipped. See [One main heading per page](pages-and-templates.md#one-main-heading-per-page).
- **Visible focus**: a clear focus ring on every link, button and field, including over hero
  photos.
- **Keyboard menu**: the main menu, its sub-menus and the small-screen menu work with the keyboard.
  Escape closes an open sub-menu or the small-screen menu, and moving the focus out of the menu
  closes it. The menu also works without JavaScript.
- **Reflow**: pages work at 320 pixels wide and when zoomed to 200%, without scrolling sideways.
- **Text spacing**: pages stay readable when visitors increase line, word or letter spacing.
- **Language links**: each language in the language switcher is marked with its language, and its
  spoken name starts with the code you see on screen ("FR"), so voice control finds it.
- **Colour contrast**: every theme is checked for WCAG AA contrast in light and dark.
- **Site map**: the [Site map](../components/site-map.md) component lists every page. With the
  main menu, it gives visitors the second way to find a page that RGAA requires (criterion 12.1).
  A breadcrumb does not count as one. Put a site map on a page of its own and link to it from the
  footer.
- **Text formatting in text sections** is kept where it carries meaning: lists, definition lists,
  tables with headers and a caption, and language changes inside a text.
- **Quotations** get their quotation marks from the page's language, including the spaces French
  needs inside « ».

## What you are responsible for

The template set cannot guess what your content means. These are yours:

- **Text alternatives for images.** An image that carries information needs a text that says what
  it shows or means on this page. By default this is the image's title in the media library, so
  give every image a meaningful title, in every language. When the same image means something
  different on a page, fill in **Text alternative** on that component.
- **Decorative images.** When an image only decorates (a backdrop, an abstract picture), tick
  **Decorative image**: screen readers then skip it. Card images and quote portraits are always
  treated as decorative, because the card's title or the person's name already says it all.
- **Images inside text sections.** Describe each one in the rich-text editor, or give it an empty
  description if it is decorative. Edit mode warns you when one is missing.
- **Headings in text sections.** Use real headings (not bold text) to structure long texts, and use
  them in order. When the section has a title, start at heading level 3.
- **Link and button labels.** A label must make sense on its own, because screen readers can list
  links out of context: "Read our pricing" rather than "Click here". For a card, the card's title
  is what screen readers read.
- **New tabs.** Use **Open in a new tab** sparingly, for documents or other sites. Links inside a
  text section always open in the same tab.
- **Translations.** Translate everything, including text alternatives and link labels, and set link
  targets in every language (see [Languages](editing-content.md#languages)).
- **Do not rely on colour alone.** "The fields in red are required" or "click the green button"
  does not work for everybody. Say it in words.
- **Text over photos.** In a hero banner with text over the photo, choose **Strong** in
  **Photo darkening** for bright or busy photos.
- **Quotations.** Type the quotation without quotation marks: the site adds them.

## The accessibility statement

In France, article 47 of law 2005-102 requires many organisations, public bodies and large
companies among them, to publish an **accessibility statement** (déclaration d'accessibilité) and
to show their compliance status on the home page: "Accessibilité : non conforme", "partiellement
conforme" or "totalement conforme".

Both are content you write and publish. The template set's own audit does not make your site
compliant: your content and your own audit decide the status.

### What a statement contains

- the commitment to accessibility (article 47) and the site it applies to;
- the compliance status, with the RGAA version and the result of the audit (the share of criteria
  met);
- the content that is not accessible, and why;
- when the statement was made, the technologies used, the tools, browsers and assistive
  technologies used for the audit (say so plainly if screen readers were not tested), and the
  pages tested;
- a way to contact you to report a problem: a real contact form or address, not an empty page;
- the remedy: the right to contact the Défenseur des droits.

### How to publish it

1. Create a page under the home page, for example "Accessibility" ("Accessibilité" in French), on
   the Content page template.
2. In its **Page options**, tick **Hide from navigation**: it is reached from the footer.
3. Add a [Text](../components/rich-text.md) section with the statement. Optionally switch on its
   **Call to action** with a label such as "Report a problem" pointing to your contact page.
4. On the home page, select the site footer and add a link to the **Legal information** list. Point
   it to the statement page and give it the mention as its title, for example
   "Accessibility: partially compliant" in English and "Accessibilité : partiellement conforme" in
   French. The footer shows on every page, home included.
5. Do the same for a site map page (with the [Site map](../components/site-map.md) component) if
   you do not have one yet.
6. Publish the pages and the footer (publish the home page).

The `classic-dev` demo site (see [Demo sites](getting-started.md#demo-sites-for-evaluators))
contains an example statement and both footer links.

## Add-ons are not covered

Components of other modules placed in a [Free zone](../components/free-zone.md) (forms, FAQ,
gallery, store locator) are not covered by the template set's audit. If you use them, audit them
as part of your own site, and list what is not accessible in your statement. See
[Add-ons](add-ons.md).

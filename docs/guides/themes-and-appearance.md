# Themes and appearance

This guide is for site administrators. It explains how to change the look of the whole site
without a developer, and what needs one.

## Where the settings are

The look of the site is set on the site itself, not on a page:

1. In jContent, open the edit form of the site node (the site, not its home page).
2. Switch on the **Site look** section.
3. Set the fields below, save, and **publish the site**. Changes apply to every page once the site
   is published.

The **Site look** section has three fields:

| Field                   | Values                                                                                                                    | Default                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Theme**               | Classic (navy), Ocean (teal), Terracotta (warm), Horizon (navy and orange), Sage (green and coral), Slate (ink and green) | Classic (navy)                                                                                                                  |
| **Light or dark**       | Automatic, Always light, Always dark                                                                                      | Automatic                                                                                                                       |
| **Default share image** | An image from the media library                                                                                           | The picture shown when a page without its own image is shared ([Sharing on social networks](seo.md#sharing-on-social-networks)) |
| **Show the breadcrumb** | ticked or not                                                                                                             | ticked                                                                                                                          |

## Theme

The theme sets the colours, fonts and shapes used across the site. Changing it alters no content
and no layout: every page keeps its sections, text and images.

| Theme                         | Light                                                            | Dark                                                           |
| ----------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| **Classic (navy)**            | ![Classic theme, light](../images/theme-default-light.png)       | ![Classic theme, dark](../images/theme-default-dark.png)       |
| **Ocean (teal)**              | ![Ocean theme, light](../images/theme-ocean-light.png)           | ![Ocean theme, dark](../images/theme-ocean-dark.png)           |
| **Terracotta (warm)**         | ![Terracotta theme, light](../images/theme-terracotta-light.png) | ![Terracotta theme, dark](../images/theme-terracotta-dark.png) |
| **Horizon (navy and orange)** | ![Horizon theme, light](../images/theme-horizon-light.png)       | ![Horizon theme, dark](../images/theme-horizon-dark.png)       |
| **Sage (green and coral)**    | ![Sage theme, light](../images/theme-sage-light.png)             | ![Sage theme, dark](../images/theme-sage-dark.png)             |
| **Slate (ink and green)**     | ![Slate theme, light](../images/theme-slate-light.png)           | ![Slate theme, dark](../images/theme-slate-dark.png)           |

Every theme is checked for sufficient text contrast (WCAG 2.1 AA) in both light and dark.

Each theme also has an **emphasis colour**, used for values that must stand out, such as key figures and prices. It is the theme's main colour in Classic, Ocean and Terracotta, an orange in Horizon, a coral in Sage and a green in Slate. Horizon is designed light first: its dark version keeps the same navy, teal and orange family. Sage is calm and rounded, with serif headings; Slate is crisper, with sans-serif headings and squarer shapes.

## Light or dark

- **Automatic**: each visitor sees the site in light or dark according to the setting of their own
  device or browser. Two visitors can see the same page in different schemes.
- **Always light**: everybody sees the light version.
- **Always dark**: everybody sees the dark version.

Choose Automatic unless your brand requires one scheme. Whatever you choose, check your images and
your logo in both schemes (see [Logos](#logos-for-light-and-dark)).

## Breadcrumb

**Show the breadcrumb** shows the path to the current page (for example Home > Services > Support)
above the content of every page except the home page. Untick it to remove the breadcrumb from the
whole site. To remove it from a single page only, use the page's **Hide the breadcrumb** option
instead (see [Page options](pages-and-templates.md#page-options)).

![The breadcrumb above a page's content](../images/breadcrumb.png)

See [Breadcrumb](../components/breadcrumb.md).

## Section backgrounds

Most sections have a **Background** field, taken from the site theme:

- **Page background**: the plain page;
- **Light band**: a quiet grey band;
- **Accent tint**: a tint of the theme's accent colour.

Alternate backgrounds to separate consecutive sections on long pages. The backgrounds follow the
theme and the light or dark scheme, so a page built on one theme looks right on the others. A
text section on the **Accent tint** background with a call to action switched on works as a
call-to-action banner.

The [Hero banner](../components/hero-banner.md) has no Background field: its **Layout** field
offers a tinted band without a photo instead.

See [Section style](../components/section-style.md).

## Logos for light and dark

The site header has two logo fields (edit them on the home page):

- **Logo**: the logo shown at the top left, linking to the home page.
- **Logo for dark mode**: an optional light-coloured version, used when the site is shown in dark
  mode, whether it is forced with **Always dark** or chosen by the visitor's device with
  **Automatic**.

If your logo is dark on a transparent background, add a light version, or it will be hard to see
in dark mode. See [Site header](../components/site-header.md).

## Images and dark mode

Photos and images are shown as they are in both schemes. For text over a photo in a
[Hero banner](../components/hero-banner.md), the **Photo darkening** field keeps the text readable:
choose **Strong** for bright or busy photos.

## What needs a developer

These changes are not settings and need a new version of the module:

- a new theme, or changes to the colours, fonts or shapes of an existing one;
- web fonts (the themes use the fonts already installed on the visitor's device, so there is
  nothing to download or to ask consent for);
- new layouts, new page templates or new components.

For developers: a theme is a set of design token overrides in one CSS file, and components never
contain colours or fonts of their own. See the Theming section of the module's
[README](../../README.md#themes).

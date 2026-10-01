# Hero carousel

Type: `ctpl:heroCarousel`, with [Hero banner](hero-banner.md) slides

## What it is

Several hero banners shown one at a time, with buttons to move from one to the next. Each slide is an ordinary [hero banner](hero-banner.md), with its own heading, text, photo, layout and button.

A carousel hides most of its content most of the time. Use it when the slides are really alternatives of equal weight; when one message matters most, a single hero banner works better.

## Where you can add it

- The **hero area** at the top of a page (pages that use the **Home** and **Content page** templates).
- The page's **main area**, between other sections.
- Inside a [Columns](columns.md) column, or a [Free zone](free-zone.md).

Add the carousel, then add hero banners inside it: one banner per slide. Drag them to change their order.

## Fields

| Label as shown in the editor | What it does                                                                          | Notes                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Title                        | The carousel's heading. It also names the carousel for screen readers.                | Per language. Optional. Level 2 heading; the slide headings are one level below it. |
| Hide the title               | Keeps the title for screen readers and search engines but removes it from the screen. | Default: off.                                                                       |
| Play automatically           | Moves to the next slide on its own.                                                   | Default: off. See "Playing automatically" below.                                    |
| Seconds per slide            | How long each slide stays on screen when the carousel plays automatically.            | Default: 7. From 5 to 30.                                                           |

Each slide has the fields of a [hero banner](hero-banner.md).

## How it behaves

### What visitors see

- One slide at a time. Under the slides, a **previous** and a **next** button (the next button on the last slide goes back to the first) and one round button per slide; the current slide's button is filled and larger.
- The carousel is as tall as its tallest slide, so the page does not jump when the slide changes.
- Keyboard: every button is reached with Tab, in the order they show on screen: the **Pause** button above the slides (when the carousel plays automatically), then the slide's own button or link, then the previous, slide and next buttons under the slides. On the round buttons, the left and right arrow keys move to the previous or next slide, Home and End to the first or last.
- Screen readers announce the slide the visitor picks ("Slide 2 of 4" and its heading). Slides that are not showing are hidden from everyone, so nothing in them can be reached by mistake.
- With JavaScript off in the visitor's browser, every slide shows, one under the other, and no button.
- A carousel with a single slide shows that banner, with no button.

### Playing automatically

**Play automatically** is off by default: a carousel that moves on its own is harder to read, and some visitors find motion distracting. When you switch it on:

- the carousel shows each slide for **Seconds per slide**, goes once through every slide and stops back on the first one;
- a **Pause** button, above the slides and the first button of the carousel, stops it; it then reads **Play** and starts it again;
- it waits while the mouse is over the carousel, while keyboard focus is inside it, and while the browser tab is in the background;
- it stops for good as soon as the visitor uses the previous, next or slide buttons;
- it never starts for visitors whose system asks for reduced motion; those visitors also get no fading between slides;
- slide changes it makes are not announced to screen readers, so they never interrupt a visitor.

### In edit mode

Every slide shows, one under the other, so you can select and edit each one in Page Builder, and add slides with the add button at the end of the list. A short note says that visitors see one slide at a time. Automatic play never runs in edit mode.

## Good practice

- **Two to four slides.** Visitors rarely look past the third.
- **Put the most important slide first.** It is the one most visitors see, and its photo loads first.
- **Keep automatic play off** unless you have a good reason; if you switch it on, leave enough seconds to read each slide.
- **Give the carousel a title** (hidden if you prefer) when the page has more than one carousel, so each has its own name for screen readers.
- Write each slide as if it were the only one: its heading, text and button must make sense alone.
- The page's own title stays the page's only level 1 heading; see the good practice of the [hero banner](hero-banner.md).

## In other languages

The title is per language; the other settings are shared. Each slide follows the [hero banner](hero-banner.md) rules: check its button in each language. The buttons of the carousel ("Previous slide", "Slide 2 of 4", "Pause") are translated by the template set.

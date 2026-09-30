# Images

Type: `ctplmix:media` (a shared field group, not a component on its own)

## What it is

Components that show a picture share the same three image fields: the **Image** itself, picked from the media library, its **Text alternative**, and a **Decorative image** switch. The text alternative is what people who cannot see the image hear or read instead of it.

## Where you can add it

The image fields appear in: [Hero banner](hero-banner.md), [Image and text](image-and-text.md), [written cards](card-grid.md), [Quote](quote.md) (the portrait), and [news items and articles](news-and-articles.md).

The [site header](site-header.md) has its own logo fields, with their own rules. Images inside a [Text](rich-text.md) section are placed with the rich-text editor and follow the rules on that page.

## Fields

| Label as shown in the editor | What it does                                | Notes                                                                                                                                   |
| ---------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Image                        | Picks an image from the media library.      | Shared by all languages.                                                                                                                |
| Text alternative             | What the image shows or means on this page. | Per language. Leave empty to use the image's title in the media library. Ignored when the image is decorative, and on cards and quotes. |
| Decorative image             | Tells screen readers to skip the image.     | Default: off. Tick it for a backdrop or an abstract picture.                                                                            |

## How it behaves

### Which text alternative is used

1. If **Decorative image** is ticked, the image gets an empty alternative: screen readers skip it.
2. Otherwise, the **Text alternative** you wrote for this use of the image, in the current language.
3. Otherwise, the image's **title in the media library**, in the current language.
4. Otherwise, nothing. In edit mode the image then shows the hint "This image has no title in the media library, so it has no alternative text."

### Where images are always decorative

Some images are always skipped by screen readers, whatever the fields say, because the text next to them already says everything:

- **Cards** in a [Card grid](card-grid.md) and in a [Content list](content-list.md): the card's title and link carry the meaning.
- The **portrait** of a [Quote](quote.md): the person's name is written next to it.

On those components the **Text alternative** field is ignored.

### Missing image

- In an [Image and text](image-and-text.md) section with no image, edit mode shows the placeholder "No image selected". Visitors see the text alone.
- A [Hero banner](hero-banner.md) without a photo becomes a tinted band.
- Other components simply show no image.

### Loading

The site reserves the image's space before it loads, so the page does not jump. The photo of a banner at the top of a page loads first. Other images load when the visitor scrolls near them.

## Good practice

- Give every image in the media library a meaningful title, in every language. It is the default alternative wherever you reuse the image.
- Write a **Text alternative** when the image means something specific on this page. Describe what matters here, not every detail: "Our support team at the Lyon office", not "photo1.jpg" or "image of people".
- Do not start with "Image of" or "Photo of": screen readers already announce an image.
- Do not repeat in the alternative what the heading or text next to the image already says.
- Tick **Decorative image** when the picture adds no information, for example an abstract backdrop behind a banner.
- An image that contains text (a poster, a chart) needs that text, or its meaning, in the alternative.

## In other languages

The image itself is shared by all languages. Its alternative is not:

- Write the **Text alternative** in each language of the site.
- Translate the image's **title in the media library** too. When no alternative is written, visitors in a language where the title is missing get an image without alternative, and edit mode flags it with the hint above.

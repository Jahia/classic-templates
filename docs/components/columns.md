# Columns

Types: `ctpl:columns` (Columns), `ctpl:column` (Column)

![A columns row on a light band: the heading "What we do" above three columns titled Consulting, Training and Support, each with one sentence](../images/columns.png)

## What it is

A row of 2 to 4 columns with an optional title. Each column holds its own page sections: text, image and text, cards, key figures and so on. Use it to put sections side by side.

## Where you can add it

- The page's **main area**.
- Inside a [Free zone](free-zone.md).

Each **Column** accepts the same sections as the page's main area. You add sections to a column in Page Builder: select the column, then use its own add button.

## Fields

| Label as shown in the editor | What it does                                      | Notes                                              |
| ---------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| Title                        | Heading of the row.                               | Per language. Optional. Level 2 heading.           |
| Column layout                | Number and widths of the columns.                 | Default: Two equal columns. See the layouts below. |
| Space between columns        | **Small**, **Medium** or **Large**.               | Default: Medium.                                   |
| Background                   | Page background, Light band or Accent tint.       | See [Section style](section-style.md).             |
| Call to action               | Optional toggle. Adds a button after the columns. | See [Call to action](call-to-action.md).           |

A **Column** has no fields of its own: it is a container for sections.

## How it behaves

### Layouts

| Column layout                  | Columns shown             |
| ------------------------------ | ------------------------- |
| Two equal columns              | 2                         |
| Three equal columns            | 3                         |
| Four equal columns             | 4                         |
| Wide column then narrow column | 2 (two thirds, one third) |
| Narrow column then wide column | 2 (one third, two thirds) |

On phones the columns are stacked one under the other. With four columns, tablets show them two by two.

### Four columns always exist

Every columns row always has four columns, whatever the layout. The layout only decides how many are shown, starting from the first. If you switch from four columns to two, the content of the third and fourth columns is kept, not deleted. It is hidden, and comes back when you switch to a layout that shows those columns again.

### Headings inside a titled row

When the row has a title (a level 2 heading), the titles of the sections inside its columns step down to level 3, and their own items (cards, for example) to level 4. When the row has no title, the sections inside keep their normal level 2 headings. The page outline stays correct either way.

## Good practice

- Give the row a title when its columns belong to one topic ("What we do"). Leave it empty when the columns are unrelated sections that simply sit side by side.
- Keep columns balanced: similar amounts of content in each, so they end at about the same height.
- Four columns get narrow on laptops. Keep their content short (a heading and a sentence or two), or use a [Card grid](card-grid.md) for a set of similar items.
- Remember that hidden columns keep their content. Before handing a page over, check that no forgotten content waits in a column the layout hides.

## In other languages

Only the title is per language. The layout, spacing and background are shared. The sections inside the columns follow their own language rules.

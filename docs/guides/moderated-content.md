# Moderated content

Some content is written by people outside your editorial team: a supplier's story sent from a
portal, for example. That content is **moderated**. It waits for an editor's decision, and the site
shows it only once an editor accepts it.

## What moderated content has

A moderated item (a supplied story of classic-media, or any type that switches on **Moderation**)
has two more fields in its edit form:

| Label as shown in the editor | What it does                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------- |
| Moderation status            | **Submitted**, **In review**, **Accepted** or **Declined**. Default: Submitted.          |
| Note to the author           | What the author reads about the item, for example why it was declined or what to change. |

## What visitors see

- **Lists never show an item that is not accepted:** story feeds, topic pages, related stories,
  content lists, whoever reads them. The author's own list (a supplier's "My submissions") is the
  only one that shows every status.
- **Opening the item itself** depends on its folder's rights. Store submitted items in a folder
  that only their authors and the editors can read: visitors who are not allowed get "not found".
  An item that is not accepted yet says so at the top of its page to those who can open it.

## Accepting, declining

1. Open the item in jContent, read it, edit it if needed.
2. Set **Moderation status** to **Accepted** and save.

That is all: the item and the pictures and files it uses are opened to every visitor and
published, in every language of the site. An item with no publication date is dated the moment you
accept it, so it comes first in the lists that show the newest items. It then appears in every list that would show it (for
a story: the latest stories, its topic pages, its format's lists, search) with no other step.

Accepting needs the **publish** right on the item: an editor who may only edit (a contributor)
can change the status, but nothing is opened or published; their edit goes through the
publication workflow as usual.

To **decline**, set **Declined** and write a note to the author. To **withdraw** an accepted item,
set any other status: it is closed again to visitors and leaves every list. Its pictures stay
readable, since another page may show them.

Setting the status opens or closes the item once: saving an accepted item again does not publish
your later edits; publish them as usual.

## For site builders

The behaviour comes from two parts: the **Moderation** option of the template set
(`ctplmix:moderated`), which keeps such items out of lists, and the **classic-moderation** module,
which opens and publishes an item when an editor who may publish accepts it. Install
classic-moderation on the platform; without it, accepted items stay closed.

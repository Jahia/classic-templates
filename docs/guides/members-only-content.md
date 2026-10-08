# Members-only content

Some content of a site is for everybody, some is for members only. This guide shows how to mark
what is reserved, what visitors who are not signed in get instead, how members sign in without
leaving the site, and, importantly, what the switches protect and what they only hide.

## The idea

A visitor who is not signed in (a **guest**) is never turned away with "page not found". They get
the public face of what they asked for, and a form to sign in:

- a **news item or article** marked "Members only": its title, date, image and teaser, a
  "Members only" badge, a notice and a **sign-in form**, in place of the body;
- a **page** marked "Members only": the site header, the page title, a notice and a sign-in
  form, in place of the page's sections.

Once signed in, the visitor stays on the same page and sees the whole thing. Lists and cards show a
**Members only** badge next to every reserved item, to guests and members alike.

## Mark a news item or an article

1. In jContent, open the item (contents > News or Articles).
2. Switch on the **Members only** section of its edit form and make sure its box is ticked.
3. Save and publish.

Untick the box (or switch the section off) and publish to make the item public again. The change
reaches visitors with the publication; nothing is cached stale.

What guests see instead of the body: kind and date, the badge, the title (the page's heading), the
teaser, the image, a "Members only" notice and the [sign-in form](../components/sign-in.md). Cards,
compact rows and tiles of the item carry the badge.

## Mark a page

1. In jContent or Page Builder, open the page's edit form.
2. Switch on **Page options** and tick **Members only**.
3. Save and publish.

The option applies to the page **and to every page below it**: tick it once on your members area
and all its sub-pages are reserved. Switching it off on the parent releases the sub-pages. A guest
who opens such a page gets the header, the footer, the breadcrumb, the page title (shown even where
a hero banner would normally carry it), a notice and the sign-in form. Signed-in visitors get the
page as usual.

In Page Builder you always see the real page, with a note saying who sees what.

### Protect the sections too

The option decides what the page shows. To also stop the sections' content from being read through
other addresses, restrict the page's **areas** (the "hero" and "main" content areas of the page) to
registered users:

Set the access rights of each area so that only registered users (the **Users** group, reader),
your site administrators and your editors can read it, and so that it no longer inherits the page's
rights. You do this in jContent (the area's permissions) or through the API, as the demo site seeds
of the repository do.

Do this for every area of every reserved page. The page itself stays readable by guests, which is
what lets them see the sign-in form instead of "page not found". An area created later (a new
area name) is not restricted until you do the same.

## The sign-in form

The [Sign-in form](../components/sign-in.md) is a page section: username, password and a button,
which signs the visitor in **without leaving the site** (it uses the platform's own sign-in, so the
session is an ordinary one). It is also what the notices of reserved items and pages contain.

After signing in, the visitor goes to:

1. the page named in the address (`?redirect=...`), when it is a path of this site (never another
   site: an address that is not a plain path of this site is ignored);
2. otherwise, on a notice of a reserved item or page: the same page, now open;
3. otherwise, on a sign-in page: the page chosen in **Page after sign-in** of the form, or the home
   page.

### Make the header's "Sign in" go to your own page

By default the header's sign-in entry opens the platform's login screen. To keep visitors in your
design:

1. Create a page (a "Sign in" page, usually hidden from the navigation) with a **Sign-in form**
   section in its main area.
2. In the site header's edit form (from the home page), pick that page in **Sign-in page**.

The entry now opens your page with `?redirect=` set to the page the visitor was on (or to the
header's **Page after sign-in**, when you chose one), and the form sends them back there. On the
sign-in page itself nothing is carried over: the form goes to **Page after sign-in** of the form
or to the home page. Without a sign-in page the entry works as before.

## What is protected, and what is only hidden

This is a presentation feature first. Read this table before you rely on it.

| What                                                                               | Guest sees                                    | Status                                                     |
| ---------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| The page of a reserved item, at its address                                        | Teaser, notice, form; no body                 | Hidden by the template                                     |
| Other views of a reserved item (`.fullPage.html.ajax`, `.html.ajax`, `.default`)   | Teaser or card; no body                       | Hidden: no view renders the body for a guest               |
| The body of a reserved item through the GraphQL API                                | **The body**                                  | **Only hidden**: the item stays readable by guests         |
| The sections of a reserved page, at their own address or through GraphQL           | "Not found"                                   | **Protected**, once the areas are restricted (see above)   |
| The sections of a reserved page, when the areas are NOT restricted                 | Not on the page, but readable through GraphQL | **Only hidden**                                            |
| The title, teaser, image and date of a reserved item, the title of a reserved page | Yes, deliberately                             | Public by design (also in search results and shared links) |

In short: **pages can be protected, news items and articles can only be hidden.** An item cannot
be restricted to registered users without also making its teaser, its card and its listing
disappear for guests, because Jahia's permissions apply to a whole item. Do not put in a reserved
item anything that must stay confidential from someone willing to query the API: put it in a
reserved page whose areas are restricted, or in a document in a restricted folder.

## Behind the scenes (administrators)

- Reserved items and pages are rendered through views cached **per user**, so that a guest and a
  member who open the same address never get each other's version, whoever asked first. Guests
  share one cached version; each signed-in user has their own. Items and pages that are not
  reserved keep the shared cache.
- Switching the option on or off, or changing it on a parent page, takes effect with the
  publication.
- The header is the same for everybody: it is cached once, and a small script swaps "Sign in" for
  the visitor's name.
- Signing in needs JavaScript (the form is an island of the page).

See also [Site header](../components/site-header.md#sign-in-entry),
[News and articles](../components/news-and-articles.md#members-only) and
[Pages and templates](pages-and-templates.md#page-options).

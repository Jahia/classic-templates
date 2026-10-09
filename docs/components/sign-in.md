# Sign-in form

Type: `ctpl:signIn`

## What it is

A section with a username field, a password field and a button, which signs the visitor in without
leaving the site. Put it on the page the header's sign-in entry points to (see
[Members-only content](../guides/members-only-content.md#make-the-headers-sign-in-go-to-your-own-page)).
The same form appears inside the notice that guests get in place of a reserved news item, article
or page.

## Where you can add it

In the main area of a page, in a column, a tab or a free zone. Usually one section on a page of its
own, called "Sign in", hidden from the navigation.

## Fields

| Label as shown in the editor | What it does                                                                 | Notes                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Title                        | Heading of the section (level 2).                                            | Per language. Optional.                                                                                 |
| Introduction                 | A sentence above the form, for example who can sign in or where to get help. | Per language. Optional.                                                                                 |
| Page after sign-in           | Where visitors go once signed in when they did not come from another page.   | Optional. Empty: the home page. Visitors sent by a reserved page or by the header go back to that page. |
| Background                   | Background of the section. See [Section backgrounds](section-style.md).      | Default: page background.                                                                               |

The words of the form ("Username", "Password", "Sign in", the error messages) are part of the
template set, translated for each language of the site.

## How it behaves

- A visitor types a username and a password and presses the button (or Enter). The page stays
  where it is while the platform checks them.
- Wrong credentials: a message appears above the form, the fields keep their content, nothing else
  changes. Another failure (the server cannot be reached) shows a different message.
- Correct credentials: the visitor goes to the page named by `?redirect=` in the address when it is
  a path of this site, else to **Page after sign-in**, else to the home page. On the notice of a
  reserved item or page, the visitor stays on that page, now open.
- A visitor who is **already signed in** sees "You are signed in as ...", a **Continue** button and
  **Sign out**, not the form.
- In Page Builder the form is shown as visitors see it, but nothing can be typed or submitted.
- The form needs JavaScript. It is accessible: every field has a label, an error is announced, the
  focus ring follows the theme, and colours follow the theme in light and dark.

## Good practice

- Give the page a clear title ("Sign in") and leave the section title for a short invitation
  ("Access your member area"): the page's own title is the level 1 heading.
- Tell members where to get help (a contact page) in the introduction: the form has no "forgot your
  password" link, because that belongs to your identity system.

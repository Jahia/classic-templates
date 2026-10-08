---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

Added a sign-in / sign-out entry to the site header: switch on "Show a sign-in entry" in the header's edit form and the utility bar offers "Sign in" to guests and the visitor's name with "Sign out" once signed in. Its addresses are the platform's own login and logout routes, built from the request's context path with a site-relative redirect (the page being viewed, or the new optional "Page after sign-in"), so nothing is tied to one server and nothing needs to be contributed as an external link. The header stays one cached fragment: a small island asks the platform who the visitor is. Also fixed: a link to a page that guests cannot read stayed cached as a plain label after the page was published or opened to everyone

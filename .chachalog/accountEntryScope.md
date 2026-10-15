---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

The header's account entry now shows the signed-in visitor's name and "Sign out" for site members and other visitors without a back-office role. On a stock Jahia, GraphQL is open to privileged users only, so their entry kept saying "Sign in"; the template set ships a scope (`org.jahia.bundles.api.authorization-classic-templates.yml`) that lets the site's pages ask `currentUser`, on no node: no content becomes readable through GraphQL.

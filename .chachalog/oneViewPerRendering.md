---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

**One rendering, one view.** The card grid's renderings and the two-rows header are views of their own, chosen in Content Editor > **Layout** > **Select a view** (**Rendu** > **Sélectionnez une vue**), instead of a field one view switched on: the card grid has **Icon tiles** and **Logo strip** beside its default cards, the site header has **Two rows** beside its default one row (choose **Clear** to go back to it). The **Display** and **Header layout** fields are hidden and kept (removing a released field is refused): pages render as before, live included, until each site runs the content migration. The change installs over a site that already has content. The header's sign-in entry (its `account` view, a part of the header) is not offered in **Select a view**.

**Content migration:** `scripts/migrate-views.groovy` moves each card grid's display and each header's layout to the view (`j:view`) and sets the old field back to its default. It writes the default workspace only and publishes nothing; until a page is published again its live version keeps the old field, which the default views still read. Run it on every instance with content (dry run first, then for real, then again to see nothing left), through the provisioning API: the header of the script gives the command. The pre-packaged sites already carry the views.

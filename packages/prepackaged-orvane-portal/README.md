# Orvane Portal pre-packaged website

The `orvane-portal` demo site, the gated portal where the photo and video suppliers of **Orvane**, a
fictional media group, answer its briefs. Built with the [classic-templates](../template-set/README.md)
template set and the [classic-media](../media/README.md) module, packaged as a Jahia module. It goes
with its sister sites [Orvane Signal](../prepackaged-orvane-signal/README.md) and
[Orvane Live](../prepackaged-orvane-live/README.md). Back to the [repository README](../../README.md).

| Artifact                                                                          | What it is                                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `org.jahia.community:orvane-portal-prepackaged-website:<version>` (`.jar`)        | The module: install it, then import the site from Administration |
| `org.jahia.community:orvane-portal-prepackaged-website:<version>:import` (`.zip`) | The same site as an import file, for the provisioning API        |

## What the site contains

Orvane Portal in English and French, theme `portal`, every page marked `noindex` (site setting):

- public pages: home (what the portal is, how it works, how to become a supplier), Guidelines, Help,
  sign-in, legal notice, privacy policy, accessibility statement and site map;
- closed pages: **Briefs** (the open briefs of the supplier's company, `ctmd:briefList`) and **My
  submissions** (the company's own submissions, `ctmd:submissionList`);
- four briefs (`ctmd:brief`, one for video suppliers only, one closed) and three earlier submissions
  (`ctmd:submission`) of two companies, with their pictures;
- the submission form shown on every open brief's page (Formidable, sign-in required), whose
  **Create content** action (`formidable-content`, of the formidable-extended-actions repository) turns an answer into a submission in the
  supplier's company folder, files with their credit line.

Every person, company, picture and contact is invented (`@orvane.example`, `.example` domains).

## Access rules travel with the site, groups do not

The export carries the ACLs of the closed pages and folders (inheritance broken, `reader` granted to
groups) but no user and no group: create them on the target, with the same names, before or after
the import (the grants name them and apply as soon as they exist):

| Group | Reads |
| --- | --- |
| `orvane-suppliers` | Briefs, My submissions, the briefs folder |
| `orvane-supplier-northlight`, `orvane-supplier-tidewater`, `orvane-supplier-kestrel` | their company's `contents/submissions/<company>` and `files/submissions/<company>`; the video-only brief is read by Tidewater and Kestrel |
| `orvane-signal-editors` | the picture desk: edits and publishes every closed node |

The `orvane-demo` repository's `seed-staff.py` creates these groups, four supplier accounts and the
picture desk, and grants the roles (the publishing role is chosen per instance: `editor-in-chief` on
a new 8.2.3.2).

## Installing

1. Install `classic-templates` and `classic-media` (with the portal theme, the noindex setting, the
   brief and submission types and the credits: PRs #36 to #38), Formidable 0.6 with
   `formidable-extended-inputs` (Jahia/formidable#432) and `formidable-content` (formidable-extended-actions repository; not released
   yet), and this module.
2. Configure Formidable's uploads (`org.jahia.modules.formidable.uploads`: add `vtt` to
   `uploadAllowedTypes`; 40 MB per file and 100 MB per request suit short video clips; files are held
   in memory). Edit it once the module has started: an edit made before leaves a one-line file.
3. Import the site (Administration > Projects > Import prepackaged project, or the provisioning API
   as in the Orvane Live README), **after** Orvane Signal and Orvane Live: their footers link here.
4. Create the groups and users (above), then publish the site's ACLs if you granted anything new.

## Regenerating the package

Seed the site locally (the `orvane-demo` seeder, passes 8 to 10), then from the repository root:

```bash
python3 scripts/export-prepackaged.py --site orvane-portal
```

# Releasing classic-templates

The four packages (template set, classic-travel, the two pre-packaged sites) share one version and
are released together. The org CI account cannot push releases to this repository yet, so a release
follows the manual path of the AIStartupKit harness (`$AISTARTUPKIT/.agents/context/jahia-release-and-ci.md`,
"Manual release when the release workflow cannot run"). This page is the checklist for this
repository; a release is done when every step is.

## 1. Changelog and version

1. Every change merged since the last release carries its `.chachalog/` fragment (and its README,
   `docs/` and `.agents/` lines). The chachalog bot keeps a "chore: release classic-templates @ vX.Y.Z"
   PR open on branch `release`: check it lists every fragment, then squash-merge it.
2. Commit `chore: release classic-templates X.Y.Z` on `main`: `X.Y.Z-SNAPSHOT` becomes `X.Y.Z` in the
   root `pom.xml`, the four `packages/*/pom.xml` and the two `package.json` (template set, travel).
   Nothing else.
3. Wait until that commit's `On merge to main` run is **in progress** (`gh run view <id> --json status`),
   then commit `chore: next development version X.(Y+1).0-SNAPSHOT; README for the X.Y.Z release`
   (the next minor, as after every release so far; the release PR sets the real number from the
   fragments):
   the SNAPSHOT version back in the same seven files, and the README's "Latest release" line pointing
   to the new tag. Pushed while the release run is still waiting, it replaces that run (one waiting
   run per concurrency group); `gh run rerun <id>` brings it back.

Do not merge anything else into `main` before the release run's `Build Module` job has finished: a
newer push cancels the older `main` run, release included once it is past waiting.

## 2. GitHub release

1. When `Build Module` has finished, download `build-artifacts`
   (`gh api repos/Jahia/classic-templates/actions/artifacts/<id>/zip`) and take the six assets:
   - `packages/template-set/target/classic-templates-X.Y.Z.tgz`
   - `packages/travel/target/classic-travel-X.Y.Z.tgz`
   - `packages/prepackaged-site/target/classic-templates-prepackaged-website-X.Y.Z.jar`, and
     `prepackaged/classic-dev.zip` renamed `classic-templates-prepackaged-website-X.Y.Z-import.zip`
   - `packages/prepackaged-skylantern/target/skylantern-prepackaged-website-X.Y.Z.jar`, and
     `prepackaged/skylantern.zip` renamed `skylantern-prepackaged-website-X.Y.Z-import.zip`
2. Check them: version `X.Y.Z` (`package.json` of the `.tgz`, `Bundle-Version` of the jars), MIT
   licence and a LICENSE file in each `.tgz`, the expected `jahia.module-dependencies` and
   `Jahia-Depends`, the site zip inside each jar, and no `/Users/` anywhere.
3. `gh release create X_Y_Z --target <release commit> --title "classic-templates_X.Y.Z"
--notes-file <the X.Y.Z section of CHANGELOG.md>` with the six assets.

## 3. Deliverables that copy the release

Both are outside this repository and both are updated in the same session as the release.

**Replication kit** (`0.Modules/demo-replication`): it installs released packages on a demo
instance (Hyper Avitron) and imports the demo sites.

- Replace the four classic-templates packages in `modules/` with the new release's files, update the
  `MODULES` list in `replicate.sh` and the versions in its README.
- Run `./replicate.sh http://localhost:8080 --modules-only` against the local Jahia: every module
  reaches STARTED, then the demo pages still answer 200.
- The kit never replaces a newer version, nor a SNAPSHOT of the same version: the demo instance runs
  classic-travel from the `demo-live` branch, with components the release does not have yet.

**Jahia Store submission pack** (`0.Modules/store-submissions/classic-templates`): what is pasted
into the Store form and uploaded. The generic rules are in the AIStartupKit harness ("Jahia Store
submission pack"); for this module:

- `classic-templates-X.Y.Z.tgz`: the release asset itself, the previous version's file removed.
- `screenshots/NN-<subject>.png`, 1280 px wide, numbered in upload order. A release that adds a theme
  or a component adds a screenshot, taken from `docs/images/` (the theme pages are there in light and
  dark).
- `listing.html`, EN and FR side by side:
  - the upload table (file, `X_Y_Z` link, version, dependencies, screenshot range);
  - the summary and the description: themes listed by name and counted, components, the two
    pre-packaged sites;
  - the FAQ: the theme list, and field names quoted as the editor shows them
    (`settings/resources/classic-templates_en.properties`, `_fr.properties`);
  - the change log: one entry per release since the last pack, for Store users (features and fixes
    they see; the CI, workflow and demo-tooling lines stay in `CHANGELOG.md`).
- Check: `grep -n "<previous version>" listing.html` finds only that version's own change-log entry,
  the page parses, no em or en dash.

The Store upload itself is done by the person submitting, under their account.

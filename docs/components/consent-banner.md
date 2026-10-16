# Consent banner

Type: `ctpl:consentBanner`

## What it is

The banner that asks visitors whether the site may record what they do, for example to personalise what it shows them. It sits at the bottom of the window until the visitor chooses **Accept** or **Refuse**, then it goes away. A **Privacy settings** button after the footer opens it again, so a visitor can change their mind as easily as they agreed.

The banner only records the visitor's choice and tells the site about it. What the site does with that choice depends on what it runs:

- With **jExperience** on the site, the choice switches its tracking on or off for that visitor (see "With jExperience" below).
- Any other script of the site can wait for the visitor's choice (see "For developers").

## Where you can add it

The **footer area of the home page**, once: the banner then shows on every page of the site. Open the home page in Page Builder and add the consent banner to the footer area, after the site footer. Like the footer, it is edited from the home page only. It cannot be added anywhere else.

## Fields

| Label as shown in the editor | What it does                                                                           | Notes                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Heading                      | Title of the banner, for example "Your privacy".                                       | Per language. Optional. Without it no title shows and screen readers announce "Privacy choices". |
| Text                         | What the site records once the visitor accepts, and why.                               | Per language. Say plainly what is recorded and that nothing is before the visitor accepts.       |
| Accept button                | Label of the button that accepts, for example "Accept".                                | Per language. Required: without it the banner does not show.                                     |
| Refuse button                | Label of the button that refuses, for example "Refuse".                                | Per language. Required. Both buttons look the same, so refusing is as easy as accepting.         |
| Settings button              | Label of the button after the footer that opens the banner again ("Privacy settings"). | Per language. Required: a visitor must always be able to withdraw.                               |
| Remember the choice for      | Number of days the visitor's choice is kept before the banner asks again.              | Default: 180. From 1 to 395 (13 months, the longest a consent may be kept).                      |
| Privacy policy link text     | Text of the link to the privacy policy, for example "Read our privacy policy".         | Per language. See [Call to action](call-to-action.md).                                           |
| Privacy policy               | The page the link opens, usually the privacy policy page.                              | Per language target. See [Call to action](call-to-action.md).                                    |

## How it behaves

### What visitors see

- On their first visit, a band at the bottom of the window with the heading, the text, the privacy policy link and the two buttons. The page underneath scrolls normally, and its end is never hidden by the band.
- After **Accept** or **Refuse**, the band goes away and is not shown again for the number of days set, on any site of the same address (the choice is kept in a cookie).
- **Privacy settings**, at the very end of every page, opens the band again; the keyboard focus moves to its first button.
- Without JavaScript the banner and the settings button do not show: nothing is recorded either, since recording needs JavaScript too.

### With jExperience

When jExperience runs on the site, **Accept** switches its tracking on for the visitor and **Refuse** switches it off. For nothing to be recorded **before** the visitor chooses, switch tracking off by default on the site: in jContent, open the site's properties and, in the jExperience options, deactivate JavaScript execution for the site and all its pages (`wemmix:deactivateJSExecution`, value "All"). Tracking then only starts for a visitor who accepts.

Until a visitor accepts, every personalised section shows its default content.

### In edit mode

The banner shows in place, after the footer, never over the page. A line under the text reminds you how it behaves, or says which button label is missing.

### For screen reader users

The banner is a region named after its heading (or "Privacy choices"). It does not move the keyboard focus when it appears; after a choice, the focus moves to the Privacy settings button.

### For developers

Every page announces the stored choice, and every new choice, with a `ctpl:consent` event on `document` (`event.detail.status` is `"granted"` or `"denied"`) and the `data-ctpl-consent` attribute on `<html>`. A script that must wait for consent listens for the event or reads the attribute. The choice is the `ctpl-consent` cookie (path `/`).

## Good practice

- **Say what is recorded.** One or two sentences: what, why, and that the visitor can change their mind.
- **Link to the privacy policy**, and keep the policy in line with the banner.
- **Do not hide Refuse.** Keep both labels short and of the same weight ("Accept", "Refuse").

## In other languages

Every label, the text and the policy link are per language. The visitor's choice is the same in every language and on every site of the same address.

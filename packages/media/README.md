# classic-media

The **classic-media** module (`org.jahia.modules.javascript:classic-media`), one of the packages of
this repository, released at the same version as the template set. Back to the
[repository README](../../README.md).

Editorial and event content for Jahia sites built on the [classic-templates](../template-set/README.md)
template set: stories in seven formats with their own pages, the people who write them and speak at
events, automatic story feeds, an event programme with day tabs and filters, a speaker gallery and
the key dates of an event. Built for media groups that run an editorial hub and an event site;
every text and link is contributed content, in every site language.

The module has no page template: its content renders inside classic-templates pages and follows the
site's classic-templates theme (light and dark) through its design tokens.

## Requirements

- Jahia 8.2.1 or later with `javascript-modules-engine` 1.2 or later.
- **classic-templates**, installed and used by the site (declared module dependency). Install the
  two modules at the same version.
- Optional: **js-media-gallery**, whose videos a video story shows; **Augmented Search**, for the
  search results section (the sites indexed); **jExperience**, which then receives the visitor's
  plays, shares, filters and searches as standard events (only while it tracks the visitor, so
  after consent on a site that asks for it, for example with the classic-templates consent banner).

## Installation

Install `classic-media-<version>.tgz` in Jahia (Administration > Modules), or build it with
`yarn build`, then enable **classic-media** on a site that uses the classic-templates template set
(Site settings > Modules, or the provisioning API: `- enable: "classic-media"` with
`site: "<siteKey>"`).

## Content types

| Type                                    | What it is                                                                                                                                                    | Where it goes                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Person (`ctmd:person`)                  | An author or a speaker: name, role, organisation, portrait, short bio, biography, profile links                                                               | A content folder. Own page listing their stories and sessions; cards in galleries and lists |
| Story (`ctmd:story`)                    | News, feature, opinion, interview, report, video or podcast: teaser, body, date, image, authors, a video or an audio file with its transcript, "Members only" | A content folder. Own page with byline, share, related stories; cards in feeds and lists    |
| Story feed (`ctmd:storyFeed`)           | The latest stories under a folder, of some formats, of some categories or of the page's topics, as cards, a list or a lead story, with format buttons         | A page area, a column, a tab, a free zone                                                   |
| Session (`ctmd:session`)                | A session of an event: start and end, room, stream, type, description, speakers with their part, "Members only"                                               | The event's content folder. Own page; rows of the agenda                                    |
| Agenda (`ctmd:agenda`)                  | The sessions of an event, one tab per day, with stream, room and type filters                                                                                 | A page area, a column, a tab, a free zone                                                   |
| Speaker gallery (`ctmd:speakerGallery`) | The people of a folder as portrait cards, sorted by name, with an A-Z index                                                                                   | A page area, a column, a tab, a free zone                                                   |
| Search results (`ctmd:searchResults`)   | A search box and the Augmented Search results for the words typed, for this site or its whole network, with previous and next pages                           | A page area, a column, a tab, a free zone                                                   |
| Key dates (`ctmd:keyDates`)             | An event's days and venue, a countdown, its key dates, a call to action                                                                                       | A page area, a column, a tab, a free zone                                                   |

The event's time zone is a setting of its content folder ("Event" in the folder's options): sessions
and the agenda show their times in that zone.

Story and session pages end with their **Topics** (categories) and **Tags**; each tag links to the
site's search results for it when the classic-templates site header names a **Search page**.

Stories and sessions take classic-templates' **Members only** switch: visitors who are not signed in
read the opening paragraphs of the body (or of the session's description; 2 by default, set per
item, never the whole text), then a notice with **Create an account** and **Sign in**, the site
header's registration and sign-in pages, both bringing them back. The rest is not sent to them. A
session keeps its times, room and speakers public. See classic-templates'
[Members-only content](../../docs/guides/members-only-content.md).

## Development

Gates and decisions: [`.agents/context/media.md`](../../.agents/context/media.md). Test site:
`python3 scripts/seed-media-test-site.py` from the repository root (site `ctmd-test`).

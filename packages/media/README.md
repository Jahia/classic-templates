# classic-media

The **classic-media** module (`org.jahia.modules.javascript:classic-media`), one of the packages of
this repository, released at the same version as the template set. Back to the
[repository README](../../README.md).

Editorial and event content for Jahia sites built on the [classic-templates](../template-set/README.md)
template set: stories in seven formats with their own pages, the people who write them and speak at
events, automatic story feeds, an event programme with day tabs and filters, a speaker gallery and
the key dates of an event. Built for media groups that run an editorial hub and an event site;
every text and link is contributed content, in every site language. The labels built into the
views (formats, roles, filters, search, share) come in English, French and European Portuguese
(`pt`); editor labels and tooltips are English and French only, so there is no `_pt.properties`
resource bundle.

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
| Search results (`ctmd:searchResults`)   | A search box with suggestions, filters (topics, tags, format, type, site) and the Augmented Search results, for this site or its whole network, with paging   | A page area, a column, a tab, a free zone                                                   |
| Key dates (`ctmd:keyDates`)             | An event's days and venue, a countdown, its key dates, a call to action                                                                                       | A page area, a column, a tab, a free zone                                                   |
| Brief (`ctmd:brief`)                    | What the group needs from its photo and video suppliers: description, deadline, media wanted, quantity, intended use, status, a mood picture                  | A content folder, readable by the suppliers it targets. Own page; cards in the brief list   |
| Brief list (`ctmd:briefList`)           | The briefs the visitor may read, open ones unless asked otherwise, the nearest deadline first, as cards                                                       | A page area, a column, a tab, a free zone                                                   |
| Supplied story (`ctmd:suppliedStory`)   | A story a supplier sent from a portal (a `ctmd:story`, moderated): it joins the story lists once the editors accept it                                        |
| Submission list (`ctmd:submissionList`) | The supplied stories the visitor may read, the newest first, whatever their status, as status cards                                                           | A page area, a column, a tab, a free zone                                                   |

The event's time zone is a setting of its content folder ("Event" in the folder's options): sessions
and the agenda show their times in that zone.

Story and session pages end with their **Topics** (categories) and **Tags**; each tag links to the
site's search results filtered by it (`?tag=<tag>`) when the classic-templates site header names a
**Search page**.

### Briefs and supplied stories (supplier portal)

For a gated supplier portal where the group's suppliers (agencies, studios, freelance writers and
photographers) read its **briefs** and send **stories**, which the editorial site publishes once
the editors accept them. The module holds the content types and the views; who sees what is
decided by Jahia's rights, never by a field.

- A **Brief** is a main resource with its own page (description, deadline, media wanted, quantity,
  intended use, a mood picture) and a card for lists. A closed brief says so in words, on its card
  and on its page. Pick a **Submission form** on the brief: a Formidable form (`fmdb:form`),
  shown on the brief's page, under the heading "Answer this brief", while the brief is open; a
  closed brief shows "This brief is closed." instead. Without a form the page shows none (edit mode
  says so). Formidable is not a dependency of the module: install it on the instance, with an
  action that creates the story (formidable-content's **Create content**). The form posts from the
  brief's page.
- A **Supplied story** (`ctmd:suppliedStory`) is a story like any other (format, title, teaser,
  text, picture, authors, topics), written by a supplier, plus the brief it answers, the licence,
  the company and who sent it, and a **moderation status** (`ctplmix:moderated` of the template
  set: submitted, in review, accepted, declined, with a note to the author). Store supplied stories
  with the site's stories, in a folder per company that only that company and the editors may
  read. **Every list leaves out a story that is not accepted**, whoever reads it; on its own page a
  story not accepted yet says so to the few who may open it. When an editor who may publish sets
  **Accepted**, classic-moderation opens the story and its files to every visitor and publishes
  them: it then appears in the story feeds, topic pages, related stories and search like any story.
- The **Submission list** shows a supplier the stories of their company, whatever their status, as
  **status cards**: format, title (a link to the story once accepted), the brief it answers (linked
  when the visitor may read it), the day it was sent, its status as text with a mark (never colour
  alone), the licence, the editors' note, its picture, and, until it is accepted, a preview of the
  lead and text. A supplied story is typed once, in one language: the list shows it whatever the
  page's language; the story feeds, which follow the page's language, show it in that language
  only until it is translated.
- The **Brief list** and the **Submission list** are computed **for the visitor who reads them**:
  the query runs with the visitor's own session, so a brief or a story the visitor may not read is
  simply absent, and two suppliers get two different lists. The two list views are cached **per
  user**, as is the status card, so a list built for one supplier is never served to another.
- Closed briefs leave the brief list unless **Show closed briefs** is on; briefs are ordered by
  deadline, those without one last. A list with nothing to show displays its own text, or leaves
  the section out when it has none.

### Photo credits

Add the **Credit** option (`ctmdmix:credited`) to a picture or video in the media library (jContent
offers it on every file) and type who to credit, exactly as it must appear, for example "Sofia
Marques / Northlight Pictures". It is the same in every language. A story's lead image (its page,
its members teaser, the episode's cover) and a brief's mood picture then carry a caption "Photo:
Sofia Marques / Northlight Pictures" ("Photo : ..." in French, "Foto: ..." in Portuguese). A file
without a credit shows as before. Videos rendered by js-media-gallery and the small thumbnails of
cards and status cards show no credit.

### The search section

Put a **Search results** section on the page the site header names as its **Search page**. It shows:

- a **search box** with suggestions: after two characters, up to five matching titles and the tags
  that match, as a list of links under the box (ArrowDown reaches them, the arrows move between them,
  Enter runs one, Escape returns to the box);
- **filters** beside the results: **Topics** (the categories, as a tree: top-level topics, their
  sub-topics under a disclosure), **Tags** (the twelve most used, then "More"), **Format** (a
  story's format, a session's type), **Type** (story, session, person, page) and, when the section
  searches the network, **Site**. Within a filter the chosen values are alternatives (a story
  tagged either way), across filters they all apply. Every value shows how many results it would
  give, without counting its own filter, so choosing one never empties its siblings;
- the **selected filters** as removable chips with "Clear all filters", the number of results in a
  status line, the results, and paging.

The address carries the whole state, so a search can be bookmarked and shared, and the back button
works: `?q=fast&topic=streaming/fast-channels&tag=carbon&tag=icvfx&format=news&type=story&site=orvane-signal&page=2`.
Without JavaScript the same filters are checkboxes of a form with an **Apply filters** button, and
the chips and the pager are links: everything works with a page reload. With JavaScript an island
(Elastic Search UI's core `SearchDriver` behind our own connector to Augmented Search,
`src/lib/searchConnector.ts`) takes the form's place and updates the results without a reload.

Each result shows its own summary under its title, the words searched highlighted in it: the SEO
description (`jcr:description`), else the teaser, else a person's role. Only an item without any of
them shows the index's excerpt (which can come from a related item the index folds in, such as a
story's author).

Augmented Search must map the media types and be fully reindexed after installing this version:
set `org.jahia.modules.augmentedsearch.content.mappedNodeTypes` to
`ctmd:story,ctmd:session,ctmd:person,ctplmix:editorialItem.teaser` (the Format filter reads the story
`format` and the session `sessionType`, the summaries read the teasers and roles; `facetable` in
the CND alone does nothing), then run a full reindex (all sites: the index mapping changes). The
topics are read from the categories the content is filed under (the category tree with the most
content is shown); the tags are Jahia's own tags. A search with nothing asked shows the filters
and no results.

Stories and sessions take classic-templates' **Members only** switch: visitors who are not signed in
read the opening paragraphs of the body (or of the session's description; 2 by default, set per
item, never the whole text), then a notice with **Create an account** and **Sign in**, the site
header's registration and sign-in pages, both bringing them back. The rest is not sent to them. A
session keeps its times, room and speakers public. See classic-templates'
[Members-only content](../../docs/guides/members-only-content.md).

## Development

Gates and decisions: [`.agents/context/media.md`](../../.agents/context/media.md). Test site:
`python3 scripts/seed-media-test-site.py` from the repository root (site `ctmd-test`).

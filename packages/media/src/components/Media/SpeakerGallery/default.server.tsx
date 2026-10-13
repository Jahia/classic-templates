import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { sortNameOf } from "../../../lib/format.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { listStart, pageOf, runQuery, startLabel } from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import { indexOf, sortPeople } from "../../../lib/select.js";
import cards from "../shared/cards.module.css";
import { ListSection } from "../shared/parts.js";
import type { Props } from "./types.js";
import classes from "./speaker-gallery.module.css";

/** People a gallery shows, from 1 to 200 (the CND range), 24 by default. */
const itemCount = (value: number | undefined) =>
  Math.min(Math.max(Math.round(value ?? 24) || 24, 1), 200);

/**
 * The speaker gallery: people under its start node as portrait cards (their own card view), sorted
 * by the name they are filed under in the page's language order. With "A-Z index", a navigation of
 * letters above the cards, each a link to the first person filed under it.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:speakerGallery", displayName: "Speaker gallery" },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const language = languageTag(currentResource.getLocale());
    const { site } = pageOf(renderContext, currentNode);
    const { start, startMissing } = listStart(currentNode, props.startNode, site);
    const max = itemCount(props.maxItems);
    const people = startMissing
      ? []
      : sortPeople(
          runQuery({
            session: jcrSession,
            renderContext,
            type: "ctmd:person",
            start,
            locale: currentResource.getLocale(),
          }).map((node) => ({
            id: node.getIdentifier(),
            node,
            sortName: sortNameOf(readString(node, "jcr:title"), readString(node, "sortName")),
          })),
          language,
        ).slice(0, max);
    const id = currentNode.getIdentifier();
    const anchor = (personId: string) => `ctmd-person-${id}-${personId}`;
    const index = props.showIndex ? indexOf(people) : [];
    return (
      <ListSection
        props={props}
        testId="ctmd-speaker-gallery"
        count={people.length}
        startMissing={startMissing}
        summary={t("gallery.summary", { start: startLabel(start), max, ...RAW })}
      >
        {(itemLevel) => (
          <>
            {index.length > 1 && (
              <nav className={classes.index} aria-label={t("gallery.index")}>
                <ul>
                  {index.map(({ letter, id: personId }) => (
                    <li key={letter}>
                      <a href={`#${anchor(personId)}`}>{letter}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <ul className={cards.grid}>
              {people.map((person) => (
                <li key={person.id} id={anchor(person.id)} className={classes.person}>
                  <Render
                    node={person.node}
                    view="card"
                    parameters={{ headingLevel: String(itemLevel) }}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </ListSection>
    );
  },
);

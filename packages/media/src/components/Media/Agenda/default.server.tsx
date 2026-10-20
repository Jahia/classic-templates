import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { dayIn, formatDate } from "../../../lib/format.js";
import { headingTag } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { eventTimeZone, listStart, pageOf, runQuery, startLabel } from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import { facetValues, groupByDay } from "../../../lib/select.js";
import shared from "../../../lib/shared.module.css";
import cards from "../shared/cards.module.css";
import { ListSection, MediaScript } from "../shared/parts.js";
import type { Props } from "./types.js";
import classes from "./agenda.module.css";

const FACETS = ["stream", "room", "type"] as const;

/**
 * The agenda: the sessions under its start node, one group per day of the event's time zone (the
 * start folder's ctmdmix:eventFolder, else the first session's), sessions in time order. Without
 * JavaScript and in edit mode the days are stacked, each under its heading; on the live site
 * static/js/media.js turns them into tabs, and with "Filters" shows a select per facet that has
 * more than one value (stream, room, type), hiding the sessions that do not match.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:agenda", displayName: "Agenda" },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const language = languageTag(currentResource.getLocale());
    const { site } = pageOf(renderContext, currentNode);
    const { start, startMissing } = listStart(currentNode, props.startNode, site);
    const sessions: JCRNodeWrapper[] = startMissing
      ? []
      : runQuery({
          session: jcrSession,
          renderContext,
          type: "ctmd:session",
          start,
          order: "start",
          locale: currentResource.getLocale(),
        });
    const zone = eventTimeZone(
      start.isNodeType("ctmdmix:eventFolder") || sessions.length === 0 ? start : sessions[0],
      renderContext,
    );
    const entries = sessions.map((node) => ({
      id: node.getIdentifier(),
      node,
      day: dayIn(readString(node, "start"), zone),
      start: readString(node, "start"),
      stream: readString(node, "stream"),
      room: readString(node, "room"),
      type: readString(node, "sessionType"),
    }));
    const days = groupByDay(entries);
    const facets =
      props.showFilters === false
        ? []
        : FACETS.filter((f) => facetValues(entries, f, language).length > 1);
    const id = currentNode.getIdentifier();
    const summary = t("agenda.summary", { start: startLabel(start), zone, ...RAW });
    return (
      <ListSection
        props={props}
        testId="ctmd-agenda"
        count={days.length}
        startMissing={startMissing}
        summary={summary}
      >
        {(dayLevel) => {
          const DayHeading = headingTag(dayLevel);
          return (
            <div data-ctmd-filter={facets.length > 0 ? "" : undefined}>
              <MediaScript />
              {facets.length > 0 && (
                <>
                  <fieldset className={classes.filters} data-ctmd-filter-controls="" hidden>
                    <legend className={shared.visuallyHidden}>{t("agenda.filters")}</legend>
                    {facets.map((facet) => (
                      <label key={facet} className={classes.filter}>
                        <span>{t(`agenda.${facet}`)}</span>
                        <select data-ctmd-facet={facet}>
                          <option value="">{t("agenda.all")}</option>
                          {facetValues(entries, facet, language).map((value) => (
                            <option key={value} value={value}>
                              {facet === "type" ? t(`session.type.${value}`) : value}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </fieldset>
                  <output
                    className={shared.visuallyHidden}
                    data-ctmd-filter-status=""
                    data-template={t("agenda.shown", { n: "{count}", ...RAW })}
                  />
                </>
              )}
              <p className={classes.zone}>{t("session.zone", { zone, ...RAW })}</p>
              <div
                data-ctmd-tabs=""
                data-ctmd-labelledby={`ctmd-agenda-${id}`}
                data-ctmd-tablist-class={classes.tablist}
                data-ctmd-hidden-class={shared.visuallyHidden}
              >
                {days.map(({ day, sessions: daySessions }) => (
                  <section
                    key={day}
                    id={`ctmd-day-${id}-${day}`}
                    className={classes.day}
                    data-ctmd-tab-panel=""
                    data-ctmd-group=""
                    aria-labelledby={`ctmd-day-${id}-${day}-h`}
                  >
                    <DayHeading
                      id={`ctmd-day-${id}-${day}-h`}
                      className={classes.dayTitle}
                      data-ctmd-tab-heading=""
                    >
                      <span data-ctmd-tab-label="">{formatDate(day, language, "full")}</span>
                    </DayHeading>
                    <ol className={classes.sessions}>
                      {daySessions.map((entry) => (
                        <li
                          key={entry.id}
                          data-ctmd-item=""
                          data-ctmd-stream={entry.stream}
                          data-ctmd-room={entry.room}
                          data-ctmd-type={entry.type}
                        >
                          <Render
                            node={entry.node}
                            view="compact"
                            parameters={{ headingLevel: String(dayLevel + 1) }}
                          />
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
              {facets.length > 0 && (
                <p className={cards.empty} data-ctmd-filter-empty="" hidden>
                  {t("agenda.noMatch")}
                </p>
              )}
            </div>
          );
        }}
      </ListSection>
    );
  },
);

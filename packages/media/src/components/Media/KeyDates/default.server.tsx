import { RenderChildren, getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { formatDate, isoDay } from "../../../lib/format.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { MediaScript } from "../shared/parts.js";
import { Untitled } from "../shared/Untitled.js";
import type { KeyDateProps, Props } from "./types.js";
import classes from "./key-dates.module.css";

/** One key date: the day, its title, an optional detail. Untitled in this language: nothing live. */
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:keyDate", displayName: "Key date" },
  ({ "jcr:title": title, date, detail }: KeyDateProps, { currentResource }) => {
    const language = languageTag(currentResource.getLocale());
    if (!title) return <Untitled />;
    return (
      <li className={classes.date} data-testid="ctmd-key-date">
        {date && (
          <time className={classes.when} dateTime={isoDay(date)}>
            {formatDate(date, language, "medium")}
          </time>
        )}
        <span className={classes.what}>{title}</span>
        {detail && <span className={classes.detail}>{detail}</span>}
      </li>
    );
  },
);

/**
 * Key dates of an event: optional heading, the event's days and venue, a countdown worked out in
 * the browser (static/js/media.js; hidden without JavaScript and in edit mode, never wrong in a
 * cached page), the key dates in order, and the call to action ("Register").
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:keyDates", displayName: "Key dates" },
  (props: Props, { currentNode, renderContext, currentResource }) => {
    const t = useT();
    const language = languageTag(currentResource.getLocale());
    const level = useHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const start = isoDay(props.eventStart);
    const end = isoDay(props.eventEnd);
    const hasDates =
      getChildNodes(currentNode, 1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctmd:keyDate")).length >
      0;
    const title = props["jcr:title"];
    if (!isEdit && !title && !start && !hasDates) return null;
    const headingId = `ctmd-key-dates-${currentNode.getIdentifier()}`;
    const startText = formatDate(start, language);
    const endText = end && end !== start ? formatDate(end, language) : undefined;
    return (
      <Section
        surface={props.ctplSurface}
        testId="ctmd-key-dates"
        labelledBy={title ? headingId : undefined}
      >
        <Styles />
        <div className={`ctpl-container ${classes.inner}`}>
          <div className={classes.event}>
            {title && (
              <Heading level={level} id={headingId} className={classes.title}>
                {title}
              </Heading>
            )}
            {startText && (
              <p className={classes.days}>
                {endText
                  ? t("keyDates.dates", { start: startText, end: endText, ...RAW })
                  : startText}
              </p>
            )}
            {props.venue && (
              <p className={classes.venue}>
                <span className="ctpl-visually-hidden">{t("keyDates.venue")}: </span>
                {props.venue}
              </p>
            )}
            {props.showCountdown !== false && start && !isEdit && (
              <>
                <MediaScript />
                <p
                  className={classes.countdown}
                  data-ctmd-countdown=""
                  data-ctmd-start={start}
                  data-ctmd-end={end ?? start}
                  data-ctmd-many={t("keyDates.startsIn", { days: "{count}", ...RAW })}
                  data-ctmd-one={t("keyDates.tomorrow")}
                  data-ctmd-today={t("keyDates.today")}
                  data-ctmd-running={t("keyDates.running")}
                  data-testid="ctmd-countdown"
                  hidden
                />
              </>
            )}
            <Cta node={currentNode} renderContext={renderContext} />
          </div>
          {(hasDates || isEdit) && (
            <ol className={classes.dates} aria-label={t("keyDates.keyDates")}>
              <RenderChildren />
            </ol>
          )}
        </div>
      </Section>
    );
  },
);

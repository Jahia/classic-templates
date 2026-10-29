import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import {
  LICENCES,
  STATUS_CUE,
  knownValue,
  submissionStatusOf,
  type SubmissionStatus,
} from "../../../lib/briefs.js";
import { formatDate, isoDay } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { titleOf } from "../../../lib/media.js";
import { readPositive, readString } from "../../../lib/props.js";
import { RichText } from "../../../lib/RichText.js";
import { Styles } from "../../../lib/Styles.js";
import { useFormatLabel } from "../shared/parts.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./supplied-story.module.css";

/**
 * The story's picture, small. Its text alternative is the file's title in the media library, else
 * its file name: files a submission action stores carry no title. The file is a cache dependency.
 */
const Thumbnail = ({ node }: { node: JCRNodeWrapper }) => {
  const { renderContext } = useServerContext();
  server.render.addCacheDependency({ node }, renderContext);
  return (
    <img
      className={classes.thumb}
      src={buildNodeUrl(node)}
      alt={readString(node, "jcr:title") ?? node.getName()}
      width={readPositive(node, "j:width")}
      height={readPositive(node, "j:height")}
      loading="lazy"
      decoding="async"
    />
  );
};

/** The status as text with a mark that says it without colour (the mark is hidden from readers). */
const StatusLabel = ({ status }: { status: SubmissionStatus }) => {
  const t = useT();
  return (
    <span className={`${classes.status} ${classes[status]}`} data-ctmd-story-status={status}>
      <span className={classes.cue} aria-hidden="true">
        {STATUS_CUE[status]}
      </span>
      {t(`submission.status.${status}`)}
    </span>
  );
};

/** A link to the brief the story answers (the visitor may read it), with a cache dependency. */
const BriefLink = ({ brief }: { brief: JCRNodeWrapper }) => {
  const { renderContext } = useServerContext();
  server.render.addCacheDependency({ node: brief }, renderContext);
  return <a href={buildNodeUrl(brief)}>{titleOf(brief)}</a>;
};

/**
 * A status card (submission list, on the supplier's portal): the story's title (a link to the
 * published story once accepted), its format, the brief it answers (a link, only when the visitor
 * can read the brief), the day it was sent, its status as text with a mark, the licence, the
 * editors' note, its picture, and, until it is accepted, a preview of what was sent: the lead and
 * the text, here, since the story itself is not on the editorial site yet.
 *
 * The brief and the story are read as the visitor: what the visitor cannot read is simply absent,
 * so the card differs per visitor and its view is cached per user (default.server.tsx).
 */
export const SuppliedStoryCard = ({ props }: { props: Props }) => {
  const t = useT();
  const formatLabel = useFormatLabel();
  const level = useParamHeadingLevel();
  const { currentNode, currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  const status = submissionStatusOf(props.moderationStatus);
  const accepted = status === "accepted";
  const title = titleOf(currentNode);
  const created = readString(currentNode, "jcr:created");
  const format = formatLabel(props.format);
  const licence = knownValue(props.licence, LICENCES);
  return (
    <article
      className={classes.card}
      data-testid="ctmd-supplied-story-card"
      data-ctmd-status={status}
    >
      <Styles />
      {props.image && <Thumbnail node={props.image} />}
      <div className={classes.body}>
        {format && <p className={classes.format}>{format}</p>}
        <Heading level={level} className={classes.title}>
          {title && accepted && (
            <a href={buildNodeUrl(currentNode)} data-testid="ctmd-supplied-story-link">
              {title}
            </a>
          )}
          {title && !accepted && title}
          {!title && <Untitled />}
        </Heading>
        <dl className={classes.facts}>
          {props.brief && (
            <div>
              <dt>{t("submission.brief")}</dt>
              <dd>
                <BriefLink brief={props.brief} />
              </dd>
            </div>
          )}
          {isoDay(created) && (
            <div>
              <dt>{t("submission.submittedOn")}</dt>
              <dd>
                <time dateTime={isoDay(created)}>{formatDate(created, language)}</time>
              </dd>
            </div>
          )}
          <div>
            <dt>{t("submission.statusLabel")}</dt>
            <dd>
              <StatusLabel status={status} />
            </dd>
          </div>
          {licence && (
            <div>
              <dt>{t("submission.licenceLabel")}</dt>
              <dd>{t(`submission.licence.${licence}`)}</dd>
            </div>
          )}
          {props.moderationNote && (
            <div className={classes.note}>
              <dt>{t("submission.note")}</dt>
              <dd>{props.moderationNote}</dd>
            </div>
          )}
        </dl>
        {!accepted && (props.teaser || props.body) && (
          <details className={classes.preview} data-testid="ctmd-supplied-story-preview">
            <summary>{t("submission.preview")}</summary>
            {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
            <RichText html={props.body} headingLevel={level + 1} />
          </details>
        )}
      </div>
    </article>
  );
};

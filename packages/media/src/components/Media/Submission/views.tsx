import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import {
  MAX_THUMBNAILS,
  STATUS_CUE,
  submissionStatusOf,
  type SubmissionStatus,
} from "../../../lib/briefs.js";
import { formatDate, isoDay } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { readReferences, titleOf } from "../../../lib/media.js";
import { readPositive, readString } from "../../../lib/props.js";
import { Styles } from "../../../lib/Styles.js";
import type { Props } from "./types.js";
import classes from "./submission.module.css";

/**
 * A photo the supplier sent, small. The alternative text is the file's title in the media library,
 * else its file name: files a submission action stores carry no title, and an empty alternative
 * would make every thumbnail anonymous to a screen reader. Each file is a cache dependency
 * (renaming it updates the text).
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

/** A node's title, and the node a cache dependency of the card (a retitled brief updates it). */
const linkedTitle = (node: JCRNodeWrapper, renderContext: RenderContext) => {
  server.render.addCacheDependency({ node }, renderContext);
  return titleOf(node);
};

/** The status as text with a mark that says it without colour (the mark is hidden from readers). */
const StatusLabel = ({ status }: { status: SubmissionStatus }) => {
  const t = useT();
  return (
    <span className={`${classes.status} ${classes[status]}`} data-ctmd-submission-status={status}>
      <span className={classes.cue} aria-hidden="true">
        {STATUS_CUE[status]}
      </span>
      {t(`submission.status.${status}`)}
    </span>
  );
};

/**
 * A status card (submission list): the submission's title, the brief it answers (a link, only when
 * the visitor can read the brief), the day it was submitted, its status as text with a mark, the
 * picture desk's note, for an accepted submission the item that uses the media (a link when the
 * visitor can read it), and small thumbnails of the first photos (the other files are summarised
 * as "N more files"). A submission has no page of its own, so the title is not a link.
 *
 * The brief and the item are read as the visitor: what the visitor cannot read is simply absent,
 * so the card differs per visitor and its view is cached per user (default.server.tsx).
 */
export const SubmissionCard = ({ props }: { props: Props }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode, renderContext, currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  const status = submissionStatusOf(props.submissionStatus);
  const title = titleOf(currentNode);
  const created = readString(currentNode, "jcr:created");
  const brief = props.brief;
  const usedIn = status === "accepted" ? props.usedIn : undefined;
  const files = readReferences(currentNode, "media");
  const images = files.filter((file) => file.isNodeType("jmix:image"));
  const shown = images.slice(0, MAX_THUMBNAILS);
  const more = files.length - shown.length;
  return (
    <article className={classes.card} data-testid="ctmd-submission-card" data-ctmd-status={status}>
      <Styles />
      <div className={classes.body}>
        <Heading level={level} className={classes.title}>
          {title}
        </Heading>
        <dl className={classes.facts}>
          {brief && (
            <div>
              <dt>{t("submission.brief")}</dt>
              <dd>
                <a href={buildNodeUrl(brief)}>{linkedTitle(brief, renderContext)}</a>
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
          {props.deskNote && (
            <div className={classes.note}>
              <dt>{t("submission.deskNote")}</dt>
              <dd>{props.deskNote}</dd>
            </div>
          )}
          {usedIn && (
            <div>
              <dt>{t("submission.usedIn")}</dt>
              <dd>
                <a href={buildNodeUrl(usedIn)}>{linkedTitle(usedIn, renderContext)}</a>
              </dd>
            </div>
          )}
        </dl>
        {shown.length > 0 && (
          <ul className={classes.thumbs} aria-label={t("submission.photos")}>
            {shown.map((file) => (
              <li key={file.getIdentifier()}>
                <Thumbnail node={file} />
              </li>
            ))}
          </ul>
        )}
        {more > 0 && <p className={classes.files}>{t("submission.moreFiles", { count: more })}</p>}
      </div>
    </article>
  );
};

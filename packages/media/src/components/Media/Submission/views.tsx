import { JImage, buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import {
  LICENCES,
  MAX_THUMBNAILS,
  STATUS_CUE,
  knownValue,
  submissionStatusOf,
  type SubmissionStatus,
} from "../../../lib/briefs.js";
import { formatDate, isoDay } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { readReferences, titleOf } from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import { Styles } from "../../../lib/Styles.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./submission.module.css";

/**
 * A photo the supplier sent, small. The alternative text is the file's title in the media library,
 * else its file name: files a submission action stores carry no title, and an empty alternative
 * would make every thumbnail anonymous to a screen reader. Each file is a cache dependency
 * (renaming it updates the text).
 */
const Thumbnail = ({
  node,
  className = classes.thumb,
}: {
  node: JCRNodeWrapper;
  className?: string;
}) => {
  const { renderContext } = useServerContext();
  server.render.addCacheDependency({ node }, renderContext);
  return (
    <JImage
      src={node}
      className={className}
      alt={readString(node, "jcr:title") ?? node.getName()}
      decoding="async"
    />
  );
};

/** A node's title, and the node a cache dependency of the card (a retitled brief updates it). */
const linkedTitle = (node: JCRNodeWrapper, renderContext: RenderContext) => {
  server.render.addCacheDependency({ node }, renderContext);
  return titleOf(node);
};

/** A link to a node the visitor may read, titled with its title (and a cache dependency). */
const NodeLink = ({ node }: { node: JCRNodeWrapper }) => {
  const { renderContext } = useServerContext();
  return <a href={buildNodeUrl(node)}>{linkedTitle(node, renderContext)}</a>;
};

/** The brief a submission answers (when the visitor may read it) and the day it was submitted. */
const SentFacts = ({ brief, created }: { brief?: JCRNodeWrapper; created?: string }) => {
  const t = useT();
  const { currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  return (
    <>
      {brief && (
        <div>
          <dt>{t("submission.brief")}</dt>
          <dd>
            <NodeLink node={brief} />
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
    </>
  );
};

/** The picture desk's note and, for an accepted submission, the item that uses the media. */
const FollowUpFacts = ({ deskNote, usedIn }: { deskNote?: string; usedIn?: JCRNodeWrapper }) => {
  const t = useT();
  return (
    <>
      {deskNote && (
        <div className={classes.note}>
          <dt>{t("submission.deskNote")}</dt>
          <dd>{deskNote}</dd>
        </div>
      )}
      {usedIn && (
        <div>
          <dt>{t("submission.usedIn")}</dt>
          <dd>
            <NodeLink node={usedIn} />
          </dd>
        </div>
      )}
    </>
  );
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
 * as "N more files"). The title links to the submission's own page (SubmissionPage).
 *
 * The brief and the item are read as the visitor: what the visitor cannot read is simply absent,
 * so the card differs per visitor and its view is cached per user (default.server.tsx).
 */
export const SubmissionCard = ({ props }: { props: Props }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
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
          <a href={buildNodeUrl(currentNode)} data-testid="ctmd-submission-link">
            {title}
          </a>
        </Heading>
        <dl className={classes.facts}>
          <SentFacts brief={brief} created={created} />
          <div>
            <dt>{t("submission.statusLabel")}</dt>
            <dd>
              <StatusLabel status={status} />
            </dd>
          </div>
          <FollowUpFacts deskNote={props.deskNote} usedIn={usedIn} />
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

/**
 * The submission's own page, inside the main-resource template of classic-templates (header,
 * footer, `<title>`), opened from the title of its status card. It owns the page's only `<h1>`:
 * the title, under the status. Then the facts (the brief it answers, the day it was submitted,
 * when and where the pictures were taken, the licence, the credit line), the picture desk's note
 * and, for an accepted submission, the item that uses the media; the caption; every photo; and
 * the other files sent (videos, caption files) as links.
 *
 * Readable only by those the ACLs let read the submission (the supplier's company, the desk):
 * anyone else gets "not found" from the platform. The brief and the item are read as the visitor,
 * so the page is cached per user (default.server.tsx), like the card.
 */
export const SubmissionPage = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  const status = submissionStatusOf(props.submissionStatus);
  const title = titleOf(currentNode);
  const created = readString(currentNode, "jcr:created");
  const brief = props.brief;
  const usedIn = status === "accepted" ? props.usedIn : undefined;
  const licence = knownValue(props.licence, LICENCES);
  const files = [
    ...readReferences(currentNode, "media"),
    ...readReferences(currentNode, "captionsFiles"),
  ];
  const images = files.filter((file) => file.isNodeType("jmix:image"));
  const others = files.filter((file) => !file.isNodeType("jmix:image"));
  return (
    <article className={classes.page} data-testid="ctmd-submission-page" data-ctmd-status={status}>
      <Styles />
      <header className={classes.pageHead}>
        <p className={classes.pageStatus}>
          <StatusLabel status={status} />
        </p>
        {title ? <h1 className={classes.pageTitle}>{title}</h1> : <Untitled />}
      </header>
      <dl className={`${classes.facts} ${classes.pageFacts}`}>
        <SentFacts brief={brief} created={created} />
        {props.shotDate && isoDay(props.shotDate) && (
          <div>
            <dt>{t("submission.shotDate")}</dt>
            <dd>
              <time dateTime={isoDay(props.shotDate)}>{formatDate(props.shotDate, language)}</time>
            </dd>
          </div>
        )}
        {props.location && (
          <div>
            <dt>{t("submission.location")}</dt>
            <dd>{props.location}</dd>
          </div>
        )}
        {licence && (
          <div>
            <dt>{t("submission.licenceLabel")}</dt>
            <dd>{t(`submission.licence.${licence}`)}</dd>
          </div>
        )}
        {props.credit && (
          <div>
            <dt>{t("submission.credit")}</dt>
            <dd>{props.credit}</dd>
          </div>
        )}
        <FollowUpFacts deskNote={props.deskNote} usedIn={usedIn} />
      </dl>
      {props.caption && (
        <section className={classes.pageSection} aria-labelledby="ctmd-submission-caption">
          <h2 id="ctmd-submission-caption">{t("submission.caption")}</h2>
          <p className={classes.caption}>{props.caption}</p>
        </section>
      )}
      {images.length > 0 && (
        <section className={classes.pageSection} aria-labelledby="ctmd-submission-photos">
          <h2 id="ctmd-submission-photos">{t("submission.photos")}</h2>
          <ul className={classes.gallery}>
            {images.map((file) => (
              <li key={file.getIdentifier()}>
                <Thumbnail node={file} className={classes.photo} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {others.length > 0 && (
        <section className={classes.pageSection} aria-labelledby="ctmd-submission-files">
          <h2 id="ctmd-submission-files">{t("submission.files")}</h2>
          <ul className={classes.fileList}>
            {others.map((file) => (
              <li key={file.getIdentifier()}>
                <a href={buildNodeUrl(file)}>{readString(file, "jcr:title") ?? file.getName()}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

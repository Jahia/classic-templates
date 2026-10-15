import { Render, buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import {
  FORM_NODE_TYPE,
  MEDIA_WANTED,
  USAGES,
  briefStatusOf,
  knownValues,
  submissionSlotState,
} from "../../../lib/briefs.js";
import { formatDate, isoDay } from "../../../lib/format.js";
import { CreditLine, creditOf } from "../../../lib/Credit.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { languageTag } from "../../../lib/locale.js";
import { RichText } from "../../../lib/RichText.js";
import { Styles } from "../../../lib/Styles.js";
import cards from "../shared/cards.module.css";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./brief.module.css";

/** The page language as a BCP 47 tag ("en", "fr"). */
const useLanguage = () => {
  const { currentResource } = useServerContext();
  return languageTag(currentResource.getLocale());
};

/**
 * The facts of a brief as a description list: deadline, kinds of media wanted, quantity and, on
 * the brief's page, what the media will be used for. A fact the editor left empty is not shown.
 */
const Facts = ({ props, withUsage }: { props: Props; withUsage: boolean }) => {
  const t = useT();
  const language = useLanguage();
  const deadline = props.deadline;
  const media = knownValues(props.mediaWanted, MEDIA_WANTED);
  const usage = withUsage ? knownValues(props.usage, USAGES) : [];
  const quantity = typeof props.quantity === "number" && props.quantity > 0 ? props.quantity : 0;
  if (!deadline && media.length === 0 && quantity === 0 && usage.length === 0) return null;
  return (
    <dl className={classes.facts}>
      {deadline && isoDay(deadline) && (
        <div>
          <dt>{t("brief.deadline")}</dt>
          <dd>
            <time dateTime={isoDay(deadline)}>{formatDate(deadline, language)}</time>
          </dd>
        </div>
      )}
      {media.length > 0 && (
        <div>
          <dt>{t("brief.mediaWanted")}</dt>
          <dd>{media.map((kind) => t(`brief.media.${kind}`)).join(", ")}</dd>
        </div>
      )}
      {quantity > 0 && (
        <div>
          <dt>{t("brief.quantity")}</dt>
          <dd>{quantity}</dd>
        </div>
      )}
      {usage.length > 0 && (
        <div>
          <dt>{t("brief.usage")}</dt>
          <dd>{usage.map((use) => t(`brief.use.${use}`)).join(", ")}</dd>
        </div>
      )}
    </dl>
  );
};

/**
 * Reads the form a brief points at (`submissionForm`), for the slot below. "none": the brief has no
 * form; "unavailable": one is set but is not a Formidable form, or the visitor cannot read it (it
 * was deleted, is not published yet, or is restricted: a weakreference to such a node comes back
 * unset); otherwise the form, contextualized the way Formidable's own form reference renders it.
 */
const readSubmissionForm = (
  currentNode: JCRNodeWrapper,
  form: JCRNodeWrapper | undefined,
): { state: "none" } | { state: "unavailable" } | { state: "ready"; node: JCRNodeWrapper } => {
  if (!currentNode.hasProperty("submissionForm")) return { state: "none" };
  if (!form || !form.isNodeType(FORM_NODE_TYPE)) return { state: "unavailable" };
  try {
    return {
      state: "ready",
      node: currentNode.getProperty("submissionForm").getContextualizedNode(),
    };
  } catch {
    return { state: "unavailable" };
  }
};

/**
 * The submission form of a brief, under the facts and the description. While the brief is open and
 * `submissionForm` points at a Formidable form (`fmdb:form`) the visitor can read, the form is
 * rendered under a level-2 heading, through `<Render>` of the contextualized node as Formidable's
 * own form reference does: the form is a client island that posts from this page, so its request
 * carries the brief's page as Referer (the Formidable action resolves the brief from it). A closed
 * brief shows a short text instead. Without a readable form nothing is shown, and in edit mode a
 * notice says what is missing. The form is a cache dependency of the page (it is read through the
 * brief's own fragment, which holds no per-visitor data: the form's markup is the same for every
 * visitor and its island decides everything else in the browser).
 */
const SubmissionSlot = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const form = readSubmissionForm(currentNode, props.submissionForm);
  const state = submissionSlotState(props.briefStatus, form.state === "ready");
  if (state === "none") {
    if (!renderContext.isEditMode()) return null;
    return (
      <p className={classes.editNote}>
        {t(form.state === "unavailable" ? "brief.formUnavailable" : "brief.noForm")}
      </p>
    );
  }
  if (form.state !== "ready") return null;
  server.render.addCacheDependency({ node: form.node }, renderContext);
  return (
    <section
      className={classes.answer}
      aria-labelledby="ctmd-brief-answer"
      data-testid="ctmd-brief-answer"
    >
      <h2 id="ctmd-brief-answer" className={classes.answerTitle}>
        {t("brief.answer")}
      </h2>
      {state === "closed" ? (
        <p data-testid="ctmd-brief-closed">{t("brief.closedForm")}</p>
      ) : (
        <Render node={form.node} readOnly />
      )}
    </section>
  );
};

/**
 * The brief's own page, inside the main-resource template of classic-templates (header, footer,
 * `<title>`). It owns the page's only `<h1>`: the title. Then, for a closed brief, a notice and a
 * badge; the facts (deadline, media wanted, quantity, intended use); the reference picture, with
 * the alternative text of its title in the media library; the description; and the place of the
 * submission form (SubmissionSlot).
 */
export const BriefFull = ({ props }: { props: Props }) => {
  const t = useT();
  const { renderContext } = useServerContext();
  const title = props["jcr:title"];
  const closed = briefStatusOf(props.briefStatus) === "closed";
  return (
    <article
      className={classes.full}
      data-testid="ctmd-brief-full"
      data-ctmd-status={closed ? "closed" : "open"}
    >
      <Styles />
      <header className={classes.head}>
        {closed && (
          <p className={classes.meta}>
            <span className={cards.badge}>{t("brief.status.closed")}</span>
          </p>
        )}
        {title ? <h1 className={classes.title}>{title}</h1> : <Untitled />}
        {closed && <p className={classes.notice}>{t("brief.closedNotice")}</p>}
      </header>
      <Facts props={props} withUsage />
      {props.referenceImage && (
        <figure className={classes.reference} data-testid="ctmd-brief-reference">
          <Image node={props.referenceImage} renderContext={renderContext} priority />
          <figcaption>
            {t("brief.reference")}
            <CreditLine credit={creditOf(props.referenceImage, renderContext)} />
          </figcaption>
        </figure>
      )}
      <RichText html={props.description} className={classes.body} headingLevel={2} />
      <SubmissionSlot props={props} />
      {renderContext.isEditMode() && !props.description && (
        <p className={classes.editNote}>{t("brief.noDescription")}</p>
      )}
    </article>
  );
};

/**
 * A card (brief list, a supplier's page): the linked title, the deadline, the kinds of media wanted
 * and the quantity, and a "Closed" badge, as text, for a closed brief. The whole card is clickable.
 */
export const BriefCard = ({ props }: { props: Props }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const closed = briefStatusOf(props.briefStatus) === "closed";
  return (
    <article
      className={cards.card}
      data-testid="ctmd-brief-card"
      data-ctmd-status={closed ? "closed" : "open"}
    >
      <Styles />
      <div className={cards.body}>
        {closed && <span className={cards.badge}>{t("brief.status.closed")}</span>}
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
        <Facts props={props} withUsage={false} />
      </div>
    </article>
  );
};

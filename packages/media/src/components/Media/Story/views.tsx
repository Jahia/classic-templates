import { Render, buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { formatDate, isoDay, readingMinutes } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { JsonLd, useAbsoluteUrl } from "../../../lib/JsonLd.js";
import { languageTag } from "../../../lib/locale.js";
import { categoryIdsOf, categoryTitlesOf, runQuery, storyAuthors } from "../../../lib/media.js";
import { readReference, readString } from "../../../lib/props.js";
import { RichText } from "../../../lib/RichText.js";
import { buildStoryLd } from "../../../lib/schema.js";
import { related } from "../../../lib/select.js";
import { Styles } from "../../../lib/Styles.js";
import cards from "../shared/cards.module.css";
import { Byline, ShareBox, useFormatLabel } from "../shared/parts.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./story.module.css";

/** Related stories shown under a story, at most; candidates read before ranking. */
const MAX_RELATED = 3;
const RELATED_CANDIDATES = 60;

/** Formats read as text: they show a reading time. */
const TEXT_FORMATS = new Set(["news", "feature", "opinion", "interview", "report"]);

/** True for a story switched to "Members only" (ctplmix:membersOnly of classic-templates). */
const isMembersOnly = (node: JCRNodeWrapper) =>
  node.hasProperty("ctplMembersOnly") && node.getProperty("ctplMembersOnly").getBoolean();

/** The page language as a BCP 47 tag ("en", "fr"). */
const useLanguage = () => {
  const { currentResource } = useServerContext();
  return languageTag(currentResource.getLocale());
};

/** The "Members" badge of a card. */
const MembersBadge = () => {
  const t = useT();
  return <span className={cards.badge}>{t("story.membersLabel")}</span>;
};

/** Format label, date, and for text formats the reading time. */
const Meta = ({ props, withReading }: { props: Props; withReading: boolean }) => {
  const t = useT();
  const language = useLanguage();
  const formatLabel = useFormatLabel()(props.format);
  const date = props.publicationDate;
  return (
    <p className={classes.meta}>
      {formatLabel && <span className={cards.kind}>{formatLabel}</span>}
      {date && <time dateTime={isoDay(date)}>{formatDate(date, language)}</time>}
      {withReading && TEXT_FORMATS.has(props.format ?? "news") && (
        <span>{t("story.readingTime", { count: readingMinutes(props.body) })}</span>
      )}
    </p>
  );
};

/** The site's sign-in page (classic-templates header setting), when it has one. */
const signInPage = (
  node: JCRNodeWrapper,
  renderContext: RenderContext,
): JCRNodeWrapper | undefined => {
  try {
    const header = node.getResolveSite().getHome().getNode("siteHeader/header");
    server.render.addCacheDependency({ node: header }, renderContext);
    return readReference(header, "signInPage");
  } catch {
    return undefined;
  }
};

/** Stories sharing the most categories with `story`, newest first among equals. */
const relatedStories = (story: JCRNodeWrapper, renderContext: RenderContext): JCRNodeWrapper[] => {
  const categories = categoryIdsOf(story);
  if (categories.length === 0) return [];
  const session = story.getSession();
  const candidates = runQuery({
    session,
    renderContext,
    type: "ctmd:story",
    start: story.getResolveSite(),
    order: "newest",
    categories,
    locale: session.getLocale(),
    limit: RELATED_CANDIDATES,
  }).map((node) => ({
    id: node.getIdentifier(),
    node,
    categories: categoryIdsOf(node),
    published: readString(node, "publicationDate"),
  }));
  return related({ id: story.getIdentifier(), categories }, candidates, MAX_RELATED).map(
    (c) => c.node,
  );
};

/** The media of a story page: a video (js-media-gallery), an audio player, or the image. */
const StoryMedia = ({ props, node }: { props: Props; node: JCRNodeWrapper }) => {
  const t = useT();
  const { renderContext } = useServerContext();
  if (props.format === "video" && props.video) {
    return (
      <div className={classes.media} data-testid="ctmd-story-video">
        {/* The video's title is the first heading under the story's h1. */}
        <Render node={props.video} parameters={{ headingLevel: "2" }} />
      </div>
    );
  }
  if (props.format === "podcast" && props.audio) {
    return (
      <figure className={classes.media} data-testid="ctmd-story-audio">
        {props.image && (
          <Image node={props.image} owner={node} renderContext={renderContext} priority />
        )}
        <figcaption className={classes.listen}>{t("story.listen")}</figcaption>
        <audio className={classes.audio} controls preload="none" src={buildNodeUrl(props.audio)} />
      </figure>
    );
  }
  if (props.image) {
    return (
      <figure className={classes.media}>
        <Image node={props.image} owner={node} renderContext={renderContext} priority />
      </figure>
    );
  }
  return null;
};

/** The story's header: meta line, the page's `<h1>`, the lead, the byline. */
const StoryHead = ({ props, node }: { props: Props; node: JCRNodeWrapper }) => {
  const { renderContext } = useServerContext();
  const title = props["jcr:title"];
  return (
    <header className={classes.head}>
      <Meta props={props} withReading />
      {title ? <h1 className={classes.title}>{title}</h1> : <Untitled />}
      {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
      <p className={classes.byline}>
        <Byline people={storyAuthors(node, renderContext)} />
      </p>
    </header>
  );
};

/**
 * What a visitor who is not signed in gets of a members-only story: its public face (meta, title,
 * lead, byline, image), a notice and a link to the site's sign-in page. The body, the media and the
 * transcript are never rendered here.
 */
const RestrictedStory = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const signIn = signInPage(currentNode, renderContext);
  return (
    <article className={`ctpl-container ${classes.full}`} data-testid="ctmd-story-restricted">
      <Styles />
      <StoryHead props={props} node={currentNode} />
      {props.image && (
        <figure className={classes.media}>
          <Image node={props.image} owner={currentNode} renderContext={renderContext} priority />
        </figure>
      )}
      <div className={classes.notice}>
        <p>{t("story.membersNotice")}</p>
        {signIn && (
          <p>
            <a className={classes.signIn} href={buildNodeUrl(signIn)}>
              {t("story.signIn")}
            </a>
          </p>
        )}
      </div>
    </article>
  );
};

/**
 * The story's own page, inside the main-resource template of classic-templates (header, footer,
 * `<title>`, meta description from the teaser). It owns the page's only `<h1>`: the title. Then the
 * byline (each author a link to their page), the share box, the media (video, audio or image), the
 * body, the transcript in a disclosure, the topics, the related stories as cards, and the story's
 * JSON-LD.
 *
 * `perUser` says the view is cached per user ("fullPageMembers"): the only place the page may tell
 * visitors apart. A members-only story gets its body there for a signed-in visitor or an editor,
 * and its teaser page for anyone else; the shared "fullPage" never renders such a body.
 */
export const StoryFull = ({ props, perUser = false }: { props: Props; perUser?: boolean }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const toAbsolute = useAbsoluteUrl();
  const language = useLanguage();
  const membersOnly = isMembersOnly(currentNode);
  const open =
    !membersOnly || (perUser && (renderContext.isLoggedIn() || renderContext.isEditMode()));
  if (!open) return <RestrictedStory props={props} />;
  const id = currentNode.getIdentifier();
  const title = props["jcr:title"];
  const url = toAbsolute(buildNodeUrl(currentNode));
  const topics = categoryTitlesOf(currentNode, renderContext);
  const relatedItems = relatedStories(currentNode, renderContext);
  const authors = storyAuthors(currentNode, renderContext);
  return (
    <article className={`ctpl-container ${classes.full}`} data-testid="ctmd-story-full">
      <Styles />
      {membersOnly && renderContext.isEditMode() && (
        <p className={classes.editNote}>{t("story.membersEdit")}</p>
      )}
      <StoryHead props={props} node={currentNode} />
      <ShareBox url={url} title={title} />
      <StoryMedia props={props} node={currentNode} />
      <RichText html={props.body} className={classes.body} headingLevel={2} />
      {props.transcript && (
        <details className={classes.transcript} data-testid="ctmd-story-transcript">
          <summary>{t("story.transcript")}</summary>
          <RichText html={props.transcript} headingLevel={3} />
        </details>
      )}
      {topics.length > 0 && (
        <section className={classes.topics} aria-labelledby={`ctmd-topics-${id}`}>
          <h2 id={`ctmd-topics-${id}`} className={classes.topicsTitle}>
            {t("story.topics")}
          </h2>
          <ul className={classes.topicList}>
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      )}
      {relatedItems.length > 0 && (
        <section className={classes.related} aria-labelledby={`ctmd-related-${id}`}>
          <h2 id={`ctmd-related-${id}`}>{t("story.related")}</h2>
          <ul className={cards.grid}>
            {relatedItems.map((node) => (
              <li key={node.getIdentifier()}>
                <Render node={node} view="card" parameters={{ headingLevel: "3" }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {title && (
        <JsonLd
          data={buildStoryLd({
            url,
            headline: title,
            format: props.format,
            description: props.teaser,
            image: props.image ? toAbsolute(buildNodeUrl(props.image)) : undefined,
            datePublished: isoDay(props.publicationDate),
            authors: authors.map((a) => ({
              name: a.name ?? "",
              url: toAbsolute(buildNodeUrl(a.node)),
            })),
            language,
            audio:
              props.format === "podcast" && props.audio
                ? toAbsolute(buildNodeUrl(props.audio))
                : undefined,
            free: !membersOnly,
          })}
        />
      )}
    </article>
  );
};

/**
 * A card (story feed, content list, related stories): image, format and date, the linked title,
 * the teaser, the authors' names (plain text: the whole card is one link), a "Members" badge for a
 * members-only story. The image is decorative (the title says it all).
 */
export const StoryCard = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  return (
    <article className={cards.card} data-testid="ctmd-story-card">
      <Styles />
      {props.image && (
        <div className={cards.media}>
          <Image node={props.image} renderContext={renderContext} decorative />
        </div>
      )}
      <div className={cards.body}>
        <Meta props={props} withReading={false} />
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
        {props.teaser && <p className={cards.teaser}>{props.teaser}</p>}
        <p className={cards.meta}>
          <Byline people={storyAuthors(currentNode, renderContext)} linked={false} />
        </p>
        {isMembersOnly(currentNode) && <MembersBadge />}
      </div>
    </article>
  );
};

/** A compact row (compact list): format and date, the linked title, the authors. */
export const StoryCompact = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  return (
    <article className={cards.compact} data-testid="ctmd-story-compact">
      <Styles />
      <Meta props={props} withReading={false} />
      <Heading level={level} className={cards.compactTitle}>
        <a href={buildNodeUrl(currentNode)}>{title}</a>
      </Heading>
      <p className={cards.meta}>
        <Byline people={storyAuthors(currentNode, renderContext)} linked={false} />
      </p>
    </article>
  );
};

/** A tile (card grid shown as tiles): format and the linked title, no image. */
export const StoryTile = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  return (
    <article className={`${cards.card} ${classes.tile}`} data-testid="ctmd-story-tile">
      <Styles />
      <div className={cards.body}>
        <Meta props={props} withReading={false} />
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
      </div>
    </article>
  );
};

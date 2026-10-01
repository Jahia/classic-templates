import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { formatDate, isoDay } from "../../../lib/dates.js";
import { type ItemLabelMode, chooseItemLabel, itemLabelMode } from "../../../lib/itemLabel.js";
import { Image } from "../../../lib/Image.js";
import { readString as str } from "../../../lib/props.js";
import { RichText } from "../../../lib/RichText.js";
import { headingTag, type HeadingTag } from "../../../lib/Heading.js";
import { Tile } from "../../../lib/Tile.js";
import classes from "./editorial.module.css";
import { languageTag } from "../../../lib/locale.js";

/** Props shared by ctpl:news and ctpl:article (ctplmix:editorialItem + mix:title). */
export interface EditorialProps {
  "jcr:title"?: string;
  "teaser"?: string;
  "body"?: string;
  "publicationDate"?: string;
  "image"?: JCRNodeWrapper;
  /** Text alternative for this use of the image (ctplmix:media); defaults to its title. */
  "imageAlt"?: string;
  "imageDecorative"?: boolean;
  "author"?: string;
}

export type Kind = "news" | "article";

/** Publication date, or the creation date when the editor left it empty. */
const dateOf = (node: JCRNodeWrapper, publicationDate?: string) =>
  publicationDate || str(node, "jcr:created");

/** Text of an HTML string with its tags dropped, in one linear pass (no backtracking regex). */
const textOf = (html: string) => {
  let out = "";
  let inTag = false;
  for (const ch of html) {
    if (ch === "<" || ch === ">") {
      inTag = ch === "<";
      out += " ";
    } else if (!inTag) {
      out += ch;
    }
  }
  return out;
};

/** Minutes of reading at 200 words a minute, at least 1. */
const readingMinutes = (html?: string) => {
  const words = textOf(html ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/**
 * Titles of the item's categories (j:defaultCategory, which Jahia offers on every node), in their
 * order, in the session's language. A category without a title there shows its name with
 * `withNames` (topics), and is left out otherwise (item labels, which then fall back to the type).
 * Each category is a cache dependency: renaming or translating it refreshes the pages that show it.
 */
export const categoryTitlesOf = (
  node: JCRNodeWrapper,
  renderContext: RenderContext,
  withNames = false,
): string[] => {
  const titles: string[] = [];
  if (!node.hasProperty("j:defaultCategory")) return titles;
  for (const value of node.getProperty("j:defaultCategory").getValues()) {
    try {
      const category = (value as unknown as { getNode(): JCRNodeWrapper }).getNode();
      server.render.addCacheDependency({ node: category }, renderContext);
      const title = str(category, "jcr:title") ?? (withNames ? category.getName() : undefined);
      if (title) titles.push(title);
    } catch {
      // category deleted or not readable here
    }
  }
  return titles;
};

/** Tags (j:tagList) and category titles, shown as the item's topics. */
const topicsOf = (node: JCRNodeWrapper, renderContext: RenderContext): string[] => {
  const topics = categoryTitlesOf(node, renderContext, true);
  if (node.hasProperty("j:tagList")) {
    for (const value of node.getProperty("j:tagList").getValues()) {
      const tag = (value as unknown as { getString(): string }).getString();
      if (tag && !topics.includes(tag)) topics.push(tag);
    }
  }
  return topics;
};

/**
 * The label mode the list rendering the item asks for (Render parameter "itemLabel", set by a
 * content list); "type" anywhere else, the full page included.
 */
const useItemLabelMode = (): ItemLabelMode => {
  const { currentResource } = useServerContext();
  try {
    return itemLabelMode(String(currentResource.getModuleParams().get("itemLabel")));
  } catch {
    return "type";
  }
};

const Meta = ({
  kind,
  node,
  props,
}: {
  kind: Kind;
  node: JCRNodeWrapper;
  props: EditorialProps;
}) => {
  const { t } = useTranslation();
  const { currentResource, renderContext } = useServerContext();
  const mode = useItemLabelMode();
  const lang = languageTag(currentResource.getLocale());
  const iso = dateOf(node, props.publicationDate);
  const label = chooseItemLabel(
    mode,
    t(`editorial.${kind}`),
    mode === "category" ? categoryTitlesOf(node, renderContext) : [],
  );
  return (
    <p className={classes.meta}>
      {label && <span className={classes.kind}>{label}</span>}
      {iso && <time dateTime={isoDay(iso)}>{formatDate(iso, lang)}</time>}
      {kind === "article" && props.author && (
        <span>
          {t("editorial.by", { author: props.author, interpolation: { escapeValue: false } })}
        </span>
      )}
      {kind === "article" && (
        <span>{t("editorial.readingTime", { count: readingMinutes(props.body) })}</span>
      )}
    </p>
  );
};

/** Shown in edit mode instead of an item that has no title in this language. */
const Untitled = () => {
  const { t } = useTranslation();
  const { renderContext } = useServerContext();
  return renderContext.isEditMode() ? (
    <p className={classes.missing}>{t("editorial.noTitle")}</p>
  ) : null;
};

/** The item's own page (rendered inside the main-resource template, which owns header and footer). */
export const FullPage = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { t } = useTranslation();
  const { currentNode, renderContext } = useServerContext();
  const topics = topicsOf(currentNode, renderContext);
  const title = props["jcr:title"];
  return (
    <article className={classes.full} data-testid={`ctpl-${kind}-full`}>
      <header className={`ctpl-container ${classes.head}`}>
        <Meta kind={kind} node={currentNode} props={props} />
        {title ? <h1 className={classes.fullTitle}>{title}</h1> : <Untitled />}
        {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
      </header>
      {props.image && (
        <figure className={`ctpl-container ${classes.figure}`}>
          <Image node={props.image} owner={currentNode} renderContext={renderContext} priority />
        </figure>
      )}
      <div className="ctpl-container">
        <RichText html={props.body} className={classes.body} />
        {topics.length > 0 && (
          <section
            className={classes.topics}
            aria-labelledby={`ctpl-topics-${currentNode.getIdentifier()}`}
          >
            <h2 id={`ctpl-topics-${currentNode.getIdentifier()}`} className={classes.topicsTitle}>
              {t("editorial.topics")}
            </h2>
            <ul className={classes.topicList}>
              {topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
};

/**
 * Heading level asked by the list rendering the item: one below the list's own heading, or the
 * list's level when it has none. Clamped to h2-h6; rendered anywhere else, an item is an h3.
 */
const useHeadingTag = (): HeadingTag => {
  const { currentResource } = useServerContext();
  try {
    const level = Number(String(currentResource.getModuleParams().get("headingLevel")));
    return headingTag(level || 3);
  } catch {
    return "h3";
  }
};

/** A card in a grid: image, meta, linked title, teaser. The whole card is clickable. */
export const Card = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { currentNode, renderContext } = useServerContext();
  const Heading = useHeadingTag();
  // No empty link in a list: an item untitled in this language is skipped.
  if (!props["jcr:title"]) return <Untitled />;
  return (
    <article className={classes.card} data-testid={`ctpl-${kind}-card`}>
      {props.image && (
        <div className={classes.cardMedia}>
          <Image node={props.image} renderContext={renderContext} decorative />
        </div>
      )}
      <div className={classes.cardBody}>
        <Meta kind={kind} node={currentNode} props={props} />
        <Heading className={classes.cardTitle}>
          <a className={classes.stretched} href={buildNodeUrl(currentNode)}>
            {props["jcr:title"]}
          </a>
        </Heading>
        {props.teaser && <p className={classes.teaser}>{props.teaser}</p>}
      </div>
    </article>
  );
};

/** A tile of a card grid's "icon tiles" display: linked title and teaser, no image. */
export const TileView = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { currentNode } = useServerContext();
  const Heading = useHeadingTag();
  if (!props["jcr:title"]) return <Untitled />;
  return (
    <Tile
      heading={props["jcr:title"]}
      headingTag={Heading}
      href={buildNodeUrl(currentNode)}
      text={props.teaser}
      testId={`ctpl-${kind}-tile`}
    />
  );
};

/** A compact row in a list: meta and linked title. */
export const Compact = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { currentNode } = useServerContext();
  const Heading = useHeadingTag();
  if (!props["jcr:title"]) return <Untitled />;
  return (
    <article className={classes.compact} data-testid={`ctpl-${kind}-compact`}>
      <Heading className={classes.compactTitle}>
        <a href={buildNodeUrl(currentNode)}>{props["jcr:title"]}</a>
      </Heading>
      <Meta kind={kind} node={currentNode} props={props} />
    </article>
  );
};

import { buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { formatDate, isoDay } from "../../../lib/dates.js";
import { Image } from "../../../lib/Image.js";
import { RichText } from "../../../lib/RichText.js";
import classes from "./editorial.module.css";

/** Props shared by ctpl:news and ctpl:article (ctplmix:editorialItem + mix:title). */
export interface EditorialProps {
  "jcr:title"?: string;
  "teaser"?: string;
  "body"?: string;
  "publicationDate"?: string;
  "image"?: JCRNodeWrapper;
  "author"?: string;
}

export type Kind = "news" | "article";

const str = (node: JCRNodeWrapper, name: string) =>
  node.hasProperty(name) ? node.getProperty(name).getString() || undefined : undefined;

/** Publication date, or the creation date when the editor left it empty. */
const dateOf = (node: JCRNodeWrapper, publicationDate?: string) =>
  publicationDate || str(node, "jcr:created");

/** Minutes of reading at 200 words a minute, at least 1. */
const readingMinutes = (html?: string) => {
  const words = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

/** Tags (j:tagList) and category titles (j:defaultCategory), which Jahia offers on every node. */
const topicsOf = (node: JCRNodeWrapper): string[] => {
  const topics: string[] = [];
  if (node.hasProperty("j:defaultCategory")) {
    for (const value of node.getProperty("j:defaultCategory").getValues()) {
      try {
        const category = (value as unknown as { getNode(): JCRNodeWrapper }).getNode();
        topics.push(str(category, "jcr:title") ?? category.getName());
      } catch {
        // category deleted or not readable here
      }
    }
  }
  if (node.hasProperty("j:tagList")) {
    for (const value of node.getProperty("j:tagList").getValues()) {
      const tag = (value as unknown as { getString(): string }).getString();
      if (tag && !topics.includes(tag)) topics.push(tag);
    }
  }
  return topics;
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
  const { currentResource } = useServerContext();
  const lang = currentResource.getLocale().getLanguage();
  const iso = dateOf(node, props.publicationDate);
  return (
    <p className={classes.meta}>
      <span className={classes.kind}>{t(`editorial.${kind}`)}</span>
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

/** The item's own page (rendered inside the main-resource template, which owns header and footer). */
export const FullPage = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { t } = useTranslation();
  const { currentNode, renderContext } = useServerContext();
  const topics = topicsOf(currentNode);
  return (
    <article className={classes.full} data-testid={`ctpl-${kind}-full`}>
      <header className={`ctpl-container ${classes.head}`}>
        <Meta kind={kind} node={currentNode} props={props} />
        <h1 className={classes.fullTitle}>{props["jcr:title"]}</h1>
        {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
      </header>
      {props.image && (
        <figure className={`ctpl-container ${classes.figure}`}>
          <Image node={props.image} renderContext={renderContext} priority />
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

/** Heading level asked by the list rendering the card (h3 under a titled list, else h2). */
const useHeadingTag = (): "h2" | "h3" => {
  const { currentResource } = useServerContext();
  try {
    const level = currentResource.getModuleParams().get("headingLevel");
    return String(level) === "2" ? "h2" : "h3";
  } catch {
    return "h3";
  }
};

/** A card in a grid: image, meta, linked title, teaser. The whole card is clickable. */
export const Card = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { currentNode, renderContext } = useServerContext();
  const Heading = useHeadingTag();
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

/** A compact row in a list: meta and linked title. */
export const Compact = ({ kind, props }: { kind: Kind; props: EditorialProps }) => {
  const { currentNode } = useServerContext();
  const Heading = useHeadingTag();
  return (
    <article className={classes.compact} data-testid={`ctpl-${kind}-compact`}>
      <Heading className={classes.compactTitle}>
        <a href={buildNodeUrl(currentNode)}>{props["jcr:title"]}</a>
      </Heading>
      <Meta kind={kind} node={currentNode} props={props} />
    </article>
  );
};

import {
  Render,
  RenderChildren,
  getChildNodes,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading, headingTag, useItemHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { readString } from "../../../lib/props.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { Section } from "../../../lib/Section.js";
import type { CardProps, ContentTeaserProps, Props } from "./types.js";
import classes from "./card-grid.module.css";

/** The news item or article a teaser shows, when it resolves here and has a title. */
const teaserTarget = (teaser: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    if (!teaser.hasProperty("j:node")) return undefined;
    const target = teaser.getProperty("j:node").getNode() as JCRNodeWrapper;
    return readString(target, "jcr:title") ? target : undefined;
  } catch {
    return undefined; // deleted, or not published / not readable in this workspace
  }
};

/** A written card shows something when it has a heading (own or lent by its link), text or image. */
const cardShows = (card: JCRNodeWrapper) =>
  Boolean(
    readString(card, "jcr:title") ||
    readString(card, "text") ||
    card.hasProperty("image") ||
    resolveLink(card).link?.targetTitle,
  );

/** True when at least one child renders on the live site: the same tests as the child views. */
const hasVisibleCard = (grid: JCRNodeWrapper) =>
  getChildNodes(grid, -1, 0, (n: JCRNodeWrapper) =>
    n.isNodeType("ctpl:card")
      ? cardShows(n)
      : n.isNodeType("ctpl:contentTeaser") && teaserTarget(n) !== undefined,
  ).length > 0;

/**
 * A section of hand-picked cards: written cards and teasers of existing news items or articles,
 * in the editor's order, 2 to 4 per row on large screens. Card titles are one level below the
 * section's heading. Nothing is rendered on the live site while the grid has no card.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:cardGrid", displayName: "Card grid" },
  (
    { "jcr:title": title, columns, introText, ctplSurface }: Props,
    { currentNode, renderContext },
  ) => {
    if (!renderContext.isEditMode() && !hasVisibleCard(currentNode)) return null;
    const headingId = `ctpl-cards-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-card-grid"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          {introText && <p className={classes.intro}>{introText}</p>}
          <ul
            className={[classes.grid, classes[`cols${columns ?? "3"}`]].filter(Boolean).join(" ")}
          >
            <RenderChildren />
          </ul>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

/**
 * A written card: image, title, short text. When it has a link, the title link covers the whole
 * card and linkLabel shows as a visual cue; the link's name is the title followed by the label
 * (visually hidden inside the link), so "click See the services" works with voice control. An
 * internal link without a card title uses the target page's title; without any heading there is
 * no link to hang the cue on, so no cue either.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:card", displayName: "Card" },
  ({ "jcr:title": title, text, linkLabel, image }: CardProps, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const Heading = headingTag(useItemHeadingLevel(currentNode));
    const isEdit = renderContext.isEditMode();
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    const heading = title || link?.targetTitle;
    if (!isEdit && !cardShows(currentNode)) return null;
    return (
      <li className={classes.item}>
        <article className={classes.card} data-testid="ctpl-card">
          {image && (
            <div className={classes.media}>
              <Image node={image} renderContext={renderContext} decorative />
            </div>
          )}
          <div className={classes.body}>
            {heading ? (
              <Heading className={classes.title}>
                {link ? (
                  <a className={classes.stretched} href={link.href}>
                    {heading}
                    {linkLabel && <span className="ctpl-visually-hidden">: {linkLabel}</span>}
                  </a>
                ) : (
                  heading
                )}
              </Heading>
            ) : (
              isEdit && <p className="ctpl-edit-hint">{t("cards.noTitle")}</p>
            )}
            {text && <p className={classes.text}>{text}</p>}
            {link && heading && linkLabel && (
              <span className={classes.more} aria-hidden="true">
                {linkLabel}
              </span>
            )}
            {isEdit && missingTarget && <p className="ctpl-edit-hint">{t("link.noTarget")}</p>}
          </div>
        </article>
      </li>
    );
  },
);

/**
 * A teaser of an existing news item or article, rendered with that item's own card view (so it
 * follows the item's edits), with the heading level of the grid's cards.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:contentTeaser", displayName: "Content teaser" },
  (_props: ContentTeaserProps, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const level = useItemHeadingLevel(currentNode);
    const target = teaserTarget(currentNode);
    if (!target) {
      return renderContext.isEditMode() ? (
        <li className={classes.item}>
          <p className="ctpl-edit-hint">{t("cards.teaserMissing")}</p>
        </li>
      ) : null;
    }
    return (
      <li className={classes.item} data-testid="ctpl-content-teaser">
        <Render node={target} view="card" parameters={{ headingLevel: String(level) }} />
      </li>
    );
  },
);

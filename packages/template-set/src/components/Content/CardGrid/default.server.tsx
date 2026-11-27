import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { headingTag, useItemHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { CardGridSection } from "./CardGridSection.js";
import { cardShows, teaserTarget } from "./cards.js";
import { displayOf } from "./display.js";
import type { CardProps, ContentTeaserProps, Props } from "./types.js";
import classes from "./card-grid.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/**
 * A section of hand-picked cards: written cards and teasers of existing news items or articles,
 * in the editor's order, 2 to 4 per row on large screens. Card titles are one level below the
 * section's heading. Nothing is rendered on the live site while the grid has no card.
 *
 * This view draws the cards (image, title, text, with the card views below); the other renderings
 * are views of their own, chosen in Layout > Select a view: "iconTiles" (iconTiles.server.tsx) and
 * "logos" (logos.server.tsx).
 *
 * `display` is the legacy choice of the rendering (hidden since 0.13.0): a grid that still says
 * "iconTiles" or "logos" (not moved to j:view yet by scripts/migrate-views.groovy, live until its
 * next publication, an older site export) keeps its look.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:cardGrid", displayName: "Card grid" },
  (props: Props, { currentNode, renderContext }) => (
    <CardGridSection
      display={displayOf(props.display)}
      props={props}
      currentNode={currentNode}
      renderContext={renderContext}
    />
  ),
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
    const { t } = useTranslation("classic-templates");
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
              isEdit && <EditNote>{t("cards.noTitle")}</EditNote>
            )}
            {text && <p className={classes.text}>{text}</p>}
            {link && heading && linkLabel && (
              <span className={classes.more} aria-hidden="true">
                {linkLabel}
              </span>
            )}
            {isEdit && missingTarget && <EditNote>{t("link.noTarget")}</EditNote>}
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
    const { t } = useTranslation("classic-templates");
    const level = useItemHeadingLevel(currentNode);
    const target = teaserTarget(currentNode);
    if (!target) {
      return renderContext.isEditMode() ? (
        <li className={classes.item}>
          <EditNote>{t("cards.teaserMissing")}</EditNote>
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

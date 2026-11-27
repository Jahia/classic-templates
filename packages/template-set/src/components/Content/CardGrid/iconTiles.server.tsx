import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { headingTag, useItemHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { Tile } from "../../../lib/Tile.js";
import { cardShows, teaserTarget } from "./cards.js";
import { CardGridSection } from "./CardGridSection.js";
import type { CardProps, ContentTeaserProps, Props } from "./types.js";
import classes from "./card-grid.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/**
 * The card grid as outlined icon tiles ("Icon tiles" in Layout > Select a view): each written card
 * is a square tile with its image as a small icon, the title and the text, the whole tile being
 * the link; a teaser shows the item's own "tile" view. The cards are rendered with the views of
 * this file.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:cardGrid",
    name: "iconTiles",
    displayName: "Card grid, icon tiles",
  },
  (props: Props, { currentNode, renderContext }) => (
    <CardGridSection
      display="iconTiles"
      props={props}
      currentNode={currentNode}
      renderContext={renderContext}
    />
  ),
);

/**
 * A written card as an outlined icon tile: the card image as a small decorative icon, the title,
 * the short text. With a link, the whole tile is the link, named by the title; the link label is
 * not shown (a tile has no room for it, and the name stays the visible title).
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:card", name: "iconTiles", displayName: "Icon tile" },
  ({ "jcr:title": title, text, image }: CardProps, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const level = useItemHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    const heading = title || link?.targetTitle;
    if (!isEdit && !cardShows(currentNode)) return null;
    return (
      <li className={classes.item}>
        <Tile
          heading={heading}
          headingTag={headingTag(level)}
          href={heading ? link?.href : undefined}
          text={text}
          icon={image && <Image node={image} renderContext={renderContext} decorative />}
          testId="ctpl-icon-tile"
        >
          {isEdit && !heading && <EditNote>{t("cards.noTitle")}</EditNote>}
          {isEdit && missingTarget && <EditNote>{t("link.noTarget")}</EditNote>}
        </Tile>
      </li>
    );
  },
);

/** A teaser of a news item or article as a tile: the item's own "tile" view (title, teaser). */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:contentTeaser",
    name: "iconTiles",
    displayName: "Content tile",
  },
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
        <Render node={target} view="tile" parameters={{ headingLevel: String(level) }} />
      </li>
    );
  },
);

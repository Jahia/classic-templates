import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { headingTag, useItemHeadingLevel } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import { readString } from "../../../lib/props.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { Tile } from "../../../lib/Tile.js";
import { cardShows, teaserTarget } from "./cards.js";
import type { CardProps, ContentTeaserProps } from "./types.js";
import classes from "./card-grid.module.css";

/*
 * The card grid's other displays: the grid renders its children with the view named after its
 * display ("iconTiles" or "logos"), so each card is drawn by one of the views below.
 */

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
          {isEdit && !heading && <p className="ctpl-edit-hint">{t("cards.noTitle")}</p>}
          {isEdit && missingTarget && <p className="ctpl-edit-hint">{t("link.noTarget")}</p>}
        </Tile>
      </li>
    );
  },
);

/**
 * A written card as one logo of a strip: the image only. Its text alternative is the card's
 * "Text alternative", else the card title, else the image's title in the library; a decorative
 * logo is skipped by screen readers, unless it is linked (a link needs a name). A card without
 * an image shows nothing on the live site.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:card", name: "logos", displayName: "Logo" },
  ({ "jcr:title": title, image, imageAlt }: CardProps, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const isEdit = renderContext.isEditMode();
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    if (!image) {
      return isEdit ? (
        <li className={classes.logoItem}>
          <p className="ctpl-edit-hint">{t("cards.logoMissing")}</p>
        </li>
      ) : null;
    }
    const alt = imageAlt || title || readString(image, "jcr:title");
    const decorative = !link && readString(currentNode, "imageDecorative") === "true";
    const logo = (
      <Image node={image} renderContext={renderContext} alt={alt} decorative={decorative} />
    );
    return (
      <li className={classes.logoItem} data-testid="ctpl-logo">
        {link ? (
          <a className={classes.logo} href={link.href}>
            {logo}
          </a>
        ) : (
          <span className={classes.logo}>{logo}</span>
        )}
        {isEdit && missingTarget && <p className="ctpl-edit-hint">{t("link.noTarget")}</p>}
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
          <p className="ctpl-edit-hint">{t("cards.teaserMissing")}</p>
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

/** A logo strip has no place for a teaser: nothing on the live site, a hint in edit mode. */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:contentTeaser", name: "logos", displayName: "Logo" },
  (_props: ContentTeaserProps, { renderContext }) => {
    const { t } = useTranslation("classic-templates");
    return renderContext.isEditMode() ? (
      <li className={classes.logoItem}>
        <p className="ctpl-edit-hint">{t("cards.teaserNotInLogos")}</p>
      </li>
    ) : null;
  },
);

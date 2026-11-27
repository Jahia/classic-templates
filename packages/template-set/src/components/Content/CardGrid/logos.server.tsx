import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { Image } from "../../../lib/Image.js";
import { readString } from "../../../lib/props.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { CardGridSection } from "./CardGridSection.js";
import type { CardProps, ContentTeaserProps, Props } from "./types.js";
import classes from "./card-grid.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/**
 * The card grid as a strip of logos ("Logo strip" in Layout > Select a view): each written card
 * shows its image only, optionally linked; teasers are left out. The cards are rendered with the
 * views of this file.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctpl:cardGrid",
    name: "logos",
    displayName: "Card grid, logo strip",
  },
  (props: Props, { currentNode, renderContext }) => (
    <CardGridSection
      display="logos"
      props={props}
      currentNode={currentNode}
      renderContext={renderContext}
    />
  ),
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
          <EditNote>{t("cards.logoMissing")}</EditNote>
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
        {isEdit && missingTarget && <EditNote>{t("link.noTarget")}</EditNote>}
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
        <EditNote>{t("cards.teaserNotInLogos")}</EditNote>
      </li>
    ) : null;
  },
);

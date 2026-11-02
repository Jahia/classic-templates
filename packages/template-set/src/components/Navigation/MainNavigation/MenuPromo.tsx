import { JImage } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { PromoData } from "../../../lib/navigation.js";
import type { RenderContext } from "org.jahia.services.render";
import { Cta } from "../../../lib/Cta.js";
import { Image } from "../../../lib/Image.js";
import { readString } from "../../../lib/props.js";
import classes from "./main-navigation.module.css";

/** The page's promotion image, or undefined when unset, deleted or not readable here. */
const promoImage = (page: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    return page.hasProperty("image")
      ? (page.getProperty("image").getNode() as JCRNodeWrapper)
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The "Menu promotion" of a top-level page (ctplmix:navPromo) in its mega menu panel: an image, a
 * title, a sentence or two and one call to action, all optional. Nothing renders when none is set.
 *
 * The title is a paragraph, not a heading: the menu comes before the page's one <h1>, and a
 * heading here would break the outline of every page. The image follows the page's ctplmix:media
 * fields (imageAlt, or imageDecorative when the title and the link already say it all); its node is
 * a cache dependency (Image), and the page itself is under home, which the menu depends on.
 */
export const MenuPromo = ({
  page,
  renderContext,
}: {
  page: JCRNodeWrapper;
  renderContext: RenderContext;
}) => {
  const image = promoImage(page);
  const title = readString(page, "promoTitle");
  const text = readString(page, "promoText");
  const linkType = readString(page, "j:linkType");
  const hasCta = linkType !== undefined && linkType !== "none";
  if (!image && !title && !text && !hasCta) return null;

  return (
    <div className={classes.promo} data-testid="ctpl-menu-promo">
      {image && (
        <div className={classes.promoMedia}>
          <Image node={image} owner={page} renderContext={renderContext} />
        </div>
      )}
      {title && <p className={classes.promoTitle}>{title}</p>}
      {text && <p className={classes.promoText}>{text}</p>}
      {hasCta && <Cta node={page} renderContext={renderContext} variant="link" />}
    </div>
  );
};

/**
 * The promotion of a top-level item of a Menu Manager menu, already resolved for the visitor: the
 * same place and look as a page's Menu promotion. The image's text alternative is the one written for
 * the promotion, else the image's title (JImage's default); the button falls back to the item's link.
 */
export const MenuPromoData = ({ promo }: { promo: PromoData }) => (
  <div className={classes.promo} data-testid="ctpl-menu-promo">
    {promo.image && (
      <div className={classes.promoMedia}>
        <JImage src={promo.image} {...(promo.imageAlt ? { alt: promo.imageAlt } : {})} />
      </div>
    )}
    <p className={classes.promoTitle}>{promo.title}</p>
    {promo.text && <p className={classes.promoText}>{promo.text}</p>}
    {promo.href && promo.linkLabel && (
      <a className={classes.promoLink} href={promo.href}>
        {promo.linkLabel}
      </a>
    )}
  </div>
);

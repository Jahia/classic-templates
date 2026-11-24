import { getChildNodes, jahiaComponent, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { innerLevel } from "../../../lib/level.js";
import { hasTag, maxProducts } from "../../../lib/product.js";
import { readStrings } from "../../../lib/props.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import cards from "../shared/cards.module.css";
import { ProductTrack } from "../shared/ProductTrack.js";
import type { Props } from "./types.js";

const PRODUCT = "shopynt:product";

/** The products the carousel shows, and where they came from (for the edit-mode summary). */
const selectProducts = (props: Props, currentNode: JCRNodeWrapper) => {
  const max = maxProducts(props.maxItems);
  const picked = (props.products ?? []).filter((node): node is JCRNodeWrapper => Boolean(node));
  if (picked.length > 0) return { items: picked.slice(0, max), source: "picked" as const };
  if (props.shop) {
    const all = getChildNodes(props.shop, -1, 0, (node) => node.isNodeType(PRODUCT));
    const matching = all.filter((node) => hasTag(readStrings(node, "shopyTags"), props.shopifyTag));
    return { items: matching.slice(0, max), source: "shop" as const, found: all.length };
  }
  const shopMissing = currentNode.hasProperty("shop");
  return { items: [], source: shopMissing ? ("shopMissing" as const) : ("none" as const) };
};

/**
 * A product carousel: picked products (in the editor's order), or the products of a shop folder
 * that carry a Shopify tag, rendered as cards in a row that scrolls sideways. Products are read
 * live from the shop through the shopify-edp connector, which sends no change events to Jahia: the
 * fragment expires after ten minutes so prices and new products show without a publication.
 * Nothing on the live site when no product shows and there is no text for that case.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctcm:productCarousel",
    displayName: "Product carousel",
    properties: { "cache.expiration": "600" },
  },
  (props: Props, { currentNode, renderContext }) => {
    const t = useT();
    const level = useHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const { items, source, found } = { found: 0, ...selectProducts(props, currentNode) };
    if (props.shop) server.render.addCacheDependency({ node: props.shop }, renderContext);
    if (!isEdit && items.length === 0 && !props.noResultText) return null;
    const title = props["jcr:title"];
    const headingId = `ctcm-carousel-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={props.ctplSurface}
        testId="ctcm-product-carousel"
        labelledBy={title ? headingId : undefined}
      >
        <Styles />
        <div className="ctpl-container">
          {title && (
            <Heading level={level} id={headingId}>
              {title}
            </Heading>
          )}
          {isEdit && (
            <p className={cards.panel}>
              {t(`carousel.summary.${source}`, {
                shown: items.length,
                found,
                tag: props.shopifyTag ?? "",
              })}
            </p>
          )}
          {items.length > 0 ? (
            <ProductTrack items={items} headingLevel={innerLevel(level, Boolean(title))} />
          ) : (
            <p className={cards.empty}>{props.noResultText || t("list.empty")}</p>
          )}
          <Cta node={currentNode} renderContext={renderContext} variant="secondary" />
        </div>
      </Section>
    );
  },
);

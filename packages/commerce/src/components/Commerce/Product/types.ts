/**
 * Props of shopynt:product, a product of the shopify-edp connector (read live from Shopify, never
 * stored in Jahia). The names are the connector's (shopify-edp definitions.cnd).
 */
export interface Props {
  /** The product name, as the shop writes it. */
  "jcr:title"?: string;
  /** The product description: HTML written in Shopify, in the shop's primary language. */
  "bodyHtml"?: string;
  /** The description in the page language, from the shop's translations (shopify-edp 1.1+). */
  "description"?: string;
  /** Shopify product type ("Eau de parfum", "Serum"). */
  "productType"?: string;
  /** The brand (Shopify vendor). */
  "vendor"?: string;
  /** The prices of the variants, in the shop's currency. */
  "prices"?: number[];
  /** The shop's currency, ISO 4217 ("AED"). */
  "currency"?: string;
  /** The URL of the product's main image on the Shopify CDN. */
  "posterPath"?: string;
  /** The product's tags in Shopify ("bestseller", "new"). */
  "shopyTags"?: string[];
  /** Shopify GraphQL ids of the variants, used by add to cart. */
  "variantGqlIds"?: string[];
}

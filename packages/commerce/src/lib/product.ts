/**
 * Product helpers for the views of shopify-edp products. Pure functions (no JCR, no React),
 * unit-tested in product.test.ts.
 */

/**
 * The price a card shows: the lowest variant price, marked "from" when the variants do not all
 * cost the same. Undefined when no price is a valid, non-negative number.
 */
export const displayPrice = (
  prices: readonly unknown[] | undefined,
): { amount: number; from: boolean } | undefined => {
  const valid = (prices ?? []).map(Number).filter((price) => Number.isFinite(price) && price >= 0);
  if (valid.length === 0) return undefined;
  const lowest = Math.min(...valid);
  return { amount: lowest, from: valid.some((price) => price !== lowest) };
};

/**
 * The product image URL to put in an <img src>: an https address only. The value comes from
 * another system (the shop), so anything else (http, javascript:, a relative path) is dropped.
 */
export const productImageUrl = (url: string | undefined): string | undefined => {
  const value = url?.trim();
  // A pattern, not `new URL()`: server views run in GraalJS, which has no URL class.
  return value && HTTPS_URL.test(value) ? value : undefined;
};

/** An absolute https address with a host and no space, quote or angle bracket. */
const HTTPS_URL = /^https:\/\/[^\s/"'<>]+(?:\/[^\s"'<>]*)?$/i;

/** Whether a product carries a Shopify tag, compared case-insensitively and trimmed. */
export const hasTag = (tags: readonly string[] | undefined, tag: string | undefined): boolean => {
  const wanted = tag?.trim().toLowerCase();
  if (!wanted) return true;
  return (tags ?? []).some((value) => value.trim().toLowerCase() === wanted);
};

/** The number of products a list shows: the editor's value within 1..24, else 8. */
export const maxProducts = (value: unknown): number => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 24) : 8;
};

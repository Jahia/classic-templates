/**
 * The visitor's bag: items added from product cards and pages, kept in the browser per site, and
 * completed in the shop (a Shopify cart permalink). Pure functions (no DOM, no React), unit-tested
 * in cart.test.ts; the Cart island stores and draws what they return.
 */

/** One line of the bag: a variant of a product, with what the drawer shows. */
export interface CartItem {
  /** The variant's number in the shop ("57672824062024"), the key of the line. */
  variant: string;
  /** The product node's identifier in Jahia (events, links). */
  product: string;
  title: string;
  /** The variant's name ("Travel size"), empty for a product without options. */
  option: string;
  price: number;
  currency: string;
  /** The product page on this site. */
  url: string;
  image: string;
  /** The shop's address, where the bag is completed ("https://<shop>.myshopify.com"). */
  store: string;
  /** The product's tags in the shop, for the visitor's profile. */
  tags: string[];
  quantity: number;
}

/** What an "Add to bag" button carries: an item without its quantity. */
export type CartEntry = Omit<CartItem, "quantity">;

/** The most of one variant a bag holds: a demo cart, not a wholesale order. */
export const MAX_QUANTITY = 20;

const DIGITS = /^\d{1,20}$/;
const HTTPS_ORIGIN = /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i;
const CURRENCY = /^[A-Z]{3}$/;
const SITE_PATH = /^\/(?!\/)[^\s"'<>\\]*$/;
const HTTPS_URL = /^https:\/\/[^\s/"'<>]+(?:\/[^\s"'<>]*)?$/i;

/** The number of a Shopify variant from its GraphQL id ("gid://shopify/ProductVariant/123" -> "123"). */
export const variantNumber = (gid: string | undefined): string | undefined => {
  const value = gid?.slice(gid.lastIndexOf("/") + 1);
  return value && DIGITS.test(value) ? value : undefined;
};

/** The storage key of a site's bag: one bag per site, whatever its language. */
export const storageKey = (siteKey: string) => `ctcm-bag:${siteKey}`;

/**
 * An entry read from a button or from storage, kept only when every field is well formed: the
 * values come from another system or from the visitor's browser, never trusted as they are.
 */
export const validEntry = (value: unknown): CartEntry | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const v = value as Record<string, unknown>;
  const text = (x: unknown) => (typeof x === "string" ? x : "");
  const price = Number(v.price);
  const entry: CartEntry = {
    variant: text(v.variant),
    product: text(v.product),
    title: text(v.title),
    option: text(v.option),
    price,
    currency: text(v.currency),
    url: text(v.url),
    image: text(v.image),
    store: text(v.store),
    tags: Array.isArray(v.tags) ? v.tags.filter((t): t is string => typeof t === "string") : [],
  };
  const ok =
    DIGITS.test(entry.variant) &&
    entry.title.length > 0 &&
    Number.isFinite(price) &&
    price >= 0 &&
    CURRENCY.test(entry.currency) &&
    HTTPS_ORIGIN.test(entry.store) &&
    (entry.url === "" || SITE_PATH.test(entry.url)) &&
    (entry.image === "" || HTTPS_URL.test(entry.image) || SITE_PATH.test(entry.image));
  return ok ? entry : undefined;
};

/** A bag read from storage: the valid lines, quantities between 1 and MAX_QUANTITY. */
export const parseCart = (raw: string | null | undefined): CartItem[] => {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.flatMap((line: unknown) => {
      const entry = validEntry(line);
      const quantity = Math.trunc(Number((line as { quantity?: unknown }).quantity));
      return entry && quantity >= 1
        ? [{ ...entry, quantity: Math.min(quantity, MAX_QUANTITY) }]
        : [];
    });
  } catch {
    return [];
  }
};

/** The bag with one more of a variant (a new line at the end, or the line's quantity plus one). */
export const addItem = (cart: readonly CartItem[], entry: CartEntry): CartItem[] => {
  const line = cart.find((item) => item.variant === entry.variant);
  if (!line) return [...cart, { ...entry, quantity: 1 }];
  return cart.map((item) =>
    item.variant === entry.variant
      ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
      : item,
  );
};

/** The bag with a line's quantity set; 0 or less removes the line. */
export const setQuantity = (
  cart: readonly CartItem[],
  variant: string,
  quantity: number,
): CartItem[] =>
  quantity < 1
    ? cart.filter((item) => item.variant !== variant)
    : cart.map((item) =>
        item.variant === variant
          ? { ...item, quantity: Math.min(Math.trunc(quantity), MAX_QUANTITY) }
          : item,
      );

/** How many items the bag holds (the badge on the button). */
export const itemCount = (cart: readonly CartItem[]) =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

/**
 * The subtotal of each currency in the bag (one in practice: a site sells in one currency), the
 * cents rounded away from floating-point noise.
 */
export const subtotals = (cart: readonly CartItem[]): { currency: string; amount: number }[] => {
  const totals = new Map<string, number>();
  for (const item of cart)
    totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.price * item.quantity);
  return [...totals].map(([currency, amount]) => ({
    currency,
    amount: Math.round(amount * 100) / 100,
  }));
};

/**
 * Where to complete the bag: one Shopify cart permalink per shop
 * ("https://<shop>.myshopify.com/cart/<variant>:<quantity>,<variant>:<quantity>"), the shop then
 * shows its own cart and checkout.
 */
export const checkoutLinks = (cart: readonly CartItem[]): { store: string; url: string }[] => {
  const byStore = new Map<string, string[]>();
  for (const item of cart) {
    const lines = byStore.get(item.store) ?? [];
    lines.push(`${item.variant}:${item.quantity}`);
    byStore.set(item.store, lines);
  }
  return [...byStore].map(([store, lines]) => ({ store, url: `${store}/cart/${lines.join(",")}` }));
};

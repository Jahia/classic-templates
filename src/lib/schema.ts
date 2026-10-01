/**
 * schema.org JSON-LD of a destination page (TouristDestination) and of a fare offer page (Offer).
 * Pure functions over plain values, unit-tested in schema.test.ts.
 *
 * classic-templates' page shell already writes the page's @graph (WebSite, Organization, WebPage,
 * BreadcrumbList) on every main resource. These builders add only the item the page is about, as
 * a separate entity that points at that WebPage by its @id (the page URL): the page graph is never
 * written twice. Every URL is absolute; only what the page shows is described. The language is the
 * WebPage's (inLanguage is not a property of a Place or an Offer).
 */

export interface DestinationLd {
  /** Absolute URL of the destination page (the WebPage @id of classic-templates). */
  url: string;
  name: string;
  description?: string;
  /** Absolute URL of the image the page shows. */
  image?: string;
  country?: string;
  /** "From" price, when the page shows one. */
  price?: number;
  currency?: string;
}

export interface FareLd {
  url: string;
  name: string;
  price?: number;
  currency?: string;
  /** ISO day of the end of the sale. */
  validThrough?: string;
  /** Visible name of the cabin ("Economy"). */
  cabin?: string;
  /** Visible route ("Hong Kong to Tokyo"). */
  route?: string;
  /** Absolute URL and name of the destination page. */
  destinationUrl?: string;
  destinationName?: string;
  image?: string;
}

type Json = Record<string, unknown>;

const compact = (object: Json): Json =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== ""),
  );

const offer = (price?: number, currency?: string): Json | undefined =>
  price !== undefined && currency
    ? { "@type": "Offer", "price": price, "priceCurrency": currency }
    : undefined;

export const buildDestinationLd = (page: DestinationLd): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": `${page.url}#destination`,
    "name": page.name,
    "description": page.description,
    "url": page.url,
    "image": page.image ? [page.image] : undefined,
    "containedInPlace": page.country ? { "@type": "Country", "name": page.country } : undefined,
    "mainEntityOfPage": { "@id": page.url },
    "offers": offer(page.price, page.currency),
  });

export const buildFareLd = (page: FareLd): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Offer",
    "@id": `${page.url}#offer`,
    "name": page.name,
    "url": page.url,
    "price": page.price,
    "priceCurrency": page.price === undefined ? undefined : page.currency,
    "priceValidUntil": page.validThrough,
    "category": page.cabin,
    "image": page.image ? [page.image] : undefined,
    "itemOffered": page.route
      ? compact({
          "@type": "Trip",
          "name": page.route,
          "itinerary": page.destinationUrl
            ? compact({
                "@type": "TouristDestination",
                "@id": `${page.destinationUrl}#destination`,
                "name": page.destinationName,
                "url": page.destinationUrl,
              })
            : undefined,
        })
      : undefined,
    "mainEntityOfPage": { "@id": page.url },
  });

/**
 * JSON for a `<script type="application/ld+json">`: `<` is written `\u003c` (and the two
 * JavaScript line separators escaped), so no value can close the script element. React writes a
 * script's text unescaped, so no dangerouslySetInnerHTML is needed.
 */
export const jsonForScript = (data: unknown): string =>
  JSON.stringify(data)
    .replaceAll("<", String.raw`\u003c`)
    .replaceAll("\u2028", String.raw`\u2028`)
    .replaceAll("\u2029", String.raw`\u2029`);

/** scheme://host[:port] for absolute URLs, from the parts of the current request. */
export const originOf = (scheme: string, host: string, port: number): string => {
  const standard = (scheme === "https" && port === 443) || (scheme === "http" && port === 80);
  const portSuffix = standard || port <= 0 ? "" : `:${port}`;
  return `${scheme}://${host}${portSuffix}`;
};

/** An absolute URL: `url` as is when it already is one, else prefixed with `origin`. */
export const absolute = (origin: string, url: string) =>
  /^https?:\/\//.test(url) ? url : `${origin}${url}`;

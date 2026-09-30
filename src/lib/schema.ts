/**
 * schema.org structured data (JSON-LD) of a page, as one `@graph`: the WebSite and the
 * Organization that publishes it, the WebPage, its BreadcrumbList when the page shows a trail, and
 * for a news item or an article its NewsArticle / Article. Pure functions over plain values (the
 * JCR reading is in templates/StructuredData.tsx), so they are unit-tested outside Jahia.
 *
 * Every URL is absolute (search engines resolve relative ones inconsistently); nodes point at each
 * other by `@id` (the URL plus a fragment), so the graph describes one site, not loose objects.
 * Only what the page shows is described: no breadcrumb when the trail is hidden, no image the page
 * does not display.
 */

export interface Crumb {
  name: string;
  /** Absolute URL; undefined for the current page. */
  url?: string;
}

export interface EditorialData {
  kind: "news" | "article";
  headline: string;
  description?: string;
  /** ISO 8601. */
  datePublished?: string;
  dateModified?: string;
  /** Absolute URL of the image the page shows. */
  image?: string;
  author?: string;
  keywords?: string[];
}

export interface PageData {
  /** Absolute URL of the page (or main resource). */
  url: string;
  /** Absolute URL of the home page, in the rendering language. */
  homeUrl: string;
  /**
   * Absolute URL of the home page in the site's default language: the Organization is one entity
   * whatever the language, so its @id never changes. Defaults to homeUrl.
   */
  organizationUrl?: string;
  /** The site's title: the WebSite's name, the same as the end of every <title>. */
  siteName: string;
  /** The brand the header shows (its brand name), naming the Organization; defaults to siteName. */
  organizationName?: string;
  /** Absolute URL of the site logo, when the header shows one. */
  logo?: string;
  name?: string;
  description?: string;
  /** BCP 47 tag of the rendering language. */
  language: string;
  breadcrumb?: Crumb[];
  editorial?: EditorialData;
}

type Json = Record<string, unknown>;

/** Search engines truncate longer headlines. */
const HEADLINE_MAX = 110;

const compact = (object: Json): Json =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0),
    ),
  );

/** The page's JSON-LD graph (see the module comment). */
export const buildGraph = (page: PageData): Json => {
  const website = `${page.homeUrl}#website`;
  const organization = `${page.organizationUrl ?? page.homeUrl}#organization`;
  const breadcrumbId = `${page.url}#breadcrumb`;
  const articleId = `${page.url}#article`;
  const hasTrail = (page.breadcrumb?.length ?? 0) > 1;

  const graph: Json[] = [
    compact({
      "@type": "Organization",
      "@id": organization,
      "name": page.organizationName || page.siteName,
      "url": page.organizationUrl ?? page.homeUrl,
      "logo": page.logo ? { "@type": "ImageObject", "url": page.logo } : undefined,
    }),
    compact({
      "@type": "WebSite",
      "@id": website,
      "url": page.homeUrl,
      "name": page.siteName,
      "inLanguage": page.language,
      "publisher": { "@id": organization },
    }),
    compact({
      "@type": "WebPage",
      "@id": page.url,
      "url": page.url,
      "name": page.name,
      "description": page.description,
      "inLanguage": page.language,
      "isPartOf": { "@id": website },
      "breadcrumb": hasTrail ? { "@id": breadcrumbId } : undefined,
      "mainEntity": page.editorial ? { "@id": articleId } : undefined,
    }),
  ];

  if (hasTrail) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      "itemListElement": (page.breadcrumb ?? []).map((crumb, index) =>
        compact({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.url ?? page.url,
        }),
      ),
    });
  }

  const item = page.editorial;
  if (item) {
    graph.push(
      compact({
        "@type": item.kind === "news" ? "NewsArticle" : "Article",
        "@id": articleId,
        "headline":
          item.headline.length > HEADLINE_MAX
            ? `${item.headline.slice(0, HEADLINE_MAX - 1)}…`
            : item.headline,
        "description": item.description,
        "datePublished": item.datePublished,
        "dateModified": item.dateModified,
        "image": item.image ? [item.image] : undefined,
        "author": item.author
          ? { "@type": "Person", "name": item.author }
          : { "@id": organization },
        "publisher": { "@id": organization },
        "mainEntityOfPage": { "@id": page.url },
        "inLanguage": page.language,
        "keywords": item.keywords,
      }),
    );
  }

  return { "@context": "https://schema.org", "@graph": graph };
};

/**
 * JSON for a `<script type="application/ld+json">`: `<` is written `<` (and the two
 * JavaScript line separators escaped), so no value can close the script element or break it.
 */
export const jsonForScript = (data: unknown): string =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

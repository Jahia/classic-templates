/**
 * schema.org JSON-LD of this module's pages: a person (Person), a story (NewsArticle, Article,
 * OpinionNewsArticle, Report, VideoObject or PodcastEpisode, by format) and a session (Event).
 * Pure functions over plain values, unit-tested in schema.test.ts.
 *
 * classic-templates' page shell already writes the page's @graph (WebSite, Organization, WebPage,
 * BreadcrumbList) on every main resource. These builders add only the item the page is about, as a
 * separate entity that points at that WebPage by its @id (the page URL): the page graph is never
 * written twice. Every URL is absolute; only what the page shows is described.
 */

type Json = Record<string, unknown>;

const compact = (object: Json): Json =>
  Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined && value !== "" && !(Array.isArray(value) && value.length === 0),
    ),
  );

/** A person linked from the page (an author, a speaker): name and page URL. */
export interface PersonRef {
  name: string;
  url?: string;
}

const personRef = (person: PersonRef): Json =>
  compact({
    "@type": "Person",
    "@id": person.url ? `${person.url}#person` : undefined,
    "name": person.name,
    "url": person.url,
  });

export interface PersonLd {
  url: string;
  name: string;
  jobTitle?: string;
  organisation?: string;
  description?: string;
  image?: string;
  /** Absolute URLs of the person's profiles (sameAs). */
  profiles?: string[];
}

export const buildPersonLd = (page: PersonLd): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${page.url}#person`,
    "name": page.name,
    "url": page.url,
    "jobTitle": page.jobTitle,
    "worksFor": page.organisation
      ? { "@type": "Organization", "name": page.organisation }
      : undefined,
    "description": page.description,
    "image": page.image,
    "sameAs": page.profiles,
    "mainEntityOfPage": { "@id": page.url },
  });

const STORY_TYPES: Record<string, string> = {
  news: "NewsArticle",
  feature: "Article",
  opinion: "OpinionNewsArticle",
  interview: "Article",
  report: "Report",
  video: "VideoObject",
  podcast: "PodcastEpisode",
};

export interface StoryLd {
  url: string;
  headline: string;
  format?: string;
  description?: string;
  image?: string;
  /** ISO date of publication. */
  datePublished?: string;
  authors?: PersonRef[];
  language?: string;
  /** Absolute URL of the episode's audio file (podcast). */
  audio?: string;
  /** False for a members-only story. */
  free?: boolean;
}

export const buildStoryLd = (page: StoryLd): Json => {
  const type = STORY_TYPES[page.format ?? "news"] ?? "Article";
  const isVideo = type === "VideoObject";
  const isEpisode = type === "PodcastEpisode";
  return compact({
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${page.url}#story`,
    // A video and an episode have a name; articles have a headline.
    [isVideo || isEpisode ? "name" : "headline"]: page.headline,
    "description": page.description,
    "url": page.url,
    "image": !isVideo && page.image ? [page.image] : undefined,
    "thumbnailUrl": isVideo ? page.image : undefined,
    [isVideo ? "uploadDate" : "datePublished"]: page.datePublished,
    [isVideo || isEpisode ? "creator" : "author"]: page.authors?.map(personRef),
    "inLanguage": page.language,
    "associatedMedia":
      isEpisode && page.audio ? { "@type": "AudioObject", "contentUrl": page.audio } : undefined,
    "isAccessibleForFree": page.free === false ? false : undefined,
    "mainEntityOfPage": { "@id": page.url },
  });
};

export interface SessionLd {
  url: string;
  name: string;
  description?: string;
  /** ISO instants with the event's offset. */
  start?: string;
  end?: string;
  room?: string;
  speakers?: PersonRef[];
  language?: string;
}

export const buildSessionLd = (page: SessionLd): Json =>
  compact({
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${page.url}#event`,
    "name": page.name,
    "description": page.description,
    "url": page.url,
    "startDate": page.start,
    "endDate": page.end,
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": page.room ? { "@type": "Place", "name": page.room } : undefined,
    "performer": page.speakers?.map(personRef),
    "inLanguage": page.language,
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

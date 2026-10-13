import { describe, expect, it } from "vitest";
import {
  absolute,
  buildPersonLd,
  buildSessionLd,
  buildStoryLd,
  jsonForScript,
  originOf,
} from "./schema.js";

const URL = "https://www.example.com/sites/orvane-signal/contents/stories/a.html";
const AUTHOR = {
  name: "Mara Lindqvist",
  url: "https://www.example.com/sites/orvane-signal/contents/people/mara.html",
};

describe("buildStoryLd", () => {
  it("describes a news story with its authors, pointing at the page's WebPage", () => {
    expect(
      buildStoryLd({
        url: URL,
        headline: "A",
        format: "news",
        datePublished: "2026-10-01",
        authors: [AUTHOR],
        language: "en",
      }),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "@id": `${URL}#story`,
      "headline": "A",
      "url": URL,
      "datePublished": "2026-10-01",
      "author": [
        {
          "@type": "Person",
          "@id": `${AUTHOR.url}#person`,
          "name": AUTHOR.name,
          "url": AUTHOR.url,
        },
      ],
      "inLanguage": "en",
      "mainEntityOfPage": { "@id": URL },
    });
  });

  it("uses the schema.org type of each format", () => {
    expect(buildStoryLd({ url: URL, headline: "A", format: "opinion" })["@type"]).toBe(
      "OpinionNewsArticle",
    );
    expect(buildStoryLd({ url: URL, headline: "A", format: "report" })["@type"]).toBe("Report");
    expect(buildStoryLd({ url: URL, headline: "A", format: "interview" })["@type"]).toBe("Article");
    expect(buildStoryLd({ url: URL, headline: "A", format: "unknown" })["@type"]).toBe("Article");
  });

  it("names a video and an episode, with their own date, creator and media properties", () => {
    const video = buildStoryLd({
      url: URL,
      headline: "V",
      format: "video",
      image: "https://x/i.jpg",
      datePublished: "2026-10-01",
      authors: [AUTHOR],
    });
    expect(video).toMatchObject({
      "@type": "VideoObject",
      "name": "V",
      "thumbnailUrl": "https://x/i.jpg",
      "uploadDate": "2026-10-01",
    });
    expect(video).not.toHaveProperty("headline");
    expect(video).toHaveProperty("creator");
    const episode = buildStoryLd({
      url: URL,
      headline: "P",
      format: "podcast",
      audio: "https://x/e.mp3",
    });
    expect(episode).toMatchObject({
      "@type": "PodcastEpisode",
      "name": "P",
      "associatedMedia": { "@type": "AudioObject", "contentUrl": "https://x/e.mp3" },
    });
  });

  it("says when a story is for members only, and leaves out what the page does not show", () => {
    expect(buildStoryLd({ url: URL, headline: "R", free: false }).isAccessibleForFree).toBe(false);
    const plain = buildStoryLd({ url: URL, headline: "R", authors: [] });
    expect(Object.keys(plain)).not.toContain("author");
    expect(Object.keys(plain)).not.toContain("isAccessibleForFree");
  });
});

describe("buildPersonLd and buildSessionLd", () => {
  it("describes a person with their organisation and profiles", () => {
    expect(
      buildPersonLd({
        url: AUTHOR.url,
        name: AUTHOR.name,
        jobTitle: "Editor",
        organisation: "Orvane",
        profiles: ["https://example.com/m"],
      }),
    ).toMatchObject({
      "@type": "Person",
      "@id": `${AUTHOR.url}#person`,
      "jobTitle": "Editor",
      "worksFor": { "@type": "Organization", "name": "Orvane" },
      "sameAs": ["https://example.com/m"],
    });
  });

  it("describes a session as an event with its room and speakers", () => {
    expect(
      buildSessionLd({
        url: URL,
        name: "Keynote",
        start: "2027-06-08T09:30:00+01:00",
        room: "Main stage",
        speakers: [{ name: "Ana" }],
      }),
    ).toMatchObject({
      "@type": "Event",
      "startDate": "2027-06-08T09:30:00+01:00",
      "location": { "@type": "Place", "name": "Main stage" },
      "performer": [{ "@type": "Person", "name": "Ana" }],
    });
  });
});

describe("helpers", () => {
  it(String.raw`writes < as \u003c so no value closes the script`, () => {
    expect(jsonForScript({ a: "</script>" })).toBe(String.raw`{"a":"\u003c/script>"}`);
  });

  it("builds absolute URLs from the request", () => {
    expect(originOf("https", "www.example.com", 443)).toBe("https://www.example.com");
    expect(originOf("http", "localhost", 8080)).toBe("http://localhost:8080");
    expect(absolute("http://localhost:8080", "/sites/a.html")).toBe(
      "http://localhost:8080/sites/a.html",
    );
    expect(absolute("http://localhost:8080", "https://cdn/x.jpg")).toBe("https://cdn/x.jpg");
  });
});

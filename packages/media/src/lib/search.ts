/**
 * Pure helpers of the search section, unit-tested in search.test.ts: the highlighted excerpt of
 * an Augmented Search hit as text parts (never HTML), the page number of the request, and the
 * label key of a hit's node type.
 */
import { decodeHTML } from "entities";

/** A run of excerpt text; `hit` is true for the words that matched. */
export interface ExcerptPart {
  text: string;
  hit: boolean;
  /** Offset of the part in the excerpt: a stable key. */
  at: number;
}

/**
 * Augmented Search highlights the matched words with `<em>...</em>` (its highlighter tags). Every
 * other tag is dropped and entities are decoded, so the parts are plain text that React escapes:
 * no markup of the index ever reaches the page.
 */
export const excerptParts = (excerpt: string | undefined): ExcerptPart[] => {
  if (!excerpt) return [];
  const parts: ExcerptPart[] = [];
  let hit = false;
  let at = 0;
  for (const piece of excerpt.split(/(<\/?em>)/)) {
    if (piece === "<em>") hit = true;
    else if (piece === "</em>") hit = false;
    else {
      const text = decodeHTML(piece.replaceAll(/<[^>]*>/g, ""));
      if (text) parts.push({ text, hit, at });
    }
    at += piece.length;
  }
  return parts;
};

/** The 1-based page asked by the request (`page` parameter), 1 when missing or invalid. */
export const pageNumber = (value: string | null | undefined): number => {
  const page = Number.parseInt(value ?? "", 10);
  return Number.isFinite(page) && page > 0 && page < 1000 ? page : 1;
};

/** The words searched, trimmed and capped (an empty string means no search yet). */
export const searchWords = (value: string | null | undefined): string =>
  (value ?? "").trim().slice(0, 200);

const KINDS: Record<string, string> = {
  "ctmd:story": "story",
  "ctmd:person": "person",
  "ctmd:session": "session",
  "ctpl:news": "news",
  "ctpl:article": "article",
  "jnt:page": "page",
};

/** The label key of a hit's node type ("search.kind.story"), "search.kind.other" otherwise. */
export const kindKey = (nodeType: string | undefined): string =>
  `search.kind.${KINDS[nodeType ?? ""] ?? "other"}`;

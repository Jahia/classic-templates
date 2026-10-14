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

/** Letters of any script, and the apostrophes and hyphens inside a word. */
const WORD_CHAR = /[\p{L}\p{N}'’-]/u;

/** The leading word characters of `text` (the end of a word cut by the highlighter). */
const leadingWord = (text: string): string => {
  let end = 0;
  while (end < text.length && WORD_CHAR.test(text[end] ?? "")) end += 1;
  return text.slice(0, end);
};

/** The trailing word characters of `text` (the start of a word cut by the highlighter). */
const trailingWord = (text: string): string => {
  let start = text.length;
  while (start > 0 && WORD_CHAR.test(text[start - 1] ?? "")) start -= 1;
  return text.slice(start);
};

/**
 * Where the index glued two passages or fields together without a space ("audiences.This",
 * "plateauPaid"): a sentence end, or a small letter, directly followed by a capital and a small
 * letter. A space-ellipsis-space goes there.
 */
const GLUED = /([.!?;:]|(?<=\p{Ll}{2})\p{Ll})(?=\p{Lu}\p{Ll})/gu;

/**
 * The excerpt as a visitor should read it, from excerptParts:
 * - a highlight covers whole words: the index highlights stems ("<em>streamin</em>g"), the rest of
 *   the word joins the mark;
 * - passages the index glued together are separated by " … ";
 * - at most `max` characters, a window that starts a little before the first highlight, cut at
 *   word boundaries, with "… " / " …" where text was left out.
 * Parts get new sequential `at` keys.
 */
type Run = { text: string; hit: boolean };

/** Step 1: the highlighter marks stems; the rest of each word joins its mark. */
const wholeWords = (parts: ExcerptPart[]): Run[] => {
  const runs: Run[] = parts.map(({ text, hit }) => ({ text, hit }));
  runs.forEach((run, i) => {
    if (!run.hit) return;
    const next = runs[i + 1];
    if (next && !next.hit) {
      const tail = leadingWord(next.text);
      run.text += tail;
      next.text = next.text.slice(tail.length);
    }
    const prev = runs[i - 1];
    if (prev && !prev.hit) {
      const head = trailingWord(prev.text);
      run.text = head + run.text;
      prev.text = prev.text.slice(0, prev.text.length - head.length);
    }
  });
  return runs.filter((run) => run.text);
};

/** Step 2: " … " where the index glued two passages together. */
const spaceGlued = (runs: Run[]): Run[] =>
  runs.map((run) => (run.hit ? run : { ...run, text: run.text.replaceAll(GLUED, "$1 … ") }));

/** The text of `run` inside [from, to), cut at word boundaries where the window cuts it. */
const clip = (run: Run, start: number, from: number, to: number): string => {
  const end = start + run.text.length;
  let text = run.text.slice(Math.max(0, from - start), Math.min(run.text.length, to - start));
  // a highlight the window would cut ("st" of "streaming") is left out, never shown in pieces
  if (run.hit) return start < from || end > to ? "" : text;
  if (start < from) text = text.replace(/^\S*\s*/u, "");
  if (end > to) text = text.replace(/\s*\S*$/u, "");
  return text;
};

/** Step 3: at most `max` characters, starting a little before the first highlight. */
const windowed = (runs: Run[], max: number): ExcerptPart[] => {
  const total = runs.reduce((n, run) => n + run.text.length, 0);
  const firstHit = runs.findIndex((run) => run.hit);
  const before = runs.slice(0, Math.max(0, firstHit)).reduce((n, run) => n + run.text.length, 0);
  const from = total > max ? Math.max(0, Math.min(before - 60, total - max)) : 0;
  const to = Math.min(total, from + max);
  const out: Run[] = [];
  let start = 0;
  for (const run of runs) {
    const end = start + run.text.length;
    if (end > from && start < to) {
      const text = clip(run, start, from, to);
      if (text) out.push({ text, hit: run.hit });
    }
    start = end;
  }
  if (out.length > 0 && from > 0) out.unshift({ text: "… ", hit: false });
  if (out.length > 0 && to < total) out.push({ text: " …", hit: false });
  return out.map((run, at) => ({ ...run, at }));
};

/**
 * The excerpt as a visitor should read it, from excerptParts: highlights cover whole words (the
 * index highlights stems: "<em>streamin</em>g"), passages the index glued together are separated
 * by " … ", and at most `max` characters are kept, a window that starts a little before the first
 * highlight, cut at word boundaries, with "… " / " …" where text was left out. Parts get new
 * sequential `at` keys.
 */
export const readableExcerpt = (parts: ExcerptPart[], max = 260): ExcerptPart[] =>
  windowed(spaceGlued(wholeWords(parts)), max);

/** Lower case without accents: "Média" and "media" compare equal. */
const fold = (text: string): string =>
  text.normalize("NFD").replaceAll(/\p{M}/gu, "").toLowerCase();

/**
 * `text` with the searched words highlighted (a word of the text that starts with a searched word
 * of two letters or more, accents and case ignored: "stream" marks "Streaming"), or undefined
 * when none of the words is in it.
 */
export const highlightWords = (text: string, words: string): ExcerptPart[] | undefined => {
  const terms = fold(words)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((term) => term.length >= 2);
  if (terms.length === 0 || !text) return undefined;
  const parts: ExcerptPart[] = [];
  let plain = "";
  let found = false;
  for (const piece of text.split(/([\p{L}\p{N}'’-]+)/u)) {
    const isWord = /[\p{L}\p{N}]/u.test(piece);
    if (isWord && terms.some((term) => fold(piece).startsWith(term))) {
      if (plain) parts.push({ text: plain, hit: false, at: parts.length });
      parts.push({ text: piece, hit: true, at: parts.length });
      plain = "";
      found = true;
    } else {
      plain += piece;
    }
  }
  if (plain) parts.push({ text: plain, hit: false, at: parts.length });
  return found ? parts : undefined;
};

/**
 * What a result shows under its title: its own summary (SEO description, else teaser), with the
 * searched words highlighted when it contains them. Only a result without a summary shows the
 * index's excerpt, made readable: the excerpt can come from a related item the index folds into
 * the result (a story's author bio), which reads as if it described the result.
 */
export const resultText = (
  hit: { excerpt: string; summary: string },
  words: string,
  max = 260,
): ExcerptPart[] => {
  if (hit.summary) {
    const own = words ? highlightWords(hit.summary, words) : undefined;
    return readableExcerpt(own ?? [{ text: hit.summary, hit: false, at: 0 }], max);
  }
  return hit.excerpt ? readableExcerpt(excerptParts(hit.excerpt), max) : [];
};

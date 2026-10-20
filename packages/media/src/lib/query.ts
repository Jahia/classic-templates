/**
 * The JCR-SQL2 queries of this module's lists. Every piece that reaches the string is checked
 * against an allow-list (type, order, format), an identifier checked against the UUID pattern
 * (categories, a person), or a path read from a JCR node and quoted as a literal: nothing typed by
 * an editor is concatenated as is. `NOT ISSAMENODE(...)` is never used (unreliable on Jahia
 * 8.2.3.2): exclusions are done in code.
 */

/** Types a list of this module may query. */
export const LIST_TYPES = new Set([
  "ctmd:story",
  "ctmd:person",
  "ctmd:session",
  "ctmd:sessionSpeaker",
]);

/** The formats of a story (ctmd:story format choicelist), in the order buttons show them. */
export const FORMATS = [
  "news",
  "feature",
  "opinion",
  "interview",
  "report",
  "video",
  "podcast",
] as const;
export type Format = (typeof FORMATS)[number];
export const isFormat = (value: unknown): value is Format =>
  typeof value === "string" && (FORMATS as readonly string[]).includes(value);

const ORDERS = {
  newest: " ORDER BY item.[publicationDate] DESC",
  start: " ORDER BY item.[start] ASC",
  none: "",
} as const;
export type Order = keyof typeof ORDERS;

/** Rows a list reads at most before filtering and sorting in code. */
export const FETCH_LIMIT = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A JCR-SQL2 string literal: single quotes doubled. */
export const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;

const anyOf = (property: string, values: string[]) => {
  const conditions = values.map((value) => `item.[${property}] = ${literal(value)}`);
  return conditions.length === 1 ? conditions.join("") : `(${conditions.join(" OR ")})`;
};

export const buildListQuery = ({
  type,
  startPath,
  order = "none",
  categories = [],
  formats = [],
  reference,
}: {
  type: string;
  startPath: string;
  order?: Order;
  /** Category identifiers: an item filed under any of them matches. */
  categories?: string[];
  formats?: string[];
  /** A multi-valued or single weakreference property that must hold this identifier. */
  reference?: { property: "authors" | "person"; id: string };
}): string => {
  if (!LIST_TYPES.has(type)) throw new Error(`not a media list type: ${type}`);
  if (!startPath.startsWith("/")) throw new Error(`not a JCR path: ${startPath}`);
  if (!(order in ORDERS)) throw new Error(`not a list order: ${order}`);
  const conditions = [`ISDESCENDANTNODE(item, ${literal(startPath)})`];
  const ids = categories.filter((id) => UUID.test(id));
  if (ids.length > 0) conditions.push(anyOf("j:defaultCategory", ids));
  const kept = formats.filter(isFormat);
  if (kept.length > 0) conditions.push(anyOf("format", kept));
  if (reference) {
    if (!UUID.test(reference.id)) throw new Error(`not an identifier: ${reference.id}`);
    conditions.push(`item.[${reference.property}] = ${literal(reference.id)}`);
  }
  return `SELECT * FROM [${type}] AS item WHERE ${conditions.join(" AND ")}${ORDERS[order]}`;
};

/** Escapes a path for use inside a cache-flush regular expression. */
export const pathRegex = (path: string) => path.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

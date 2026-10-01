/**
 * The JCR-SQL2 query of a travel list: every item of one type under a start node. Only an
 * allow-listed type name and a path read from a JCR node (quoted as a literal) reach the string;
 * nothing typed by an editor is concatenated as is.
 *
 * There is no ORDER BY and no exclusion in the query: sorting, region and end-of-sale filtering
 * are done in code (lib/select.ts), because they depend on another node (the fare's destination),
 * the page's language and today's date. `NOT ISSAMENODE(...)` is not used either: it is unreliable
 * on Jahia 8.2.3.2.
 */

/** Types a travel list may query. */
export const LIST_TYPES = new Set(["ctrv:fareOffer", "ctrv:destination"]);

/** Rows a list reads at most before filtering and sorting in code. */
export const FETCH_LIMIT = 200;

/** A JCR-SQL2 string literal: single quotes doubled. */
export const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;

export const buildListQuery = (type: string, startPath: string): string => {
  if (!LIST_TYPES.has(type)) throw new Error(`not a travel list type: ${type}`);
  if (!startPath.startsWith("/")) throw new Error(`not a JCR path: ${startPath}`);
  return `SELECT * FROM [${type}] AS item WHERE ISDESCENDANTNODE(item, ${literal(startPath)})`;
};

/** Escapes a path for use inside a cache-flush regular expression. */
export const pathRegex = (path: string) => path.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

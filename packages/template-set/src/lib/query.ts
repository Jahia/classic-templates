import { getChildNodes, getNodesByJCRQuery } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper, JCRSessionWrapper } from "org.jahia.services.content";
import type { JCRSiteNode } from "org.jahia.services.content.decorator";

/** Sort fields a list may use, and the directions. Nothing else reaches the query string. */
const CRITERIA = new Set(["publicationDate", "jcr:created", "jcr:lastModified", "jcr:title"]);
const DIRECTIONS = new Set(["asc", "desc"]);
const TYPE_NAME = /^[A-Za-z][\w-]*:[A-Za-z][\w-]*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Upper bound of categories a filter expands to (selected ones plus their subcategories). */
const MAX_CATEGORIES = 200;

interface NodeTypeInfo {
  isNodeType(name: string): boolean;
}

/** The registered node type called `name`, or undefined when it does not exist. */
const nodeType = (session: JCRSessionWrapper, name: string): NodeTypeInfo | undefined => {
  if (!TYPE_NAME.test(name)) return undefined;
  try {
    // javax.jcr.Workspace#getNodeTypeManager exists at runtime; the library's typings omit it.
    const workspace = session.getWorkspace() as unknown as {
      getNodeTypeManager(): { getNodeType(name: string): NodeTypeInfo };
    };
    return workspace.getNodeTypeManager().getNodeType(name);
  } catch {
    return undefined;
  }
};

/** True when `name` is a type a content list may show (a subtype of ctplmix:listable). */
export const isListableType = (session: JCRSessionWrapper, name: string): boolean =>
  nodeType(session, name)?.isNodeType("ctplmix:listable") ?? false;

interface NodeTypeRegistry {
  getInstance(): { getNodeType(name: string): { getLabel(locale: unknown): string } };
}

/**
 * The editor-facing label of a type, for the edit-mode panel ("News item", "Actualité"). The JCR
 * type manager returns plain JCR node types, which carry no label: Jahia's registry does.
 */
export const typeLabel = (name: string, locale: unknown): string => {
  if (!TYPE_NAME.test(name)) return name;
  try {
    const registry = Java.type<NodeTypeRegistry>(
      "org.jahia.services.content.nodetypes.NodeTypeRegistry",
    );
    return registry.getInstance().getNodeType(name).getLabel(locale) || name;
  } catch {
    return name;
  }
};

/** A JCR-SQL2 string literal: single quotes doubled. */
const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;

/**
 * The selected categories and all their subcategories (identifiers), so that picking "Products"
 * also lists items filed under "Products / Laptops". Bounded by MAX_CATEGORIES.
 */
export const categoryIds = (categories?: JCRNodeWrapper[]): string[] => {
  const ids = new Set<string>();
  const walk = (node: JCRNodeWrapper) => {
    if (ids.size >= MAX_CATEGORIES) return;
    ids.add(node.getIdentifier());
    for (const child of getChildNodes(node, -1, 0, (n: JCRNodeWrapper) =>
      n.isNodeType("jnt:category"),
    )) {
      walk(child);
    }
  };
  for (const category of categories ?? []) {
    try {
      walk(category);
    } catch {
      // category deleted or not readable: ignored
    }
  }
  return [...ids];
};

/**
 * The JCR-SQL2 query of a content list. Every piece that reaches the string is either validated
 * against an allow-list (type, sort field, direction), an identifier checked against the UUID
 * pattern (categories), or a path read from a JCR node and quoted as a literal; nothing typed by an
 * editor is concatenated as is.
 *
 * Categories: an item matches when its j:defaultCategory (the platform's category property,
 * multi-valued) holds any of the given identifiers.
 *
 * Excluded items are NOT part of the query: on Jahia 8.2.3.2, `NOT ISSAMENODE(...)` is unreliable
 * (through GraphQL it excluded nothing, through getNodesByJCRQuery only the first of two). They are
 * filtered in code by runList, which fetches enough extra rows to fill the list. (Joining "<>"
 * comparisons with OR, as a previous implementation did, is also always true as soon as two items
 * are excluded.)
 */
export const buildListQuery = ({
  type,
  start,
  criteria,
  direction,
  categories,
}: {
  type: string;
  start: JCRNodeWrapper;
  criteria?: string;
  direction?: string;
  categories?: string[];
}): string => {
  if (!TYPE_NAME.test(type)) throw new Error(`not a node type name: ${type}`);
  const sort = criteria && CRITERIA.has(criteria) ? criteria : "publicationDate";
  const dir = direction && DIRECTIONS.has(direction) ? direction.toUpperCase() : "DESC";
  const conditions = [`ISDESCENDANTNODE(item, ${literal(start.getPath())})`];
  const ids = (categories ?? []).filter((id) => UUID.test(id));
  if (ids.length > 0) {
    const inCategory = ids.map((id) => `item.[j:defaultCategory] = ${literal(id)}`).join(" OR ");
    conditions.push(`(${inCategory})`);
  }
  return `SELECT * FROM [${type}] AS item WHERE ${conditions.join(" AND ")} ORDER BY item.[${sort}] ${dir}`;
};

/** What a content list ran and found: shown to editors in edit mode. */
export interface ListResult {
  items: JCRNodeWrapper[];
  query: string;
  /** Rows the query returned (capped by the fetch size). */
  fetched: number;
  /** True when the fetch size was reached: there may be more matching items. */
  capped: boolean;
  skippedExcluded: number;
  skippedUntranslated: number;
}

/**
 * Runs a content list: the query, then the excluded items and the items not translated into the
 * page's language filtered out, sliced to `max`. Fetches `(max + excluded) * 2` rows, or `countUpTo`
 * rows when the caller wants a count for editors.
 */
export const runList = ({
  session,
  type,
  start,
  criteria,
  direction,
  categories,
  exclude,
  locale,
  max,
  countUpTo,
}: {
  session: JCRSessionWrapper;
  type: string;
  start: JCRNodeWrapper;
  criteria?: string;
  direction?: string;
  categories?: string[];
  exclude?: JCRNodeWrapper[];
  locale: unknown;
  max: number;
  countUpTo?: number;
}): ListResult => {
  const query = buildListQuery({ type, start, criteria, direction, categories });
  const excluded = excludedIds(exclude);
  const fetchSize = Math.max(countUpTo ?? 0, (max + excluded.size) * 2);
  const rows = getNodesByJCRQuery(session, query, fetchSize);
  let skippedExcluded = 0;
  let skippedUntranslated = 0;
  const items: JCRNodeWrapper[] = [];
  for (const node of rows) {
    if (excluded.has(node.getIdentifier())) skippedExcluded++;
    else if (!node.hasI18N(locale as never)) skippedUntranslated++;
    else if (items.length < max) items.push(node);
  }
  return {
    items,
    query,
    fetched: rows.length,
    capped: rows.length >= fetchSize,
    skippedExcluded,
    skippedUntranslated,
  };
};

/** Identifiers of the excluded items (deleted ones are skipped). */
export const excludedIds = (exclude?: JCRNodeWrapper[]): Set<string> => {
  const ids = new Set<string>();
  for (const node of exclude ?? []) {
    try {
      ids.add(node.getIdentifier());
    } catch {
      // excluded item deleted: nothing to exclude
    }
  }
  return ids;
};

/** The start node as edit-mode summaries name it: the site's title, or its path below the site. */
export const startLabelOf = (start: JCRNodeWrapper, site: JCRSiteNode): string =>
  start.getPath() === site.getPath()
    ? site.getTitle() || site.getName()
    : start.getPath().replace(`${site.getPath()}/`, "");

/** Escapes a path for use inside a cache-flush regular expression. */
export const pathRegex = (path: string) => path.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

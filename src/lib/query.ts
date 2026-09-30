import type { JCRNodeWrapper, JCRSessionWrapper } from "org.jahia.services.content";

/** Sort fields a list may use, and the directions. Nothing else reaches the query string. */
const CRITERIA = new Set(["publicationDate", "jcr:created", "jcr:lastModified", "jcr:title"]);
const DIRECTIONS = new Set(["asc", "desc"]);
const TYPE_NAME = /^[A-Za-z][\w-]*:[A-Za-z][\w-]*$/;

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
 * The editor-facing label of a type, for the edit-mode summary ("News item", "Actualité"). The JCR
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
 * The JCR-SQL2 query of a content list. Every piece that reaches the string is either validated
 * against an allow-list (type, sort field, direction) or a path read from a JCR node and quoted
 * as a literal; nothing typed by an editor is concatenated as is.
 *
 * Excluded items are NOT part of the query: on Jahia 8.2.3.2, `NOT ISSAMENODE(...)` is unreliable
 * (through GraphQL it excluded nothing, through getNodesByJCRQuery only the first of two). They are
 * filtered in code by `withoutExcluded`, and the caller fetches enough extra rows to fill the list.
 * (Joining "<>" comparisons with OR, as a previous implementation did, is also always true as soon
 * as two items are excluded.)
 */
export const buildListQuery = ({
  type,
  start,
  criteria,
  direction,
}: {
  type: string;
  start: JCRNodeWrapper;
  criteria?: string;
  direction?: string;
}): string => {
  if (!TYPE_NAME.test(type)) throw new Error(`not a node type name: ${type}`);
  const sort = criteria && CRITERIA.has(criteria) ? criteria : "publicationDate";
  const dir = direction && DIRECTIONS.has(direction) ? direction.toUpperCase() : "DESC";
  return `SELECT * FROM [${type}] AS item WHERE ISDESCENDANTNODE(item, ${literal(start.getPath())}) ORDER BY item.[${sort}] ${dir}`;
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

/** Escapes a path for use inside a cache-flush regular expression. */
export const pathRegex = (path: string) => path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

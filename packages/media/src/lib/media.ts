import { getChildNodes, getNodesByJCRQuery, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper, JCRSessionWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { sortNameOf, validTimeZone } from "./format.js";
import { readReference, readString } from "./props.js";
import { buildListQuery, FETCH_LIMIT, pathRegex, type Order } from "./query.js";

/** Categories a list may expand to (a category and its subcategories) before it stops. */
const MAX_CATEGORIES = 200;

/** The nodes a multi-valued weakreference points at, in order, skipping those that do not resolve. */
export const readReferences = (node: JCRNodeWrapper, name: string): JCRNodeWrapper[] => {
  if (!node.hasProperty(name)) return [];
  const nodes: JCRNodeWrapper[] = [];
  for (const value of node.getProperty(name).getValues()) {
    try {
      nodes.push((value as unknown as { getNode(): JCRNodeWrapper }).getNode());
    } catch {
      // deleted, or not readable in this workspace (not published yet)
    }
  }
  return nodes;
};

/** Identifiers of the categories an item is filed under (j:defaultCategory), resolvable or not. */
export const categoryIdsOf = (node: JCRNodeWrapper): string[] =>
  node.hasProperty("j:defaultCategory")
    ? node
        .getProperty("j:defaultCategory")
        .getValues()
        .map((value) => value.getString())
    : [];

/** Titles of an item's categories, each a cache dependency (renaming a category refreshes it). */
export const categoryTitlesOf = (node: JCRNodeWrapper, renderContext: RenderContext): string[] =>
  readReferences(node, "j:defaultCategory").flatMap((category) => {
    server.render.addCacheDependency({ node: category }, renderContext);
    const title = readString(category, "jcr:title");
    return title ? [title] : [];
  });

/** Identifiers of categories and of all their subcategories (a filter matches either). */
export const expandCategories = (categories: JCRNodeWrapper[]): string[] => {
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
  for (const category of categories) {
    try {
      walk(category);
    } catch {
      // category deleted or not readable: ignored
    }
  }
  return [...ids];
};

/**
 * Runs a list query under `start`, as the visitor, and makes the fragment depend on everything
 * under `start`: adding, editing or publishing an item there refreshes the list. Items with no
 * translation in the page's language are left out (a list never shows an untitled link).
 */
export const runQuery = ({
  session,
  renderContext,
  type,
  start,
  order,
  categories,
  formats,
  reference,
  locale,
  limit = FETCH_LIMIT,
}: {
  session: JCRSessionWrapper;
  renderContext: RenderContext;
  type: string;
  start: JCRNodeWrapper;
  order?: Order;
  categories?: string[];
  formats?: string[];
  reference?: { property: "authors" | "person"; id: string };
  locale: unknown;
  limit?: number;
}): JCRNodeWrapper[] => {
  server.render.addCacheDependency(
    { flushOnPathMatchingRegexp: `${pathRegex(start.getPath())}(/.*)?` },
    renderContext,
  );
  const query = buildListQuery({
    type,
    startPath: start.getPath(),
    order,
    categories,
    formats,
    reference,
  });
  return getNodesByJCRQuery(session, query, limit).filter(
    (node) => type === "ctmd:sessionSpeaker" || node.hasI18N(locale as never),
  );
};

/**
 * Where a list looks: its start node, or the page's site when none is set. A start node that is
 * set but does not resolve (deleted, not yet published) is reported as missing: the list then
 * shows nothing on the live site rather than silently widening to the whole site.
 */
export const listStart = (
  currentNode: JCRNodeWrapper,
  startNode: JCRNodeWrapper | undefined,
  site: JCRNodeWrapper,
): { start: JCRNodeWrapper; startMissing: boolean } => ({
  start: startNode ?? site,
  startMissing: !startNode && currentNode.hasProperty("startNode"),
});

/** A person as cards, bylines and galleries show them. */
export interface PersonData {
  node: JCRNodeWrapper;
  name?: string;
  role?: string;
  organisation?: string;
  sortName: string;
  portrait?: JCRNodeWrapper;
}

/** A person's data; the person is a cache dependency of the fragment showing it. */
export const readPerson = (node: JCRNodeWrapper, renderContext: RenderContext): PersonData => {
  server.render.addCacheDependency({ node }, renderContext);
  const name = readString(node, "jcr:title");
  return {
    node,
    name,
    role: readString(node, "role"),
    organisation: readString(node, "organisation"),
    sortName: sortNameOf(name, readString(node, "sortName")),
    portrait: readReference(node, "image"),
  };
};

/** The authors of a story, in byline order (each a cache dependency). */
export const storyAuthors = (story: JCRNodeWrapper, renderContext: RenderContext): PersonData[] =>
  readReferences(story, "authors")
    .map((node) => readPerson(node, renderContext))
    .filter((person) => person.name);

/** A speaker of a session: the person and the part they play. */
export interface SpeakerData extends PersonData {
  part: string;
}

/** The speakers of a session, in the order of its child ctmd:sessionSpeaker nodes. */
export const sessionSpeakers = (
  session: JCRNodeWrapper,
  renderContext: RenderContext,
): SpeakerData[] =>
  getChildNodes(session, -1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctmd:sessionSpeaker")).flatMap(
    (child) => {
      const person = readReference(child, "person");
      if (!person) return [];
      const data = readPerson(person, renderContext);
      return data.name ? [{ ...data, part: readString(child, "speakerRole") ?? "speaker" }] : [];
    },
  );

/**
 * The event time zone of a node: ctmdTimeZone of the nearest ancestor folder carrying
 * ctmdmix:eventFolder (each folder looked at is a cache dependency), else UTC.
 */
export const eventTimeZone = (node: JCRNodeWrapper, renderContext: RenderContext): string => {
  let current: JCRNodeWrapper | undefined = node;
  for (let depth = 0; current && depth < 20; depth++) {
    if (current.isNodeType("jnt:virtualsite")) break;
    if (current.isNodeType("ctmdmix:eventFolder")) {
      server.render.addCacheDependency({ node: current }, renderContext);
      return validTimeZone(readString(current, "ctmdTimeZone"));
    }
    try {
      current = current.getParent() as JCRNodeWrapper;
    } catch {
      current = undefined;
    }
  }
  return "UTC";
};

/**
 * The page being rendered (its main resource) and the page's site. `renderContext.getSite()` can
 * be another site on a shared instance where several sites keep the server name localhost; the
 * main resource always belongs to the page's own site.
 */
export const pageOf = (renderContext: RenderContext, fallback: JCRNodeWrapper) => {
  try {
    const page = renderContext.getMainResource()?.getNode();
    if (page) return { page, site: page.getResolveSite() as JCRNodeWrapper };
  } catch {
    // no main resource (rendering outside a page)
  }
  return { page: fallback, site: fallback.getResolveSite() as JCRNodeWrapper };
};

/** What an edit-mode summary calls a start node: its title, else its name. */
export const startLabel = (start: JCRNodeWrapper): string =>
  readString(start, "jcr:title") ?? start.getName();

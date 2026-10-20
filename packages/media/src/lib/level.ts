/**
 * Heading levels of sections, worked out from the containers they sit in. Pure (no Jahia import),
 * so it is unit tested; lib/Heading.tsx gives it the JCR tree and the render context.
 */

/** Deepest heading level HTML has; the page template owns the only h1, sections start at h2. */
export const DEEPEST = 6;

export type Level = 2 | 3 | 4 | 5 | 6;

/** A level kept between h2 and h6. */
export const clampLevel = (level: number): Level =>
  Math.min(Math.max(Math.round(level) || 2, 2), DEEPEST) as Level;

/** What the level computation reads from the content tree. */
export interface LevelTree<N> {
  /** Parent node; may throw (root, no read access): the section then counts as a page section. */
  parent: (node: N) => N;
  isType: (node: N, type: string) => boolean;
  /** True when the container shows its own heading (a title in this language). */
  titled: (node: N) => boolean;
  /** Registers a container whose title decides the level (a cache dependency). */
  depend: (node: N) => void;
}

/**
 * Heading level of a section's title, following the classic-templates heading policy:
 * - in a page area: h2;
 * - in a column of a ctpl:columns row: one below the row's title when it shows one, the row's own
 *   level otherwise, so the outline never jumps from h1 to h3;
 * - in a tab of a ctpl:tabs section: one below the tab's label, which is itself a heading one below
 *   the tabs title when it shows one (the tabs' own level otherwise);
 * - in a ctpl:freeZone: one below the zone's title when it shows one, the zone's own level
 *   otherwise.
 * Containers nest (a tabs section in a column, a free zone in a tab), so the level is worked out up
 * the tree, and clamped to h6. Every container on the way is a dependency.
 */
export const sectionLevel = <N>(node: N, tree: LevelTree<N>): Level => {
  try {
    const parent = tree.parent(node);
    if (tree.isType(parent, "ctpl:freeZone")) {
      tree.depend(parent);
      return clampLevel(sectionLevel(parent, tree) + (tree.titled(parent) ? 1 : 0));
    }
    const inColumn = tree.isType(parent, "ctpl:column");
    const inTab = !inColumn && tree.isType(parent, "ctpl:tab");
    if (!inColumn && !inTab) return 2;
    const container = tree.parent(parent);
    tree.depend(container);
    const titled = tree.titled(container) ? 1 : 0;
    return clampLevel(sectionLevel(container, tree) + titled + (inTab ? 1 : 0));
  } catch {
    return 2;
  }
};

/**
 * Level of the headings one step inside a section (its cards, its tools, its body): one below the
 * section's heading when it shows one, the section's own level otherwise.
 */
export const innerLevel = (level: number, titled: boolean): Level =>
  clampLevel(titled ? level + 1 : level);

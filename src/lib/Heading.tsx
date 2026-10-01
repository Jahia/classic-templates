import { server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import type { ReactNode } from "react";
import { readString } from "./props.js";

/** Deepest heading level HTML has. */
const DEEPEST = 6;
const clampLevel = (level: number) => Math.min(Math.max(level, 2), DEEPEST);

/**
 * Heading level of a section's title. Sections start at h2 (the page template owns the h1), and
 * step down inside a container that shows its own heading:
 * - in a column of a ctpl:columns row: one below the row's title when it shows one (h3 under an
 *   h2 row), the row's own level otherwise, so the outline never jumps from h1 to h3;
 * - in a tab of a ctpl:tabs section: one below the tab's label, which is itself a heading (one
 *   below the tabs title when it shows one).
 * Containers nest (a row in a tab), so the level is worked out up the tree. Each container is a
 * cache dependency: giving it a title, or removing it, re-renders the sections inside.
 */
const sectionLevel = (node: JCRNodeWrapper, renderContext: RenderContext): number => {
  try {
    const parent = node.getParent() as JCRNodeWrapper;
    if (!parent.isNodeType("ctpl:column") && !parent.isNodeType("ctpl:tab")) return 2;
    const container = parent.getParent() as JCRNodeWrapper;
    server.render.addCacheDependency({ node: container }, renderContext);
    const titled = readString(container, "jcr:title") ? 1 : 0;
    const inTab = parent.isNodeType("ctpl:tab") ? 1 : 0;
    return clampLevel(sectionLevel(container, renderContext) + titled + inTab);
  } catch {
    return 2;
  }
};

/** Heading level of a section's own title (see sectionLevel). */
export const useHeadingLevel = (node: JCRNodeWrapper): number => {
  const { renderContext } = useServerContext();
  return sectionLevel(node, renderContext);
};

/**
 * Heading level of an item rendered by a section's list (a card of a card grid): one below the
 * section's heading when the section shows a title, the section's own level otherwise. The section
 * is a cache dependency, for the same reason as the row above.
 */
export const useItemHeadingLevel = (item: JCRNodeWrapper): number => {
  const { renderContext } = useServerContext();
  try {
    const section = item.getParent() as JCRNodeWrapper;
    server.render.addCacheDependency({ node: section }, renderContext);
    const level = sectionLevel(section, renderContext);
    return clampLevel(readString(section, "jcr:title") ? level + 1 : level);
  } catch {
    return 3;
  }
};

/**
 * Level the headings inside a section's rich text start at: one below the section's own heading
 * when it shows one, the section's level otherwise (see RichText).
 */
export const useBodyHeadingLevel = (node: JCRNodeWrapper, hasTitle: boolean): number =>
  clampLevel(useHeadingLevel(node) + (hasTitle ? 1 : 0));

export type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

const TAGS: Record<number, HeadingTag> = { 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" };

/** The heading element of a level, h2 to h6 (a level out of range is clamped). */
export const headingTag = (level: number): HeadingTag => TAGS[clampLevel(Math.round(level))];

export const SectionHeading = ({
  node,
  id,
  className,
  children,
}: {
  node: JCRNodeWrapper;
  id?: string;
  className?: string;
  children: ReactNode;
}) => {
  const Tag = headingTag(useHeadingLevel(node));
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

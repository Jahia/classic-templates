import { server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import type { ReactNode } from "react";
import { readString } from "./props.js";

/**
 * Heading level of a section's title. Sections start at h2 (the page template owns the h1). A
 * section dropped in a column of a ctpl:columns row whose own title shows (an h2) steps down to
 * h3; under an untitled row it stays h2, so the outline never jumps from h1 to h3. The row is a
 * cache dependency: giving it a title, or removing it, re-renders the sections inside.
 */
const sectionLevel = (node: JCRNodeWrapper, renderContext: RenderContext): 2 | 3 => {
  try {
    const column = node.getParent();
    if (!column.isNodeType("ctpl:column")) return 2;
    const row = column.getParent() as JCRNodeWrapper;
    server.render.addCacheDependency({ node: row }, renderContext);
    return readString(row, "jcr:title") ? 3 : 2;
  } catch {
    return 2;
  }
};

/** Heading level of a section's own title (see sectionLevel). */
export const useHeadingLevel = (node: JCRNodeWrapper): 2 | 3 => {
  const { renderContext } = useServerContext();
  return sectionLevel(node, renderContext);
};

/**
 * Heading level of an item rendered by a section's list (a card of a card grid): one below the
 * section's heading when the section shows a title, the section's own level otherwise. The section
 * is a cache dependency, for the same reason as the row above.
 */
export const useItemHeadingLevel = (item: JCRNodeWrapper): 2 | 3 | 4 => {
  const { renderContext } = useServerContext();
  try {
    const section = item.getParent() as JCRNodeWrapper;
    server.render.addCacheDependency({ node: section }, renderContext);
    const level = sectionLevel(section, renderContext);
    return readString(section, "jcr:title") ? ((level + 1) as 3 | 4) : level;
  } catch {
    return 3;
  }
};

const TAGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

/** The heading element of a level: h2, h3 or h4. */
export const headingTag = (level: 2 | 3 | 4) => TAGS[level];

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
  const Tag = useHeadingLevel(node) === 3 ? "h3" : "h2";
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

import { server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import type { ReactNode } from "react";
import { readString } from "./props.js";

export type Level = 2 | 3 | 4;

const isType = (node: JCRNodeWrapper, type: string): boolean => {
  try {
    return node.isNodeType(type);
  } catch {
    return false;
  }
};

/**
 * Heading level of a section's title, following the classic-templates heading policy: sections
 * start at h2 (the page template owns the h1). A section dropped in a column of a ctpl:columns row,
 * or in a ctpl:freeZone, whose own title shows (an h2) steps down to h3; under an untitled row or
 * zone it stays h2, so the outline never jumps from h1 to h3. That container is a cache
 * dependency: giving it a title, or removing it, re-renders the sections inside.
 */
export const sectionLevel = (node: JCRNodeWrapper, renderContext: RenderContext): 2 | 3 => {
  try {
    const parent = node.getParent() as JCRNodeWrapper;
    let titled: JCRNodeWrapper | undefined;
    if (isType(parent, "ctpl:column")) titled = parent.getParent() as JCRNodeWrapper;
    else if (isType(parent, "ctpl:freeZone")) titled = parent;
    if (!titled) return 2;
    server.render.addCacheDependency({ node: titled }, renderContext);
    return readString(titled, "jcr:title") ? 3 : 2;
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
 * Heading level asked by the list rendering an item (the `headingLevel` parameter that
 * classic-templates' content list and this module's lists pass to the card view): one below the
 * list's heading. Clamped to h2-h4; rendered anywhere else, an item is an h3.
 */
export const useParamHeadingLevel = (): Level => {
  const { currentResource } = useServerContext();
  try {
    const level = Number(String(currentResource.getModuleParams().get("headingLevel")));
    return Math.min(Math.max(level || 3, 2), 4) as Level;
  } catch {
    return 3;
  }
};

const TAGS = { 2: "h2", 3: "h3", 4: "h4" } as const;

/** The heading element of a level: h2, h3 or h4. */
export const headingTag = (level: number) => TAGS[Math.min(Math.max(level, 2), 4) as Level];

export const Heading = ({
  level,
  id,
  className,
  children,
}: {
  level: number;
  id?: string;
  className?: string;
  children: ReactNode;
}) => {
  const Tag = headingTag(level);
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

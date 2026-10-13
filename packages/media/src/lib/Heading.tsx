import { server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import type { ReactNode } from "react";
import { clampLevel, sectionLevel as levelInTree, type Level } from "./level.js";
import { readString } from "./props.js";

export type { Level } from "./level.js";

const isType = (node: JCRNodeWrapper, type: string): boolean => {
  try {
    return node.isNodeType(type);
  } catch {
    return false;
  }
};

/**
 * Heading level of a section's title, following the classic-templates heading policy (see
 * level.ts): h2 in a page area, stepping down inside titled columns rows, tabs (one below the tab
 * label) and free zones, nested containers included, clamped to h6. Each container is a cache
 * dependency: giving it a title, or removing it, re-renders the sections inside.
 */
export const sectionLevel = (node: JCRNodeWrapper, renderContext: RenderContext): Level =>
  levelInTree(node, {
    parent: (n) => n.getParent() as JCRNodeWrapper,
    isType,
    titled: (n) => Boolean(readString(n, "jcr:title")),
    depend: (n) => server.render.addCacheDependency({ node: n }, renderContext),
  });

/** Heading level of a section's own title (see sectionLevel). */
export const useHeadingLevel = (node: JCRNodeWrapper): Level => {
  const { renderContext } = useServerContext();
  return sectionLevel(node, renderContext);
};

/**
 * Heading level asked by the list rendering an item (the `headingLevel` parameter that
 * classic-templates' content list and this module's lists pass to the card view): one below the
 * list's heading. Clamped to h2-h6; rendered anywhere else, an item is an h3.
 */
export const useParamHeadingLevel = (): Level => {
  const { currentResource } = useServerContext();
  try {
    const param = currentResource.getModuleParams().get("headingLevel");
    const level = typeof param === "string" ? Number(param) : 0;
    return clampLevel(level || 3);
  } catch {
    return 3;
  }
};

const TAGS = { 2: "h2", 3: "h3", 4: "h4", 5: "h5", 6: "h6" } as const;

/** The heading element of a level, h2 to h6 (a level out of range is clamped). */
export const headingTag = (level: number) => TAGS[clampLevel(level)];

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

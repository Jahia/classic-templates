import { server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { ReactNode } from "react";

/**
 * Heading level of a section's title. Sections start at h2 (the page template owns the h1). A
 * section dropped in a column of a ctpl:columns row whose own title shows (an h2) steps down to
 * h3; under an untitled row it stays h2, so the outline never jumps from h1 to h3. The row is a
 * cache dependency: giving it a title, or removing it, re-renders the sections inside.
 */
export const useHeadingLevel = (node: JCRNodeWrapper): 2 | 3 => {
  const { renderContext } = useServerContext();
  try {
    const column = node.getParent();
    if (!column.isNodeType("ctpl:column")) return 2;
    const row = column.getParent();
    server.render.addCacheDependency({ node: row }, renderContext);
    const title = row.hasProperty("jcr:title") ? row.getProperty("jcr:title").getString() : "";
    return title ? 3 : 2;
  } catch {
    return 2;
  }
};

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

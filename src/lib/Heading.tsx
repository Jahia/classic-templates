import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { ReactNode } from "react";

/**
 * Heading level of a section's title. Sections start at h2 (the page template owns the h1); a
 * section dropped in a column of a ctpl:columns row is subordinate to that row, so it steps down
 * to h3. Keeps the document outline strict (h1 > h2 > h3) whatever editors nest.
 */
export const headingLevelFor = (node: JCRNodeWrapper): 2 | 3 => {
  try {
    return node.getParent().isNodeType("ctpl:column") ? 3 : 2;
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
  const Tag = headingLevelFor(node) === 3 ? "h3" : "h2";
  return (
    <Tag id={id} className={className}>
      {children}
    </Tag>
  );
};

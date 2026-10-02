import type { JCRNodeWrapper } from "org.jahia.services.content";

/** A string property of `node`, or undefined when absent or empty. */
export const readString = (node: JCRNodeWrapper, name: string): string | undefined =>
  node.hasProperty(name) ? node.getProperty(name).getString() || undefined : undefined;

/** A positive long property of `node` (e.g. j:width), or undefined. */
export const readPositive = (node: JCRNodeWrapper, name: string): number | undefined => {
  if (!node.hasProperty(name)) return undefined;
  const value = Number(node.getProperty(name).getLong());
  return value > 0 ? value : undefined;
};

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

/** A number property of `node` (a double such as a price), or undefined when absent. */
export const readNumber = (node: JCRNodeWrapper, name: string): number | undefined => {
  if (!node.hasProperty(name)) return undefined;
  const value = Number(node.getProperty(name).getDouble());
  return Number.isFinite(value) ? value : undefined;
};

/**
 * The node a weakreference property of `node` points at, or undefined when it is not set, was
 * deleted, or is not readable in this workspace (not published yet).
 */
export const readReference = (node: JCRNodeWrapper, name: string): JCRNodeWrapper | undefined => {
  try {
    return node.hasProperty(name)
      ? (node.getProperty(name).getNode() as JCRNodeWrapper)
      : undefined;
  } catch {
    return undefined;
  }
};

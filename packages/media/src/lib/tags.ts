import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { readReference } from "./props.js";
import { safeLocalPath } from "./urls.js";

/** The item's tags (j:tagList, which Jahia offers on every node), in their order, without repeats. */
export const tagsOf = (node: JCRNodeWrapper): string[] => {
  const tags: string[] = [];
  if (!node.hasProperty("j:tagList")) return tags;
  for (const value of node.getProperty("j:tagList").getValues()) {
    const tag = (value as unknown as { getString(): string }).getString().trim();
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
};

/** The search page's address for `tag`: `page` with `q` (the search section's parameter) set. */
export const tagSearchUrl = (page: string, tag: string): string =>
  `${page}${page.includes("?") ? "&" : "?"}q=${encodeURIComponent(tag)}`;

/**
 * A function giving the address of the search results for one tag, from the classic-templates
 * site header's Search page; undefined when the site names none (tags are then plain text). The
 * header is a cache dependency.
 */
export const tagSearch = (
  node: JCRNodeWrapper,
  renderContext: RenderContext,
): ((tag: string) => string) | undefined => {
  try {
    const header = node.getResolveSite().getHome().getNode("siteHeader/header");
    server.render.addCacheDependency({ node: header }, renderContext);
    const page = readReference(header, "searchPage");
    const url = page ? safeLocalPath(buildNodeUrl(page)) : undefined;
    return url ? (tag) => tagSearchUrl(url, tag) : undefined;
  } catch {
    return undefined;
  }
};

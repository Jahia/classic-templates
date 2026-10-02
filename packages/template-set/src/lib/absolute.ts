import type { RenderContext } from "org.jahia.services.render";

/** scheme://host[:port] of the current request, for absolute URLs (JSON-LD, Open Graph). */
export const originOf = (renderContext: RenderContext): string => {
  const request = renderContext.getRequest();
  const scheme = request.getScheme();
  const port = request.getServerPort();
  const standard = (scheme === "https" && port === 443) || (scheme === "http" && port === 80);
  const portSuffix = standard || port <= 0 ? "" : `:${port}`;
  return `${scheme}://${request.getServerName()}${portSuffix}`;
};

/** A site path made absolute on the current request's origin; full URLs pass through. */
export const absoluteUrl = (origin: string, path: string): string => {
  if (/^https?:\/\//.test(path)) return path;
  const separator = path.startsWith("/") ? "" : "/";
  return `${origin}${separator}${path}`;
};

import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";

const num = (node: JCRNodeWrapper, name: string): number | undefined => {
  if (!node.hasProperty(name)) return undefined;
  const value = Number(node.getProperty(name).getLong());
  return value > 0 ? value : undefined;
};

/**
 * An image from the media library.
 *
 * - alt: the image's own title in the library (jcr:title), or "" when `decorative`.
 * - width/height: the image's intrinsic size (j:width / j:height of jmix:image), so the browser
 *   reserves the space and the layout does not shift while it loads.
 * - `priority` for the banner image at the top of the page (eager, high fetch priority); every
 *   other image loads lazily.
 * The image node is declared as a cache dependency: renaming it in the library updates the alt text.
 */
export const Image = ({
  node,
  renderContext,
  className,
  priority = false,
  decorative = false,
}: {
  node: JCRNodeWrapper;
  renderContext: RenderContext;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) => {
  server.render.addCacheDependency({ node }, renderContext);
  const title = node.hasProperty("jcr:title") ? node.getProperty("jcr:title").getString() : "";
  return (
    <img
      className={className}
      src={buildNodeUrl(node)}
      alt={decorative ? "" : title}
      width={num(node, "j:width")}
      height={num(node, "j:height")}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
};

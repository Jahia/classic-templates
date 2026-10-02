import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { readPositive, readString } from "./props.js";

/**
 * An image from the media library.
 *
 * - alt: "" when `decorative` or when `owner` (the node carrying ctplmix:media) marks it decorative;
 *   else `alt` when the caller worked it out itself (a linked logo), else the owner's imageAlt
 *   (what the image means there, per language); else the image's own title in the library
 *   (jcr:title).
 * - width/height: the image's intrinsic size (j:width / j:height of jmix:image), so the browser
 *   reserves the space and the layout does not shift while it loads.
 * - `priority` for the banner image at the top of the page (eager, high fetch priority); every
 *   other image loads lazily.
 * The image node is declared as a cache dependency: renaming it in the library updates the alt text.
 * A content image whose library title is empty would silently get alt="": edit mode flags it.
 */
export const Image = ({
  node,
  renderContext,
  className,
  priority = false,
  decorative = false,
  owner,
  alt,
}: {
  node: JCRNodeWrapper;
  /** The node whose ctplmix:media points at the image, for its imageAlt / imageDecorative. */
  owner?: JCRNodeWrapper;
  renderContext: RenderContext;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
  /** The text alternative, when the caller resolves it (see above). */
  alt?: string;
}) => {
  const { t } = useTranslation("classic-templates");
  server.render.addCacheDependency({ node }, renderContext);
  const hidden = decorative || (owner ? readString(owner, "imageDecorative") === "true" : false);
  const title =
    alt || (owner && readString(owner, "imageAlt")) || readString(node, "jcr:title") || "";
  const img = (
    <img
      className={className}
      src={buildNodeUrl(node)}
      alt={hidden ? "" : title}
      width={readPositive(node, "j:width")}
      height={readPositive(node, "j:height")}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
    />
  );
  if (hidden || title || !renderContext.isEditMode()) return img;
  return (
    <>
      {img}
      <span className="ctpl-edit-hint">{t("image.noTitle")}</span>
    </>
  );
};

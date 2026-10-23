import { JImage, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { readString } from "./props.js";

/**
 * An image from the media library.
 *
 * - alt: "" when `decorative` or when `owner` (the node carrying ctplmix:media) marks it decorative;
 *   else `alt` when the caller worked it out itself (a linked logo), else the owner's imageAlt
 *   (what the image means there, per language); else the image's own title in the library
 *   (jcr:title).
 * - JImage (javascript-modules 1.3) writes width/height from the image's intrinsic size, so the
 *   layout does not shift, and a srcset of resized candidates: they take effect with a DAM or an
 *   image resizer; on a default Jahia every candidate serves the original file. `sizes` tells the
 *   browser how wide the image shows (default: "auto, 100vw" when lazy, "100vw" when eager).
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
  sizes,
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
  /** How wide the image shows, for the srcset choice: `sizes` entries, most specific first. */
  sizes?: string[];
  /** The text alternative, when the caller resolves it (see above). */
  alt?: string;
}) => {
  const { t } = useTranslation("classic-templates");
  server.render.addCacheDependency({ node }, renderContext);
  const hidden = decorative || (owner ? readString(owner, "imageDecorative") === "true" : false);
  const title =
    alt || (owner && readString(owner, "imageAlt")) || readString(node, "jcr:title") || "";
  const img = (
    <JImage
      src={node}
      className={className}
      alt={hidden ? "" : title}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      {...(sizes ? { sizes } : {})}
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

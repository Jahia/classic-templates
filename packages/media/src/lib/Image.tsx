import { JImage, Render, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useT } from "./i18n.js";
import { readString } from "./props.js";
import classes from "./shared.module.css";

/** A Cloudinary 3D model (picked where an image goes) renders through its own view, not an `<img>`. */
const MODEL_3D = "cloudynt:model3d";

/** False where the type is not defined (no Cloudinary module): `isNodeType` may throw there. */
export const isModel3d = (node: JCRNodeWrapper): boolean => {
  try {
    return node.isNodeType(MODEL_3D);
  } catch {
    return false;
  }
};

/**
 * An image from the media library, with the classic-templates ctplmix:media rules.
 *
 * - alt: "" when `decorative` or when `owner` (the node carrying ctplmix:media) marks it decorative;
 *   else the owner's imageAlt (what the image means there, per language); else the image's own
 *   title in the library (jcr:title).
 * - JImage (javascript-modules 1.3) writes width/height from the image's intrinsic size, so the
 *   layout does not shift, and a srcset of resized candidates: they take effect with a DAM or an
 *   image resizer; on a default Jahia every candidate serves the original file. `sizes` tells the
 *   browser how wide the image shows (default: "auto, 100vw" when lazy, "100vw" when eager).
 * - `priority` for the image at the top of a page (eager, high fetch priority); every other image
 *   loads lazily.
 * The image node is a cache dependency: renaming it in the library updates the alt text. A content
 * image whose library title is empty would silently get alt="": edit mode flags it. A Cloudinary
 * 3D model (cloudynt:model3d) renders its own default view instead, in `className`.
 */
export const Image = ({
  node,
  renderContext,
  className,
  priority = false,
  decorative = false,
  sizes,
  owner,
}: {
  node: JCRNodeWrapper;
  owner?: JCRNodeWrapper;
  renderContext: RenderContext;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
  /** How wide the image shows, for the srcset choice: `sizes` entries, most specific first. */
  sizes?: string[];
}) => {
  const t = useT();
  if (isModel3d(node)) {
    return className ? (
      <span className={className}>
        <Render node={node} />
      </span>
    ) : (
      <Render node={node} />
    );
  }
  server.render.addCacheDependency({ node }, renderContext);
  const hidden = decorative || (owner ? readString(owner, "imageDecorative") === "true" : false);
  const title = (owner && readString(owner, "imageAlt")) || readString(node, "jcr:title") || "";
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
      <span className={classes.hint}>{t("image.noTitle")}</span>
    </>
  );
};

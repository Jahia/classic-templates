import { buildNodeUrl, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useT } from "./i18n.js";
import { readPositive, readString } from "./props.js";
import classes from "./shared.module.css";

/**
 * An image from the media library, with the classic-templates ctplmix:media rules.
 *
 * - alt: "" when `decorative` or when `owner` (the node carrying ctplmix:media) marks it decorative;
 *   else the owner's imageAlt (what the image means there, per language); else the image's own
 *   title in the library (jcr:title).
 * - width/height: the image's intrinsic size (j:width / j:height), so the layout does not shift.
 * - `priority` for the image at the top of a page (eager, high fetch priority); every other image
 *   loads lazily.
 * The image node is a cache dependency: renaming it in the library updates the alt text. A content
 * image whose library title is empty would silently get alt="": edit mode flags it.
 */
export const Image = ({
  node,
  renderContext,
  className,
  priority = false,
  decorative = false,
  owner,
}: {
  node: JCRNodeWrapper;
  owner?: JCRNodeWrapper;
  renderContext: RenderContext;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) => {
  const t = useT();
  server.render.addCacheDependency({ node }, renderContext);
  const hidden = decorative || (owner ? readString(owner, "imageDecorative") === "true" : false);
  const title = (owner && readString(owner, "imageAlt")) || readString(node, "jcr:title") || "";
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
      <span className={classes.hint}>{t("image.noTitle")}</span>
    </>
  );
};

import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { resolveLink } from "./resolveLink.js";
import classes from "./cta.module.css";

/**
 * The call to action stored on `node` by ctplmix:cta (Jahia link picker + ctaLabel). Renders a
 * button-styled link, or nothing when there is no link in the current language; in edit mode it
 * then shows why, so the editor can fix the missing label or translation of the link.
 */
export const Cta = ({
  node,
  label,
  renderContext,
  variant = "primary",
}: {
  node: JCRNodeWrapper;
  label?: string;
  renderContext: RenderContext;
  /** "primary" (filled), "secondary" (outlined), "onOverlay" (light, over a photo). */
  variant?: "primary" | "secondary" | "onOverlay";
}) => {
  const { t } = useTranslation();
  const { link, missingTarget } = resolveLink(node, renderContext);
  const text = label || link?.targetTitle;
  if (link && text) {
    return (
      <p className={classes.wrap}>
        <a className={`${classes.cta} ${classes[variant]}`} href={link.href} data-testid="ctpl-cta">
          {text}
        </a>
      </p>
    );
  }
  if (!renderContext.isEditMode() || (!missingTarget && !label)) return null;
  return (
    <p className={classes.hint} data-testid="ctpl-cta-hint">
      {missingTarget ? t("link.noTarget") : t("cta.noLabel")}
    </p>
  );
};

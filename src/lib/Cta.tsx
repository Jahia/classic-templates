import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { readString } from "./props.js";
import { resolveLink } from "./resolveLink.js";
import classes from "./cta.module.css";

/**
 * The call to action stored on `node` by ctplmix:cta (Jahia link picker + ctaLabel). Renders a
 * button-styled link, or nothing when there is no link in the current language; in edit mode it
 * then shows why, so the editor can fix the missing label or translation of the link.
 *
 * Safe on any node: without the mixin (an editor who did not switch it on) there is no link and no
 * label, so it renders nothing, in edit mode too. Every section view ends with it for that reason.
 * `label` defaults to the node's ctaLabel.
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
  /**
   * "primary" (filled), "secondary" (outlined), "onOverlay" (light, over a photo), "link" (a text
   * link with a 44 px target, for slim bands).
   */
  variant?: "primary" | "secondary" | "onOverlay" | "link";
}) => {
  const { t } = useTranslation();
  const { link, missingTarget } = resolveLink(node, renderContext);
  const ctaLabel = label ?? readString(node, "ctaLabel");
  const text = ctaLabel || link?.targetTitle;
  if (link && text) {
    return (
      <p className={classes.wrap}>
        <a className={`${classes.cta} ${classes[variant]}`} href={link.href} data-testid="ctpl-cta">
          {text}
        </a>
      </p>
    );
  }
  if (!renderContext.isEditMode()) return null;
  // Edit mode only: say which half of the button is missing. Nothing when neither is set (the
  // editor did not ask for a button).
  let hint: string | undefined;
  if (missingTarget) hint = t("link.noTarget");
  else if (link)
    hint = t("cta.noLabel"); // a link, but no label and no title to fall back on
  else if (ctaLabel) hint = t("cta.noLink"); // a label, but "No link"
  if (!hint) return null;
  return (
    <p className={classes.hint} data-testid="ctpl-cta-hint">
      {hint}
    </p>
  );
};

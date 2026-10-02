import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useT } from "./i18n.js";
import { readString } from "./props.js";
import { resolveLink } from "./resolveLink.js";
import classes from "./cta.module.css";

/**
 * The call to action stored on `node` by classic-templates' ctplmix:cta (Jahia link picker +
 * ctaLabel), drawn like the classic-templates buttons. Renders a button-styled link, or nothing
 * when there is no link in the current language; in edit mode it then says why. Safe on any node:
 * without the mixin there is no link and no label, so it renders nothing.
 */
export const Cta = ({
  node,
  renderContext,
  variant = "primary",
}: {
  node: JCRNodeWrapper;
  renderContext: RenderContext;
  variant?: "primary" | "secondary";
}) => {
  const t = useT();
  const { link, missingTarget } = resolveLink(node, renderContext);
  const ctaLabel = readString(node, "ctaLabel");
  const text = ctaLabel || link?.targetTitle;
  if (link && text) {
    return (
      <p className={classes.wrap}>
        <a className={`${classes.cta} ${classes[variant]}`} href={link.href} data-testid="ctrv-cta">
          {text}
        </a>
      </p>
    );
  }
  if (!renderContext.isEditMode()) return null;
  let hint: string | undefined;
  if (missingTarget) hint = t("cta.noTarget");
  else if (link) hint = t("cta.noLabel");
  else if (ctaLabel) hint = t("cta.noLink");
  if (!hint) return null;
  return (
    <p className={classes.hint} data-testid="ctrv-cta-hint">
      {hint}
    </p>
  );
};

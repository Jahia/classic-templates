import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { resolveLink } from "../../../lib/resolveLink.js";
import type { Props } from "./types.js";
import classes from "./link.module.css";

/**
 * One list item. The parent list owns the <ul>; this view renders the <li> so the list keeps valid
 * structure when Page Builder wraps each child for selection.
 *
 * With no target in the current language, the label renders without a link (never href="#"), and
 * edit mode adds a hint so the editor notices the missing translation of the link.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:link", displayName: "Link" },
  ({ "jcr:title": title, openInNewTab }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation();
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    const label = title || link?.targetTitle;
    const isEdit = renderContext.isEditMode();

    if (!link) {
      if (!isEdit) return label ? <li className={classes.item}>{label}</li> : null;
      return (
        <li className={classes.item} data-testid="ctpl-link">
          {label || t("link.untitled")}
          {missingTarget && <span className={classes.hint}>{t("link.noTarget")}</span>}
        </li>
      );
    }

    const newTab = Boolean(openInNewTab);
    return (
      <li className={classes.item} data-testid="ctpl-link">
        <a
          className={classes.link}
          href={link.href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
        >
          {label || link.href}
          {newTab && <span className="ctpl-visually-hidden"> ({t("link.newTab")})</span>}
        </a>
      </li>
    );
  },
);

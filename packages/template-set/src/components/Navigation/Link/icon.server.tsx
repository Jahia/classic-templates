import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { resolveLink } from "../../../lib/resolveLink.js";
import { socialIconOf } from "../../../lib/socialIcons.js";
import type { Props } from "./types.js";
import classes from "./link.module.css";

/**
 * "icon": a link to a social network shows the network's icon (src/lib/socialIcons.ts, recognised
 * from the address). Its name for assistive technology is the link's title, else the network's,
 * kept as visually hidden text with the "opens in a new tab" notice. A link to any other address,
 * or with no target, renders as the default view does: text. Used by the footer's social links.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:link", name: "icon", displayName: "Link as an icon" },
  ({ "jcr:title": title, openInNewTab }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    const icon = socialIconOf(link?.href);
    const newTab = Boolean(openInNewTab);
    const label = title || icon?.name || link?.targetTitle;
    if (!link) {
      if (!renderContext.isEditMode())
        return label ? <li className={classes.item}>{label}</li> : null;
      return (
        <li className={classes.item} data-testid="ctpl-link">
          {label || t("link.untitled")}
          {missingTarget && <span className={classes.hint}>{t("link.noTarget")}</span>}
        </li>
      );
    }
    return (
      <li className={classes.item} data-testid="ctpl-link">
        <a
          className={icon ? classes.iconLink : classes.link}
          href={link.href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          data-social={icon?.id}
        >
          {icon && (
            <svg className={classes.icon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d={icon.path} fill="currentColor" />
            </svg>
          )}
          <span className={icon ? "ctpl-visually-hidden" : undefined}>{label || link.href}</span>
          {newTab && <span className="ctpl-visually-hidden"> ({t("link.newTab")})</span>}
        </a>
      </li>
    );
  },
);

import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { resolveLink } from "../../../lib/resolveLink.js";
import { pageSite } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./link.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/**
 * "network": one site of a network bar (ctpl:networkBar). Same rules as the default view (an <li>,
 * no link without a target in this language, an edit hint), plus: the link whose internal target
 * belongs to the site of the page being viewed carries aria-current="true" and is drawn as the
 * current one. An external link is never current: its address says nothing about this site.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:link", name: "network", displayName: "Network site" },
  ({ "jcr:title": title, openInNewTab }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const { link, missingTarget } = resolveLink(currentNode, renderContext);
    const label = title || link?.targetTitle;
    const isEdit = renderContext.isEditMode();

    if (!link) {
      if (!isEdit)
        return label ? (
          <li className={classes.item} data-testid="ctpl-network-site">
            {label}
          </li>
        ) : null;
      return (
        <li className={classes.item} data-testid="ctpl-network-site">
          {label || t("link.untitled")}
          {missingTarget && <EditNote inline>{t("link.noTarget")}</EditNote>}
        </li>
      );
    }

    const current = !link.external && link.siteKey === pageSite(renderContext).getSiteKey();
    const newTab = Boolean(openInNewTab);
    return (
      <li className={classes.item} data-testid="ctpl-network-site">
        <a
          className={current ? `${classes.network} ${classes.current}` : classes.network}
          href={link.href}
          aria-current={current ? "true" : undefined}
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

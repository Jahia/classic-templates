import { RenderChildren, getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import type { Props } from "./types.js";
import classes from "./network-bar.module.css";

/**
 * The network bar: the group's name and one link per site of the group (ctpl:link, "network"
 * view, which marks the site being viewed with aria-current).
 *
 * - A navigation landmark named by the label (or a translated default, for screen readers only).
 *   In the header area it sits beside the site header, never inside it: one banner landmark.
 * - On the inverse surface, the one surface whose text pair is contrast-checked for every theme
 *   and scheme (text-inverse on surface-inverse); the focus ring takes that text colour.
 * - Nothing on the live site without a link; in edit mode an empty bar says what to add.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:networkBar", displayName: "Network bar" },
  ({ label }: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const isEdit = renderContext.isEditMode();
    const empty =
      getChildNodes(currentNode, 1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctpl:link")).length ===
      0;
    if (!isEdit && empty) return null;
    const labelId = `ctpl-network-${currentNode.getIdentifier()}`;
    return (
      <nav className={classes.bar} aria-labelledby={labelId} data-testid="ctpl-network-bar">
        <div className={`ctpl-container ${classes.inner}`}>
          <p id={labelId} className={label ? classes.label : "ctpl-visually-hidden"}>
            {label || t("network.label")}
          </p>
          {isEdit && empty && (
            <p className={`ctpl-edit-hint ${classes.hint}`}>{t("network.empty")}</p>
          )}
          <ul className={classes.sites}>
            <RenderChildren view="network" />
          </ul>
        </div>
      </nav>
    );
  },
);

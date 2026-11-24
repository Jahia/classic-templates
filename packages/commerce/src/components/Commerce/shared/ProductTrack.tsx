import { Render } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { RAW, useT } from "../../../lib/i18n.js";
import classes from "./track.module.css";

/**
 * A row of product cards that scrolls sideways. Its name differs from the section's own
 * ("Bestsellers, scroll sideways"), so two landmarks never share one name (axe landmark-unique).
 *, in CSS only (scroll snapping, no script). The row
 * is a labelled, focusable region so keyboard users can scroll it with the arrow keys (WCAG 2.1.1);
 * it follows the page's direction, so it starts on the right on an Arabic page. Each product is
 * rendered with its own card view, one heading level below the section's.
 */
export const ProductTrack = ({
  items,
  label,
  headingLevel,
}: {
  items: JCRNodeWrapper[];
  label: string;
  headingLevel: number;
}) => {
  const t = useT();
  return (
    // A scrollable region must be reachable from the keyboard: tabIndex makes it focusable.
    <div
      className={classes.region}
      role="region"
      aria-label={t("track.scroll", { title: label || t("track.label"), ...RAW })}
      tabIndex={0}
    >
      <ul className={classes.track}>
        {items.map((item) => (
          <li key={item.getIdentifier()} className={classes.item}>
            <Render node={item} view="card" parameters={{ headingLevel: String(headingLevel) }} />
          </li>
        ))}
      </ul>
    </div>
  );
};

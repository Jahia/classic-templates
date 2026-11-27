import { Render } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import classes from "./track.module.css";

/**
 * A row of product cards that scrolls sideways, in CSS only (scroll snapping, no script). Every
 * card holds a link, so keyboard users reach each one with Tab and the row scrolls to it: the row
 * itself needs no focus nor role. It follows the page's direction, so it starts on the right on an
 * Arabic page. Each product is rendered with its own card view, one heading level below the
 * section's.
 */
export const ProductTrack = ({
  items,
  headingLevel,
}: {
  items: JCRNodeWrapper[];
  headingLevel: number;
}) => {
  return (
    <div className={classes.region}>
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

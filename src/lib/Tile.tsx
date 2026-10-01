import type { ReactNode } from "react";
import type { HeadingTag } from "./Heading.js";
import classes from "./tile.module.css";

/**
 * An outlined square tile: an optional small icon, a heading and a short text. With `href`, the
 * heading link is stretched over the whole tile (one link, named by the heading); the tile draws
 * the focus ring. Used by the card grid's "icon tiles" display, for written cards and for teasers
 * of news or articles (their "tile" view). `children` go last (edit-mode hints).
 */
export const Tile = ({
  heading,
  headingTag: Heading,
  href,
  text,
  icon,
  testId,
  children,
}: {
  heading?: string;
  headingTag: HeadingTag;
  href?: string;
  text?: string;
  icon?: ReactNode;
  testId: string;
  children?: ReactNode;
}) => (
  <article className={classes.tile} data-testid={testId}>
    <div className={classes.content}>
      {icon && <div className={classes.icon}>{icon}</div>}
      {heading && (
        <Heading className={classes.title}>
          {href ? (
            <a className={classes.stretched} href={href}>
              {heading}
            </a>
          ) : (
            heading
          )}
        </Heading>
      )}
      {text && <p className={classes.text}>{text}</p>}
      {children}
    </div>
  </article>
);

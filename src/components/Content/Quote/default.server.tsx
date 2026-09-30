import { jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { Image } from "../../../lib/Image.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./quote.module.css";

/**
 * A quotation with the person's name, role and portrait: a figure with a blockquote and its
 * caption. Quotation marks are added by CSS in the page's language style (“ ” in English, « » in
 * French), so editors type none. The portrait is decorative: the name next to it says who it is.
 * "large" renders a pull quote. Without a quotation in this language nothing is rendered.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:quote", displayName: "Quote" },
  (
    { quote, author, authorRole, variant, image, ctplSurface }: Props,
    { currentNode, renderContext },
  ) => {
    const { t } = useTranslation();
    if (!quote) {
      return renderContext.isEditMode() ? (
        <p className="ctpl-container ctpl-edit-hint">{t("quote.empty")}</p>
      ) : null;
    }
    return (
      <Section surface={ctplSurface} testId="ctpl-quote">
        <div className="ctpl-container">
          <figure className={`${classes.quote} ${variant === "large" ? classes.large : ""}`}>
            <blockquote className={classes.text}>
              <p>{quote}</p>
            </blockquote>
            {(author || authorRole) && (
              <figcaption className={classes.caption}>
                {image && (
                  <span className={classes.portrait}>
                    <Image node={image} renderContext={renderContext} decorative />
                  </span>
                )}
                <span>
                  {author && <span className={classes.author}>{author}</span>}
                  {authorRole && <span className={classes.role}>{authorRole}</span>}
                </span>
              </figcaption>
            )}
          </figure>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

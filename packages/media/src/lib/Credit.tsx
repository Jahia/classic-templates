import { server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { CREDIT_PROPERTY, normalizeCredit } from "./creditText.js";
import { RAW, useT } from "./i18n.js";
import { readString } from "./props.js";
import classes from "./credit.module.css";

/**
 * The credit of a media file (ctmdmix:credited), or undefined: the file has no such property, or it
 * is blank. The file is a cache dependency (as in Image), so a credit edited in the media library
 * reaches the cached pages that show the picture.
 */
export const creditOf = (
  node: JCRNodeWrapper | undefined,
  renderContext: RenderContext,
): string | undefined => {
  if (!node) return undefined;
  server.render.addCacheDependency({ node }, renderContext);
  return normalizeCredit(readString(node, CREDIT_PROPERTY));
};

/** "Photo: <credit>" in the page language; the credit is content, so it is not escaped twice. */
const useLine = (credit: string) => useT()("credit.photo", { credit, ...RAW });

/**
 * The credit as a caption of its own, for a figure that has none: `<figcaption>Photo: ...</figcaption>`.
 * Renders nothing when `credit` is undefined, so a file without a credit changes no output.
 */
export const CreditCaption = ({ credit }: { credit: string | undefined }) =>
  credit ? <CreditCaptionLine credit={credit} /> : null;

const CreditCaptionLine = ({ credit }: { credit: string }) => (
  <figcaption className={classes.caption} data-testid="ctmd-credit">
    {useLine(credit)}
  </figcaption>
);

/**
 * The credit as a line inside a caption the figure already has (a figure holds one figcaption).
 * Renders nothing when `credit` is undefined.
 */
export const CreditLine = ({ credit }: { credit: string | undefined }) =>
  credit ? <CreditLineText credit={credit} /> : null;

const CreditLineText = ({ credit }: { credit: string }) => (
  <span className={classes.line} data-testid="ctmd-credit">
    {useLine(credit)}
  </span>
);

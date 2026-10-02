import { useServerContext } from "@jahia/javascript-modules-library";
import { RAW, useT } from "./i18n.js";
import { sanitizeRichTextWithReport } from "./sanitize.js";
import classes from "./shared.module.css";

/**
 * Renders a rich-text property written by an editor (a destination's body, a fare's conditions, a
 * travel tool's text).
 *
 * This is the module's ONLY raw-HTML sink, on purpose: every view renders rich text through it, so
 * static analysis of dangerouslySetInnerHTML points to exactly one place to justify. The
 * justification is the allow-list sanitizer applied right here (lib/sanitize.ts, the
 * classic-templates sanitizer), never platform-side HTML filtering, a site setting the module
 * cannot count on.
 *
 * `headingLevel` is the level the body's own headings start at: one below the heading that
 * introduces the text, so the page outline never skips a level. Ids the editor wrote are prefixed
 * with the block's identifier. Tables scroll inside a focusable region named after their caption
 * (or "Table", translated). The text takes the classic-templates `ctpl-prose` look. In edit mode,
 * an image without a text alternative and a table without a caption are flagged.
 */
export const RichText = ({
  html,
  className,
  headingLevel = 2,
}: {
  html?: string;
  className?: string;
  headingLevel?: number;
}) => {
  const t = useT();
  const { renderContext, currentNode } = useServerContext();
  if (!html) return null;
  const {
    html: clean,
    imageWithoutAlt,
    tableWithoutCaption,
  } = sanitizeRichTextWithReport(html, {
    headingLevel,
    idPrefix: `rt-${currentNode.getIdentifier().slice(0, 8)}-`,
    tableLabel: (index, total) =>
      total > 1 ? t("richText.tableNumbered", { number: index, ...RAW }) : t("richText.table"),
  });
  const isEdit = renderContext.isEditMode();
  return (
    <>
      <div
        className={className ? `ctpl-prose ${className}` : "ctpl-prose"}
        // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- sanitized just above (lib/sanitize.ts), see the component comment
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {isEdit && imageWithoutAlt && <p className={classes.hint}>{t("richText.imageWithoutAlt")}</p>}
      {isEdit && tableWithoutCaption && (
        <p className={classes.hint}>{t("richText.tableWithoutCaption")}</p>
      )}
    </>
  );
};

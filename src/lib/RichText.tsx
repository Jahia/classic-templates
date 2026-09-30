import { useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { sanitizeRichTextWithReport } from "./sanitize.js";

/**
 * Renders a rich-text property written by an editor in the Jahia rich-text editor.
 *
 * This is the module's ONLY raw-HTML sink, on purpose: every component renders rich text through
 * it, so the security scan (jahia-security-scan rule R10, dangerouslySetInnerHTML) reports exactly
 * one place to justify. The justification is the allow-list sanitizer applied right here
 * (lib/sanitize.ts), never platform-side HTML filtering, a site setting the template set
 * cannot count on. HTML from
 * any other system must still never be passed here without thought: it is sanitized the same
 * way, but its structure (whole documents, headings) is not editorial.
 *
 * `headingLevel` is the level the body's own headings start at: one below the heading that
 * introduces the text (h3 under a section h2), so the page outline never skips a level. Ids the
 * editor wrote are prefixed with the block's own identifier, so two blocks on a page never share
 * one. In edit mode, an image without a text alternative is flagged.
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
  const { t } = useTranslation();
  const { renderContext, currentNode } = useServerContext();
  if (!html) return null;
  const { html: clean, imageWithoutAlt } = sanitizeRichTextWithReport(html, {
    headingLevel,
    idPrefix: `rt-${currentNode.getIdentifier().slice(0, 8)}-`,
  });
  return (
    <>
      <div
        className={className ? `ctpl-prose ${className}` : "ctpl-prose"}
        // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- sanitized just above (lib/sanitize.ts), see the component comment
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      {renderContext.isEditMode() && imageWithoutAlt && (
        <p className="ctpl-edit-hint">{t("richText.imageWithoutAlt")}</p>
      )}
    </>
  );
};

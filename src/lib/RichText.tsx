import { sanitizeRichText } from "./sanitize.js";

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
 */
export const RichText = ({ html, className }: { html?: string; className?: string }) =>
  html ? (
    <div
      className={className ? `ctpl-prose ${className}` : "ctpl-prose"}
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- sanitized just above (lib/sanitize.ts), see the component comment
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  ) : null;

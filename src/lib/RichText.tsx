/**
 * Renders a rich-text property written by an editor in the Jahia rich-text editor.
 *
 * This is the module's ONLY raw-HTML sink, on purpose: every component renders rich text through
 * it, so the security scan (jahia-security-scan rule R10, dangerouslySetInnerHTML) reports exactly
 * one place to justify. The justification: the value is a Jahia `richtext` property, cleaned by
 * Jahia's HTML filtering when it is saved, and authored by editors of this site. HTML coming from
 * any other system (a CRM, a feed, an API) must never be passed here: sanitise it with an
 * allow-list first (see the AIStartupKit rule on external HTML).
 */
export const RichText = ({ html, className }: { html?: string; className?: string }) =>
  html ? (
    <div
      className={className ? `ctpl-prose ${className}` : "ctpl-prose"}
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml -- the one audited sink, see above
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;

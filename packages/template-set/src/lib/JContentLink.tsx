import { useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { jcontentUrl } from "./jcontent.js";

/**
 * "Open in jContent (new tab)": a link to `node` in jContent, in the page's language, for the notes
 * and panels editors read in Page Builder (a new tab, so Page Builder stays open). Edit mode only:
 * nothing in preview or live; nothing either for a node outside a site.
 */
export const JContentLink = ({
  node,
  className,
  testId,
}: {
  node?: JCRNodeWrapper;
  className?: string;
  testId?: string;
}) => {
  const { t } = useTranslation("classic-templates");
  const { renderContext, currentResource } = useServerContext();
  if (!node || !renderContext.isEditMode()) return null;
  const href = jcontentUrl(
    node.getPath(),
    currentResource.getLocale().toString(),
    renderContext.getRequest().getContextPath(),
  );
  if (!href) return null;
  return (
    <a className={className} href={href} target="_blank" rel="noopener" data-testid={testId}>
      {t("query.panel.openInJContent")}
    </a>
  );
};

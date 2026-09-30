import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { readString } from "../lib/props.js";
import { chromeOwner } from "../lib/site.js";
import classes from "./breadcrumb.module.css";

interface Crumb {
  title: string;
  href?: string;
}

/**
 * The pages between the home page and `node`, home first, `node` excluded. A node outside the
 * home tree (a news item in a content folder) gets the home page only. A page without a title in
 * this language is left out (its system name means nothing to visitors). Each page is a cache
 * dependency, so renaming or translating one refreshes the trails that show it.
 */
const trailOf = (
  node: JCRNodeWrapper,
  home: JCRNodeWrapper,
  renderContext: RenderContext,
): Crumb[] => {
  const crumb = (page: JCRNodeWrapper): Crumb => {
    server.render.addCacheDependency({ node: page }, renderContext);
    return { title: readString(page, "jcr:title") ?? page.getName(), href: buildNodeUrl(page) };
  };
  const homePath = home.getPath();
  if (!node.getPath().startsWith(`${homePath}/`)) return [crumb(home)];
  const pages: Crumb[] = [];
  try {
    let parent = node.getParent() as JCRNodeWrapper;
    while (parent.getPath() !== homePath) {
      if (parent.isNodeType("jnt:page") && readString(parent, "jcr:title")) {
        pages.unshift(crumb(parent));
      }
      parent = parent.getParent() as JCRNodeWrapper;
    }
  } catch {
    // an ancestor is not readable here: the trail stops at the readable part
  }
  return [crumb(home), ...pages];
};

/**
 * The breadcrumb trail of the page (or main resource) being rendered, above its content: every
 * page from home, then the current page, marked aria-current. Off on the home page, when the site
 * turns breadcrumbs off (ctplmix:siteSettings ctplShowBreadcrumb, on by default, including on
 * sites created before the setting existed) and on a page that hides it (ctplmix:pageOptions).
 * Carries schema.org BreadcrumbList microdata for search engines, without an inline script.
 */
export const Breadcrumb = () => {
  const { t } = useTranslation();
  const { mainNode, renderContext } = useServerContext();
  const site = renderContext.getSite();
  const home = chromeOwner(site);
  if (mainNode.getPath() === home.getPath() || home.getPath() === site.getPath()) return null;
  if (readString(site, "ctplShowBreadcrumb") === "false") return null;
  if (readString(mainNode, "ctplHideBreadcrumb") === "true") return null;

  const trail = trailOf(mainNode, home, renderContext);
  const current: Crumb = { title: readString(mainNode, "jcr:title") ?? mainNode.getName() };
  return (
    <nav
      aria-label={t("breadcrumb.label")}
      className="ctpl-container"
      data-testid="ctpl-breadcrumb"
    >
      <ol className={classes.trail} itemScope itemType="https://schema.org/BreadcrumbList">
        {[...trail, current].map((crumb, index) => (
          <li
            key={crumb.href ?? "current"}
            className={classes.crumb}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {crumb.href ? (
              <a href={crumb.href} itemProp="item">
                <span itemProp="name">{crumb.title}</span>
              </a>
            ) : (
              <span itemProp="name" aria-current="page">
                {crumb.title}
              </span>
            )}
            <meta itemProp="position" content={String(index + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
};

import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { readString } from "../lib/props.js";
import { chromeOwner, pageSite } from "../lib/site.js";
import { titleOf } from "../lib/title.js";
import { type Trail, type TrailTree, buildTrail } from "../lib/trail.js";
import classes from "./breadcrumb.module.css";

/**
 * The site's nodes as lib/trail.ts sees them, with the cache dependencies of the trail: every page
 * it links (renaming or translating one refreshes the trails that show it), and every content
 * folder it looks at for a listing page, with the listing page it finds (setting, changing or
 * clearing one refreshes the pages of the folder's items). Nothing above the site is read.
 */
const jcrTree = (renderContext: RenderContext): TrailTree<JCRNodeWrapper> => {
  const sitePath = pageSite(renderContext).getPath();
  const depend = (node: JCRNodeWrapper) =>
    server.render.addCacheDependency({ node }, renderContext);
  return {
    path: (node) => node.getPath(),
    parent: (node) => {
      if (node.getPath() === sitePath) return undefined;
      try {
        return node.getParent() as JCRNodeWrapper;
      } catch {
        return undefined; // not readable here: the trail stops at the readable part
      }
    },
    title: (node) => titleOf(node),
    name: (node) => node.getName(),
    href: (node) => {
      depend(node);
      return buildNodeUrl(node);
    },
    isPage: (node) => node.isNodeType("jnt:page"),
    listingPage: (folder) => {
      if (!folder.isNodeType("jnt:contentFolder")) return undefined;
      depend(folder);
      if (!folder.isNodeType("ctplmix:listingPage") || !folder.hasProperty("ctplListingPage")) {
        return undefined;
      }
      try {
        const page = folder.getProperty("ctplListingPage").getNode() as JCRNodeWrapper;
        depend(page);
        return page;
      } catch {
        return undefined; // deleted, or not published in this workspace
      }
    },
  };
};

/**
 * The breadcrumb trail of the page (or main resource) being rendered, home first, the current page
 * last (no href), or undefined when the page shows none: on the home page, when the site turns
 * breadcrumbs off (ctplmix:siteSettings ctplShowBreadcrumb, on by default, including on sites
 * created before the setting existed) and on a page that hides it (ctplmix:pageOptions). An item
 * stored in a content folder goes through the page that lists it (ctplmix:listingPage on the
 * folder, see lib/trail.ts). The home crumb reads `homeLabel` (the translated "Home"), not the
 * home page's title, which is often a long search-engine title. Shared by the visible trail and
 * the schema.org BreadcrumbList (templates/StructuredData.tsx), so both always agree.
 */
export const breadcrumbOf = (
  mainNode: JCRNodeWrapper,
  renderContext: RenderContext,
  homeLabel: string,
): Trail | undefined => {
  const site = pageSite(renderContext);
  const home = chromeOwner(site);
  if (mainNode.getPath() === home.getPath() || home.getPath() === site.getPath()) return undefined;
  if (readString(site, "ctplShowBreadcrumb") === "false") return undefined;
  if (readString(mainNode, "ctplHideBreadcrumb") === "true") return undefined;
  return buildTrail(jcrTree(renderContext), mainNode, home, homeLabel);
};

/**
 * The visible breadcrumb trail, above the page's content (see breadcrumbOf). In edit mode, an item
 * whose folders name no listing page says where to set one.
 */
export const Breadcrumb = () => {
  const { t } = useTranslation("classic-templates");
  const { mainNode, renderContext } = useServerContext();
  const trail = breadcrumbOf(mainNode, renderContext, t("breadcrumb.home"));
  if (!trail) return null;
  return (
    <nav
      aria-label={t("breadcrumb.label")}
      className="ctpl-container"
      data-testid="ctpl-breadcrumb"
    >
      <ol className={classes.trail}>
        {trail.crumbs.map((crumb) => (
          <li key={crumb.href ?? "current"} className={classes.crumb}>
            {crumb.href ? (
              <a href={crumb.href}>{crumb.title}</a>
            ) : (
              <span aria-current="page">{crumb.title}</span>
            )}
          </li>
        ))}
      </ol>
      {trail.unlisted && renderContext.isEditMode() && (
        <p className="ctpl-edit-hint" data-testid="ctpl-breadcrumb-hint">
          {t("breadcrumb.noListingPage")}
        </p>
      )}
    </nav>
  );
};

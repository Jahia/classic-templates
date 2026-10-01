import {
  AddResources,
  buildModuleFileUrl,
  server,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { readString as read } from "../lib/props.js";
import { pageSite, readSiteLook } from "../lib/site.js";

import "modern-normalize/modern-normalize.css";
import "./tokens.css";
import "./global.css";
import "./addons.css";
import { languageTag } from "../lib/locale.js";

/**
 * The HTML document around every page: the SEO and accessibility baseline lives here so no
 * template can forget it.
 *
 * - `<html lang>` from the rendering locale, never a literal.
 * - `data-ctpl-theme` / `data-ctpl-scheme` from the site settings: switching theme or light/dark
 *   is an attribute change, set by an administrator in jContent with no deploy.
 * - `<title>` is "<page> | <site>": `jcr:title` stays the short page name.
 * - `<meta name="description">` from the page's (or main resource's) description, falling back to
 *   the site description, so every page has one.
 * - A skip link to `#main-content`, the id of the template's `<main>`.
 *
 * The rendered page depends on the site node (theme, scheme, title, description), which is not a
 * child of the page: without an explicit cache dependency, publishing a new theme leaves every
 * cached live page on the old one.
 */
export const Layout = ({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) => {
  const { renderContext, currentResource } = useServerContext();
  const { t } = useTranslation("classic-templates");
  const site = pageSite(renderContext);
  server.render.addCacheDependency({ node: site }, renderContext);
  const siteName = site.getTitle() || site.getName();
  const { theme, scheme } = readSiteLook(site);
  const metaDescription = description || read(site, "j:description");

  return (
    <html
      lang={languageTag(currentResource.getLocale())}
      data-ctpl-theme={theme}
      data-ctpl-scheme={scheme}
    >
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title && title !== siteName ? `${title} | ${siteName}` : siteName}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
      </head>
      <body>
        <a className="ctpl-skip-link" href="#main-content">
          {t("layout.skipToContent")}
        </a>
        {children}
      </body>
    </html>
  );
};

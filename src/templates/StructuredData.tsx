import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import { languageTag } from "../lib/locale.js";
import { readString } from "../lib/props.js";
import { type EditorialData, buildGraph, jsonForScript } from "../lib/schema.js";
import { chromeOwner } from "../lib/site.js";
import { breadcrumbOf } from "./Breadcrumb.jsx";

/** scheme://host[:port] of the current request, for absolute URLs. */
const originOf = (renderContext: RenderContext): string => {
  const request = renderContext.getRequest();
  const scheme = request.getScheme();
  const port = request.getServerPort();
  const standard = (scheme === "https" && port === 443) || (scheme === "http" && port === 80);
  const portSuffix = standard || port <= 0 ? "" : `:${port}`;
  return `${scheme}://${request.getServerName()}${portSuffix}`;
};

/** The header singleton, whose brand name and logo name the Organization. */
const headerOf = (home: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    return home.hasNode("siteHeader/header")
      ? (home.getNode("siteHeader/header") as JCRNodeWrapper)
      : undefined;
  } catch {
    return undefined;
  }
};

const referenced = (node: JCRNodeWrapper, name: string): JCRNodeWrapper | undefined => {
  try {
    return node.hasProperty(name)
      ? (node.getProperty(name).getNode() as JCRNodeWrapper)
      : undefined;
  } catch {
    return undefined; // deleted, or not published in this workspace
  }
};

const valuesOf = (node: JCRNodeWrapper, name: string): string[] =>
  node.hasProperty(name)
    ? node
        .getProperty(name)
        .getValues()
        .map((value) => (value as unknown as { getString(): string }).getString())
    : [];

/**
 * The schema.org JSON-LD of the page being rendered (see lib/schema.ts), for every page and every
 * main resource: WebSite, Organization, WebPage, the BreadcrumbList of the visible trail, and a
 * NewsArticle or Article for ctpl:news / ctpl:article. A main resource of another module gets the
 * page-level graph only (its module may describe it further).
 *
 * The JSON sits in the text of a <script type="application/ld+json">: React writes a script's text
 * unescaped (only a closing </script> is neutralised), and jsonForScript writes every `<` as
 * <, so no dangerouslySetInnerHTML is needed and no value can end the script.
 */
export const StructuredData = ({ name, description }: { name?: string; description?: string }) => {
  const { t } = useTranslation("classic-templates");
  const { mainNode, renderContext, currentResource } = useServerContext();
  const origin = originOf(renderContext);
  const absolute = (url: string) => (/^https?:\/\//.test(url) ? url : `${origin}${url}`);

  const site = renderContext.getSite();
  const home = chromeOwner(site);
  const header = headerOf(home);
  if (header) server.render.addCacheDependency({ node: header }, renderContext);
  const logo = header ? referenced(header, "logo") : undefined;

  let editorial: EditorialData | undefined;
  if (mainNode.isNodeType("ctplmix:editorialItem")) {
    const image = referenced(mainNode, "image");
    editorial = {
      kind: mainNode.isNodeType("ctpl:news") ? "news" : "article",
      headline: readString(mainNode, "jcr:title") ?? mainNode.getName(),
      description: readString(mainNode, "teaser"),
      datePublished: readString(mainNode, "publicationDate") ?? readString(mainNode, "jcr:created"),
      dateModified: readString(mainNode, "jcr:lastModified"),
      image: image ? absolute(buildNodeUrl(image)) : undefined,
      author: readString(mainNode, "author"),
      keywords: valuesOf(mainNode, "j:tagList"),
    };
  }

  const graph = buildGraph({
    url: absolute(buildNodeUrl(mainNode)),
    homeUrl: absolute(buildNodeUrl(home)),
    organizationUrl: absolute(buildNodeUrl(home, { language: site.getDefaultLanguage() })),
    siteName: site.getTitle() || site.getName(),
    organizationName: header ? readString(header, "brandName") : undefined,
    logo: logo ? absolute(buildNodeUrl(logo)) : undefined,
    name,
    description,
    language: languageTag(currentResource.getLocale()),
    breadcrumb: breadcrumbOf(mainNode, renderContext, t("breadcrumb.home"))?.crumbs.map(
      (crumb) => ({
        name: crumb.title,
        url: crumb.href ? absolute(crumb.href) : undefined,
      }),
    ),
    editorial,
  });

  return <script type="application/ld+json">{jsonForScript(graph)}</script>;
};

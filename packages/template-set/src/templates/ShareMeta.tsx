import { buildNodeUrl, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { absoluteUrl, originOf } from "../lib/absolute.js";
import { languageTag } from "../lib/locale.js";
import { readPositive, readString } from "../lib/props.js";
import { type ShareImageCandidate, firstShareImage, ogLocale } from "../lib/share.js";
import { chromeOwner, pageSite } from "../lib/site.js";

const referenced = (node: JCRNodeWrapper | undefined, name: string): JCRNodeWrapper | undefined => {
  try {
    return node?.hasProperty(name)
      ? (node.getProperty(name).getNode() as JCRNodeWrapper)
      : undefined;
  } catch {
    return undefined; // deleted, or not published in this workspace
  }
};

const child = (node: JCRNodeWrapper, path: string): JCRNodeWrapper | undefined => {
  try {
    return node.hasNode(path) ? (node.getNode(path) as JCRNodeWrapper) : undefined;
  } catch {
    return undefined;
  }
};

/** The image of the first hero banner of a page, also inside a hero carousel. */
const heroImageOf = (page: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  const area = child(page, "hero");
  if (!area) return undefined;
  for (const first of area.getNodes()) {
    const section = first as JCRNodeWrapper;
    const own = referenced(section, "image");
    if (own) return own;
    for (const slide of section.getNodes()) {
      const image = referenced(slide as JCRNodeWrapper, "image");
      if (image) return image;
    }
    return undefined; // only the first hero section counts
  }
  return undefined;
};

/**
 * The text alternative of a shared image: the alternative the item gives for this use (unless it
 * marks the image decorative), else the image's own title.
 */
const altOf = (image: JCRNodeWrapper, owner: JCRNodeWrapper | undefined): string | undefined => {
  const decorative = owner ? readString(owner, "imageDecorative") === "true" : false;
  const ownAlt = owner && !decorative ? readString(owner, "imageAlt") : undefined;
  return ownAlt ?? readString(image, "jcr:title");
};

/**
 * Open Graph and Twitter card tags of the page being rendered, so a shared link shows its title,
 * description and an image. og:title and og:description repeat the page's <title> and meta
 * description. og:image is never left out: the page's own share image (Jahia's SEO panel,
 * jmix:seoHtmlHead openGraphImage), else the image of the item shown (news, article, any main
 * resource with ctplmix:media), else the page's first hero image, else the site's default share
 * image, else the site logo. The chosen image is a cache dependency, so replacing it updates the
 * tags.
 */
export const ShareMeta = ({ title, description }: { title: string; description?: string }) => {
  const { renderContext, currentResource } = useServerContext();
  const site = pageSite(renderContext);
  const mainNode = renderContext.getMainResource().getNode();
  const header = child(chromeOwner(site), "siteHeader/header");
  const origin = originOf(renderContext);

  const candidates: ShareImageCandidate<JCRNodeWrapper>[] = [
    { source: "seo", find: () => referenced(mainNode, "openGraphImage") },
    {
      source: "item",
      find: () =>
        mainNode.isNodeType("ctplmix:media") ? referenced(mainNode, "image") : undefined,
    },
    {
      source: "hero",
      find: () => (mainNode.isNodeType("jnt:page") ? heroImageOf(mainNode) : undefined),
    },
    { source: "site", find: () => referenced(site, "ctplShareImage") },
    { source: "logo", find: () => referenced(header, "logo") },
  ];
  const found = firstShareImage(candidates);
  if (found) server.render.addCacheDependency({ node: found.image }, renderContext);
  if (header) server.render.addCacheDependency({ node: header }, renderContext);

  const image = found?.image;
  const imageAlt = image
    ? altOf(image, found?.source === "item" ? mainNode : undefined)
    : undefined;
  const width = image ? readPositive(image, "j:width") : undefined;
  const height = image ? readPositive(image, "j:height") : undefined;
  const isArticle = mainNode.isNodeType("ctplmix:editorialItem");
  const published = isArticle ? readString(mainNode, "publicationDate") : undefined;

  return (
    <>
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content={isArticle ? "article" : "website"} />
      <meta property="og:url" content={absoluteUrl(origin, buildNodeUrl(mainNode))} />
      <meta property="og:site_name" content={site.getTitle() || site.getName()} />
      <meta property="og:locale" content={ogLocale(languageTag(currentResource.getLocale()))} />
      {image && <meta property="og:image" content={absoluteUrl(origin, buildNodeUrl(image))} />}
      {image && width && <meta property="og:image:width" content={String(width)} />}
      {image && height && <meta property="og:image:height" content={String(height)} />}
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      {published && <meta property="article:published_time" content={published} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
    </>
  );
};

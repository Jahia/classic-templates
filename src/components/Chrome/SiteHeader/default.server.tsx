import {
  RenderChild,
  buildNodeUrl,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { chromeOwner } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./site-header.module.css";

const title = (node: JCRNodeWrapper) =>
  node.hasProperty("jcr:title") ? node.getProperty("jcr:title").getString() : "";

/**
 * The site header: utility links and the language switcher in a bar above (right-aligned), then
 * the logo linking to the home page and the main navigation.
 *
 * Logo: the light version, plus an optional dark version swapped in by CSS when the page is dark
 * (forced by the site or following the visitor). With the brand name shown, the image is
 * decorative (alt=""); without it, the image carries the brand name as its alt text.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:siteHeader", displayName: "Site header" },
  ({ logo, logoDark, brandName, showBrandName }: Props, { renderContext }) => {
    const site = renderContext.getSite();
    const home = chromeOwner(site);
    const brand = brandName || site.getTitle() || site.getName();
    const withText = showBrandName !== false || !logo;
    for (const image of [logo, logoDark]) {
      if (image) server.render.addCacheDependency({ node: image }, renderContext);
    }

    return (
      <header className={classes.header} data-testid="ctpl-site-header">
        <div className={classes.utility}>
          <div className={`ctpl-container ${classes.utilityInner}`}>
            <RenderChild name="utilityLinks" view="inline" />
            <RenderChild name="languageSwitcher" />
          </div>
        </div>
        <div className={`ctpl-container ${classes.bar}`}>
          <a className={classes.brand} href={buildNodeUrl(home)} data-testid="ctpl-brand">
            {logo && (
              <img
                className={logoDark ? classes.logoLight : classes.logo}
                src={buildNodeUrl(logo)}
                alt={withText ? "" : brand || title(logo)}
              />
            )}
            {logo && logoDark && (
              <img
                className={classes.logoDark}
                src={buildNodeUrl(logoDark)}
                alt={withText ? "" : brand}
              />
            )}
            {withText && <span className={classes.brandName}>{brand}</span>}
          </a>
          <RenderChild name="navigation" />
        </div>
      </header>
    );
  },
);

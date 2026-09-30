import {
  RenderChild,
  buildNodeUrl,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import { readPositive } from "../../../lib/props.js";
import { chromeOwner } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./site-header.module.css";

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
    server.render.addCacheDependency({ node: site }, renderContext); // brand falls back to the site title
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
                width={readPositive(logo, "j:width")}
                height={readPositive(logo, "j:height")}
                alt={withText ? "" : brand}
              />
            )}
            {logo && logoDark && (
              <img
                className={classes.logoDark}
                src={buildNodeUrl(logoDark)}
                width={readPositive(logoDark, "j:width")}
                height={readPositive(logoDark, "j:height")}
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

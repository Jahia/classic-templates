import { RenderChild, RenderChildren, jahiaComponent } from "@jahia/javascript-modules-library";
import type { Props } from "./types.js";
import classes from "./site-footer.module.css";

/**
 * The site footer: brand block (site name, tagline) and link columns, then a bottom bar with the
 * copyright, legal links and social links. `{year}` in the copyright is replaced with the current
 * year, so "© {year} Company" never goes stale. The footer is seeded with a copyright, so the
 * landmark is never empty.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:siteFooter", displayName: "Site footer" },
  ({ tagline, copyright }: Props, { renderContext }) => {
    const site = renderContext.getSite();
    const siteName = site.getTitle() || site.getName();
    const year = String(new Date().getFullYear());

    return (
      <footer className={classes.footer} data-testid="ctpl-site-footer">
        <div className={`ctpl-container ${classes.top}`}>
          <div className={classes.brand}>
            <p className={classes.siteName}>{siteName}</p>
            {tagline && <p className={classes.tagline}>{tagline}</p>}
          </div>
          <RenderChild name="columns" />
        </div>
        <div className={classes.bottom}>
          <div className={`ctpl-container ${classes.bottomInner}`}>
            {copyright && (
              <p className={classes.copyright} data-testid="ctpl-copyright">
                {copyright.replaceAll("{year}", year)}
              </p>
            )}
            <RenderChild name="legal" view="inline" />
            <RenderChild name="social" view="inline" />
          </div>
        </div>
      </footer>
    );
  },
);

/** The footer's columns: each child link list renders as a titled column. */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:footerColumns", displayName: "Footer columns" },
  () => (
    <div className={classes.columns} data-testid="ctpl-footer-columns">
      <RenderChildren view="column" />
    </div>
  ),
);

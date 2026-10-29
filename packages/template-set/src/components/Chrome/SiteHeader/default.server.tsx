import type { JCRNodeWrapper } from "org.jahia.services.content";
import {
  Render,
  RenderChild,
  buildNodeUrl,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { readPositive } from "../../../lib/props.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import { SearchSlot } from "./SearchSlot.js";
import type { Props } from "./types.js";
import classes from "./site-header.module.css";

/**
 * The site header: utility links and the language switcher in a bar above (right-aligned), then
 * the logo linking to the home page and the main navigation.
 *
 * Account entry (optional, "Show a sign-in entry"): "Sign in" for a guest, the visitor's name and
 * "Sign out" once signed in. It is its own view of this node (account.server.tsx) so that its
 * fragment can vary by page while the rest of the header stays one shared cached fragment.
 *
 * Search box (optional, "Show a search box", and the Search page set): a GET form to that page,
 * `q` being the words, with autocomplete as an island (HeaderSearch.client.tsx) when Augmented
 * Search is there. Without a Search page nothing is shown to visitors, and editors get a hint.
 *
 * Logo: the light version, plus an optional dark version swapped in by CSS when the page is dark
 * (forced by the site or following the visitor). With the brand name shown, the image is
 * decorative (alt=""); without it, the image carries the brand name as its alt text.
 */
/**
 * An image Jahia knows no size of (an SVG: j:width and j:height are only read from raster images)
 * gets the theme's logo height: without it the browser has no intrinsic size and draws it 0 wide.
 */
const sizeClass = (image: JCRNodeWrapper): string =>
  readPositive(image, "j:width") && readPositive(image, "j:height")
    ? ""
    : ` ${classes.logoUnsized}`;

jahiaComponent(
  { componentType: "view", nodeType: "ctpl:siteHeader", displayName: "Site header" },
  (
    {
      logo,
      logoDark,
      brandName,
      showBrandName,
      brandCaption,
      headerLayout,
      showAccount,
      showSearch,
    }: Props,
    { currentNode, renderContext },
  ) => {
    const { t } = useTranslation("classic-templates");
    const site = pageSite(renderContext);
    server.render.addCacheDependency({ node: site }, renderContext); // brand falls back to the site title
    const home = chromeOwner(site);
    const brand = brandName || site.getTitle() || site.getName();
    const withText = showBrandName !== false || !logo;
    for (const image of [logo, logoDark]) {
      if (image) server.render.addCacheDependency({ node: image }, renderContext);
    }

    const navigation = <RenderChild name="navigation" />;
    const account =
      showAccount &&
      (renderContext.isEditMode() ? (
        // Not rendered through the account view: that would wrap the header in a second
        // Page Builder selection marker. Editors see what visitors get, as plain text.
        <span data-testid="ctpl-account-preview">{t("account.signIn")}</span>
      ) : (
        <Render node={currentNode} view="account" />
      ));
    const brandLink = (
      <a className={classes.brand} href={buildNodeUrl(home)} data-testid="ctpl-brand">
        {logo && (
          <img
            className={`${logoDark ? classes.logoLight : classes.logo}${sizeClass(logo)}`}
            src={buildNodeUrl(logo)}
            width={readPositive(logo, "j:width")}
            height={readPositive(logo, "j:height")}
            alt={withText ? "" : brand}
          />
        )}
        {logo && logoDark && (
          <img
            className={`${classes.logoDark}${sizeClass(logoDark)}`}
            src={buildNodeUrl(logoDark)}
            width={readPositive(logoDark, "j:width")}
            height={readPositive(logoDark, "j:height")}
            alt={withText ? "" : brand}
          />
        )}
        {withText && <span className={classes.brandName}>{brand}</span>}
        {brandCaption && <span className={classes.brandCaption}>{brandCaption}</span>}
      </a>
    );

    if (headerLayout === "twoRows") {
      // Brand, search box, utility links, account and languages on top; the menu on its own row.
      return (
        <header className={`${classes.header} ${classes.twoRows}`} data-testid="ctpl-site-header">
          <div className={`ctpl-container ${classes.bar}`}>
            {brandLink}
            <div className={classes.end}>
              {showSearch && (
                <div className={classes.searchWrap}>
                  <SearchSlot />
                </div>
              )}
              <div className={classes.tools}>
                <RenderChild name="utilityLinks" view="inline" />
                {account}
                <RenderChild name="languageSwitcher" />
              </div>
            </div>
          </div>
          <div className={classes.navRow}>
            <div className="ctpl-container">{navigation}</div>
          </div>
        </header>
      );
    }

    return (
      <header className={classes.header} data-testid="ctpl-site-header">
        <div className={classes.utility}>
          <div className={`ctpl-container ${classes.utilityInner}`}>
            <RenderChild name="utilityLinks" view="inline" />
            <RenderChild name="languageSwitcher" />
            {account}
          </div>
        </div>
        <div className={`ctpl-container ${classes.bar}`}>
          {brandLink}
          {showSearch ? (
            <div className={classes.end}>
              {navigation}
              <SearchSlot />
            </div>
          ) : (
            navigation
          )}
        </div>
      </header>
    );
  },
);

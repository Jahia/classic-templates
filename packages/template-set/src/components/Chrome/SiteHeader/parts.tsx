import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import type { ReactNode } from "react";
import {
  JImage,
  Render,
  RenderChild,
  buildNodeUrl,
  server,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { readPositive } from "../../../lib/props.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./site-header.module.css";

/*
 * What every view of the site header draws (default.server.tsx: one row; twoRows.server.tsx: the
 * menu on a row of its own): the brand link, the main navigation and the account entry. This file
 * registers no view.
 */

/** The pieces a header view places. */
export interface HeaderParts {
  /** The logo and the brand name, linking to the home page. */
  brandLink: ReactNode;
  /** The main navigation (the header's navigation child). */
  navigation: ReactNode;
  /** The sign-in / sign-out entry, or false when "Show a sign-in entry" is off. */
  account: ReactNode;
}

/**
 * An image Jahia knows no size of (an SVG: j:width and j:height are only read from raster images)
 * gets the theme's logo height: without it the browser has no intrinsic size and draws it 0 wide.
 */
const sizeClass = (image: JCRNodeWrapper): string =>
  readPositive(image, "j:width") && readPositive(image, "j:height")
    ? ""
    : ` ${classes.logoUnsized}`;

/**
 * Builds the brand link, the navigation and the account entry of a header view.
 *
 * Account entry (optional, "Show a sign-in entry"): "Sign in" for a guest, the visitor's name and
 * "Sign out" once signed in. It is its own view of this node (account.server.tsx) so that its
 * fragment can vary by page while the rest of the header stays one shared cached fragment.
 *
 * Logo: the light version, plus an optional dark version swapped in by CSS when the page is dark
 * (forced by the site or following the visitor). With the brand name shown, the image is
 * decorative (alt=""); without it, the image carries the brand name as its alt text.
 */
export const useHeaderParts = (
  { logo, logoDark, brandName, showBrandName, brandCaption, showAccount }: Props,
  currentNode: JCRNodeWrapper,
  renderContext: RenderContext,
): HeaderParts => {
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
        <JImage
          src={logo}
          className={`${logoDark ? classes.logoLight : classes.logo}${sizeClass(logo)}`}
          alt={withText ? "" : brand}
          loading="eager"
        />
      )}
      {logo && logoDark && (
        <JImage
          src={logoDark}
          className={`${classes.logoDark}${sizeClass(logoDark)}`}
          alt={withText ? "" : brand}
          loading="eager"
        />
      )}
      {withText && <span className={classes.brandName}>{brand}</span>}
      {brandCaption && <span className={classes.brandCaption}>{brandCaption}</span>}
    </a>
  );
  return { brandLink, navigation, account };
};

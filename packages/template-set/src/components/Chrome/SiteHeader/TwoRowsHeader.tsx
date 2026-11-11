import { RenderChild } from "@jahia/javascript-modules-library";
import type { HeaderParts } from "./parts.js";
import { SearchSlot } from "./SearchSlot.js";
import classes from "./site-header.module.css";

/**
 * The two-rows header: the brand, the search box, the utility links, the account entry and the
 * languages on a top row, the main menu on its own row below (a mega menu panel then opens right
 * under it). Drawn by the "twoRows" view (twoRows.server.tsx), and by the default view for a
 * header that still carries the legacy headerLayout "twoRows". This file registers no view.
 */
export const TwoRowsHeader = ({
  parts: { brandLink, navigation, account },
  showSearch,
}: Readonly<{ parts: HeaderParts; showSearch?: boolean }>) => (
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

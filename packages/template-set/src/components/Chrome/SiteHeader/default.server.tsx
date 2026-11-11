import { RenderChild, jahiaComponent } from "@jahia/javascript-modules-library";
import { useHeaderParts } from "./parts.js";
import { SearchSlot } from "./SearchSlot.js";
import { TwoRowsHeader } from "./TwoRowsHeader.js";
import type { Props } from "./types.js";
import classes from "./site-header.module.css";

/**
 * The site header on one row: utility links, the account entry and the language switcher in a bar
 * above (right-aligned), then the logo linking to the home page and the main navigation. The other
 * rendering is the "twoRows" view (twoRows.server.tsx), chosen in Layout > Select a view.
 *
 * Search box (optional, "Show a search box", and the Search page set): a GET form to that page,
 * `q` being the words, with autocomplete as an island (HeaderSearch.client.tsx) when Augmented
 * Search is there. Without a Search page nothing is shown to visitors, and editors get a hint.
 *
 * headerLayout is the legacy choice of the two renderings (hidden since 0.13.0): a header that still
 * says "twoRows" (not moved to j:view yet by scripts/migrate-views.groovy, live until its next
 * publication, an older site export) keeps its two rows.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:siteHeader", displayName: "Site header" },
  (props: Props, { currentNode, renderContext }) => {
    const parts = useHeaderParts(props, currentNode, renderContext);
    if (props.headerLayout === "twoRows") {
      return <TwoRowsHeader parts={parts} showSearch={props.showSearch} />;
    }
    const { brandLink, navigation, account } = parts;
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
          {props.showSearch ? (
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

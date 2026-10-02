import {
  AddResources,
  buildModuleFileUrl,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { buildMainNavigation, type NavItem } from "../../../lib/navigation.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./main-navigation.module.css";

const ItemLink = ({ item, className }: { item: NavItem; className: string }) =>
  item.href ? (
    <a className={className} href={item.href}>
      {item.title}
    </a>
  ) : (
    <span className={className}>{item.title}</span>
  );

const Chevron = () => (
  <svg className={classes.chevron} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

/**
 * The main menu, three levels deep, read from the page tree under the home page.
 *
 * Server-rendered and usable without JavaScript: on large screens level 2 opens on hover and on
 * keyboard focus (:focus-within), on small screens every level is listed. static/js/navigation.js
 * then switches to the disclosure pattern: the menu button and the submenu buttons
 * (aria-expanded) open things, Escape, an outside click or focus leaving an item close them, and
 * the current page gets aria-current. The active page is set in the browser, not here: the
 * header is one cached fragment shared by every page, so server-side state would be wrong.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:mainNavigation", displayName: "Main navigation" },
  ({ navDepth }: Props, { renderContext, currentNode }) => {
    const { t } = useTranslation("classic-templates");
    const items = buildMainNavigation(
      chromeOwner(pageSite(renderContext)),
      navDepth ?? 3,
      renderContext,
    );
    if (items.length === 0) return null;
    const listId = `ctpl-nav-${currentNode.getIdentifier()}`;

    return (
      <nav
        className={classes.nav}
        aria-label={t("nav.main")}
        data-ctpl-nav
        data-testid="ctpl-main-navigation"
      >
        <AddResources
          type="javascript"
          resources={buildModuleFileUrl("static/js/navigation.js")}
          key="ctpl-navigation"
        />
        <button
          type="button"
          className={classes.menuToggle}
          aria-expanded="false"
          aria-controls={listId}
          data-ctpl-nav-toggle
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" />
          </svg>
          {t("nav.menu")}
        </button>
        <ul id={listId} className={classes.level1} data-ctpl-nav-list>
          {items.map((item) => {
            const panelId = `ctpl-subnav-${item.id}`;
            return (
              <li key={item.id} className={classes.item1} data-ctpl-nav-item>
                <ItemLink item={item} className={classes.link1} />
                {item.children.length > 0 && (
                  <>
                    <button
                      type="button"
                      className={classes.subToggle}
                      aria-expanded="false"
                      aria-controls={panelId}
                      data-ctpl-subnav-toggle
                    >
                      <span className="ctpl-visually-hidden">
                        {t("nav.submenu", {
                          title: item.title,
                          interpolation: { escapeValue: false },
                        })}
                      </span>
                      <Chevron />
                    </button>
                    <div id={panelId} className={classes.panel}>
                      <ul className={classes.level2}>
                        {item.children.map((sub) => (
                          <li key={sub.id} className={classes.item2} data-ctpl-nav-item>
                            <ItemLink item={sub} className={classes.link2} />
                            {sub.children.length > 0 && (
                              <ul className={classes.level3}>
                                {sub.children.map((deep) => (
                                  <li key={deep.id} data-ctpl-nav-item>
                                    <ItemLink item={deep} className={classes.link3} />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);

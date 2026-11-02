import {
  AddResources,
  buildModuleFileUrl,
  buildNodeUrl,
  jahiaComponent,
  server,
  useGQLQuery,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper, JCRSessionWrapper } from "org.jahia.services.content";
import type { RenderContext } from "org.jahia.services.render";
import { useTranslation } from "react-i18next";
import {
  CUSTOM_MENU_QUERY,
  dependencyFor,
  toNavItems,
  type ResolvedEntry,
} from "../../../lib/customMenu.js";
import { EditNote } from "../../../lib/EditNote.js";
import { buildMainNavigation, type NavItem } from "../../../lib/navigation.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import { MenuPromo, MenuPromoData } from "./MenuPromo.js";
import type { Props } from "./types.js";
import classes from "./main-navigation.module.css";

const NEW_TAB = { target: "_blank", rel: "noopener noreferrer" };

const ItemLink = ({
  item,
  className,
  newTabText,
}: {
  item: NavItem;
  className: string;
  newTabText: string;
}) => {
  if (!item.href) {
    return <span className={className}>{item.title}</span>;
  }
  const opens = item.newTab ? NEW_TAB : {};
  return (
    <a className={className} href={item.href} {...opens}>
      {item.title}
      {item.newTab && <span className="ctpl-visually-hidden"> ({newTabText})</span>}
    </a>
  );
};

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
 *
 * navStyle "mega" keeps the same markup and script and changes the panel: full width under the
 * header, the sub-pages in columns, and the top-level page's "Menu promotion" beside them
 * (MenuPromo). On small screens it reads as the dropdown style, the promotion under the list.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:mainNavigation", displayName: "Main navigation" },
  ({ navDepth, navStyle, menuSource, menu }: Props, { renderContext, currentNode, jcrSession }) => {
    const depth = navDepth ?? 3;
    const pageTree = () =>
      buildMainNavigation(chromeOwner(pageSite(renderContext)), depth, renderContext);
    const listId = `ctpl-nav-${currentNode.getIdentifier()}`;
    const mega = navStyle === "mega";
    if (menuSource === "menu" && menu) {
      return (
        <CustomMenuNavigation
          menu={menu}
          depth={depth}
          mega={mega}
          listId={listId}
          renderContext={renderContext}
          jcrSession={jcrSession}
          pageTree={pageTree}
        />
      );
    }
    return (
      <NavigationMarkup
        items={pageTree()}
        mega={mega}
        listId={listId}
        renderContext={renderContext}
      />
    );
  },
);

/** The menu's markup, whatever its source: the page tree, or a Menu Manager menu. */
const NavigationMarkup = ({
  items,
  mega,
  listId,
  renderContext,
}: {
  items: NavItem[];
  mega: boolean;
  listId: string;
  renderContext: RenderContext;
}) => {
  const { t } = useTranslation("classic-templates");
  if (items.length === 0) {
    return null;
  }
  return (
    <nav
      className={mega ? `${classes.nav} ${classes.mega}` : classes.nav}
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
              <ItemLink item={item} className={classes.link1} newTabText={t("link.newTab")} />
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
                          <ItemLink
                            item={sub}
                            className={classes.link2}
                            newTabText={t("link.newTab")}
                          />
                          {sub.children.length > 0 && (
                            <ul className={classes.level3}>
                              {sub.children.map((deep) => (
                                <li key={deep.id} data-ctpl-nav-item>
                                  <ItemLink
                                    item={deep}
                                    className={classes.link3}
                                    newTabText={t("link.newTab")}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    {mega && item.promo && (
                      <MenuPromo page={item.promo} renderContext={renderContext} />
                    )}
                    {mega && item.promoData && <MenuPromoData promo={item.promoData} />}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

/**
 * The header menu from jContent > Menus (Menu Manager), read as the visitor through
 * menuManager.resolvedMenu, with the resolver's cache dependencies. When the menu cannot be read
 * (deleted, not published, Menu Manager not installed: the field is then unknown), the page tree
 * shows, and edit mode says why.
 */
const CustomMenuNavigation = ({
  menu,
  depth,
  mega,
  listId,
  renderContext,
  jcrSession,
  pageTree,
}: {
  menu: JCRNodeWrapper;
  depth: number;
  mega: boolean;
  listId: string;
  renderContext: RenderContext;
  jcrSession: JCRSessionWrapper;
  pageTree: () => NavItem[];
}) => {
  const { t } = useTranslation("classic-templates");
  const { data, errors } = useGQLQuery({
    query: CUSTOM_MENU_QUERY,
    variables: {
      menu: menu.getIdentifier(),
      language: renderContext.getMainResource().getLocale().toString(),
      workspace: renderContext.getWorkspace() === "live" ? "LIVE" : "EDIT",
      maxDepth: depth,
    },
  });
  const resolved = (
    data as
      | {
          menuManager?: {
            resolvedMenu?: { items: ResolvedEntry[]; dependencies: string[] } | null;
          };
        }
      | undefined
  )?.menuManager?.resolvedMenu;
  if (errors?.length || !resolved) {
    return (
      <>
        {renderContext.isEditMode() && (
          <EditNote level="info" testId="ctpl-nav-custom-unavailable">
            {t("nav.customMenuUnavailable")}
          </EditNote>
        )}
        <NavigationMarkup
          items={pageTree()}
          mega={mega}
          listId={listId}
          renderContext={renderContext}
        />
      </>
    );
  }
  for (const dependency of resolved.dependencies) {
    server.render.addCacheDependency(dependencyFor(dependency), renderContext);
  }
  const nodeOf = (id: string): JCRNodeWrapper | undefined => {
    try {
      return jcrSession.getNodeByIdentifier(id);
    } catch {
      return undefined;
    }
  };
  const items = toNavItems(resolved.items, {
    nodeOf,
    urlOf: (id) => {
      const node = nodeOf(id);
      return node ? buildNodeUrl(node) : undefined;
    },
  });
  return (
    <NavigationMarkup items={items} mega={mega} listId={listId} renderContext={renderContext} />
  );
};

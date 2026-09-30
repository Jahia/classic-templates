import {
  Render,
  getNodesByJCRQuery,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading, headingLevelFor } from "../../../lib/Heading.js";
import {
  buildListQuery,
  excludedIds,
  isListableType,
  pathRegex,
  typeLabel,
} from "../../../lib/query.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./jcr-query.module.css";

/**
 * A content list: the news items or articles found under a folder (or page), sorted, limited,
 * rendered as cards (grid) or compact rows (list), with an optional "see all" link.
 *
 * - Excluded items and items not translated into the page's language are filtered out in code
 *   (a live FR page must not show an EN-only item with an empty title), so the query fetches more
 *   rows than needed and slices.
 * - The list depends on everything under its start node: adding, editing or publishing an item
 *   there refreshes the cached list.
 * - In edit mode a summary tells the editor what the list shows, even when it is empty.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:jcrQuery", displayName: "Content list" },
  (
    {
      "jcr:title": title,
      type,
      startNode,
      criteria,
      sortDirection,
      maxItems,
      layout,
      excludeNodes,
      noResultText,
      ctaLabel,
      ctplSurface,
    }: Props,
    { currentNode, renderContext, jcrSession, currentResource },
  ) => {
    const { t } = useTranslation();
    const isEdit = renderContext.isEditMode();
    const site = renderContext.getSite();
    const start: JCRNodeWrapper = startNode ?? site;
    const listType = type ?? "ctpl:news";
    const locale = currentResource.getLocale();
    const max = Math.min(Math.max(Number(maxItems) || 6, 1), 50);

    let items: JCRNodeWrapper[] = [];
    if (isListableType(jcrSession, listType)) {
      server.render.addCacheDependency(
        { flushOnPathMatchingRegexp: `${pathRegex(start.getPath())}(/.*)?` },
        renderContext,
      );
      const query = buildListQuery({ type: listType, start, criteria, direction: sortDirection });
      const excluded = excludedIds(excludeNodes);
      items = (getNodesByJCRQuery(jcrSession, query, (max + excluded.size) * 2) as JCRNodeWrapper[])
        .filter((node) => !excluded.has(node.getIdentifier()) && node.hasI18N(locale))
        .slice(0, max);
    }

    if (items.length === 0 && !isEdit && !noResultText) return null;

    const headingId = `ctpl-list-${currentNode.getIdentifier()}`;
    const level = headingLevelFor(currentNode);
    const itemLevel = String(title ? level + 1 : level);
    const view = layout === "list" ? "compact" : "card";
    const startLabel =
      start.getPath() === site.getPath()
        ? site.getTitle() || site.getName()
        : start.getPath().replace(`${site.getPath()}/`, "");

    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-jcr-query"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          {isEdit && (
            <p className={classes.summary} data-testid="ctpl-jcr-query-summary">
              {t("query.summary", {
                type: typeLabel(listType, locale),
                start: startLabel,
                order: sortDirection === "asc" ? t("query.oldest") : t("query.newest"),
                max,
                interpolation: { escapeValue: false },
              })}
            </p>
          )}
          {items.length > 0 ? (
            <ul className={layout === "list" ? classes.list : classes.grid}>
              {items.map((item) => (
                <li key={item.getIdentifier()}>
                  <Render node={item} view={view} parameters={{ headingLevel: itemLevel }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className={classes.empty}>{noResultText || t("query.empty")}</p>
          )}
          <Cta
            node={currentNode}
            label={ctaLabel}
            renderContext={renderContext}
            variant="secondary"
          />
        </div>
      </Section>
    );
  },
);

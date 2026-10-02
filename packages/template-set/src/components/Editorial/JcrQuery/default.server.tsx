import { Render, jahiaComponent, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading, useHeadingLevel } from "../../../lib/Heading.js";
import { itemLabelMode } from "../../../lib/itemLabel.js";
import { languageTag } from "../../../lib/locale.js";
import {
  type ListResult,
  categoryIds,
  isListableType,
  pathRegex,
  runList,
  startLabelOf,
  typeLabel,
} from "../../../lib/query.js";
import { Section } from "../../../lib/Section.js";
import { EditPanel } from "./EditPanel.js";
import type { Props } from "./types.js";
import classes from "./jcr-query.module.css";
import { pageSite } from "../../../lib/site.js";

/** Editors see how many items match, up to this count. */
const EDIT_COUNT = 500;

/**
 * A content list: the news items or articles found under a folder (or page), optionally in given
 * categories, sorted, limited, rendered as cards (grid) or compact rows (list), with an optional
 * "see all" link.
 *
 * - Excluded items and items not translated into the page's language are filtered out in code
 *   (a live FR page must not show an EN-only item with an empty title); see lib/query.ts runList.
 * - A start node that is set but does not resolve (deleted, not yet published) renders nothing on
 *   the live site instead of silently widening the list to the whole site.
 * - The list depends on everything under its start node: adding, editing or publishing an item
 *   there refreshes the cached list.
 * - In edit mode a panel tells the editor what the list does and found, even when it is empty.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:jcrQuery", displayName: "Content list" },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const { t } = useTranslation("classic-templates");
    const level = useHeadingLevel(currentNode); // hooks before any early return
    const isEdit = renderContext.isEditMode();
    const site = pageSite(renderContext);
    const startMissing = !props.startNode && currentNode.hasProperty("startNode");
    const start: JCRNodeWrapper = props.startNode ?? site;
    const type = props.type ?? "ctpl:news";
    const typeValid = isListableType(jcrSession, type);
    const locale = currentResource.getLocale();
    const max = Math.min(Math.max(Number(props.maxItems) || 6, 1), 50);
    const categories = categoryIds(props.filterCategories);

    let result: ListResult | undefined;
    if (typeValid && !startMissing) {
      server.render.addCacheDependency(
        { flushOnPathMatchingRegexp: `${pathRegex(start.getPath())}(/.*)?` },
        renderContext,
      );
      result = runList({
        session: jcrSession,
        type,
        start,
        criteria: props.criteria,
        direction: props.sortDirection,
        categories,
        exclude: props.excludeNodes,
        locale,
        max,
        countUpTo: isEdit ? EDIT_COUNT : undefined,
      });
    }
    const items = result?.items ?? [];

    if (!isEdit && (startMissing || (items.length === 0 && !props.noResultText))) return null;

    const title = props["jcr:title"];
    const headingId = `ctpl-list-${currentNode.getIdentifier()}`;
    const view = props.layout === "list" ? "compact" : "card";
    const itemLabel = itemLabelMode(props.itemLabel);

    return (
      <Section
        surface={props.ctplSurface}
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
            <EditPanel
              info={{
                typeLabel: typeLabel(type, locale),
                typeValid,
                startLabel: startLabelOf(start, site),
                startMissing,
                criteria: props.criteria ?? "publicationDate",
                direction: props.sortDirection === "asc" ? "asc" : "desc",
                max,
                layout: props.layout === "list" ? "list" : "grid",
                itemLabel,
                categories: props.filterCategories ?? [],
                expandedCategories: categories.length,
                excluded: props.excludeNodes ?? [],
                language: languageTag(locale),
                result,
              }}
            />
          )}
          {items.length > 0 ? (
            <ul className={props.layout === "list" ? classes.list : classes.grid}>
              {items.map((item) => (
                <li key={item.getIdentifier()}>
                  <Render
                    node={item}
                    view={view}
                    parameters={{ headingLevel: String(title ? level + 1 : level), itemLabel }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={classes.empty}>{props.noResultText || t("query.empty")}</p>
          )}
          <Cta
            node={currentNode}
            label={props.ctaLabel}
            renderContext={renderContext}
            variant="secondary"
          />
        </div>
      </Section>
    );
  },
);

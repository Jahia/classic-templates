import { Render, jahiaComponent, server } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { RAW, useT } from "../../../lib/i18n.js";
import {
  categoryIdsOf,
  expandCategories,
  listStart,
  pageOf,
  runQuery,
  startLabel,
} from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import { FORMATS, isFormat } from "../../../lib/query.js";
import shared from "../../../lib/shared.module.css";
import cards from "../shared/cards.module.css";
import { ListSection, MediaScript, useFormatLabel } from "../shared/parts.js";
import parts from "../shared/parts.module.css";
import type { Props } from "./types.js";
import classes from "./story-feed.module.css";

/** Stories a feed shows, from 1 to 50 (the CND range), 9 by default. */
const itemCount = (value: number | undefined) =>
  Math.min(Math.max(Math.round(value ?? 9) || 9, 1), 50);

/**
 * The story feed: the latest stories under its start node (or the whole site), optionally only
 * those filed under the page's categories and/or the picked ones (subcategories included), and/or
 * of some formats, newest first. Cards in a grid, compact rows, or the newest story large above a
 * grid. With "Format buttons", a row of toggles (hidden until static/js/media.js runs) shows one
 * format at a time; without JavaScript every story stays visible. The feed depends on everything
 * under its start node and, with "this page's topics", on the page itself.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctmd:storyFeed", displayName: "Story feed" },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const formatLabel = useFormatLabel();
    const { page, site } = pageOf(renderContext, currentNode);
    const { start, startMissing } = listStart(currentNode, props.startNode, site);
    const max = itemCount(props.maxItems);
    const formats = (props.formats ?? []).filter(isFormat);
    let categories = expandCategories(props.filterCategories ?? []);
    let pageWithoutCategory = false;
    if (props.pageCategories) {
      server.render.addCacheDependency({ node: page }, renderContext);
      const own = categoryIdsOf(page);
      pageWithoutCategory = own.length === 0;
      categories = [...new Set([...categories, ...own])];
    }
    const items: JCRNodeWrapper[] =
      startMissing || pageWithoutCategory
        ? []
        : runQuery({
            session: jcrSession,
            renderContext,
            type: "ctmd:story",
            start,
            order: "newest",
            categories,
            formats,
            locale: currentResource.getLocale(),
            limit: max * 2,
          }).slice(0, max);
    const present = FORMATS.filter((f) => items.some((item) => readString(item, "format") === f));
    const withFilter = props.showFilter === true && present.length > 1;
    const layout = props.layout === "list" || props.layout === "lead" ? props.layout : "grid";
    const summary = (
      <>
        {t("feed.summary", {
          formats:
            formats.length > 0
              ? formats.map((f) => formatLabel(f)).join(", ")
              : t("feed.allFormats"),
          start: startLabel(start),
          max,
          ...RAW,
        })}{" "}
        {props.pageCategories &&
          (pageWithoutCategory ? t("feed.pageNoCategory") : t("feed.pageCategories"))}
      </>
    );
    let listClass = cards.grid;
    if (layout === "list") listClass = classes.list;
    else if (layout === "lead") listClass = `${cards.grid} ${classes.leadGrid}`;
    return (
      <ListSection
        props={props}
        testId="ctmd-story-feed"
        count={items.length}
        startMissing={startMissing}
        summary={summary}
      >
        {(itemLevel) => (
          <div
            data-ctmd-filter={withFilter ? "" : undefined}
            data-ctmd-track={withFilter ? currentNode.getIdentifier() : undefined}
          >
            {withFilter && (
              <>
                <MediaScript />
                <fieldset className={parts.filters} data-ctmd-filter-controls="" hidden>
                  <legend className={parts.filterLabel}>{t("feed.filterLabel")}</legend>
                  <button
                    type="button"
                    className={parts.toggle}
                    aria-pressed="true"
                    data-ctmd-facet="format"
                    data-ctmd-value=""
                  >
                    {t("feed.all")}
                  </button>
                  {present.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={parts.toggle}
                      aria-pressed="false"
                      data-ctmd-facet="format"
                      data-ctmd-value={f}
                    >
                      {formatLabel(f)}
                    </button>
                  ))}
                </fieldset>
                <output
                  className={shared.visuallyHidden}
                  data-ctmd-filter-status=""
                  data-template={t("feed.shown", { n: "{count}", ...RAW })}
                />
              </>
            )}
            <ul className={listClass}>
              {items.map((item, index) => (
                <li
                  key={item.getIdentifier()}
                  className={layout === "lead" && index === 0 ? classes.lead : undefined}
                  data-ctmd-item=""
                  data-ctmd-format={readString(item, "format") ?? "news"}
                >
                  <Render
                    node={item}
                    view={layout === "list" ? "compact" : "card"}
                    parameters={{ headingLevel: String(itemLevel) }}
                  />
                </li>
              ))}
            </ul>
            {withFilter && (
              <p className={cards.empty} data-ctmd-filter-empty="" hidden>
                {t("feed.noMatch")}
              </p>
            )}
          </div>
        )}
      </ListSection>
    );
  },
);

import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { readString } from "../../../lib/props.js";
import type { ListResult } from "../../../lib/query.js";
import classes from "./jcr-query.module.css";

const titleOf = (node: JCRNodeWrapper) => readString(node, "jcr:title") ?? node.getName();

export interface PanelInfo {
  typeLabel: string;
  typeValid: boolean;
  startLabel: string;
  startMissing: boolean;
  criteria: string;
  direction: "asc" | "desc";
  max: number;
  layout: "grid" | "list";
  categories: JCRNodeWrapper[];
  expandedCategories: number;
  excluded: JCRNodeWrapper[];
  language: string;
  result?: ListResult;
}

/**
 * Edit mode only: everything the list is doing, so an editor can tell why it shows what it shows
 * (or nothing): the settings resolved to labels, what the query found and skipped, warnings, and
 * the JCR-SQL2 query for developers.
 */
export const EditPanel = ({ info }: { info: PanelInfo }) => {
  const { t } = useTranslation();
  const r = info.result;
  const order = t(info.direction === "asc" ? "query.oldest" : "query.newest");
  const rows: [string, string][] = [
    [t("query.panel.type"), info.typeLabel],
    [t("query.panel.start"), info.startLabel],
    [t("query.panel.sort"), `${t(`query.sort.${info.criteria.replace(":", "_")}`)}, ${order}`],
    [t("query.panel.max"), String(info.max)],
    [t("query.panel.display"), t(`query.layout.${info.layout}`)],
    [
      t("query.panel.categories"),
      info.categories.length === 0
        ? t("query.panel.allCategories")
        : `${info.categories.map(titleOf).join(", ")} ${t("query.panel.withSubcategories", { count: info.expandedCategories })}`,
    ],
    [
      t("query.panel.excluded"),
      info.excluded.length === 0 ? t("query.panel.none") : info.excluded.map(titleOf).join(", "),
    ],
  ];
  if (r) {
    rows.push([
      t("query.panel.found"),
      t("query.panel.foundValue", {
        shown: r.items.length,
        matching: r.fetched - r.skippedExcluded,
        more: r.capped ? "+" : "",
      }),
    ]);
    rows.push([
      t("query.panel.skipped"),
      t("query.panel.skippedValue", {
        excluded: r.skippedExcluded,
        untranslated: r.skippedUntranslated,
        language: info.language,
      }),
    ]);
  }

  return (
    <div className={classes.panel} data-testid="ctpl-jcr-query-summary">
      <p className={classes.panelTitle}>
        {t("query.summary", {
          type: info.typeLabel,
          start: info.startLabel,
          order,
          max: info.max,
          interpolation: { escapeValue: false },
        })}
      </p>
      {info.startMissing && (
        <p className="ctpl-edit-hint" data-testid="ctpl-jcr-query-start-missing">
          {t("query.startMissing")}
        </p>
      )}
      {!info.typeValid && <p className="ctpl-edit-hint">{t("query.invalidType")}</p>}
      <dl className={classes.panelList}>
        {rows.map(([label, value]) => (
          <div key={label} className={classes.panelRow}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {r && (
        <details className={classes.panelQuery}>
          <summary>{t("query.panel.query")}</summary>
          <code>{r.query}</code>
        </details>
      )}
    </div>
  );
};

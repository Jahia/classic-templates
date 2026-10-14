/**
 * The layout of the search section, shared by the server view and the island: title, search box,
 * facet groups beside the results (selected filters, count, hits, pager). The caller gives the
 * search box (a plain input on the server, a combobox in the island) and, in the island, the
 * actions that replace the form's links and button.
 */
import type { FormEvent, ReactNode, Ref } from "react";
import { useT } from "../../../lib/i18n.js";
import type { SearchPage } from "../../../lib/searchResponse.js";
import {
  FACETS,
  isAsked,
  stateUrl,
  withFacet,
  withoutFilters,
  type FacetName,
  type SearchState,
} from "../../../lib/searchState.js";
import cards from "../shared/cards.module.css";
import {
  FacetPanel,
  LevelHeading,
  Pager,
  ResultList,
  SelectedFilters,
  selectedValues,
  statusClass,
  useFacetLabel,
  useStatusText,
} from "./parts.js";
import classes from "./search-results.module.css";

export interface PanelProps {
  /** Unique on the page: ids derive from it. */
  idPrefix: string;
  title?: string;
  /** Heading level of the section's title. */
  level: number;
  /** The address of this page (the form's action and the base of every link). */
  action: string;
  state: SearchState;
  page: SearchPage;
  loading: boolean;
  failed: boolean;
  /** Results per page. */
  size: number;
  siteLabels: Record<string, string>;
  showSites: boolean;
  noResultText?: string;
  /** The search box, inside the form; its input has the id `${idPrefix}-q`. */
  box: ReactNode;
  /**
   * The handlers replace the links and the "Apply" button. False (the default) renders exactly the
   * server's no-JavaScript markup, which is what the island's first render must be: React hydrates
   * the island against the server's HTML, and any difference is a hydration error (#418).
   */
  interactive?: boolean;
  /** Island only: the handlers that replace the links and the "Apply" button. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onToggle?: (facet: FacetName, value: string, selected: boolean) => void;
  onClear?: () => void;
  onPage?: (page: number) => void;
  /** Island only: where focus goes after a page change or a removed filter. */
  resultsHeadingRef?: Ref<HTMLHeadingElement>;
  rootRef?: Ref<HTMLDivElement>;
}

export const SearchPanel = (props: PanelProps) => {
  const { idPrefix, title, level, action, state, page, size, showSites, siteLabels } = props;
  const t = useT();
  const labelFor = useFacetLabel(siteLabels);
  const asked = isAsked(state);
  const interactive = props.interactive ?? Boolean(props.onToggle);
  const formId = `${idPrefix}-form`;
  const status = useStatusText(state, page.total, asked, props.failed);
  const hasFacets = FACETS.some(
    (facet) => page.facets[facet].length > 0 && (facet !== "site" || showSites),
  );
  const chips = selectedValues(state, page.facets, labelFor);
  const resultsLevel = title ? level + 1 : level;
  const removeHref = (facet: FacetName, value: string) =>
    stateUrl(
      action,
      withFacet(
        state,
        facet,
        state[facet].filter((candidate) => candidate !== value),
      ),
    );

  return (
    <div className="ctpl-container" ref={props.rootRef}>
      {title && (
        <LevelHeading level={level} id={`${idPrefix}-title`}>
          {title}
        </LevelHeading>
      )}
      <search>
        <form
          id={formId}
          className={classes.form}
          method="get"
          action={action}
          onSubmit={interactive ? props.onSubmit : undefined}
          // jExperience's tracker stamps data-wem-observed on forms before React hydrates
          suppressHydrationWarning
          data-testid="ctmd-search-form"
        >
          <label className={classes.label} htmlFor={`${idPrefix}-q`}>
            {t("search.label")}
          </label>
          <div className={classes.row}>
            {props.box}
            <button type="submit" className={classes.submit}>
              {t("search.submit")}
            </button>
          </div>
        </form>
      </search>
      <div className={hasFacets ? classes.layout : classes.layoutPlain}>
        {hasFacets && (
          <div className={classes.side} role="group" aria-label={t("search.filters")}>
            <FacetPanel
              // switching from the form's fields to controlled ones starts the boxes afresh
              key={interactive ? "live" : "static"}
              facets={page.facets}
              state={state}
              siteLabels={siteLabels}
              showSites={showSites}
              idPrefix={idPrefix}
              onToggle={interactive ? props.onToggle : undefined}
              formId={interactive ? undefined : formId}
            />
            {!interactive && (
              <button type="submit" form={formId} className={classes.apply}>
                {t("search.apply")}
              </button>
            )}
          </div>
        )}
        <div className={classes.main} aria-busy={props.loading}>
          <SelectedFilters
            chips={chips}
            onRemove={
              interactive && props.onToggle
                ? (facet, value) => props.onToggle?.(facet, value, false)
                : undefined
            }
            onClear={interactive ? props.onClear : undefined}
            removeHref={removeHref}
            clearHref={stateUrl(action, withoutFilters(state))}
          />
          {asked && (
            <LevelHeading
              level={resultsLevel}
              id={`${idPrefix}-results`}
              className={classes.resultsHeading}
              tabIndex={-1}
              ref={props.resultsHeadingRef}
            >
              {t("search.results")}
            </LevelHeading>
          )}
          <output
            className={statusClass(status)}
            data-testid="ctmd-search-status"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </output>
          {!asked && <p className={cards.empty}>{t("search.hint")}</p>}
          {asked && !props.failed && page.total === 0 && !props.loading && (
            <p className={cards.empty}>{props.noResultText || t("search.none")}</p>
          )}
          <ResultList
            items={page.items}
            words={state.q}
            start={(state.page - 1) * size + 1}
            level={resultsLevel + 1}
          />
          <Pager
            page={state.page}
            totalPages={page.totalPages}
            hrefOf={(to) => stateUrl(action, { ...state, page: to })}
            onPage={interactive ? props.onPage : undefined}
          />
        </div>
      </div>
    </div>
  );
};

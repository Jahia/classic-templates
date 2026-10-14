/**
 * The pieces of the search section shared by the server view (no JavaScript: a GET form, links)
 * and the island (SearchApp.client.tsx: the same markup, driven by Search UI): facet groups,
 * selected filters, the results list and the pager. They import nothing from Jahia, so the browser
 * bundle can carry them; every label is a locale key.
 */
import type { ChangeEvent, ElementType, ReactNode, Ref } from "react";
import { RAW, useT } from "../../../lib/i18n.js";
import { clampLevel } from "../../../lib/level.js";
import { excerptParts, kindKey } from "../../../lib/search.js";
import type { FacetEntry, Facets, ResultItem } from "../../../lib/searchResponse.js";
import {
  FACETS,
  STORY_FORMATS,
  type FacetName,
  type SearchState,
} from "../../../lib/searchState.js";
import shared from "../../../lib/shared.module.css";
import cards from "../shared/cards.module.css";
import classes from "./search-results.module.css";

/** Tags shown before "More". */
export const TAGS_SHOWN = 12;

/** A heading of level 2 to 6 (components never render an h1). */
export const LevelHeading = ({
  level,
  id,
  className,
  tabIndex,
  ref,
  children,
}: {
  level: number;
  id?: string;
  className?: string;
  tabIndex?: number;
  ref?: Ref<HTMLHeadingElement>;
  children: ReactNode;
}) => {
  const Tag = `h${clampLevel(level)}` as ElementType;
  return (
    <Tag id={id} className={className} tabIndex={tabIndex} ref={ref}>
      {children}
    </Tag>
  );
};

/** The label of a facet value: a topic's title, a translated format, type or site name. */
export const useFacetLabel = (siteLabels: Record<string, string>) => {
  const t = useT();
  return (facet: FacetName, entry: FacetEntry): string => {
    switch (facet) {
      case "topic": {
        return entry.label ?? entry.value;
      }
      case "format": {
        const known = (STORY_FORMATS as readonly string[]).includes(entry.value);
        return t(known ? `format.${entry.value}` : `session.type.${entry.value}`);
      }
      case "type": {
        return t(`search.kind.${entry.value}`);
      }
      case "site": {
        return siteLabels[entry.value] ?? entry.value;
      }
      default: {
        return entry.value;
      }
    }
  };
};

/** The sentence the status line reads out: how many results, for which words. */
export const useStatusText = (
  state: SearchState,
  total: number,
  asked: boolean,
  failed: boolean,
): string => {
  const t = useT();
  if (!asked) return "";
  if (failed) return t("search.unavailable");
  if (state.q) return t("search.count", { count: total, words: state.q, ...RAW });
  return t("search.countAll", { count: total });
};

interface OptionProps {
  facet: FacetName;
  entry: FacetEntry;
  label: string;
  selected: boolean;
  formId?: string;
  onToggle?: (facet: FacetName, value: string, selected: boolean) => void;
}

/** One checkbox of a facet: a plain form field on the server, a controlled one in the island. */
const Option = ({ facet, entry, label, selected, formId, onToggle }: OptionProps) => (
  <label className={classes.option}>
    <input
      className={classes.checkbox}
      type="checkbox"
      name={facet}
      value={entry.value}
      form={formId}
      {...(onToggle
        ? {
            checked: selected,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              onToggle(facet, entry.value, event.target.checked),
          }
        : { defaultChecked: selected })}
    />
    <span className={classes.optionText}>{label}</span>
    <span className={classes.count}>{entry.count}</span>
  </label>
);

interface GroupProps {
  entries: FacetEntry[];
  selected: ReadonlySet<string>;
  labelOf: (entry: FacetEntry) => string;
  facet: FacetName;
  formId?: string;
  onToggle?: OptionProps["onToggle"];
}

/** A flat list of options (Format, Type, Site). */
const FlatOptions = ({ entries, selected, labelOf, facet, formId, onToggle }: GroupProps) => (
  <ul className={classes.options}>
    {entries.map((entry) => (
      <li key={entry.value}>
        <Option
          facet={facet}
          entry={entry}
          label={labelOf(entry)}
          selected={selected.has(entry.value)}
          formId={formId}
          onToggle={onToggle}
        />
      </li>
    ))}
  </ul>
);

/** Tags: the most used first, the rest under "More" (open when one of them is selected). */
const TagOptions = (props: GroupProps) => {
  const t = useT();
  const head = props.entries.slice(0, TAGS_SHOWN);
  const rest = props.entries.slice(TAGS_SHOWN);
  return (
    <>
      <FlatOptions {...props} entries={head} />
      {rest.length > 0 && (
        <details className={classes.more} open={rest.some((e) => props.selected.has(e.value))}>
          <summary className={classes.summary}>{t("search.more", { count: rest.length })}</summary>
          <FlatOptions {...props} entries={rest} />
        </details>
      )}
    </>
  );
};

/** Topics as a tree: top-level topics, their sub-topics under a disclosure. */
const TopicTree = ({
  parent,
  known,
  ...props
}: GroupProps & { parent: string | undefined; known: ReadonlySet<string> }) => {
  const t = useT();
  const parentOf = (entry: FacetEntry) =>
    entry.parent && known.has(entry.parent) ? entry.parent : undefined;
  const level = props.entries.filter((entry) => parentOf(entry) === parent);
  /** True when the topic or anything under it is selected. */
  const holdsSelection = (entry: FacetEntry): boolean =>
    props.selected.has(entry.value) ||
    props.entries.some((child) => parentOf(child) === entry.value && holdsSelection(child));
  return (
    <ul className={classes.options}>
      {level.map((entry) => {
        const kids = props.entries.filter((child) => parentOf(child) === entry.value);
        return (
          <li key={entry.value}>
            <Option
              facet="topic"
              entry={entry}
              label={props.labelOf(entry)}
              selected={props.selected.has(entry.value)}
              formId={props.formId}
              onToggle={props.onToggle}
            />
            {kids.length > 0 && (
              <details className={classes.sub} open={kids.some((kid) => holdsSelection(kid))}>
                <summary className={classes.summary}>
                  {t("search.subtopics", { count: kids.length })}
                </summary>
                <TopicTree {...props} parent={entry.value} known={known} />
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export interface FacetPanelProps {
  facets: Facets;
  state: SearchState;
  siteLabels: Record<string, string>;
  /** Network scope: more than one site to choose from. */
  showSites: boolean;
  /** Ids of the elements, unique on the page. */
  idPrefix: string;
  /** Island only: called when a checkbox changes (without it, the boxes are plain form fields). */
  onToggle?: OptionProps["onToggle"];
  /** Server only: the id of the GET form the checkboxes and the button belong to. */
  formId?: string;
}

/**
 * The facet groups: a fieldset and legend per facet, a checkbox per value with its count. Topics
 * are a tree, tags show the top twelve, sites only appear for a network search. A group with no
 * value is left out.
 */
export const FacetPanel = ({
  facets,
  state,
  siteLabels,
  showSites,
  idPrefix,
  onToggle,
  formId,
}: FacetPanelProps) => {
  const t = useT();
  const labelFor = useFacetLabel(siteLabels);
  return (
    <>
      {FACETS.map((facet) => {
        const entries = facets[facet];
        if (entries.length === 0 || (facet === "site" && !showSites)) return null;
        const props: GroupProps = {
          entries,
          selected: new Set(state[facet]),
          labelOf: (entry) => labelFor(facet, entry),
          facet,
          formId,
          onToggle,
        };
        return (
          <fieldset
            key={facet}
            className={classes.group}
            data-testid={`ctmd-search-facet-${facet}`}
          >
            <legend id={`${idPrefix}-${facet}`} className={classes.legend}>
              {t(`search.facet.${facet}`)}
            </legend>
            {facet === "topic" && (
              <TopicTree
                {...props}
                parent={undefined}
                known={new Set(entries.map((e) => e.value))}
              />
            )}
            {facet === "tag" && <TagOptions {...props} />}
            {facet !== "topic" && facet !== "tag" && <FlatOptions {...props} />}
          </fieldset>
        );
      })}
    </>
  );
};

/** Every selected value with its label, in the facets' order. */
export const selectedValues = (
  state: SearchState,
  facets: Facets,
  labelFor: (facet: FacetName, entry: FacetEntry) => string,
): { facet: FacetName; value: string; label: string }[] =>
  FACETS.flatMap((facet) =>
    state[facet].map((value) => {
      const entry = facets[facet].find((candidate) => candidate.value === value) ?? {
        value,
        count: 0,
      };
      return { facet, value, label: labelFor(facet, entry) };
    }),
  );

/**
 * The selected filters as removable chips and "Clear all". In the island they are buttons; without
 * JavaScript they are links to the same search without that value.
 */
export const SelectedFilters = ({
  chips,
  onRemove,
  onClear,
  removeHref,
  clearHref,
}: {
  chips: { facet: FacetName; value: string; label: string }[];
  onRemove?: (facet: FacetName, value: string) => void;
  onClear?: () => void;
  removeHref?: (facet: FacetName, value: string) => string;
  clearHref?: string;
}) => {
  const t = useT();
  if (chips.length === 0) return null;
  return (
    <div className={classes.chips} data-testid="ctmd-search-chips">
      <ul className={classes.chipList} aria-label={t("search.selected")}>
        {chips.map((chip) => {
          const name = t("search.remove", { label: chip.label, ...RAW });
          const content = (
            <>
              <span>{chip.label}</span>
              <span aria-hidden="true" className={classes.chipX}>
                ×
              </span>
            </>
          );
          return (
            <li key={`${chip.facet}:${chip.value}`}>
              {onRemove ? (
                <button
                  type="button"
                  className={classes.chip}
                  aria-label={name}
                  data-ctmd-chip=""
                  onClick={() => onRemove(chip.facet, chip.value)}
                >
                  {content}
                </button>
              ) : (
                <a
                  className={classes.chip}
                  aria-label={name}
                  href={removeHref?.(chip.facet, chip.value)}
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
      {onClear ? (
        <button type="button" className={classes.clear} onClick={onClear} data-ctmd-chip="">
          {t("search.clear")}
        </button>
      ) : (
        <a className={classes.clear} href={clearHref}>
          {t("search.clear")}
        </a>
      )}
    </div>
  );
};

/** The hits, with the markup and classes of the server's results (the island swaps in place). */
export const ResultList = ({
  items,
  start,
  level,
}: {
  items: ResultItem[];
  start: number;
  /** Heading level of each hit's title. */
  level: number;
}) => {
  const t = useT();
  if (items.length === 0) return null;
  return (
    <ol className={classes.results} start={start}>
      {items.map((hit) => (
        <li key={hit.id} className={classes.result} data-testid="ctmd-search-hit">
          <p className={cards.kind}>{t(kindKey(hit.type))}</p>
          <LevelHeading level={level} className={classes.title}>
            {hit.url ? <a href={hit.url}>{hit.title}</a> : hit.title}
          </LevelHeading>
          {hit.excerpt ? (
            <p className={classes.excerpt}>
              {excerptParts(hit.excerpt).map((part) =>
                part.hit ? (
                  <mark key={part.at} className={classes.mark}>
                    {part.text}
                  </mark>
                ) : (
                  <span key={part.at}>{part.text}</span>
                ),
              )}
            </p>
          ) : (
            hit.summary && <p className={classes.excerpt}>{hit.summary}</p>
          )}
        </li>
      ))}
    </ol>
  );
};

/** Previous and next links with the page's position; `onPage` turns a click into a page change. */
export const Pager = ({
  page,
  totalPages,
  hrefOf,
  onPage,
}: {
  page: number;
  totalPages: number;
  hrefOf: (page: number) => string;
  onPage?: (page: number) => void;
}) => {
  const t = useT();
  if (totalPages <= 1) return null;
  const link = (to: number, rel: "prev" | "next", label: string) => (
    <a
      href={hrefOf(to)}
      rel={rel}
      onClick={
        onPage
          ? (event) => {
              event.preventDefault();
              onPage(to);
            }
          : undefined
      }
    >
      {label}
    </a>
  );
  return (
    <nav className={classes.pager} aria-label={t("search.pages")}>
      {page > 1 && link(page - 1, "prev", t("search.previous"))}
      <span className={classes.position}>{t("search.page", { page, pages: totalPages })}</span>
      {page < totalPages && link(page + 1, "next", t("search.next"))}
    </nav>
  );
};

/** The text the status line is hidden with when it is empty (kept in the page for the live region). */
export const statusClass = (text: string): string =>
  text ? classes.status : shared.visuallyHidden;

/**
 * The search box without suggestions: a plain input of the GET form. The server renders it, and the
 * island's first render must match it (see PanelProps.interactive) before it swaps in the combobox.
 */
export const SearchInput = ({ id, value }: { id: string; value: string }) => (
  <input
    id={id}
    className={classes.input}
    type="search"
    name="q"
    defaultValue={value}
    maxLength={200}
  />
);

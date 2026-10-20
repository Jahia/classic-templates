import type { FocusEvent, KeyboardEvent, Ref } from "react";
import { useTranslation } from "react-i18next";
import { searchUrl, type Suggestion } from "../../../lib/headerSearch.js";
import classes from "./header-search.module.css";

/** The suggestions: the matching items, then "Search for <words>". */
export type Option = { kind: "item"; suggestion: Suggestion } | { kind: "search"; words: string };

/** What the box shows; the handlers are the island's (the server renders it without any). */
export interface SearchBoxProps {
  /** The id of the input; the other ids derive from it. */
  id: string;
  /** The search page: the form's action. */
  action: string;
  value: string;
  /** The panel is open (small screens, with the script). */
  expanded: boolean;
  /** The list of suggestions is shown. */
  open: boolean;
  options: Option[];
  onChange?: (value: string) => void;
  onToggle?: () => void;
  /** Keys pressed in the input, on a suggestion link or on the toggle. */
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** The focus left the input, a suggestion link or the toggle. */
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  inputRef?: Ref<HTMLInputElement>;
  /** Called with each suggestion link, so the island can move the focus onto it. */
  linkRef?: (index: number, link: HTMLAnchorElement | null) => void;
  rootRef?: Ref<HTMLDivElement>;
  toggleRef?: Ref<HTMLButtonElement>;
}

const Magnifier = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path d="M13 13l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

/** Where a suggestion goes: the item's own page, or the search page for the words typed. */
const hrefOf = (option: Option, action: string) =>
  option.kind === "item" ? option.suggestion.url : searchUrl(action, option.words);

/**
 * The markup of the header's search box: a GET form to the search page with an input named `q`
 * (it works without JavaScript), the suggestions as a list of plain links under it, a status that
 * says how many there are, and a toggle that only shows on small screens once the page's script
 * has run. Native elements only: a link opens with Enter or a click, the form submits the words.
 */
export const SearchBox = (props: SearchBoxProps) => {
  const { t } = useTranslation("classic-templates");
  const { id, open } = props;
  const listId = `${id}-list`;
  const panelId = `${id}-panel`;
  const statusId = `${id}-status`;
  return (
    <div
      className={classes.search}
      data-open={props.expanded ? "" : undefined}
      data-testid="ctpl-header-search"
      ref={props.rootRef}
    >
      <button
        type="button"
        className={classes.toggle}
        aria-expanded={props.expanded}
        aria-controls={panelId}
        onClick={props.onToggle}
        onKeyDown={props.onKeyDown}
        onBlur={props.onBlur}
        ref={props.toggleRef}
        data-testid="ctpl-header-search-toggle"
      >
        <Magnifier />
        <span>{t("search.toggle")}</span>
      </button>
      <div id={panelId} className={classes.panel}>
        <form
          className={classes.form}
          method="get"
          action={props.action}
          role="search"
          aria-label={t("search.label")}
          // jExperience's tracker stamps data-wem-observed on forms before React hydrates
          suppressHydrationWarning
        >
          <div className={classes.combo}>
            <label htmlFor={id} className="ctpl-visually-hidden">
              {t("search.label")}
            </label>
            <input
              id={id}
              className={classes.input}
              type="search"
              name="q"
              aria-describedby={statusId}
              autoComplete="off"
              maxLength={200}
              value={props.value}
              onChange={(event) => props.onChange?.(event.target.value)}
              onKeyDown={props.onKeyDown}
              onBlur={props.onBlur}
              ref={props.inputRef}
            />
            <ul
              id={listId}
              className={classes.listbox}
              aria-label={t("search.suggestions")}
              hidden={!open}
              data-testid="ctpl-header-search-suggestions"
            >
              {props.options.map((option, index) => (
                <li key={option.kind === "item" ? option.suggestion.id : "search"}>
                  <a
                    href={hrefOf(option, props.action)}
                    className={
                      option.kind === "search"
                        ? `${classes.option} ${classes.optionSearch}`
                        : classes.option
                    }
                    onKeyDown={props.onKeyDown}
                    onBlur={props.onBlur}
                    ref={(link) => props.linkRef?.(index, link)}
                  >
                    {option.kind === "item"
                      ? option.suggestion.title
                      : t("search.for", {
                          words: option.words,
                          interpolation: { escapeValue: false },
                        })}
                  </a>
                </li>
              ))}
            </ul>
            <output id={statusId} className="ctpl-visually-hidden">
              {open ? t("search.suggestionCount", { count: props.options.length }) : ""}
            </output>
          </div>
          <button type="submit" className={classes.submit}>
            {t("search.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

/** The edit-mode hint: the box is on but the header names no search page. */
export const SearchHint = () => {
  const { t } = useTranslation("classic-templates");
  return (
    <p className={classes.hint} data-testid="ctpl-header-search-hint">
      {t("search.noPage")}
    </p>
  );
};

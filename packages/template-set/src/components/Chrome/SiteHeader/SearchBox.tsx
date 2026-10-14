import type { FocusEvent, KeyboardEvent, Ref } from "react";
import { useTranslation } from "react-i18next";
import type { Suggestion } from "../../../lib/headerSearch.js";
import classes from "./header-search.module.css";

/** The options of the suggestion list: the matching items, then "Search for <words>". */
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
  /** The suggestion list is open. */
  open: boolean;
  /** The highlighted option, -1 for none. */
  active: number;
  options: Option[];
  onChange?: (value: string) => void;
  onToggle?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onPick?: (option: Option) => void;
  onBlur?: (event: FocusEvent<HTMLElement>) => void;
  inputRef?: Ref<HTMLInputElement>;
  rootRef?: Ref<HTMLDivElement>;
  toggleRef?: Ref<HTMLButtonElement>;
}

const Magnifier = () => (
  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
    <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path d="M13 13l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);

/**
 * The markup of the header's search box: a GET form to the search page with an input named `q`
 * (it works without JavaScript), the suggestions as an ARIA 1.2 combobox with a list box, and a
 * toggle that only shows on small screens once the page's script has run.
 */
export const SearchBox = (props: SearchBoxProps) => {
  const { t } = useTranslation("classic-templates");
  const { id, open, active } = props;
  const listId = `${id}-list`;
  const panelId = `${id}-panel`;
  const optionId = (index: number) => `${id}-option-${index}`;
  return (
    <div
      className={classes.search}
      data-open={props.expanded ? "" : undefined}
      data-testid="ctpl-header-search"
      onBlur={props.onBlur}
      onKeyDown={props.onKeyDown}
      ref={props.rootRef}
    >
      <button
        type="button"
        className={classes.toggle}
        aria-expanded={props.expanded}
        aria-controls={panelId}
        onClick={props.onToggle}
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
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listId}
              aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
              autoComplete="off"
              maxLength={200}
              value={props.value}
              onChange={(event) => props.onChange?.(event.target.value)}
              ref={props.inputRef}
            />
            <ul
              id={listId}
              className={classes.listbox}
              role="listbox"
              aria-label={t("search.suggestions")}
              hidden={!open}
            >
              {props.options.map((option, index) => (
                <li
                  key={option.kind === "item" ? option.suggestion.id : "search"}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === active}
                  className={
                    option.kind === "search"
                      ? `${classes.option} ${classes.optionSearch}`
                      : classes.option
                  }
                  // The input keeps focus: a press must not blur it before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => props.onPick?.(option)}
                >
                  {option.kind === "item"
                    ? option.suggestion.title
                    : t("search.for", {
                        words: option.words,
                        interpolation: { escapeValue: false },
                      })}
                </li>
              ))}
            </ul>
            <div role="status" className="ctpl-visually-hidden">
              {open ? t("search.suggestionCount", { count: props.options.length }) : ""}
            </div>
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

/**
 * The search box with its suggestions as a list of plain links (the island's box).
 *
 * ArrowDown moves the focus from the input onto the suggestions, the arrows move between them,
 * Escape returns to the input and closes the list; Tab out of the box and a click elsewhere close
 * it too. Each suggestion is a link to the search it stands for (its URL works on its own, in a new
 * tab too); a plain click or Enter runs that search in place instead of reloading the page. Typing
 * is debounced; a request that answers after a newer one was asked is dropped. A status, which
 * describes the input, says how many suggestions there are.
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { RAW, useT } from "../../../lib/i18n.js";
import { keyResult } from "../../../lib/comboboxKeys.js";
import { SUGGEST_MINIMUM } from "../../../lib/searchConnector.js";
import type { Suggestion } from "../../../lib/searchResponse.js";
import shared from "../../../lib/shared.module.css";
import classes from "./search-results.module.css";

/** Quiet time after the last keystroke before suggestions are asked for. */
export const SUGGEST_DELAY = 200;

/** A click the browser should handle itself: another button, or a modifier (new tab, window). */
const browserClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export const SearchCombobox = ({
  id,
  value,
  onChange,
  suggest,
  onPick,
  hrefOf,
}: {
  /** The id of the input (its label points at it). */
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggest: (words: string) => Promise<Suggestion[]>;
  /** Runs the search a suggestion stands for, in place. */
  onPick: (suggestion: Suggestion) => void;
  /** The address of the search a suggestion stands for (its link). */
  hrefOf: (suggestion: Suggestion) => string;
}) => {
  const t = useT();
  const listId = useId();
  const statusId = useId();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sequenceRef = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      sequenceRef.current++;
    },
    [],
  );

  const ask = (words: string) => {
    clearTimeout(timerRef.current);
    const mine = ++sequenceRef.current;
    if (words.trim().length < SUGGEST_MINIMUM) {
      setItems([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      void suggest(words).then((list) => {
        if (mine !== sequenceRef.current) return;
        setItems(list);
        setOpen(list.length > 0);
      });
    }, SUGGEST_DELAY);
  };

  const pick = (suggestion: Suggestion) => {
    sequenceRef.current++;
    clearTimeout(timerRef.current);
    setItems([]);
    setOpen(false);
    inputRef.current?.focus();
    onPick(suggestion);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const result = keyResult({
      key: event.key,
      open,
      focus: linksRef.current.findIndex((link) => link !== null && link === event.target),
      count: items.length,
    });
    if (result.prevent) event.preventDefault();
    if (result.open !== undefined) setOpen(result.open);
    if (result.focus !== undefined) {
      (result.focus === -1 ? inputRef.current : linksRef.current[result.focus])?.focus();
    }
    // Enter in the input: the form submits the words as typed, a pending suggestion is dropped.
    if (event.key === "Enter" && event.target === inputRef.current) sequenceRef.current++;
  };

  // Focus moved out of the box by the keyboard: the list closes.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.relatedTarget || rootRef.current?.contains(event.relatedTarget)) return;
    setOpen(false);
  };

  return (
    <div className={classes.combo} ref={rootRef}>
      <input
        id={id}
        ref={inputRef}
        className={classes.input}
        type="search"
        name="q"
        aria-describedby={statusId}
        autoComplete="off"
        maxLength={200}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          ask(event.target.value);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      <ul
        id={listId}
        className={classes.listbox}
        aria-label={t("search.suggestions")}
        hidden={!open}
        data-testid="ctmd-search-suggestions"
      >
        {items.map((item, index) => (
          <li key={item.kind === "result" ? item.id : `tag:${item.value}`}>
            <a
              href={hrefOf(item)}
              className={[classes.suggestion, item.kind === "tag" && classes.suggestionTag]
                .filter(Boolean)
                .join(" ")}
              ref={(link) => {
                linksRef.current[index] = link;
              }}
              onClick={(event) => {
                if (browserClick(event)) return;
                event.preventDefault();
                pick(item);
              }}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
            >
              {item.kind === "result"
                ? item.title
                : t("search.suggestTag", { tag: item.value, ...RAW })}
            </a>
          </li>
        ))}
      </ul>
      <output id={statusId} className={shared.visuallyHidden}>
        {open ? t("search.suggestionCount", { count: items.length }) : ""}
      </output>
    </div>
  );
};

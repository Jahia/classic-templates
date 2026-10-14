/**
 * The search box as an ARIA 1.2 combobox with a list box of suggestions (the island's box).
 *
 * The input keeps focus; the arrow keys move a virtual cursor through the options
 * (`aria-activedescendant`), Enter picks the highlighted one or submits the form, Escape closes the
 * list, Tab and a click elsewhere close it. Typing is debounced; a request that answers after a
 * newer one was asked is dropped. A polite status announces how many suggestions there are.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { RAW, useT } from "../../../lib/i18n.js";
import { keyResult } from "../../../lib/comboboxKeys.js";
import { SUGGEST_MINIMUM } from "../../../lib/searchConnector.js";
import type { Suggestion } from "../../../lib/searchResponse.js";
import shared from "../../../lib/shared.module.css";
import classes from "./search-results.module.css";

/** Quiet time after the last keystroke before suggestions are asked for. */
export const SUGGEST_DELAY = 200;

export const SearchCombobox = ({
  id,
  value,
  onChange,
  suggest,
  onPick,
}: {
  /** The id of the input (its label points at it). */
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggest: (words: string) => Promise<Suggestion[]>;
  onPick: (suggestion: Suggestion) => void;
}) => {
  const t = useT();
  const listId = useId();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const sequenceRef = useRef(0);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      sequenceRef.current++;
    },
    [],
  );

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const ask = (words: string) => {
    clearTimeout(timerRef.current);
    const mine = ++sequenceRef.current;
    if (words.trim().length < SUGGEST_MINIMUM) {
      setItems([]);
      close();
      return;
    }
    timerRef.current = setTimeout(() => {
      void suggest(words).then((list) => {
        if (mine !== sequenceRef.current) return;
        setItems(list);
        setOpen(list.length > 0);
        setActive(-1);
      });
    }, SUGGEST_DELAY);
  };

  const pick = (suggestion: Suggestion) => {
    sequenceRef.current++;
    clearTimeout(timerRef.current);
    setItems([]);
    close();
    onPick(suggestion);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const result = keyResult({
      key: event.key,
      open,
      active,
      count: items.length,
      fromInput: true,
    });
    if (result.prevent) event.preventDefault();
    if (result.open !== undefined) setOpen(result.open);
    if (result.active !== undefined) setActive(result.active);
    const chosen = result.pick === undefined ? undefined : items[result.pick];
    if (chosen) pick(chosen);
    // Enter without a highlighted option: the form submits the words as typed.
    else if (event.key === "Enter") sequenceRef.current++;
  };

  const optionId = (index: number) => `${listId}-${index}`;

  return (
    <div
      className={classes.combo}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
    >
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
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          ask(event.target.value);
        }}
        onKeyDown={onKeyDown}
      />
      <ul
        id={listId}
        className={classes.listbox}
        role="listbox"
        aria-label={t("search.suggestions")}
        hidden={!open}
      >
        {items.map((item, index) => (
          <li
            key={item.kind === "result" ? item.id : `tag:${item.value}`}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            className={[classes.suggestion, item.kind === "tag" && classes.suggestionTag]
              .filter(Boolean)
              .join(" ")}
            // The input keeps focus: a press must not blur it before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(item)}
          >
            {item.kind === "result"
              ? item.title
              : t("search.suggestTag", { tag: item.value, ...RAW })}
          </li>
        ))}
      </ul>
      <div role="status" className={shared.visuallyHidden}>
        {open ? t("search.suggestionCount", { count: items.length }) : ""}
      </div>
    </div>
  );
};

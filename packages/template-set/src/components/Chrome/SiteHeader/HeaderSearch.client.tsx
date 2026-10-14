import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import {
  SUGGEST_MINIMUM,
  keyResult,
  SUGGEST_QUERY,
  searchUrl,
  suggestVariables,
  suggestionsOf,
  type Suggestion,
} from "../../../lib/headerSearch.js";
import { SearchBox, type Option } from "./SearchBox.js";

interface Props {
  /** The search page, as a site path: the form's action. */
  action: string;
  /** The site's GraphQL endpoint (`<context path>/modules/graphql`). */
  endpoint: string;
  /** The page's language, for the suggestions. */
  language: string;
  /** The sites suggestions come from: this one, and those the header's network bar links to. */
  sites: string[];
  /** Unique on the page. */
  id: string;
}

/** Quiet time after the last keystroke before suggestions are asked for. */
const DELAY = 250;

/** Asks Augmented Search for suggestions; any failure (service missing, network, shape) is none. */
const ask = async (
  props: Pick<Props, "endpoint" | "language" | "sites">,
  words: string,
  signal: AbortSignal,
): Promise<Suggestion[]> => {
  try {
    const response = await fetch(props.endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        query: SUGGEST_QUERY,
        variables: suggestVariables(words, props.sites, props.language),
      }),
      signal,
    });
    return response.ok ? suggestionsOf(await response.json()) : [];
  } catch {
    return [];
  }
};

/**
 * The header's search box with autocomplete: an ARIA 1.2 combobox over the page's own form.
 *
 * Without JavaScript the server's markup is a plain GET form to the search page. Here, after two
 * characters and a pause, the best five matches of Augmented Search are offered, each linking
 * straight to the item, then "Search for <words>". The arrow keys move through them, Enter picks
 * the highlighted one (or submits the form), Escape closes. If the service is missing or the call
 * fails there is simply no suggestion and no message: the form still works.
 *
 * On small screens (once `html.ctpl-js` is set) a button reveals the field in a panel that drops
 * below the header; Escape closes it and returns focus to the button.
 */
export default function HeaderSearch({ action, endpoint, language, sites, id }: Readonly<Props>) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef<AbortController>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);
  // A press outside the box closes the list and the panel (a blur alone misses a click on
  // something that takes no focus, and some browsers give a pressed button no focus).
  useEffect(() => {
    if (!open && !expanded) return;
    const outside = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
      setActive(-1);
      setExpanded(false);
    };
    globalThis.document.addEventListener("pointerdown", outside);
    return () => globalThis.document.removeEventListener("pointerdown", outside);
  }, [open, expanded]);

  const options: Option[] =
    suggestions.length > 0
      ? [
          ...suggestions.map((suggestion): Option => ({ kind: "item", suggestion })),
          { kind: "search", words: value.trim() },
        ]
      : [];

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const change = (words: string) => {
    setValue(words);
    clearTimeout(timerRef.current);
    abortRef.current?.abort();
    if (words.trim().length < SUGGEST_MINIMUM) {
      setSuggestions([]);
      close();
      return;
    }
    timerRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;
      void ask({ endpoint, language, sites }, words, controller.signal).then((found) => {
        if (controller.signal.aborted) return;
        setSuggestions(found);
        setOpen(found.length > 0);
        setActive(-1);
      });
    }, DELAY);
  };

  const pick = (option: Option) => {
    close();
    globalThis.location.assign(
      option.kind === "item" ? option.suggestion.url : searchUrl(action, option.words),
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const result = keyResult({
      key: event.key,
      open,
      active,
      count: options.length,
      fromInput: event.target === inputRef.current,
      expanded,
    });
    if (result.prevent) event.preventDefault();
    if (result.open !== undefined) setOpen(result.open);
    if (result.active !== undefined) setActive(result.active);
    if (result.collapse) {
      setExpanded(false);
      toggleRef.current?.focus();
    }
    const chosen = result.pick === undefined ? undefined : options[result.pick];
    if (chosen) pick(chosen);
  };

  // Focus moved to another control by the keyboard: the list and the panel close.
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.relatedTarget || event.currentTarget.contains(event.relatedTarget)) return;
    close();
    setExpanded(false);
  };

  return (
    <SearchBox
      id={id}
      action={action}
      value={value}
      expanded={expanded}
      open={open}
      active={active}
      options={options}
      onChange={change}
      onToggle={() => setExpanded(!expanded)}
      onKeyDown={onKeyDown}
      onPick={pick}
      onBlur={onBlur}
      inputRef={inputRef}
      toggleRef={toggleRef}
      rootRef={rootRef}
    />
  );
}

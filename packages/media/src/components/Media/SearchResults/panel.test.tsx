import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import en from "../../../../settings/locales/en.json";
import { adaptSearchData } from "../../../lib/searchResponse.js";
import type { QueryContext } from "../../../lib/searchQuery.js";
import { emptyState, type SearchState } from "../../../lib/searchState.js";
import browse from "../../../lib/__fixtures__/search-browse.json";
import words from "../../../lib/__fixtures__/search-words.json";
import { SearchPanel, type PanelProps } from "./panel.js";
import { SearchInput } from "./parts.js";
import { SearchCombobox } from "./SearchCombobox.js";

const ctx: QueryContext = {
  language: "en",
  workspace: "LIVE",
  sites: ["orvane-signal", "orvane-live"],
  size: 3,
};

await i18next.init({
  lng: "en",
  ns: ["classic-media"],
  defaultNS: "classic-media",
  resources: { en: { "classic-media": en } },
  react: { useSuspense: false },
});

const render = (state: SearchState, data: unknown, extra: Partial<PanelProps> = {}) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18next}>
      <SearchPanel
        idPrefix="s1"
        title="Search"
        level={2}
        action="/sites/s/home/search.html"
        state={state}
        page={adaptSearchData(data, state, ctx)}
        loading={false}
        failed={false}
        size={3}
        siteLabels={{ "orvane-signal": "Orvane Signal", "orvane-live": "Orvane Live" }}
        showSites
        box={<input id="s1-q" name="q" type="search" defaultValue={state.q} />}
        {...extra}
      />
    </I18nextProvider>,
  );

describe("SearchPanel without JavaScript", () => {
  const html = render({ ...emptyState(), q: "fast", tag: ["fast"] }, words);

  it("is a GET form whose fields and button belong to it", () => {
    expect(html).toContain('<form id="s1-form"');
    expect(html).toContain('method="get"');
    expect(html).toContain('action="/sites/s/home/search.html"');
    expect(html).toContain('<label class="');
    const tag = /<input[^>]*name="tag"[^>]*>/.exec(html)?.[0] ?? "";
    expect(tag).toContain('form="s1-form"');
    expect(html).toMatch(/<button type="submit" form="s1-form"[^>]*>Apply filters<\/button>/);
  });

  it("has a fieldset and a legend per facet, a labelled checkbox with its count per value", () => {
    expect(html).toContain('data-testid="ctmd-search-facet-tag"');
    expect(html).toMatch(/<legend[^>]*>Tags<\/legend>/);
    expect(html).toMatch(/<legend[^>]*>Topics<\/legend>/);
    expect(html).toMatch(/<legend[^>]*>Site<\/legend>/);
    const box =
      /<label[^>]*><input[^>]*name="tag"[^>]*\/><span[^>]*>fast<\/span><span[^>]*>\d+<\/span><\/label>/;
    expect(html).toMatch(box);
    const input = /<input[^>]*name="tag"[^>]*>/.exec(html)?.[0] ?? "";
    expect(input).toContain('type="checkbox"');
    expect(input).toContain('value="fast"');
    expect(input).toContain('checked=""');
    expect(html).toContain("Orvane Signal");
  });

  it("offers sub-topics under a disclosure and more tags under another", () => {
    expect(html).toMatch(/<summary[^>]*>Sub-topics \(\d+\)<\/summary>/);
    const many = {
      main: {
        tag: { data: Array.from({ length: 20 }, (_, i) => ({ value: `t${i}`, count: 20 - i })) },
      },
    };
    expect(render(emptyState(), many)).toMatch(/<summary[^>]*>More \(8\)<\/summary>/);
  });

  it("shows the selected values as links that remove them, and a way to clear all", () => {
    expect(html).toContain('aria-label="Selected filters"');
    expect(html).toContain('href="/sites/s/home/search.html?q=fast"');
    expect(html).toContain("Clear all filters");
  });

  it("keeps one h2 (the title), a hidden results heading, the count in a status and the hits", () => {
    expect(html.match(/<h2/g)).toHaveLength(1);
    expect(html).toMatch(/<h3[^>]*tabindex="-1"[^>]*>Results<\/h3>/);
    expect(html).toMatch(/<output[^>]*>13 results for “fast”<\/output>/);
    expect(html.match(/data-testid="ctmd-search-hit"/g)).toHaveLength(3);
    expect(html).toContain(
      '<a href="/sites/orvane-signal/contents/stories/fast-ad-fill-rates-climb.html">',
    );
    expect(html).toMatch(/<h4[^>]*><a href=/);
    expect(html).toContain("<mark");
  });

  it("pages with links, and names the position", () => {
    const second = render({ ...emptyState(), q: "fast", page: 2 }, words);
    expect(second).toContain('rel="prev"');
    expect(second).toContain('href="/sites/s/home/search.html?q=fast"');
    expect(second).toContain('rel="next"');
    expect(second).toContain("Page 2 of 5");
    expect(second).toContain('start="4"');
  });

  it("says what to do when nothing is asked, and shows no hit", () => {
    const idle = render(emptyState(), browse);
    expect(idle).toContain("Type words or choose filters to see results.");
    expect(idle).not.toContain("ctmd-search-hit");
    expect(idle).not.toContain("Results</h");
  });

  it("says so when nothing matches", () => {
    const none = render(
      { ...emptyState(), q: "zzz" },
      { main: { results: { totalHits: 0, hits: [] } } },
    );
    expect(none).toContain("Nothing matches these words.");
  });

  it("has an untitled section start at its own level", () => {
    const untitled = render({ ...emptyState(), q: "fast" }, words, { title: undefined });
    expect(untitled).not.toMatch(/<h2[^>]*id="s1-title"/);
    expect(untitled).toMatch(/<h2[^>]*>Results<\/h2>/);
    expect(untitled).toMatch(/<h3[^>]*><a href=/);
  });

  it("leaves the site group out for a single-site search", () => {
    expect(render(emptyState(), browse, { showSites: false })).not.toContain("facet-site");
  });
});

describe("SearchPanel in the island", () => {
  const html = render({ ...emptyState(), q: "fast", tag: ["fast"] }, words, {
    onToggle: () => {},
    onClear: () => {},
    onPage: () => {},
    onSubmit: () => {},
  });

  it("has no Apply button and controlled checkboxes, no form association", () => {
    expect(html).not.toContain("Apply filters");
    expect(html).not.toMatch(/<input[^>]*name="tag"[^>]*form=/);
  });

  it("removes a filter with a button named after it", () => {
    expect(html).toMatch(/<button type="button"[^>]*aria-label="Remove filter: fast"/);
    expect(html).toContain("Clear all filters</button>");
  });
});

describe("SearchCombobox", () => {
  const html = renderToStaticMarkup(
    <I18nextProvider i18n={i18next}>
      <SearchCombobox
        id="q"
        value=""
        onChange={() => {}}
        suggest={async () => []}
        onPick={() => {}}
        hrefOf={() => "/search.html"}
      />
    </I18nextProvider>,
  );

  it("is a plain search input described by its status, over a hidden list of suggestion links", () => {
    const input = /<input[^>]*>/.exec(html)?.[0] ?? "";
    expect(input).toContain('type="search"');
    expect(input).not.toContain("role=");
    const status = /aria-describedby="([^"]+)"/.exec(input)?.[1];
    expect(html).toMatch(new RegExp(`<output id="${status}"`));
    expect(html).toMatch(/<ul[^>]*aria-label="Suggestions"[^>]*hidden=""/);
    expect(html).not.toMatch(/role="(combobox|listbox|option|status)"/);
  });
});

describe("hydration: the island's first render is the server's markup", () => {
  const state = { ...emptyState(), q: "fast", tag: ["fast"] };
  const handlers = {
    onToggle: () => {},
    onClear: () => {},
    onPage: () => {},
    onSubmit: () => {},
    resultsHeadingRef: () => {},
    rootRef: () => {},
  };

  it("is identical with or without the handlers while not interactive", () => {
    const server = render(state, words, {
      box: <SearchInput id="s1-q" value="fast" />,
    });
    const firstRender = render(state, words, {
      box: <SearchInput id="s1-q" value="fast" />,
      ...handlers,
      interactive: false,
    });
    expect(firstRender).toBe(server);
  });

  it("differs once interactive (that swap happens after hydration, never during it)", () => {
    const server = render(state, words);
    expect(render(state, words, { ...handlers, interactive: true })).not.toBe(server);
  });
});

describe("the result count is a polite live region", () => {
  it("is a status region holding the count, updated in place", () => {
    const html = render({ ...emptyState(), q: "fast" }, words);
    expect(html).toMatch(/<output[^>]*aria-live="polite"[^>]*aria-atomic="true"[^>]*>13 results/);
  });
});

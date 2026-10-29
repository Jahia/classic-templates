import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import en from "../../../../settings/locales/en.json";
import { SearchBox, type SearchBoxProps } from "./SearchBox.js";

await i18next.init({
  lng: "en",
  ns: ["classic-templates"],
  defaultNS: "classic-templates",
  resources: { en: { "classic-templates": en } },
  react: { useSuspense: false },
});

const render = (props: Partial<SearchBoxProps> = {}) =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18next}>
      <SearchBox
        id="s"
        action="/sites/s/home/search.html"
        value=""
        expanded={false}
        open={false}
        options={[]}
        {...props}
      />
    </I18nextProvider>,
  );

describe("SearchBox, closed (also the server's markup)", () => {
  const html = render();

  it("is a GET form to the search page whose field is named q, labelled, with a submit button", () => {
    expect(html).toMatch(/<form[^>]*action="\/sites\/s\/home\/search.html"[^>]*method="get"/);
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-label="Search the site"');
    expect(html).toMatch(/<label for="s"[^>]*>Search the site<\/label>/);
    expect(html).toMatch(/<input[^>]*id="s"[^>]*name="q"/);
    expect(html).toMatch(/<button type="submit"[^>]*>Search<\/button>/);
  });

  it("is a plain search input described by its status, over a hidden list of suggestions", () => {
    const input = /<input[^>]*>/.exec(html)?.[0] ?? "";
    expect(input).toContain('type="search"');
    expect(input).toContain('aria-describedby="s-status"');
    expect(input).not.toContain("role=");
    expect(html).toMatch(/<ul[^>]*id="s-list"[^>]*hidden=""/);
    expect(html).toMatch(/<output id="s-status"[^>]*><\/output>/);
    expect(html).not.toMatch(/role="(combobox|listbox|option|status)"/);
  });

  it("has a toggle that names the panel it opens", () => {
    expect(html).toMatch(
      /<button type="button"[^>]*aria-expanded="false"[^>]*aria-controls="s-panel"/,
    );
    expect(html).toContain('id="s-panel"');
  });
});

describe("SearchBox, list open", () => {
  const html = render({
    value: "fast",
    open: true,
    options: [
      { kind: "item", suggestion: { id: "a", title: "Fast channels", url: "/a.html" } },
      { kind: "item", suggestion: { id: "b", title: "Fast ads", url: "/b.html" } },
      { kind: "search", words: "fast" },
    ],
  });

  it("offers each suggestion as a link, the search page last, and says how many there are", () => {
    expect(html).toMatch(/<a href="\/a.html"[^>]*>Fast channels<\/a>/);
    expect(html).toMatch(/<a href="\/b.html"[^>]*>Fast ads<\/a>/);
    expect(html).toMatch(
      /<a href="\/sites\/s\/home\/search.html\?q=fast"[^>]*>Search for “fast”<\/a>/,
    );
    expect(html).toContain("3 suggestions available");
    expect(html).not.toMatch(/<ul[^>]*hidden/);
  });

  it("does not render a suggestion as markup", () => {
    const hostile = render({
      open: true,
      options: [
        { kind: "item", suggestion: { id: "x", title: "<img src=x onerror=1>", url: "/x.html" } },
        { kind: "search", words: "<b>" },
      ],
    });
    expect(hostile).not.toContain("<img");
    expect(hostile).toContain("&lt;img");
    expect(hostile).toContain("Search for “&lt;b&gt;”");
  });
});

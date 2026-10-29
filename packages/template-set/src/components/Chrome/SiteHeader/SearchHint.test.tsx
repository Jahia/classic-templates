import i18next from "i18next";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it, vi } from "vitest";
import en from "../../../../settings/locales/en.json";
import { SearchHint } from "./SearchHint.js";

let editMode = true;
vi.mock("@jahia/javascript-modules-library", () => ({
  useServerContext: () => ({ renderContext: { isEditMode: () => editMode } }),
}));

await i18next.init({
  lng: "en",
  ns: ["classic-templates"],
  defaultNS: "classic-templates",
  resources: { en: { "classic-templates": en } },
  react: { useSuspense: false },
});

const render = () =>
  renderToStaticMarkup(
    <I18nextProvider i18n={i18next}>
      <SearchHint />
    </I18nextProvider>,
  );

describe("SearchHint", () => {
  it("tells editors the header needs a search page, as an edit note", () => {
    editMode = true;
    const html = render();
    expect(html).toContain("names no Search page");
    expect(html).toContain('class="ctpl-edit-hint');
    expect(html).toContain('data-level="hidden"');
  });

  it("renders nothing outside edit mode (preview and live)", () => {
    editMode = false;
    expect(render()).toBe("");
  });
});

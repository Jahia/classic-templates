/*
 * Progressive enhancement of the classic-templates tabs (Tabs view). Without this file every tab
 * is a headed block, one after the other. With it, each [data-ctpl-tabs] becomes the ARIA tabs
 * pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/):
 * - a tablist of buttons built from the tab labels (role="tab", aria-selected, aria-controls),
 *   panels with role="tabpanel" labelled by their tab, the panels not selected hidden;
 * - roving tabindex: Tab reaches the selected tab only; Left and Right arrows move to the previous
 *   or next tab (wrapping), Home and End to the first and last, and select it;
 * - the first tab is selected, unless the address points at a tab (#tab-<name>) or at something
 *   inside one (an accordion entry, a heading): that tab is selected, on load and whenever the
 *   address changes;
 * - the labels stay in the panels as headings, visually hidden, so the page outline is the same.
 * It only relies on data-* attributes and ARIA, never on (hashed) CSS module class names.
 */
(function () {
  document.documentElement.classList.add("ctpl-js");

  const KEYS = { ArrowLeft: -1, ArrowRight: 1 };
  const instances = [];

  /** The panels of a tabs block, nested tabs blocks excluded. */
  const panelsOf = (root) =>
    [...root.querySelectorAll("[data-ctpl-tab-panel]")].filter(
      (panel) =>
        panel.closest("[data-ctpl-tabs]") === root && panel.querySelector("[data-ctpl-tab-label]"),
    );

  const init = (root) => {
    if (root.hasAttribute("data-ctpl-ready")) return;
    const panels = panelsOf(root);
    if (panels.length === 0) return;
    const list = document.createElement("div");
    list.setAttribute("role", "tablist");
    const labelledBy = root.getAttribute("data-labelledby");
    if (labelledBy) list.setAttribute("aria-labelledby", labelledBy);

    const tabs = panels.map((panel, index) => {
      const label = panel.querySelector("[data-ctpl-tab-label]");
      if (!panel.id) panel.id = `ctpl-tab-panel-${index + 1}`;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${panel.id}-tab`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.textContent = label.textContent;
      label.setAttribute("data-ctpl-tab-hidden", "");
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      list.append(tab);
      return tab;
    });

    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) tabs[index].focus();
    };

    list.addEventListener("click", (event) => {
      const index = tabs.indexOf(event.target.closest('[role="tab"]'));
      if (index >= 0) select(index, true);
    });
    list.addEventListener("keydown", (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      let next;
      if (event.key in KEYS) next = (current + KEYS[event.key] + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });

    panels[0].before(list);
    root.setAttribute("data-ctpl-ready", "");
    select(0, false);
    instances.push({ panels, select });
  };

  /** The id the address points at ("" for none, or for a malformed escape). */
  const hashId = () => {
    try {
      return decodeURIComponent(globalThis.location.hash.slice(1));
    } catch {
      return "";
    }
  };

  /** Selects the tab the address points at: the tab itself or something inside it. */
  const followHash = () => {
    const id = hashId();
    const target = id ? document.querySelector(`#${CSS.escape(id)}`) : null;
    if (!target) return;
    for (const { panels, select } of instances) {
      const index = panels.findIndex((panel) => panel.contains(target));
      if (index >= 0) select(index, false);
    }
    target.scrollIntoView({ block: "start" });
  };

  const start = () => {
    document.querySelectorAll("[data-ctpl-tabs]").forEach(init);
    followHash();
  };

  globalThis.addEventListener("hashchange", followHash);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

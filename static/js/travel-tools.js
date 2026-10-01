/*
 * Progressive enhancement of the travel tools sections (ctrv:travelTools): the server renders the
 * tools as stacked sections with headings, which is what visitors get without JavaScript and what
 * editors get in edit mode. This script turns each section marked data-ctrv-tabs into the WAI-ARIA
 * tabs pattern: a tab list (named by the section heading) with one tab per tool, the tool sections
 * as tab panels, roving focus with the arrow keys, Home and End, automatic activation.
 */
(() => {
  const enhance = (root) => {
    const panels = [...root.querySelectorAll(":scope > [data-ctrv-tab-panel]")];
    if (panels.length < 2) return; // one tool needs no tabs
    const tablist = document.createElement("div");
    tablist.setAttribute("role", "tablist");
    const labelledBy = root.dataset.ctrvLabelledby;
    if (labelledBy && document.getElementById(labelledBy)) {
      tablist.setAttribute("aria-labelledby", labelledBy);
    }

    const tabs = panels.map((panel, index) => {
      const label = panel.querySelector("[data-ctrv-tab-label]");
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${panel.id}-tab`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.textContent = label ? label.textContent : `${index + 1}`;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      tablist.append(tab);
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

    tablist.addEventListener("click", (event) => {
      const index = tabs.indexOf(event.target.closest("[role='tab']"));
      if (index >= 0) select(index, false);
    });
    tablist.addEventListener("keydown", (event) => {
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      const last = tabs.length - 1;
      const next = {
        ArrowRight: current === last ? 0 : current + 1,
        ArrowLeft: current === 0 ? last : current - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });

    root.prepend(tablist);
    select(0, false);
    root.dataset.ctrvTabs = "ready";
  };

  const start = () => document.querySelectorAll("[data-ctrv-tabs='']").forEach(enhance);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

/*
 * Progressive enhancement of classic-media sections. The server renders everything a visitor needs
 * without JavaScript (stacked agenda days, every story and session, no share buttons, no
 * countdown), which is also what editors get in edit mode, where this script is not loaded.
 *
 * - [data-ctmd-tabs]: agenda days become WAI-ARIA tabs (tab list named by the section heading,
 *   roving focus with the arrow keys, Home and End, automatic activation).
 * - [data-ctmd-filter]: buttons (aria-pressed) or selects that hide the items of the section that
 *   do not match (data-ctmd-<facet> on each item), with a polite count of what is shown.
 * - [data-ctmd-share]: the browser's share sheet when it has one, and "copy link".
 * - [data-ctmd-countdown]: "Starts in 12 days" / "Happening now", from the event's first and last
 *   day, in the visitor's calendar; the texts come from the page (translated by the server).
 */
(() => {
  // ---- Tabs -------------------------------------------------------------------------------------
  const tabs = (root) => {
    const panels = [...root.querySelectorAll(":scope > [data-ctmd-tab-panel]")];
    if (panels.length < 2) return;
    const tablist = document.createElement("div");
    tablist.setAttribute("role", "tablist");
    if (root.dataset.ctmdTablistClass) tablist.className = root.dataset.ctmdTablistClass;
    const labelledBy = root.dataset.ctmdLabelledby;
    if (labelledBy && document.getElementById(labelledBy)) {
      tablist.setAttribute("aria-labelledby", labelledBy);
    }
    const buttons = panels.map((panel, index) => {
      const label = panel.querySelector("[data-ctmd-tab-label]");
      const tab = document.createElement("button");
      tab.type = "button";
      tab.id = `${panel.id}-tab`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panel.id);
      tab.textContent = label ? label.textContent : `${index + 1}`;
      // The tab shows the day; its heading stays in the panel for the page outline and screen
      // reader navigation (an h2 then h4 would skip a level), hidden visually only.
      const heading = label?.closest("[data-ctmd-tab-heading]");
      if (heading && root.dataset.ctmdHiddenClass)
        heading.classList.add(root.dataset.ctmdHiddenClass);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.tabIndex = 0;
      tablist.append(tab);
      return tab;
    });
    const select = (index, focus) => {
      buttons.forEach((tab, i) => {
        const selected = i === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[i].hidden = !selected;
      });
      if (focus) buttons[index].focus();
    };
    tablist.addEventListener("click", (event) => {
      const index = buttons.indexOf(event.target.closest("[role='tab']"));
      if (index >= 0) select(index, false);
    });
    tablist.addEventListener("keydown", (event) => {
      const current = buttons.indexOf(document.activeElement);
      if (current < 0) return;
      const last = buttons.length - 1;
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
  };

  // ---- Filters ----------------------------------------------------------------------------------
  // data-ctmd-stream on an item is dataset.ctmdStream.
  const key = (facet) => `ctmd${facet.charAt(0).toUpperCase()}${facet.slice(1)}`;
  const filters = (root) => {
    const controls = root.querySelector("[data-ctmd-filter-controls]");
    const status = root.querySelector("[data-ctmd-filter-status]");
    const empty = root.querySelector("[data-ctmd-filter-empty]");
    if (!controls) return;
    const items = [...root.querySelectorAll("[data-ctmd-item]")];
    const wanted = {};
    const apply = () => {
      let shown = 0;
      for (const item of items) {
        const match = Object.entries(wanted).every(
          ([facet, value]) => !value || item.dataset[key(facet)] === value,
        );
        item.hidden = !match;
        if (match) shown++;
      }
      // Days with no matching session are hidden with their heading.
      for (const group of root.querySelectorAll("[data-ctmd-group]")) {
        const any = [...group.querySelectorAll("[data-ctmd-item]")].some((item) => !item.hidden);
        group.dataset.ctmdEmpty = String(!any);
      }
      if (empty) empty.hidden = shown > 0;
      if (status)
        status.textContent = (status.dataset.template || "{count}").replace(
          "{count}",
          String(shown),
        );
    };
    controls.hidden = false;
    for (const button of controls.querySelectorAll("button[data-ctmd-facet]")) {
      button.addEventListener("click", () => {
        const facet = button.dataset.ctmdFacet;
        for (const other of controls.querySelectorAll(`button[data-ctmd-facet='${facet}']`)) {
          other.setAttribute("aria-pressed", String(other === button));
        }
        wanted[facet] = button.dataset.ctmdValue || "";
        apply();
      });
    }
    for (const select of controls.querySelectorAll("select[data-ctmd-facet]")) {
      select.addEventListener("change", () => {
        wanted[select.dataset.ctmdFacet] = select.value;
        apply();
      });
    }
  };

  // ---- Share ------------------------------------------------------------------------------------
  const share = (root) => {
    const url = root.dataset.ctmdUrl || location.href;
    const title = root.dataset.ctmdTitle || document.title;
    const shareButton = root.querySelector("[data-ctmd-share-native]");
    const copyButton = root.querySelector("[data-ctmd-share-copy]");
    const status = root.querySelector("[data-ctmd-share-status]");
    let any = false;
    if (shareButton && typeof navigator.share === "function") {
      shareButton.hidden = false;
      any = true;
      shareButton.addEventListener("click", () => navigator.share({ title, url }).catch(() => {}));
    }
    if (copyButton && navigator.clipboard) {
      copyButton.hidden = false;
      any = true;
      copyButton.addEventListener("click", () =>
        navigator.clipboard.writeText(url).then(
          () => {
            if (status) status.textContent = status.dataset.copied || "";
          },
          () => {},
        ),
      );
    }
    root.hidden = !any;
  };

  // ---- Countdown --------------------------------------------------------------------------------
  const countdown = (root) => {
    const start = root.dataset.ctmdStart;
    const end = root.dataset.ctmdEnd || start;
    if (!start) return;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const day = (iso) => Date.parse(`${iso}T00:00:00Z`);
    const days = Math.round((day(start) - today) / 86_400_000);
    let text = "";
    if (days > 1) text = (root.dataset.ctmdMany || "").replace("{count}", String(days));
    else if (days === 1) text = root.dataset.ctmdOne || "";
    else if (days === 0) text = root.dataset.ctmdToday || "";
    else if (today <= day(end)) text = root.dataset.ctmdRunning || "";
    if (!text) return;
    root.textContent = text;
    root.hidden = false;
  };

  const start = () => {
    document.querySelectorAll("[data-ctmd-tabs]").forEach(tabs);
    document.querySelectorAll("[data-ctmd-filter]").forEach(filters);
    document.querySelectorAll("[data-ctmd-share]").forEach(share);
    document.querySelectorAll("[data-ctmd-countdown]").forEach(countdown);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

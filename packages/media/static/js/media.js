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
 * - Tracking, when jExperience runs on the page and tracks this visitor (its tracker loaded a
 *   profile and is active, so after consent where the site asks for it): standard jCustomer events
 *   only, no event type of our own. A story's video or audio (data-ctmd-track-media) sends `video`
 *   events (action play / ended, the story as target); share and filter buttons send `click`
 *   events (target type share / filter); a search results page (data-ctmd-track-search) sends one
 *   `search` event with its words. Without jExperience, or before consent, nothing is sent.
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
        track("click", {
          id: trackedId(root),
          type: "filter",
          properties: { facet, value: wanted[facet] },
        });
      });
    }
    for (const select of controls.querySelectorAll("select[data-ctmd-facet]")) {
      select.addEventListener("change", () => {
        wanted[select.dataset.ctmdFacet] = select.value;
        apply();
        track("click", {
          id: trackedId(root),
          type: "filter",
          properties: { facet: select.dataset.ctmdFacet, value: select.value },
        });
      });
    }
  };

  // ---- Tracking ---------------------------------------------------------------------------------
  // jExperience's tracker (window.wem) tracks this visitor: the context it loaded has a profile
  // (wem.getLoadedContext(), its public accessor) and tracking is on (wemInitConfig.activateWem:
  // off until consent on a site that asks for it, off again after a refusal).
  const tracking = () =>
    Boolean(
      globalThis.wem?.getLoadedContext?.()?.profileId &&
      globalThis.digitalData?.wemInitConfig?.activateWem === true &&
      typeof globalThis.wem.collectEvent === "function",
    );
  /** The node the event is about: the nearest data-ctmd-track (a story, a feed, an agenda). */
  const trackedId = (element) => element.closest("[data-ctmd-track]")?.dataset.ctmdTrack;
  const track = (eventType, target, properties) => {
    if (!tracking() || !target.id) return;
    const wem = globalThis.wem;
    const event = wem.buildEvent(
      eventType,
      wem.buildTarget(target.id, target.type, target.properties),
      wem.buildSourcePage(),
    );
    if (properties) event.properties = properties;
    wem.collectEvent(event);
  };
  /** Runs `send` once the tracker has loaded its context (now if it already has). */
  const whenTracked = (send) => {
    const wem = globalThis.wem;
    if (!wem) return;
    if (wem.getLoadedContext?.()?.profileId) send();
    else if (typeof wem._registerCallback === "function")
      wem._registerCallback(send, "classic-media tracking", 50);
  };
  const playerEvents = (root) => {
    const id = trackedId(root);
    for (const player of root.querySelectorAll("video, audio")) {
      let played = false;
      player.addEventListener("play", () => {
        if (played) return; // one play per page view, not one per pause and resume
        played = true;
        track("video", { id, type: root.dataset.ctmdTrackMedia, properties: { action: "play" } });
      });
      player.addEventListener("ended", () =>
        track("video", { id, type: root.dataset.ctmdTrackMedia, properties: { action: "ended" } }),
      );
    }
  };
  const searchEvent = (root) => {
    const keyword = root.dataset.ctmdTrackSearch;
    if (!keyword) return;
    whenTracked(() =>
      track(
        "search",
        { id: trackedId(root), type: "search" },
        {
          keyword,
          language: (document.documentElement.lang || "").slice(0, 5),
          origin: "ctmd:searchResults",
        },
      ),
    );
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
      shareButton.addEventListener("click", () =>
        navigator
          .share({ title, url })
          .then(() =>
            track("click", {
              id: trackedId(root),
              type: "share",
              properties: { method: "native" },
            }),
          )
          .catch(() => {}),
      );
    }
    if (copyButton && navigator.clipboard) {
      copyButton.hidden = false;
      any = true;
      copyButton.addEventListener("click", () =>
        navigator.clipboard.writeText(url).then(
          () => {
            if (status) status.textContent = status.dataset.copied || "";
            track("click", { id: trackedId(root), type: "share", properties: { method: "copy" } });
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
    document.querySelectorAll("[data-ctmd-track-media]").forEach(playerEvents);
    document.querySelectorAll("[data-ctmd-track-search]").forEach(searchEvent);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

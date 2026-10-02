/*
 * Progressive enhancement of the classic-templates accordion (Accordion view). The entries are
 * native <details>/<summary> and open and close without this file; with it:
 * - an "Expand all / Collapse all" button shows (hidden until data-ctpl-ready is set) and opens
 *   or closes every entry; its label follows the entries the visitor opened or closed;
 * - a link to an entry (page.html#acc-<name>, or to anything inside one) opens it, on load and
 *   whenever the address changes, and scrolls it into view.
 * Labels come from the server (data-expand-label, data-collapse-label), in the page's language.
 * It only relies on data-* attributes, never on (hashed) CSS module class names.
 */
(function () {
  document.documentElement.classList.add("ctpl-js");

  const entriesOf = (root) => [...root.querySelectorAll("details[data-ctpl-accordion-item]")];

  const refresh = (root, button) => {
    const allOpen = entriesOf(root).every((entry) => entry.open);
    button.textContent = root.dataset[allOpen ? "collapseLabel" : "expandLabel"];
  };

  const init = (root) => {
    if (root.hasAttribute("data-ctpl-ready")) return;
    const button = root.querySelector("[data-ctpl-accordion-all]");
    if (button) {
      button.addEventListener("click", () => {
        const open = !entriesOf(root).every((entry) => entry.open);
        for (const entry of entriesOf(root)) entry.open = open;
        refresh(root, button);
      });
      // "toggle" does not bubble: listen in the capture phase for every entry at once.
      root.addEventListener("toggle", () => refresh(root, button), true);
      refresh(root, button);
    }
    root.setAttribute("data-ctpl-ready", "");
  };

  /** The id the address points at ("" for none, or for a malformed escape). */
  const hashId = () => {
    try {
      return decodeURIComponent(globalThis.location.hash.slice(1));
    } catch {
      return "";
    }
  };

  /** Opens the entry the address points at (the entry itself or something inside it). */
  const openTarget = () => {
    const id = hashId();
    if (!id) return;
    const target = document.querySelector(`#${CSS.escape(id)}`);
    const entry = target ? target.closest("details[data-ctpl-accordion-item]") : null;
    if (!entry) return;
    entry.open = true;
    target.scrollIntoView({ block: "start" });
  };

  const start = () => {
    document.querySelectorAll("[data-ctpl-accordion]").forEach(init);
    openTarget();
  };

  globalThis.addEventListener("hashchange", openTarget);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

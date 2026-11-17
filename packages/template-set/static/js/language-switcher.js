/*
 * Progressive enhancement of the classic-templates language switcher (LanguageSwitcher view).
 * The drop-down is a native details/summary and opens without this file; with it, an open list
 * closes on Escape (focus back on its button), on a click outside it, and when keyboard focus
 * leaves it, so it never covers what the visitor reaches next (WCAG 1.4.13).
 * It only relies on a data-* attribute, never on (hashed) CSS module class names.
 */
(function () {
  function init(menu) {
    if (menu.hasAttribute("data-ctpl-ready")) return;
    menu.setAttribute("data-ctpl-ready", "");
    var toggle = menu.querySelector("summary");

    menu.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !menu.open) return;
      menu.open = false;
      if (toggle) toggle.focus();
    });
    menu.addEventListener("focusout", function (event) {
      if (event.relatedTarget && menu.contains(event.relatedTarget)) return;
      menu.open = false;
    });
    document.addEventListener("click", function (event) {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  }

  function start() {
    document.querySelectorAll("[data-ctpl-lang-menu]").forEach(init);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

/*
 * Progressive enhancement of the classic-templates main navigation (MainNavigation view).
 * The menu works without this file; with it:
 * - html gets the "ctpl-js" class, which turns on the collapsible small-screen menu;
 * - the menu button and each submenu button toggle aria-expanded (CSS reads that state);
 * - Escape closes the open submenu (or dismisses a hover-opened one) and returns focus to its
 *   button; a click outside, or focus leaving the menu item, closes it (WCAG 1.4.13);
 * - the link to the current page gets aria-current="page", and its menu ancestors data-active.
 * It only relies on data-* attributes and ARIA states, never on (hashed) CSS module class names.
 */
(function () {
  document.documentElement.classList.add("ctpl-js");

  function closeAll(nav, except) {
    nav.querySelectorAll('[data-ctpl-subnav-toggle][aria-expanded="true"]').forEach(function (b) {
      if (b !== except) b.setAttribute("aria-expanded", "false");
    });
  }

  function markCurrent(nav) {
    var here = window.location.pathname.replace(/\/$/, "");
    nav.querySelectorAll("a[href]").forEach(function (a) {
      var path = new URL(a.getAttribute("href"), window.location.href).pathname.replace(/\/$/, "");
      if (path !== here) return;
      a.setAttribute("aria-current", "page");
      var item = a.closest("[data-ctpl-nav-item]");
      while (item) {
        item.setAttribute("data-active", "");
        item = item.parentElement ? item.parentElement.closest("[data-ctpl-nav-item]") : null;
      }
    });
  }

  function init(nav) {
    if (nav.hasAttribute("data-ctpl-ready")) return;
    nav.setAttribute("data-ctpl-ready", "");
    var toggle = nav.querySelector("[data-ctpl-nav-toggle]");
    var list = nav.querySelector("[data-ctpl-nav-list]");

    if (toggle && list) {
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        list.toggleAttribute("data-open", open);
      });
    }

    nav.querySelectorAll("[data-ctpl-subnav-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") !== "true";
        closeAll(nav, button);
        button.setAttribute("aria-expanded", String(open));
      });
    });

    nav.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var item = event.target.closest ? event.target.closest("[data-ctpl-nav-item]") : null;
      var top = item;
      while (top && top.parentElement && top.parentElement.closest("[data-ctpl-nav-item]")) {
        top = top.parentElement.closest("[data-ctpl-nav-item]");
      }
      var hovered = nav.querySelector("[data-ctpl-nav-item]:hover");
      if (hovered) hovered.setAttribute("data-ctpl-dismissed", "");
      var open = nav.querySelector('[data-ctpl-subnav-toggle][aria-expanded="true"]');
      if (open) {
        open.setAttribute("aria-expanded", "false");
        open.focus();
      } else if (top) {
        var button = top.querySelector("[data-ctpl-subnav-toggle]");
        if (button) button.focus();
      }
    });

    nav.querySelectorAll("[data-ctpl-nav-list] > [data-ctpl-nav-item]").forEach(function (item) {
      item.addEventListener("mouseleave", function () {
        item.removeAttribute("data-ctpl-dismissed");
      });
      item.addEventListener("focusout", function (event) {
        if (event.relatedTarget && item.contains(event.relatedTarget)) return;
        var button = item.querySelector("[data-ctpl-subnav-toggle]");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) closeAll(nav);
    });

    markCurrent(nav);
  }

  function start() {
    document.querySelectorAll("[data-ctpl-nav]").forEach(init);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

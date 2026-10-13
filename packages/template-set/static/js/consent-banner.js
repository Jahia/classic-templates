/*
 * The classic-templates consent banner (ConsentBanner view). Never loaded in edit mode. With it:
 * - the banner shows while the visitor has not chosen; Accept / Refuse store the choice in the
 *   `ctpl-consent` cookie (path /, so every site of the host shares it) for the banner's
 *   data-ctpl-consent-days, then hide it;
 * - with jExperience on the page (window.wem), its tracking follows the choice: wem.enableWem()
 *   after Accept, wem.disableWem() after Refuse, and again on later pages when its own switch
 *   (wemInitConfig.activateWem) no longer matches the stored choice;
 * - every choice, and the stored one on each page, is announced with a `ctpl:consent` event on
 *   document (detail: { status: "granted" | "denied" }) and data-ctpl-consent on <html>, for any
 *   other script that must wait for consent;
 * - the "privacy settings" button is cloned from the <template> after the footer and opens the
 *   banner again, focus on its first choice; after a choice made from the banner, focus moves to
 *   that button;
 * - while the banner shows, the end of the page is padded by its height, so it never hides the
 *   footer or a focused element (scroll padding).
 * Without JavaScript nothing of this shows. Relies on data-* attributes only, never on (hashed)
 * CSS module class names.
 */
(function () {
  "use strict";

  var COOKIE = "ctpl-consent";
  var DAY = 86400;

  function stored() {
    var match = document.cookie.match(/(?:^|;\s*)ctpl-consent=(granted|denied)(?:;|$)/);
    return match ? match[1] : null;
  }

  function store(status, days) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie =
      COOKIE + "=" + status + "; Max-Age=" + days * DAY + "; Path=/; SameSite=Lax" + secure;
  }

  /** Aligns jExperience's per-visitor switch with the choice, when jExperience is on the page. */
  function syncTracker(status) {
    var wem = window.wem;
    if (!wem) return;
    var config = window.digitalData && window.digitalData.wemInitConfig;
    var active = config ? config.activateWem : undefined;
    if (status === "granted" && active !== true && typeof wem.enableWem === "function") {
      wem.enableWem();
    } else if (status === "denied" && active !== false && typeof wem.disableWem === "function") {
      wem.disableWem();
    }
  }

  function announce(status) {
    document.documentElement.dataset.ctplConsent = status;
    document.dispatchEvent(new CustomEvent("ctpl:consent", { detail: { status: status } }));
  }

  function pad(banner) {
    var height = banner.hidden ? "" : banner.offsetHeight + "px";
    document.documentElement.style.scrollPaddingBottom = height;
    document.body.style.paddingBottom = height;
  }

  function init(root) {
    if (root.dataset.ctplReady !== undefined) return;
    root.dataset.ctplReady = "";
    var banner = root.querySelector("[data-ctpl-consent-banner]");
    var template = root.querySelector("template[data-ctpl-consent-settings]");
    if (!banner || !template) return;
    var days = Number(root.dataset.ctplConsentDays) || 180;
    var settingsRow = template.content.firstElementChild.cloneNode(true);
    var settings = settingsRow.querySelector("button");
    root.append(settingsRow);

    function show(focus) {
      banner.hidden = false;
      pad(banner);
      if (focus) {
        var first = banner.querySelector("[data-ctpl-consent-choice]");
        if (first) first.focus();
      }
    }

    function hide() {
      var hadFocus = banner.contains(document.activeElement);
      banner.hidden = true;
      pad(banner);
      if (hadFocus && settings) settings.focus();
    }

    banner.querySelectorAll("[data-ctpl-consent-choice]").forEach(function (button) {
      button.addEventListener("click", function () {
        var status = button.dataset.ctplConsentChoice;
        store(status, days);
        syncTracker(status);
        announce(status);
        hide();
      });
    });
    if (settings) {
      settings.addEventListener("click", function () {
        show(true);
      });
    }
    window.addEventListener("resize", function () {
      if (!banner.hidden) pad(banner);
    });

    var status = stored();
    if (status) {
      syncTracker(status);
      announce(status);
    } else {
      show(false);
    }
  }

  function start() {
    document.querySelectorAll("[data-ctpl-consent]").forEach(function (root) {
      init(root);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

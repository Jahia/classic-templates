/*
 * Progressive enhancement of the classic-templates notice bar (NoticeBar view). Loaded only for a
 * bar the editor made dismissible, and never in edit mode (the view renders neither this script
 * nor the attributes it reads there). With it:
 * - the close button is cloned from the bar's <template>, so without JavaScript no button shows
 *   that could not work;
 * - closing hides the bar for the rest of the visitor's browser session (sessionStorage) and, when
 *   focus was in the bar, moves it to the next focusable element after the bar (else to <main>);
 * - a hidden bar shows again as soon as its items change (data-ctpl-notice-signature), so a new
 *   notice is never missed.
 * Storage can be unavailable (private browsing, blocked site data): closing then hides the bar
 * for this page view only. Relies on data-* attributes only, never on (hashed) CSS module class
 * names.
 */
(function () {
  "use strict";

  var PREFIX = "ctpl-notice:";
  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function read(key) {
    try {
      return window.sessionStorage.getItem(PREFIX + key);
    } catch {
      return null; // storage blocked: the bar shows
    }
  }

  function write(key, value) {
    try {
      window.sessionStorage.setItem(PREFIX + key, value);
    } catch {
      // storage blocked: hidden for this page view only
    }
  }

  /** Focuses the first visible focusable element after `bar` in the document, else <main>. */
  function focusAfter(bar) {
    for (var el of document.querySelectorAll(FOCUSABLE)) {
      var follows = (bar.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      if (follows && !bar.contains(el) && el.getClientRects().length > 0) {
        el.focus();
        return;
      }
    }
    var main = document.querySelector("#main-content");
    if (main) main.focus();
  }

  function init(bar) {
    if (bar.dataset.ctplReady !== undefined) return;
    bar.dataset.ctplReady = "";
    var key = bar.dataset.ctplNotice;
    var signature = bar.dataset.ctplNoticeSignature || "";
    if (!key) return;
    if (read(key) === signature) {
      bar.hidden = true;
      return;
    }
    var template = bar.querySelector("template[data-ctpl-notice-dismiss]");
    var slot = bar.querySelector("[data-ctpl-notice-actions]");
    var source = template && template.content.firstElementChild;
    if (!source || !slot) return;
    var button = source.cloneNode(true);
    button.addEventListener("click", function () {
      var hadFocus = bar.contains(document.activeElement);
      write(key, signature);
      bar.hidden = true;
      if (hadFocus) focusAfter(bar);
    });
    slot.append(button);
  }

  function start() {
    document.querySelectorAll("[data-ctpl-notice]").forEach(function (bar) {
      init(bar);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

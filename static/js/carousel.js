/*
 * Progressive enhancement of the classic-templates hero carousel (HeroCarousel view). The view
 * only loads it on the live site for a carousel of two slides or more; without it (and in edit
 * mode) the slides are stacked. With it:
 * - html gets the "ctpl-js" class as soon as the script runs (in the page head), so the CSS lays
 *   the carousel out for one slide at a time from the first paint;
 * - one slide shows; the others are hidden from everyone (visibility, inert, aria-hidden);
 * - previous / next buttons wrap around; one button per slide carries aria-current on the current
 *   one, and the arrow keys, Home and End move between those buttons;
 * - a slide changed by the visitor is announced through a polite live region; changes made by
 *   autoplay are never announced (the region is aria-live="off" while it plays);
 * - autoplay runs only when the editor switched it on (data-interval) and the visitor does not
 *   ask for reduced motion: one pass through the slides, back on the first, then it stops. Hover,
 *   keyboard focus inside the carousel (except on the Pause / Play button) and a hidden tab
 *   suspend it; any use of the slide buttons stops it; the Pause / Play button toggles it.
 * It only relies on data-* attributes and ARIA states, never on (hashed) CSS module class names.
 */
(function () {
  "use strict";

  /** `i` brought back into 0..count-1: the slide before the first is the last, and so on. */
  function wrapIndex(i, count) {
    return ((i % count) + count) % count;
  }

  /** The slide button a key moves to from button `current` of `count`, or -1 for other keys. */
  function keyTarget(key, current, count) {
    if (key === "ArrowRight") return wrapIndex(current + 1, count);
    if (key === "ArrowLeft") return wrapIndex(current - 1, count);
    if (key === "Home") return 0;
    if (key === "End") return count - 1;
    return -1;
  }

  /** Milliseconds per slide from data-interval (seconds): never under 5 seconds. */
  function delayOf(value) {
    var seconds = Number(value);
    return Math.max(5, Number.isFinite(seconds) && seconds > 0 ? seconds : 7) * 1000;
  }

  // Unit tests (vitest) load this file in a sandbox that has no document.
  if (typeof module === "object" && module && module.exports) {
    module.exports = { wrapIndex: wrapIndex, keyTarget: keyTarget, delayOf: delayOf };
  }
  if (typeof document === "undefined") return;

  document.documentElement.classList.add("ctpl-js");

  var reducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function init(root) {
    if (root.dataset.ctplReady !== undefined) return;
    root.dataset.ctplReady = "";
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-ctpl-slide]"));
    var count = slides.length;
    var controls = root.querySelector("[data-ctpl-carousel-controls]");
    if (count < 2 || !controls) return;
    var pickers = Array.prototype.slice.call(
      controls.querySelectorAll("[data-ctpl-carousel-goto]"),
    );
    var prev = controls.querySelector("[data-ctpl-carousel-prev]");
    var next = controls.querySelector("[data-ctpl-carousel-next]");
    var toggle = controls.querySelector("[data-ctpl-carousel-toggle]");
    var toggleLabel = toggle && toggle.querySelector("[data-ctpl-carousel-toggle-label]");
    var status = root.querySelector("[data-ctpl-carousel-status]");
    var delay = delayOf(root.dataset.interval);
    var index = 0;
    var playing = false;
    var steps = 0;
    var timer = null;
    var hovered = false;
    var focused = false;

    /** What the live region says for slide `i`: "Slide 2 of 4: <its heading>". */
    function describe(i) {
      var label = pickers[i] ? pickers[i].textContent.trim() : "";
      var heading = slides[i].querySelector("h2, h3, h4");
      var title = heading ? heading.textContent.trim() : "";
      return title ? label + ": " + title : label;
    }

    function announce(text) {
      if (!status) return;
      status.textContent = "";
      // A tick later, so assistive technologies see a change even for the same text.
      window.setTimeout(function () {
        status.textContent = text;
      }, 50);
    }

    function show(target, byVisitor) {
      index = wrapIndex(target, count);
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.toggleAttribute("data-active", active);
        slide.inert = !active;
        if (active) slide.removeAttribute("aria-hidden");
        else slide.setAttribute("aria-hidden", "true");
      });
      pickers.forEach(function (button, i) {
        if (i === index) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
      if (byVisitor) announce(describe(index));
    }

    function schedule() {
      window.clearTimeout(timer);
      timer = null;
      if (!playing || hovered || focused || document.hidden) return;
      timer = window.setTimeout(function () {
        steps++;
        show(index + 1, false);
        if (steps >= count) setPlaying(false);
        else schedule();
      }, delay);
    }

    function setPlaying(on) {
      playing = on;
      steps = 0;
      if (toggle) {
        toggle.dataset.playing = String(on);
        if (toggleLabel) {
          toggleLabel.textContent = on ? toggle.dataset.labelPause : toggle.dataset.labelPlay;
        }
      }
      if (status) status.setAttribute("aria-live", on ? "off" : "polite");
      schedule();
    }

    /** A slide picked by the visitor: autoplay stops for good, the change is announced. */
    function go(target) {
      if (playing) setPlaying(false);
      show(target, true);
    }

    show(0, false);
    controls.hidden = false;

    if (prev) {
      prev.addEventListener("click", function () {
        go(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        go(index + 1);
      });
    }
    pickers.forEach(function (button, i) {
      button.addEventListener("click", function () {
        go(i);
      });
      button.addEventListener("keydown", function (event) {
        var target = keyTarget(event.key, i, pickers.length);
        if (target < 0) return;
        event.preventDefault();
        pickers[target].focus();
        go(target);
      });
    });

    if (toggle) {
      toggle.addEventListener("click", function () {
        setPlaying(!playing);
      });
      root.addEventListener("mouseenter", function () {
        hovered = true;
        schedule();
      });
      root.addEventListener("mouseleave", function () {
        hovered = false;
        schedule();
      });
      root.addEventListener("focusin", function (event) {
        // Focus on the Pause / Play button itself does not suspend: it is the rotation's control.
        focused = event.target !== toggle;
        schedule();
      });
      root.addEventListener("focusout", function (event) {
        if (event.relatedTarget && root.contains(event.relatedTarget)) return;
        focused = false;
        schedule();
      });
      document.addEventListener("visibilitychange", schedule);
      setPlaying(!reducedMotion);
    }
  }

  function start() {
    document.querySelectorAll("[data-ctpl-carousel]").forEach(function (root) {
      init(root);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

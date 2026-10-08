#!/usr/bin/env node
/**
 * Checks WCAG 2.1 contrast of the colour roles in src/templates/tokens.css, for every theme and
 * both colour schemes. Components only ever read these roles, so checking them here covers every
 * component at once.
 *
 * The token file is resolved the way a browser would: the :root block, then the theme block on
 * top, var() substituted, light-dark() split by scheme, and colours with alpha composited over the
 * surface they sit on.
 *
 * Usage: node scripts/check-contrast.mjs   (exit 1 on any failing pair)
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/templates/tokens.css", import.meta.url), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

/** Custom properties declared in every `:root...{}` block whose selector matches `selector`. */
const blockVars = (selector) => {
  const vars = {};
  for (const [, sel, body] of css.matchAll(/(:root[^{]*)\{([^}]*)\}/g)) {
    if (sel.trim() !== selector) continue;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      vars[name] = value.trim();
    }
  }
  return vars;
};

/** Splits `a, b` at top-level commas (ignoring those inside parentheses). */
const splitTop = (s) => {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") depth++;
    else if (s[i] === ")") depth--;
    else if (s[i] === "," && depth === 0) {
      parts.push(s.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(s.slice(start).trim());
  return parts;
};

const resolve = (value, vars, scheme, depth = 0) => {
  if (depth > 20) throw new Error(`var() cycle near ${value}`);
  let v = value.trim();
  const ld = v.match(/^light-dark\(([\s\S]*)\)$/);
  if (ld) {
    const [light, dark] = splitTop(ld[1]);
    return resolve(scheme === "light" ? light : dark, vars, scheme, depth + 1);
  }
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) {
    if (!(ref[1] in vars)) throw new Error(`undefined token ${ref[1]}`);
    return resolve(vars[ref[1]], vars, scheme, depth + 1);
  }
  return v;
};

const parseHex = (hex) => {
  const m = hex.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (!m) throw new Error(`not a #rrggbb[aa] colour: ${hex}`);
  const n = parseInt(m[1], 16);
  return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
};

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

const luminance = ({ r, g, b }) => {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground role, background role, minimum ratio, note]
const PAIRS = [
  ["text", "surface-page", 4.5],
  ["text", "surface-raised", 4.5],
  ["text", "surface-sunken", 4.5],
  ["text-muted", "surface-page", 4.5],
  ["text-muted", "surface-raised", 4.5],
  ["text-muted", "surface-sunken", 4.5],
  ["text-inverse", "surface-inverse", 4.5],
  ["accent", "surface-page", 4.5, "links and outlined buttons"],
  ["accent", "surface-sunken", 4.5],
  ["accent", "accent-subtle", 4.5, "badges, links on accent-tint sections"],
  ["text", "accent-subtle", 4.5, "text on accent-tint sections"],
  ["text-muted", "accent-subtle", 4.5],
  ["text-on-accent", "accent", 4.5, "buttons on any section"],
  ["link-hover", "surface-page", 4.5],
  ["link-hover", "accent-subtle", 4.5, "hovered links on the notice bar"],
  ["text-on-accent", "accent", 4.5, "filled buttons"],
  ["text-on-accent", "accent-hover", 4.5],
  ["success", "success-surface", 4.5],
  ["warning", "warning-surface", 4.5],
  ["danger", "danger-surface", 4.5],
  ["success", "surface-page", 4.5],
  ["warning", "surface-page", 4.5],
  ["danger", "surface-page", 4.5],
  ["highlight", "surface-page", 4.5, "prices and key figures"],
  ["highlight", "surface-raised", 4.5],
  ["highlight", "surface-sunken", 4.5],
  ["highlight", "accent-subtle", 4.5],
  ["text-on-highlight", "highlight", 4.5, "filled emphasis (a price tag)"],
  ["text-on-action", "action", 4.5, "filled call-to-action button"],
  ["text-on-action", "action-hover", 4.5, "hovered call-to-action button"],
  ["action", "surface-page", 4.5, "outlined call-to-action button"],
  ["action", "surface-raised", 4.5],
  ["action", "surface-sunken", 4.5],
  ["action", "accent-subtle", 4.5, "outlined button on accent-tint sections"],
  ["action-hover", "accent-subtle", 4.5, "hovered outlined button"],
  ["border-strong", "surface-page", 3, "form field borders (non-text)"],
  ["focus", "surface-page", 3, "focus ring (non-text)"],
  ["focus", "accent-subtle", 3, "focus ring on accent-tint sections and the notice bar"],
  ["text-on-overlay", "overlay", 4.5, "hero text, overlay composited over a white photo"],
];

const base = blockVars(":root");
const themes = ["default"];
for (const [, name] of css.matchAll(/:root\[data-ctpl-theme="([\w-]+)"\]/g)) {
  if (!themes.includes(name)) themes.push(name);
}

const white = parseHex("#ffffff");
let failures = 0;
for (const theme of themes) {
  const vars =
    theme === "default" ? base : { ...base, ...blockVars(`:root[data-ctpl-theme="${theme}"]`) };
  for (const scheme of ["light", "dark"]) {
    const color = (role) => parseHex(resolve(`var(--ctpl-color-${role})`, vars, scheme));
    const rows = [];
    for (const [fgRole, bgRole, min, note] of PAIRS) {
      let bg = color(bgRole);
      // A translucent background (the hero overlay) is judged over the worst case: a white photo.
      if (bg.a < 1) bg = over(bg, white);
      const fg = over(color(fgRole), bg);
      const r = ratio(fg, bg);
      const ok = r >= min;
      if (!ok) failures++;
      rows.push(
        `  ${ok ? "ok  " : "FAIL"} ${r.toFixed(2).padStart(5)} >= ${min}  ${fgRole} on ${bgRole}${note ? `  (${note})` : ""}`,
      );
    }
    console.log(`${theme} / ${scheme}`);
    console.log(rows.join("\n"));
  }
}

console.log(failures ? `\n${failures} pair(s) below WCAG 2.1 AA` : "\nAll pairs meet WCAG 2.1 AA");
process.exit(failures ? 1 : 0);

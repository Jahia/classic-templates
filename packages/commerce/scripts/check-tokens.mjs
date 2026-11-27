#!/usr/bin/env node
/**
 * Fails when a stylesheet of the module contains a literal colour, or reads a tier-1 primitive
 * token of classic-templates (--ctpl-slate-900, --ctpl-white, --ctpl-stack-serif...), so that the
 * module follows every classic-templates theme without an edit. Views read semantic roles only:
 * var(--ctpl-color-...), var(--ctpl-font-...), var(--ctpl-space-...).
 *
 * Usage: node scripts/check-tokens.mjs   (exit 1 on any literal)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../src", import.meta.url).pathname;
const LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/gi;
const PRIMITIVE =
  /var\(--ctpl-(?:(?:slate|navy|teal|clay|green|amber|red|sky|ember)-\d+|white|black|stack-[a-z]+)\b/g;

const cssFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return cssFiles(join(dir, entry.name));
    return entry.name.endsWith(".css") ? [join(dir, entry.name)] : [];
  });

let found = 0;
for (const file of cssFiles(root)) {
  const lines = readFileSync(file, "utf8").replaceAll(/\/\*[\s\S]*?\*\//g, (comment) =>
    comment.replaceAll(/[^\n]/g, " "),
  );
  lines.split("\n").forEach((line, i) => {
    for (const match of line.matchAll(LITERAL)) {
      found++;
      console.log(`${relative(process.cwd(), file)}:${i + 1}  literal colour "${match[0]}"`);
    }
    for (const match of line.matchAll(PRIMITIVE)) {
      found++;
      console.log(`${relative(process.cwd(), file)}:${i + 1}  primitive token "${match[0]})"`);
    }
  });
}

console.log(
  found
    ? `\n${found} problem(s): use a semantic --ctpl-color-* / --ctpl-font-* token`
    : "No literal colours or primitive tokens in the module's stylesheets",
);
process.exit(found ? 1 : 0);

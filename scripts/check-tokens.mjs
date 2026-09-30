#!/usr/bin/env node
/**
 * Fails when a stylesheet other than src/templates/tokens.css contains a literal colour, so that
 * re-theming never needs a component edit. Components read semantic tokens: var(--ctpl-color-...).
 *
 * Usage: node scripts/check-tokens.mjs   (exit 1 on any literal)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("../src", import.meta.url).pathname;
const TOKENS = join(root, "templates", "tokens.css");
const LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/gi;

const cssFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? cssFiles(join(dir, e.name))
      : e.name.endsWith(".css")
        ? [join(dir, e.name)]
        : [],
  );

let found = 0;
for (const file of cssFiles(root)) {
  if (file === TOKENS) continue;
  const lines = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, (c) =>
    c.replace(/[^\n]/g, " "),
  );
  lines.split("\n").forEach((line, i) => {
    for (const m of line.matchAll(LITERAL)) {
      found++;
      console.log(`${relative(process.cwd(), file)}:${i + 1}  literal colour "${m[0]}"`);
    }
  });
}

console.log(
  found
    ? `\n${found} literal colour(s): use a --ctpl-color-* token`
    : "No literal colours outside tokens.css",
);
process.exit(found ? 1 : 0);

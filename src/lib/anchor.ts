/**
 * An HTML id built from a JCR node name, for deep links (`page.html#<id>`): lower case letters,
 * digits and hyphens only, starting with a letter, at most 64 characters, prefixed so it never
 * takes one of the page's own ids. Jahia names nodes after their title ("baggage-allowance"), so
 * the anchor reads like the item.
 */
export const anchorOf = (prefix: string, name: string): string => {
  let slug = "";
  let gap = false;
  for (const ch of name.normalize("NFKD").toLowerCase()) {
    const keep = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    if (keep) {
      if (gap && slug) slug += "-";
      slug += ch;
      gap = false;
    } else if (ch < "̀" || ch > "ͯ") {
      gap = true; // any other character separates words; combining accents are dropped
    }
  }
  return `${prefix}${slug.slice(0, 64) || "item"}`;
};

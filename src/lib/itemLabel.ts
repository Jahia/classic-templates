/**
 * What a list shows as the small label of each item (the "NEWS" / "ARTICLE" line of cards and
 * compact rows, or the label before each notice of a notice bar):
 * - "type": the item's content type ("News", "Article"), the long-standing behaviour;
 * - "category": the title of the item's first category (Jahia's own j:defaultCategory), in the
 *   page's language, or the type when the item has no category with a title;
 * - "none": no label (the notice bar's default).
 */
export type ItemLabelMode = "none" | "type" | "category";

const MODES = new Set<string>(["none", "type", "category"]);

/** The mode a list asks for, `fallback` for a missing or unknown value. */
export const itemLabelMode = (value: unknown, fallback: ItemLabelMode = "type"): ItemLabelMode => {
  const mode = typeof value === "string" ? value : "";
  return MODES.has(mode) ? (mode as ItemLabelMode) : fallback;
};

/**
 * The label an item shows: nothing in "none" mode, the first non-blank category title in
 * "category" mode, the type label otherwise (and when the item has no titled category).
 */
export const chooseItemLabel = (
  mode: ItemLabelMode,
  typeLabel: string | undefined,
  categoryTitles: readonly string[],
): string | undefined => {
  if (mode === "none") return undefined;
  if (mode === "category") {
    const first = categoryTitles.map((title) => title.trim()).find(Boolean);
    if (first) return first;
  }
  return typeLabel;
};

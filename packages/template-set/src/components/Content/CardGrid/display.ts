/** How a card grid draws its cards (ctpl:cardGrid "display"). */
export type Display = "cards" | "iconTiles" | "logos";

const DISPLAYS = new Set<string>(["cards", "iconTiles", "logos"]);

/** The grid's display, "cards" for a missing or unknown value (grids created before the choice). */
export const displayOf = (value?: string): Display =>
  value && DISPLAYS.has(value) ? (value as Display) : "cards";

/** The view the grid renders its children with: the display's name, the default view for cards. */
export const childView = (display: Display): string | undefined =>
  display === "cards" ? undefined : display;

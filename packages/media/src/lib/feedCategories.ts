/**
 * Which sentence the story feed's edit-mode summary uses for its categories, with the names it
 * fills in: the categories picked on the feed (filterCategories) and, with "this page's
 * categories" (pageCategories), the page's own. A picked category and the page's are combined
 * with "or", as the query combines them. Undefined when the feed filters on no category.
 */
export type FeedCategoriesSentence =
  | { key: "feed.categories"; categories: string }
  | { key: "feed.pageCategories"; categories: string }
  | { key: "feed.bothCategories"; categories: string; page: string }
  | { key: "feed.pageNoCategory" };

export const feedCategoriesSentence = (
  picked: readonly string[],
  page: readonly string[] | undefined,
): FeedCategoriesSentence | undefined => {
  const pickedNames = picked.join(", ");
  if (page === undefined) {
    return picked.length > 0 ? { key: "feed.categories", categories: pickedNames } : undefined;
  }
  if (page.length === 0) return { key: "feed.pageNoCategory" };
  const pageNames = page.join(", ");
  return picked.length > 0
    ? { key: "feed.bothCategories", categories: pickedNames, page: pageNames }
    : { key: "feed.pageCategories", categories: pageNames };
};

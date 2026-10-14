import { useServerContext } from "@jahia/javascript-modules-library";
import { useT } from "../../../lib/i18n.js";
import { categoryTitlesOf } from "../../../lib/media.js";
import { tagSearch, tagsOf } from "../../../lib/tags.js";
import classes from "./taxonomy.module.css";

/**
 * The item's topics (its categories) and tags, each under its own h2, at the end of a story's or a
 * session's page. Each tag links to the site's search results for it when the classic-templates
 * site header names a Search page, and is plain text otherwise. Renders nothing when the item has
 * neither.
 */
export const Taxonomy = () => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const id = currentNode.getIdentifier();
  const topics = categoryTitlesOf(currentNode, renderContext);
  const tags = tagsOf(currentNode);
  const searchFor = tags.length > 0 ? tagSearch(currentNode, renderContext) : undefined;
  return (
    <>
      {topics.length > 0 && (
        <section className={classes.block} aria-labelledby={`ctmd-topics-${id}`}>
          <h2 id={`ctmd-topics-${id}`} className={classes.title}>
            {t("story.topics")}
          </h2>
          <ul className={classes.list}>
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
      )}
      {tags.length > 0 && (
        <section
          className={classes.block}
          aria-labelledby={`ctmd-tags-${id}`}
          data-testid="ctmd-item-tags"
        >
          <h2 id={`ctmd-tags-${id}`} className={classes.title}>
            {t("item.tags")}
          </h2>
          <ul className={classes.list}>
            {tags.map((tag) => (
              <li key={tag}>
                {searchFor ? (
                  <a className={classes.link} href={searchFor(tag)}>
                    {tag}
                  </a>
                ) : (
                  tag
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

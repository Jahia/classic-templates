import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { filterBriefs, listLimit, sortBriefs } from "../../../lib/briefs.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { listStart, pageOf, runQuery, startLabel } from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import cards from "../shared/cards.module.css";
import { ListSection } from "../shared/parts.js";
import type { Props } from "./types.js";

/** Briefs a list shows, from 1 to 100 (the CND range), 20 by default. */
const itemCount = (value: number | undefined) => listLimit(value, 20, 100);

/**
 * The brief list: the briefs under its folder (or the whole site) that the visitor may read, the
 * open ones only unless "Show closed briefs" is on, the nearest deadline first, as cards (the
 * brief's own card view).
 *
 * The query runs with the request's own JCR session (`jcrSession`), so a brief the visitor may not
 * read is never returned: two suppliers can get two different lists. For that reason the view is
 * cached per user (`cache.perUser`): by default Jahia keys a fragment on the visitor's roles on
 * the list's own path, which does not see the ACLs of the briefs found below it. The list still
 * depends on everything under its folder (runQuery), so publishing, editing or deleting a brief
 * refreshes it.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:briefList",
    displayName: "Brief list",
    properties: { "cache.perUser": "true" },
  },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const language = languageTag(currentResource.getLocale());
    const { site } = pageOf(renderContext, currentNode);
    const { start, startMissing } = listStart(currentNode, props.folder, site, "folder");
    const max = itemCount(props.maxItems);
    const showClosed = props.showClosed === true;
    const rows = startMissing
      ? []
      : runQuery({
          session: jcrSession,
          renderContext,
          type: "ctmd:brief",
          start,
          order: "deadline",
          statuses: showClosed ? undefined : ["open"],
          locale: currentResource.getLocale(),
        }).map((node) => ({
          node,
          deadline: readString(node, "deadline"),
          status: readString(node, "briefStatus"),
          title: readString(node, "jcr:title"),
        }));
    const items = sortBriefs(filterBriefs(rows, showClosed), language).slice(0, max);
    return (
      <ListSection
        props={{ ...props, noResultText: props.emptyText }}
        testId="ctmd-brief-list"
        count={items.length}
        startMissing={startMissing}
        summary={t("briefList.summary", {
          start: startLabel(start),
          scope: showClosed ? t("briefList.scopeAll") : t("briefList.scopeOpen"),
          max,
          ...RAW,
        })}
      >
        {(itemLevel) => (
          <ul className={cards.grid}>
            {items.map(({ node }) => (
              <li key={node.getIdentifier()}>
                <Render node={node} view="card" parameters={{ headingLevel: String(itemLevel) }} />
              </li>
            ))}
          </ul>
        )}
      </ListSection>
    );
  },
);

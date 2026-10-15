import { Render, jahiaComponent } from "@jahia/javascript-modules-library";
import { listLimit, sortSubmissions } from "../../../lib/briefs.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { listStart, pageOf, runQuery, startLabel } from "../../../lib/media.js";
import { readString } from "../../../lib/props.js";
import cards from "../shared/cards.module.css";
import { ListSection } from "../shared/parts.js";
import type { Props } from "./types.js";

/** Submissions a list shows, from 1 to 100 (the CND range), 20 by default. */
const itemCount = (value: number | undefined) => listLimit(value, 20, 100);

/**
 * The submission list: the submissions under its folder (or the whole site) that the visitor may
 * read, the newest first, as status cards (the submission's own "statusCard" view). A supplier
 * whose submissions are readable by them alone sees exactly their own.
 *
 * The query runs with the request's own JCR session (`jcrSession`), so a submission the visitor
 * may not read is never returned. For that reason the view is cached per user (`cache.perUser`):
 * by default Jahia keys a fragment on the visitor's roles on the list's own path, which does not
 * see the ACLs of the submissions found below it, and one supplier could be served another's list.
 * The list still depends on everything under its folder (runQuery), so a new submission, or the
 * desk changing a status and publishing it, refreshes it.
 *
 * Submissions are not left out for lack of a translation (see WITHOUT_TRANSLATION in
 * lib/media.ts): the supplier typed them once, in one language.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:submissionList",
    displayName: "Submission list",
    properties: { "cache.perUser": "true" },
  },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const { site } = pageOf(renderContext, currentNode);
    const { start, startMissing } = listStart(currentNode, props.folder, site, "folder");
    const max = itemCount(props.maxItems);
    const items = startMissing
      ? []
      : sortSubmissions(
          runQuery({
            session: jcrSession,
            renderContext,
            type: "ctmd:submission",
            start,
            order: "created",
            locale: currentResource.getLocale(),
            limit: max,
          }).map((node) => ({ node, created: readString(node, "jcr:created") })),
        );
    return (
      <ListSection
        props={{ ...props, noResultText: props.emptyText }}
        testId="ctmd-submission-list"
        count={items.length}
        startMissing={startMissing}
        summary={t("submissionList.summary", { start: startLabel(start), max, ...RAW })}
      >
        {(itemLevel) => (
          <ul className={cards.grid}>
            {items.map(({ node }) => (
              <li key={node.getIdentifier()}>
                <Render
                  node={node}
                  view="statusCard"
                  parameters={{ headingLevel: String(itemLevel) }}
                />
              </li>
            ))}
          </ul>
        )}
      </ListSection>
    );
  },
);

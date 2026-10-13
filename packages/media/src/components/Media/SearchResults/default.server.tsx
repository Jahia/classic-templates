import {
  buildNodeUrl,
  getChildNodes,
  jahiaComponent,
  useGQLQuery,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { pageOf } from "../../../lib/media.js";
import { readReference } from "../../../lib/props.js";
import { excerptParts, kindKey, pageNumber, searchWords } from "../../../lib/search.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import shared from "../../../lib/shared.module.css";
import cards from "../shared/cards.module.css";
import type { Props } from "./types.js";
import classes from "./search-results.module.css";

const SEARCH = `query Search($q: String!, $sites: [String], $language: String, $workspace: Workspace, $page: Int, $size: Int) {
  search(q: $q, siteKeys: $sites, language: $language, workspace: $workspace) {
    results(page: $page, size: $size) {
      totalHits
      hasMore
      hits { id displayableName excerpt link nodeType }
    }
  }
}`;

interface Hit {
  id: string;
  displayableName?: string;
  excerpt?: string;
  link?: string;
  nodeType?: string;
}

/** Results a page shows, from 5 to 50 (the CND range), 10 by default. */
const sizeOf = (value: number | undefined) =>
  Math.min(Math.max(Math.round(value ?? 10) || 10, 5), 50);

/**
 * The site keys a search covers: the page's site, and with scope "network" the sites the home
 * page's network bar links to (the internal targets of its ctpl:link children).
 */
const siteKeysOf = (site: JCRNodeWrapper, scope: string | undefined): string[] => {
  const keys = [site.getName()];
  if (scope !== "network") return keys;
  try {
    const home = (site as unknown as { getHome(): JCRNodeWrapper }).getHome();
    const header = home.getNode("siteHeader");
    for (const bar of getChildNodes(header, -1, 0, (n: JCRNodeWrapper) =>
      n.isNodeType("ctpl:networkBar"),
    )) {
      for (const link of getChildNodes(bar, -1, 0, (n: JCRNodeWrapper) =>
        n.isNodeType("ctpl:link"),
      )) {
        const target = readReference(link, "j:linknode");
        const key = target?.getResolveSite()?.getName();
        if (key && !keys.includes(key)) keys.push(key);
      }
    }
  } catch {
    // no network bar: this site only
  }
  return keys;
};

/**
 * The search section: a search form (GET, the `q` parameter, on this page) and, when words were
 * given, the Augmented Search results for them in the page's language, from the live workspace
 * (the edit workspace in edit mode), as the visitor: a count read by screen readers, then each
 * hit's kind, linked title and excerpt with the matched words marked, then "previous" and "next".
 * Excerpts are rebuilt as text parts (lib/search.ts): no markup of the index reaches the page.
 * Never cached: the results depend on the request (`cache.expiration` 0).
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:searchResults",
    displayName: "Search results",
    properties: { "cache.expiration": "0" },
  },
  (props: Props, { currentNode, renderContext, currentResource }) => {
    const t = useT();
    const level = useHeadingLevel(currentNode);
    const request = renderContext.getRequest();
    const words = searchWords(request.getParameter("q"));
    const page = pageNumber(request.getParameter("page"));
    const size = sizeOf(props.pageSize);
    const { page: mainPage, site } = pageOf(renderContext, currentNode);
    const action = buildNodeUrl(mainPage);
    const id = currentNode.getIdentifier();
    const title = props["jcr:title"];
    const sites = siteKeysOf(site, props.scope);

    let hits: Hit[] = [];
    let total = 0;
    let hasMore = false;
    let failed = false;
    if (words) {
      const { data, errors } = useGQLQuery({
        query: SEARCH,
        variables: {
          q: words,
          sites,
          language: currentResource.getLocale().toString(),
          workspace: renderContext.isEditMode() ? "EDIT" : "LIVE",
          page: page - 1,
          size,
        },
      });
      const results = data?.search?.results;
      failed = Boolean(errors?.length) || !results;
      hits = (results?.hits ?? []) as Hit[];
      total = Number(results?.totalHits ?? 0);
      hasMore = Boolean(results?.hasMore);
    }
    const link = (to: number) => {
      const pageParam = to > 1 ? `&page=${to}` : "";
      return `${action}?q=${encodeURIComponent(words)}${pageParam}`;
    };
    const headingId = `ctmd-search-${id}`;
    const inputId = `ctmd-search-q-${id}`;
    let status = "";
    if (words && failed) status = t("search.unavailable");
    else if (words) status = t("search.count", { count: total, words, ...RAW });

    return (
      <Section
        surface={props.ctplSurface}
        testId="ctmd-search"
        labelledBy={title ? headingId : undefined}
      >
        <Styles />
        <div className="ctpl-container">
          {title && (
            <Heading level={level} id={headingId}>
              {title}
            </Heading>
          )}
          <form
            className={classes.form}
            role="search"
            method="get"
            action={action}
            data-testid="ctmd-search-form"
          >
            <label className={classes.label} htmlFor={inputId}>
              {t("search.label")}
            </label>
            <div className={classes.row}>
              <input
                id={inputId}
                className={classes.input}
                type="search"
                name="q"
                defaultValue={words}
                maxLength={200}
              />
              <button type="submit" className={classes.submit}>
                {t("search.submit")}
              </button>
            </div>
          </form>
          <p
            className={status ? classes.status : shared.visuallyHidden}
            role="status"
            data-testid="ctmd-search-status"
          >
            {status}
          </p>
          {words && !failed && total === 0 && (
            <p className={cards.empty}>{props.noResultText || t("search.none")}</p>
          )}
          {hits.length > 0 && (
            <ol className={classes.results} start={(page - 1) * size + 1}>
              {hits.map((hit) => (
                <li key={hit.id} className={classes.result} data-testid="ctmd-search-hit">
                  <p className={cards.kind}>{t(kindKey(hit.nodeType))}</p>
                  <Heading level={title ? level + 1 : level} className={classes.title}>
                    <a href={hit.link}>{hit.displayableName}</a>
                  </Heading>
                  {hit.excerpt && (
                    <p className={classes.excerpt}>
                      {excerptParts(hit.excerpt).map((part) =>
                        part.hit ? (
                          <mark key={part.at} className={classes.mark}>
                            {part.text}
                          </mark>
                        ) : (
                          <span key={part.at}>{part.text}</span>
                        ),
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
          {(page > 1 || hasMore) && (
            <nav className={classes.pager} aria-label={t("search.pages")}>
              {page > 1 && (
                <a href={link(page - 1)} rel="prev">
                  {t("search.previous")}
                </a>
              )}
              {hasMore && (
                <a href={link(page + 1)} rel="next">
                  {t("search.next")}
                </a>
              )}
            </nav>
          )}
        </div>
      </Section>
    );
  },
);

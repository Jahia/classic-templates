import {
  buildNodeUrl,
  getChildNodes,
  Island,
  jahiaComponent,
  useGQLQuery,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useHeadingLevel } from "../../../lib/Heading.js";
import { pageOf } from "../../../lib/media.js";
import { readReference } from "../../../lib/props.js";
import { buildSearchQuery, type QueryContext } from "../../../lib/searchQuery.js";
import { adaptSearchData } from "../../../lib/searchResponse.js";
import { emptyState, parseSearchState } from "../../../lib/searchState.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { MediaScript } from "../shared/parts.js";
import { SearchPanel } from "./panel.js";
import { SearchInput } from "./parts.js";
import SearchApp from "./SearchApp.client.jsx";
import type { Props } from "./types.js";

/** Results a page shows, from 5 to 50 (the CND range), 10 by default. */
const sizeOf = (value: number | undefined) =>
  Math.min(Math.max(Math.round(value ?? 10) || 10, 5), 50);

/** The title of a site, its key when it has none. */
const siteLabel = (site: JCRNodeWrapper): string => {
  try {
    return (site as unknown as { getTitle(): string }).getTitle() || site.getName();
  } catch {
    return site.getName();
  }
};

/**
 * The sites a search covers: the page's site, and with scope "network" the sites the home page's
 * network bar links to (the internal targets of its ctpl:link children), each with its title.
 */
const sitesOf = (site: JCRNodeWrapper, scope: string | undefined): Map<string, string> => {
  const sites = new Map([[site.getName(), siteLabel(site)]]);
  if (scope !== "network") return sites;
  try {
    const home = (site as unknown as { getHome(): JCRNodeWrapper }).getHome();
    const header = home.getNode("siteHeader");
    for (const bar of getChildNodes(header, -1, 0, (n: JCRNodeWrapper) =>
      n.isNodeType("ctpl:networkBar"),
    )) {
      for (const link of getChildNodes(bar, -1, 0, (n: JCRNodeWrapper) =>
        n.isNodeType("ctpl:link"),
      )) {
        const target = readReference(link, "j:linknode")?.getResolveSite();
        if (target && !sites.has(target.getName())) sites.set(target.getName(), siteLabel(target));
      }
    }
  } catch {
    // no network bar: this site only
  }
  return sites;
};

/**
 * The search section: a search form (GET, on this page), facet groups (topics as a tree, tags,
 * format, type and, for a network search, site) and the Augmented Search results for the words and
 * the selected values, in the page's language, from the live workspace (the edit workspace in edit
 * mode), as the visitor. Within a facet the selected values are alternatives, across facets they
 * all apply; the counts ignore a facet's own selection (lib/searchQuery.ts).
 *
 * This view is the page without JavaScript: the facets are checkboxes of the same GET form with an
 * "Apply filters" button, the pager and the chips are links. In the browser the island
 * (SearchApp.client.tsx) takes the same place and starts from this very answer: Elastic Search UI
 * behind our connector, no reload. Excerpts are rebuilt as text parts (lib/search.ts): no markup of
 * the index reaches the page. Never cached: the results depend on the request.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctmd:searchResults",
    displayName: "Search results",
    properties: { "cache.expiration": "0" },
  },
  (props: Props, { currentNode, renderContext, currentResource }) => {
    const level = useHeadingLevel(currentNode);
    const request = renderContext.getRequest();
    const state = parseSearchState((name) => {
      const values = request.getParameterValues(name);
      const all: string[] = [];
      for (let i = 0; i < (values?.length ?? 0); i++) all.push(String(values[i]));
      return all;
    });
    const size = sizeOf(props.pageSize);
    const editing = renderContext.isEditMode();
    const { page: mainPage, site } = pageOf(renderContext, currentNode);
    const action = buildNodeUrl(mainPage);
    const id = currentNode.getIdentifier();
    const sites = sitesOf(site, props.scope);
    const context: QueryContext = {
      language: currentResource.getLocale().toString(),
      workspace: editing ? "EDIT" : "LIVE",
      sites: [...sites.keys()],
      size,
    };

    // Facets are always read (they offer what to search for); the first page of hits only when
    // something was asked. The page is read through the same builder as the browser's connector.
    const built = buildSearchQuery(state, context);
    const { data, errors } = useGQLQuery({ query: built.query, variables: built.variables });
    const failed = Boolean(errors?.length) || !data?.main;
    const page = adaptSearchData(failed ? undefined : data, failed ? emptyState() : state, context);
    const idPrefix = `ctmd-search-${id}`;
    const siteLabels = Object.fromEntries(sites);

    const panel = (
      <SearchPanel
        idPrefix={idPrefix}
        title={props["jcr:title"]}
        level={level}
        action={action}
        state={state}
        page={page}
        loading={false}
        failed={failed}
        size={size}
        siteLabels={siteLabels}
        showSites={sites.size > 1}
        noResultText={props.noResultText}
        box={<SearchInput id={`${idPrefix}-q`} value={state.q} />}
      />
    );

    return (
      <Section
        surface={props.ctplSurface}
        testId="ctmd-search"
        labelledBy={props["jcr:title"] ? `${idPrefix}-title` : undefined}
      >
        <Styles />
        <MediaScript />
        {state.q && !failed && (
          <span hidden data-ctmd-track-search={state.q} data-ctmd-track={id} />
        )}
        {editing || failed ? (
          panel
        ) : (
          <Island
            component={SearchApp}
            props={{
              endpoint: `${request.getContextPath()}/modules/graphql`,
              action,
              language: context.language,
              workspace: context.workspace,
              sites: [...context.sites],
              siteLabels,
              size,
              level,
              title: props["jcr:title"],
              noResultText: props.noResultText,
              idPrefix,
              trackId: id,
              initial: { state, page },
            }}
          />
        )}
      </Section>
    );
  },
);

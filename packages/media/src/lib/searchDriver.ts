/**
 * The only module that loads Elastic Search UI's runtime (`@elastic/search-ui`, core: the
 * `SearchDriver` and nothing of the React or views packages). The island imports it dynamically in
 * the browser (searchStore.ts), so the server bundle and the island's first chunk never carry it.
 *
 * The driver owns the search state, the paging and the history. Its address handling is ours: the
 * parameters are the ones of searchState.ts (`q`, `tag`, `topic`...), clean URLs, a new history
 * entry per change, and `lang` or any parameter we do not own is kept.
 */
import { SearchDriver, type APIConnector } from "@elastic/search-ui";
import { requestFromState, stateFromRequest } from "./searchConnector.js";
import { mergeQuery, queryToState, stateToQuery } from "./searchState.js";

/** What the store gives the driver. */
export interface DriverConfig {
  connector: APIConnector;
  /** Results per page. */
  size: number;
}

/** The driver of a search page, reading and writing the browser's address. */
export const createDriver = ({ connector, size }: DriverConfig): SearchDriver =>
  new SearchDriver({
    apiConnector: connector,
    // The first search always runs, even for an address with nothing asked: it fills the facets.
    alwaysSearchOnInitialLoad: true,
    trackUrlState: true,
    urlPushDebounceLength: 0,
    initialState: { resultsPerPage: size },
    searchQuery: {},
    routingOptions: {
      readUrl: () => globalThis.location.search,
      writeUrl: (query, { replaceUrl }) => {
        const search = mergeQuery(globalThis.location.search, query);
        const { pathname, hash } = globalThis.location;
        const target = pathname + (search ? "?" + search : "") + hash;
        if (replaceUrl) globalThis.history.replaceState(null, "", target);
        else globalThis.history.pushState(null, "", target);
      },
      urlToState: (search) => requestFromState(queryToState(search), size),
      stateToUrl: (state) => stateToQuery(stateFromRequest(state)),
      routeChangeHandler: (callback) => {
        const handler = () => callback(globalThis.location.search);
        globalThis.addEventListener("popstate", handler);
        return () => globalThis.removeEventListener("popstate", handler);
      },
    },
  });

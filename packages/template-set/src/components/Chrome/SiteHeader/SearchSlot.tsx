import { Island, useServerContext } from "@jahia/javascript-modules-library";
import { searchPageHref, suggestionSites } from "../../../lib/headerPages.js";
import HeaderSearch from "./HeaderSearch.client.jsx";
import { SearchBox, SearchHint } from "./SearchBox.js";

/**
 * The header's search box, when "Show a search box" is on: nothing for visitors while the header
 * names no Search page (editors get a hint in Page Builder), a plain form in Page Builder (the
 * autocomplete would only get in the editors' way), the autocomplete island on the live site.
 */
export const SearchSlot = () => {
  const { currentNode, currentResource, renderContext } = useServerContext();
  const isEdit = renderContext.isEditMode();
  const locale = currentResource.getLocale();
  const action = searchPageHref(renderContext, locale);
  if (!action) return isEdit ? <SearchHint /> : null;
  const id = `ctpl-header-search-${currentNode.getIdentifier()}`;
  if (isEdit) {
    return (
      <SearchBox
        id={id}
        action={action}
        value=""
        expanded={false}
        open={false}
        active={-1}
        options={[]}
      />
    );
  }
  return (
    <Island
      component={HeaderSearch}
      props={{
        action,
        endpoint: `${renderContext.getRequest().getContextPath()}/modules/graphql`,
        language: locale.toString(),
        sites: suggestionSites(renderContext),
        id,
      }}
    />
  );
};

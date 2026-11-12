import { usePageLabels } from "../../../lib/pageLabels.js";
import { EditNote } from "../../../lib/EditNote.js";
import classes from "./header-search.module.css";

/**
 * The edit-mode hint: the box is on but the header names no search page. Server only (EditNote
 * reads the render context), so it lives apart from SearchBox, which the island shares.
 */
export const SearchHint = () => {
  const { t } = usePageLabels();
  return (
    <EditNote className={classes.hint} testId="ctpl-header-search-hint">
      {t("search.noPage")}
    </EditNote>
  );
};

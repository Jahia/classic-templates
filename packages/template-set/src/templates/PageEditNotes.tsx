import { useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { EditNote } from "../lib/EditNote.js";
import { fullTitle } from "../lib/share.js";
import { chromeOwner, pageSite, robotsDirective } from "../lib/site.js";

/** About what search results show of a title before cutting it. */
export const TITLE_SHOWN = 60;

/**
 * The page-level notes of Page Builder, above the header: what an editor cannot see from the frame.
 *
 * - On every page but home, the shared header and footer are locked here (PageShell): they are
 *   edited on the home page.
 * - Search: the page has no description of its own (search engines get the site's), its browser
 *   title is longer than search results show, the site asks search engines not to index it.
 *
 * Edit mode only (EditNote): nothing of it reaches preview, live or the live cache.
 */
export const PageEditNotes = ({ title, description }: { title?: string; description?: string }) => {
  const { t } = useTranslation("classic-templates");
  const { renderContext, mainNode } = useServerContext();
  if (!renderContext.isEditMode()) return null;
  const site = pageSite(renderContext);
  const owner = chromeOwner(site);
  const browserTitle = fullTitle(title, site.getTitle() || site.getName());
  return (
    <>
      {mainNode.getPath() !== owner.getPath() && (
        <EditNote level="info" container testId="ctpl-chrome-locked-note">
          {t("pageNotes.chromeLocked")}
        </EditNote>
      )}
      {!description && (
        <EditNote level="info" container testId="ctpl-page-no-description">
          {t("pageNotes.noDescription")}
        </EditNote>
      )}
      {browserTitle.length > TITLE_SHOWN && (
        <EditNote level="info" container testId="ctpl-page-long-title">
          {t("pageNotes.longTitle", {
            title: browserTitle,
            count: browserTitle.length,
            max: TITLE_SHOWN,
            interpolation: { escapeValue: false },
          })}
        </EditNote>
      )}
      {robotsDirective(site) && (
        <EditNote level="info" container testId="ctpl-page-noindex">
          {t("pageNotes.noIndex")}
        </EditNote>
      )}
    </>
  );
};

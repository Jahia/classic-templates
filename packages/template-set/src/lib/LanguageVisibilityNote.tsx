import { useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { EditNote } from "./EditNote.js";
import { pageSite } from "./site.js";
import { languageVisibility } from "./visibility.js";

const INVALID_LANGUAGES = "j:invalidLanguages";

/**
 * One line above a section, a reused content or a page in Page Builder when it is switched off in
 * some of the site's languages (Visibility > Content visibility by language): the frame shows the
 * block in every language, visitors of those languages never get it. Nothing when it shows in all.
 *
 * The note is a warning in a language that hides the block, information in one that shows it. The
 * language names are written in the rendering language, like the note. Edit mode only (EditNote).
 */
export const LanguageVisibilityNote = ({
  node,
  container,
  testId = "ctpl-language-visibility",
}: {
  /** The node whose visibility is read; the node being rendered by default. */
  node?: JCRNodeWrapper;
  /** Wrapped in the page's content width, for a note at the top of a full-width section. */
  container?: boolean;
  testId?: string;
}) => {
  const { renderContext, currentNode, currentResource } = useServerContext();
  const { t } = useTranslation("classic-templates");
  if (!renderContext.isEditMode()) return null;
  const target = node ?? currentNode;
  if (!target.hasProperty(INVALID_LANGUAGES)) return null;
  const invalid = target
    .getProperty(INVALID_LANGUAGES)
    .getValues()
    .map((value: { getString(): string }) => value.getString());
  // The page's own site, never getSiteLocales(): it reads renderContext.getSite(), which is another
  // site when several share a server name (Jahia Cloud, CI test sites on localhost).
  const site = pageSite(renderContext);
  const locales = Object.fromEntries(
    site.getLanguagesAsLocales().map((locale) => [locale.toString(), locale]),
  );
  const { shown, hidden } = languageVisibility(
    invalid,
    Object.keys(locales),
    site.getDefaultLanguage(),
  );
  if (hidden.length === 0) return null;

  const current = currentResource.getLocale();
  const names = (codes: string[]) =>
    codes.map((code) => locales[code].getDisplayName(current)).join(t("visibilityNote.separator"));
  const hiddenHere = hidden.includes(current.toString());
  return (
    <EditNote level={hiddenHere ? "hidden" : "info"} container={container} testId={testId}>
      {shown.length === 0
        ? t("visibilityNote.hiddenEverywhere")
        : t("visibilityNote.shownOnly", {
            shown: names(shown),
            hidden: names(hidden),
            interpolation: { escapeValue: false },
          })}
    </EditNote>
  );
};

import type { ReactNode } from "react";
import { useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";

/**
 * What a note tells the editor: `info` explains something the frame cannot show (what a list does,
 * where content is reused), `hidden` says what visitors will not see and what to fill, `a11y` names an
 * accessibility problem.
 */
export type EditNoteLevel = "info" | "hidden" | "a11y";

/**
 * A note for editors in Page Builder, the module's one way to tell them what the edit frame cannot
 * show: content left out on live, an accessibility problem, what a list does and found, where content
 * is reused, what is locked on this page.
 *
 * Rendered in edit mode only, never in preview (what visitors get) nor live, so nothing of it reaches
 * a visitor or the live cache. The look is the global `ctpl-edit-hint` class (templates/global.css)
 * and its `data-level`, built from the theme tokens; `className` adds layout only. An accessibility
 * note starts with a label, so its level does not rest on colour alone. The text comes from the
 * caller, translated in the module's namespace: one sentence, what happens and what to do.
 */
export const EditNote = ({
  level = "hidden",
  inline,
  container,
  className,
  testId,
  children,
}: {
  level?: EditNoteLevel;
  /** A `span` inside a line (a link, an image) instead of a paragraph. */
  inline?: boolean;
  /** Wrapped in the page's content width (`ctpl-container`), for a note outside a section. */
  container?: boolean;
  className?: string;
  testId?: string;
  children: ReactNode;
}) => {
  const { renderContext } = useServerContext();
  const { t } = useTranslation("classic-templates");
  if (!renderContext.isEditMode()) return null;
  const Tag = inline ? "span" : "p";
  const note = (
    <Tag
      className={className ? `ctpl-edit-hint ${className}` : "ctpl-edit-hint"}
      data-level={level}
      data-testid={testId}
    >
      {level === "a11y" && <span className="ctpl-edit-hint-label">{t("editNote.a11y")} </span>}
      {children}
    </Tag>
  );
  return container ? <div className="ctpl-container">{note}</div> : note;
};

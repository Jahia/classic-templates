import { useServerContext } from "@jahia/javascript-modules-library";
import { useT } from "../../../lib/i18n.js";
import shared from "../../../lib/shared.module.css";

/** Shown in edit mode instead of an item that has no title in this language; nothing live. */
export const Untitled = ({ message = "item.noTitle" }: { message?: string }) => {
  const t = useT();
  const { renderContext } = useServerContext();
  return renderContext.isEditMode() ? <p className={shared.hint}>{t(message)}</p> : null;
};

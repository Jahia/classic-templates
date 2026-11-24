import { useServerContext } from "@jahia/javascript-modules-library";
import { useT } from "../../../lib/i18n.js";
import { EditNote } from "../../../lib/EditNote.js";

/** Shown in edit mode instead of an item that has no title in this language; nothing live. */
export const Untitled = ({ message = "item.noTitle" }: { message?: string }) => {
  const t = useT();
  const { renderContext } = useServerContext();
  return renderContext.isEditMode() ? <EditNote>{t(message)}</EditNote> : null;
};

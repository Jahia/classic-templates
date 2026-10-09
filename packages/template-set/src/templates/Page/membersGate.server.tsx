import { buildNodeUrl, jahiaComponent } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { MembersNotice } from "../../lib/MembersNotice.js";
import { AreaList, type AreaName } from "../PageAreas.jsx";
import { PageHeading } from "../PageShell.jsx";
import type { PageProps } from "./types.js";
import classes from "../page-areas.module.css";

/** The module parameter "areas" ("hero,main"), reduced to the names a template can offer. */
const areasOf = (value: unknown): AreaName[] => {
  const asked = (typeof value === "string" ? value : "").split(",");
  const known = (["hero", "main"] as const).filter((name) => asked.includes(name));
  return known.length > 0 ? known : ["main"];
};

/**
 * What the page template renders in place of its areas on a members-only page (see PageAreas).
 *
 * Cached per user (`cache.perUser`): a signed-in visitor gets the areas, a visitor who is not gets a
 * visible title, a notice and the sign-in form, never the areas. A guest's output is the same for every guest, so
 * the guest fragment is shared by all of them; each signed-in user gets a fragment of their own.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "jnt:page",
    name: "membersGate",
    displayName: "Members only page",
    properties: { "cache.perUser": "true" },
  },
  (
    { "jcr:title": title, ctplHideTitle }: PageProps,
    { currentNode, currentResource, renderContext },
  ) => {
    const { t } = useTranslation("classic-templates");
    const areas = areasOf(currentResource.getModuleParams().get("areas"));
    if (renderContext.isLoggedIn()) {
      return (
        <>
          <PageHeading title={title} hidden={ctplHideTitle} />
          <AreaList areas={areas} />
        </>
      );
    }
    // Held back: the title is shown even where a hero banner would normally carry it.
    return (
      <>
        <PageHeading title={title} />
        <div className={`ctpl-container ${classes.gate}`}>
          <MembersNotice text={t("members.pageNotice")} fallback={buildNodeUrl(currentNode)} />
        </div>
      </>
    );
  },
);

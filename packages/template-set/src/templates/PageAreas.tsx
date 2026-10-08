import { Area, Render, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { gatingPageOf } from "../lib/pageGate.js";
import { PageHeading } from "./PageShell.jsx";
import classes from "./page-areas.module.css";

/** The areas a template offers, in order. Home and content pages: hero and main; full-width: main. */
export type AreaName = "hero" | "main";

/** The areas of a page, as editors fill them. */
export const AreaList = ({ areas }: { areas: AreaName[] }) => (
  <>
    {areas.includes("hero") && <Area name="hero" nodeType="ctpl:heroArea" />}
    {areas.includes("main") && <Area name="main" nodeType="ctpl:pageArea" />}
  </>
);

/**
 * The body of a page template: the page's `<h1>` and its areas, or, on a members-only page (the
 * page's own option or a parent's, see gatingPageOf), the "membersGate" view of the page, which
 * renders the heading itself: a visitor held back must still see the title, even on a page whose
 * hero banner normally carries it.
 *
 * The gate view is the only place that tells visitors apart. It is cached per user, while this
 * template sits in a cache every visitor shares, so who sees the areas never depends on who rendered
 * the page first. The page's header, title and breadcrumb are shared and public. In edit mode the
 * areas are rendered as they are, so editors can work on them, with a note saying who sees what.
 */
export const PageAreas = ({
  title,
  hideTitle,
  areas,
}: {
  title?: string;
  hideTitle?: boolean;
  areas: AreaName[];
}) => {
  const { t } = useTranslation("classic-templates");
  const { currentNode, renderContext } = useServerContext();
  const gated = gatingPageOf(currentNode, renderContext) !== undefined;
  if (!gated)
    return (
      <>
        <PageHeading title={title} hidden={hideTitle} />
        <AreaList areas={areas} />
      </>
    );
  if (!renderContext.isEditMode()) {
    return <Render node={currentNode} view="membersGate" parameters={{ areas: areas.join(",") }} />;
  }
  return (
    <>
      <p className={`ctpl-container ${classes.editNote}`} data-testid="ctpl-members-edit-note">
        {t("members.pageEditNote")}
      </p>
      <PageHeading title={title} hidden={hideTitle} />
      <AreaList areas={areas} />
    </>
  );
};

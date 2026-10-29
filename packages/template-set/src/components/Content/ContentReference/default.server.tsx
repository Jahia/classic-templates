import {
  Render,
  getNodesByJCRQuery,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { EditNote } from "../../../lib/EditNote.js";

/** Above this many, the note says "50+": the number only tells the editor how widely it is shared. */
const MAX_COUNTED = 50;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The reused node, or undefined when it is gone or this user cannot read it. */
const reusedNode = (reference: JCRNodeWrapper): JCRNodeWrapper | undefined => {
  try {
    if (!reference.hasProperty("j:node")) return undefined;
    return (reference.getProperty("j:node").getNode() as JCRNodeWrapper | null) ?? undefined;
  } catch {
    return undefined;
  }
};

/** The references to `id` this user can read, this one included, counted up to MAX_COUNTED + 1. */
const referenceCount = (reference: JCRNodeWrapper, id: string): number =>
  UUID.test(id)
    ? getNodesByJCRQuery(
        reference.getSession(),
        `SELECT * FROM [jnt:contentReference] WHERE [j:node] = '${id}'`,
        MAX_COUNTED + 1,
      ).length
    : 1;

/**
 * The reused node as the platform's view renders it (`getContextualizedNode`, not in the library's
 * typings): in the reference's context. A content reference always has `j:node`, which that method
 * reads.
 */
const contextualized = (reference: JCRNodeWrapper): JCRNodeWrapper =>
  (reference as unknown as { getContextualizedNode(): JCRNodeWrapper }).getContextualizedNode();

const stringOf = (node: JCRNodeWrapper, name: string): string | undefined =>
  node.hasProperty(name) ? node.getProperty(name).getString() || undefined : undefined;

/**
 * Reused content (`jnt:contentReference`, "Paste as reference"): the template set's own view of the
 * platform type, so that Page Builder says what the reference is.
 *
 * It renders what the platform's view (default module, `jmix_nodeReference/nodeReference.jsp`)
 * renders: the reused node in the reference's context, not editable through the reference, in the
 * view the reference names (`j:referenceView`), with the reference's title as `refTitle`, and a cache
 * dependency on the reused node. Visitors get nothing more.
 *
 * In edit mode a note says where the content comes from and how many references show it (an edit
 * changes all of them), that visitors see nothing while it is not published, or that it no longer
 * exists. The count is a query run in edit mode only, bounded.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "jnt:contentReference",
    displayName: "Reused content",
  },
  (_, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const isEdit = renderContext.isEditMode();
    const reused = reusedNode(currentNode);
    if (!reused) {
      const path = stringOf(currentNode, "j:node");
      if (path) server.render.addCacheDependency({ uuid: path }, renderContext);
      return isEdit ? (
        <EditNote testId="ctpl-reference-missing">{t("reference.missing")}</EditNote>
      ) : null;
    }
    const id = reused.getIdentifier();
    server.render.addCacheDependency({ uuid: id }, renderContext);
    const rendered = (
      <Render
        node={contextualized(currentNode)}
        readOnly
        view={stringOf(currentNode, "j:referenceView")}
        parameters={{ refTitle: stringOf(currentNode, "jcr:title") ?? "" }}
      />
    );
    if (!isEdit) return rendered;

    const count = referenceCount(currentNode, id);
    const site = reused.getResolveSite();
    const published =
      reused.hasProperty("j:published") && reused.getProperty("j:published").getBoolean();
    return (
      <>
        <EditNote level="info" testId="ctpl-reference-note">
          {t("reference.reused", {
            title: reused.getDisplayableName(),
            site: site ? site.getTitle() || site.getSiteKey() : reused.getPath(),
            count: count > MAX_COUNTED ? `${MAX_COUNTED}+` : String(count),
            interpolation: { escapeValue: false },
          })}
        </EditNote>
        {!published && (
          <EditNote testId="ctpl-reference-unpublished">{t("reference.unpublished")}</EditNote>
        )}
        {rendered}
      </>
    );
  },
);

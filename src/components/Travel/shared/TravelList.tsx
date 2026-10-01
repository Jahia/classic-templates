import { Render, server, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import type { ReactNode } from "react";
import { Cta } from "../../../lib/Cta.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { pathRegex } from "../../../lib/query.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import cards from "./cards.module.css";

/** Fields of ctrvmix:travelList, plus the section's title, surface and call to action. */
export interface TravelListProps {
  "jcr:title"?: string;
  "startNode"?: JCRNodeWrapper;
  "region"?: string;
  "maxItems"?: number;
  "noResultText"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}

/**
 * Where a list looks: its start node, or the whole site when none is set. A start node that is set
 * but does not resolve (deleted, not yet published) is reported as missing: the list then shows
 * nothing on the live site rather than silently widening to the whole site. The list depends on
 * everything under its start node: adding, editing or publishing an item there refreshes it.
 */
export const useListStart = (props: TravelListProps) => {
  const { currentNode, renderContext } = useServerContext();
  const startMissing = !props.startNode && currentNode.hasProperty("startNode");
  const start: JCRNodeWrapper = props.startNode ?? renderContext.getSite();
  if (!startMissing) {
    server.render.addCacheDependency(
      { flushOnPathMatchingRegexp: `${pathRegex(start.getPath())}(/.*)?` },
      renderContext,
    );
  }
  return { start, startMissing };
};

/**
 * The section around a travel list: optional heading (h2, or h3 inside a titled column or free
 * zone), an edit-mode summary, the items rendered with their card view (one heading level below
 * the section's), the text shown when nothing matches, and the "see all" call to action. Nothing
 * on the live site when the list is empty and has no text for that case.
 */
export const TravelList = ({
  props,
  items,
  testId,
  summary,
  startMissing,
}: {
  props: TravelListProps;
  items: JCRNodeWrapper[];
  testId: string;
  summary: ReactNode;
  startMissing: boolean;
}) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const level = useHeadingLevel(currentNode);
  const isEdit = renderContext.isEditMode();
  if (!isEdit && (startMissing || (items.length === 0 && !props.noResultText))) return null;
  const title = props["jcr:title"];
  const headingId = `${testId}-${currentNode.getIdentifier()}`;
  return (
    <Section surface={props.ctplSurface} testId={testId} labelledBy={title ? headingId : undefined}>
      <Styles />
      <div className="ctpl-container">
        {title && (
          <Heading level={level} id={headingId}>
            {title}
          </Heading>
        )}
        {isEdit && <p className={cards.panel}>{startMissing ? t("list.startMissing") : summary}</p>}
        {items.length > 0 ? (
          <ul className={cards.grid}>
            {items.map((item) => (
              <li key={item.getIdentifier()}>
                <Render
                  node={item}
                  view="card"
                  parameters={{ headingLevel: String(title ? level + 1 : level) }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={cards.empty}>{props.noResultText || t("list.empty")}</p>
        )}
        <Cta node={currentNode} renderContext={renderContext} variant="secondary" />
      </div>
    </Section>
  );
};

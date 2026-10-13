import {
  AddResources,
  buildModuleFileUrl,
  buildNodeUrl,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { ReactNode } from "react";
import { Cta } from "../../../lib/Cta.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import type { PersonData } from "../../../lib/media.js";
import { isFormat } from "../../../lib/query.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import shared from "../../../lib/shared.module.css";
import cards from "./cards.module.css";
import classes from "./parts.module.css";

/**
 * Adds static/js/media.js (tabs, filters, share, countdown) to the page, never in edit mode: there
 * the server's plain markup is what editors work on. Jahia adds it once per page.
 */
export const MediaScript = () => {
  const { renderContext } = useServerContext();
  if (renderContext.isEditMode()) return null;
  return (
    <AddResources
      type="javascript"
      resources={buildModuleFileUrl("static/js/media.js")}
      key="ctmd-media-js"
    />
  );
};

/** The translated name of a story format ("Opinion"), or nothing for an unknown value. */
export const useFormatLabel = () => {
  const t = useT();
  return (format: string | undefined) => (isFormat(format) ? t(`format.${format}`) : undefined);
};

/** Names joined the page's way: "A", "A and B", "A, B and C". */
export const joinNames = (names: ReactNode[], and: string): ReactNode[] =>
  names.flatMap((name, index) => {
    if (index === 0) return [name];
    return [index === names.length - 1 ? ` ${and} ` : ", ", name];
  });

/** Where the names go in the translated "By {{names}}" sentence. */
const SPLIT = "@@names@@";

/** "By A and B", each name a link to the person's page (plain text with `linked={false}`). */
export const Byline = ({ people, linked = true }: { people: PersonData[]; linked?: boolean }) => {
  const t = useT();
  if (people.length === 0) return null;
  const names = people.map((person) =>
    linked ? (
      <a
        key={person.node.getIdentifier()}
        href={buildNodeUrl(person.node)}
        className={classes.person}
      >
        {person.name}
      </a>
    ) : (
      <span key={person.node.getIdentifier()}>{person.name}</span>
    ),
  );
  const [before, after] = t("story.by", { names: SPLIT, ...RAW }).split(SPLIT);
  return (
    <span className={classes.byline}>
      {before}
      {joinNames(names, t("story.and"))}
      {after}
    </span>
  );
};

/**
 * The share box of a page: the browser's share sheet and "copy link" buttons, both hidden until
 * static/js/media.js finds the browser can do it (so nobody gets a button that does nothing), and a
 * polite status line ("Link copied"). Nothing at all without JavaScript or in edit mode.
 */
export const ShareBox = ({ url, title }: { url: string; title?: string }) => {
  const t = useT();
  const { renderContext } = useServerContext();
  if (renderContext.isEditMode()) return null;
  return (
    <div
      className={classes.share}
      role="group"
      aria-label={t("share.label")}
      data-ctmd-share=""
      data-ctmd-url={url}
      data-ctmd-title={title}
      data-testid="ctmd-share"
      hidden
    >
      <MediaScript />
      <button type="button" className={classes.shareButton} data-ctmd-share-native="" hidden>
        {t("share.share")}
      </button>
      <button type="button" className={classes.shareButton} data-ctmd-share-copy="" hidden>
        {t("share.copy")}
      </button>
      <span
        className={shared.visuallyHidden}
        role="status"
        data-ctmd-share-status=""
        data-copied={t("share.copied")}
      />
    </div>
  );
};

/** Props every list section of this module shares (title, surface, "see all" call to action). */
export interface SectionProps {
  "jcr:title"?: string;
  "noResultText"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}

/**
 * The section around a media list: optional heading (h2, or lower inside a titled column, tab or
 * free zone), the edit-mode summary, the list itself (`children`, given the heading level of its
 * items), the text shown when nothing matches, and the "see all" call to action. Nothing on the
 * live site when the list is empty and has no text for that case, or when its start node is set
 * but missing.
 */
export const ListSection = ({
  props,
  testId,
  count,
  startMissing,
  summary,
  children,
  extra,
}: {
  props: SectionProps;
  testId: string;
  count: number;
  startMissing: boolean;
  summary: ReactNode;
  children: (itemLevel: number) => ReactNode;
  extra?: ReactNode;
}) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const level = useHeadingLevel(currentNode);
  const isEdit = renderContext.isEditMode();
  if (!isEdit && (startMissing || (count === 0 && !props.noResultText))) return null;
  const title = props["jcr:title"];
  const headingId = `${testId}-${currentNode.getIdentifier()}`;
  const itemLevel = title ? level + 1 : level;
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
        {extra}
        {count > 0 ? (
          children(itemLevel)
        ) : (
          <p className={cards.empty}>{props.noResultText || t("list.empty")}</p>
        )}
        <Cta node={currentNode} renderContext={renderContext} variant="secondary" />
      </div>
    </Section>
  );
};

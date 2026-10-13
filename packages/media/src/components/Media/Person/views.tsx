import {
  Render,
  RenderChildren,
  buildNodeUrl,
  getChildNodes,
  useServerContext,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { JsonLd, useAbsoluteUrl } from "../../../lib/JsonLd.js";
import { getNodesByJCRQuery } from "@jahia/javascript-modules-library";
import { buildListQuery } from "../../../lib/query.js";
import { RichText } from "../../../lib/RichText.js";
import { resolveLink } from "../../../lib/resolveLink.js";
import { buildPersonLd } from "../../../lib/schema.js";
import { Styles } from "../../../lib/Styles.js";
import { readString } from "../../../lib/props.js";
import cards from "../shared/cards.module.css";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./person.module.css";

/** Stories and sessions shown on a person's page, at most. */
const MAX_LISTED = 12;

/** "Senior editor, Orvane" (role and organisation, either may be missing). */
const Role = ({ props, className }: { props: Props; className: string }) => {
  const parts = [props.role, props.organisation].filter(Boolean);
  return parts.length > 0 ? <p className={className}>{parts.join(", ")}</p> : null;
};

/**
 * Items of `type` under every site that reference the person (a story's authors, a session
 * speaker's person), as the visitor sees them. The person page expires from the cache after five
 * minutes (default.server.tsx) rather than depending on every site's content.
 */
const itemsOf = (person: JCRNodeWrapper, type: "ctmd:story" | "ctmd:sessionSpeaker") => {
  const session = person.getSession();
  const locale = session.getLocale();
  const query = buildListQuery({
    type,
    startPath: "/sites",
    order: type === "ctmd:story" ? "newest" : "none",
    reference: {
      property: type === "ctmd:story" ? "authors" : "person",
      id: person.getIdentifier(),
    },
  });
  const rows = getNodesByJCRQuery(session, query, 100);
  if (type === "ctmd:story") return rows.filter((n) => n.hasI18N(locale)).slice(0, MAX_LISTED);
  const seen = new Set<string>();
  const sessions: JCRNodeWrapper[] = [];
  for (const speaker of rows) {
    try {
      const parent = speaker.getParent() as JCRNodeWrapper;
      if (parent.hasI18N(locale) && !seen.has(parent.getIdentifier())) {
        seen.add(parent.getIdentifier());
        sessions.push(parent);
      }
    } catch {
      // not readable here
    }
  }
  const startOf = (n: JCRNodeWrapper) => Date.parse(readString(n, "start") ?? "") || 0;
  return sessions.sort((a, b) => startOf(a) - startOf(b)).slice(0, MAX_LISTED);
};

/**
 * The person's own page, inside the main-resource template of classic-templates (header, footer,
 * `<title>` = the name, meta description = the short bio). It owns the page's only `<h1>`: the
 * name. Then the bio, the profile links, the person's stories and sessions as cards (rendered
 * through their own card view), and the Person JSON-LD.
 */
export const PersonFull = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const toAbsolute = useAbsoluteUrl();
  const id = currentNode.getIdentifier();
  const name = props["jcr:title"];
  const links = getChildNodes(currentNode, -1, 0, (n: JCRNodeWrapper) => n.isNodeType("ctpl:link"));
  const profiles = links.flatMap((link) => {
    const resolved = resolveLink(link, renderContext).link;
    return resolved?.external ? [resolved.href] : [];
  });
  const stories = itemsOf(currentNode, "ctmd:story");
  const sessions = itemsOf(currentNode, "ctmd:sessionSpeaker");
  const list = (key: string, items: JCRNodeWrapper[], title: string) =>
    items.length > 0 && (
      <section className={classes.list} aria-labelledby={`ctmd-${key}-${id}`}>
        <h2 id={`ctmd-${key}-${id}`}>{title}</h2>
        <ul className={cards.grid}>
          {items.map((node) => (
            <li key={node.getIdentifier()}>
              <Render node={node} view="card" parameters={{ headingLevel: "3" }} />
            </li>
          ))}
        </ul>
      </section>
    );
  return (
    <article className={classes.full} data-testid="ctmd-person-full">
      <Styles />
      <header className={classes.head}>
        {props.image && (
          <div className={classes.portrait}>
            <Image node={props.image} owner={currentNode} renderContext={renderContext} priority />
          </div>
        )}
        <div>
          {name ? <h1 className={classes.name}>{name}</h1> : <Untitled />}
          <Role props={props} className={classes.role} />
          {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
        </div>
      </header>
      <RichText html={props.bio} className={classes.bio} headingLevel={2} />
      {(links.length > 0 || renderContext.isEditMode()) && (
        <section className={classes.profiles} aria-labelledby={`ctmd-profiles-${id}`}>
          <h2 id={`ctmd-profiles-${id}`}>{t("person.profiles")}</h2>
          <ul className={classes.profileList}>
            <RenderChildren />
          </ul>
        </section>
      )}
      {name && list("stories", stories, t("person.stories", { name, ...RAW }))}
      {name && list("sessions", sessions, t("person.sessions", { name, ...RAW }))}
      {name && (
        <JsonLd
          data={buildPersonLd({
            url: toAbsolute(buildNodeUrl(currentNode)),
            name,
            jobTitle: props.role,
            organisation: props.organisation,
            description: props.teaser,
            image: props.image ? toAbsolute(buildNodeUrl(props.image)) : undefined,
            profiles,
          })}
        />
      )}
    </article>
  );
};

/**
 * A card (speaker gallery, content list, a story's or session's people): round portrait, the
 * linked name, role and organisation, short bio. The whole card is clickable; the portrait is
 * decorative (the name says it all). Untitled in this language: nothing live.
 */
export const PersonCard = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const name = props["jcr:title"];
  if (!name) return <Untitled />;
  return (
    <article className={`${cards.card} ${classes.card}`} data-testid="ctmd-person-card">
      <Styles />
      {props.image && (
        <div className={classes.cardPortrait}>
          <Image node={props.image} renderContext={renderContext} decorative />
        </div>
      )}
      <div className={cards.body}>
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {name}
          </a>
        </Heading>
        <Role props={props} className={cards.meta} />
        {props.teaser && <p className={cards.teaser}>{props.teaser}</p>}
      </div>
    </article>
  );
};

/** A compact row: the linked name, then role and organisation. */
export const PersonCompact = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const name = props["jcr:title"];
  if (!name) return <Untitled />;
  return (
    <article className={cards.compact} data-testid="ctmd-person-compact">
      <Styles />
      <Heading level={level} className={cards.compactTitle}>
        <a href={buildNodeUrl(currentNode)}>{name}</a>
      </Heading>
      <Role props={props} className={cards.meta} />
    </article>
  );
};

import { Render, buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import { formatDate, formatTime, isoInZone } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { JsonLd, useAbsoluteUrl } from "../../../lib/JsonLd.js";
import { languageTag } from "../../../lib/locale.js";
import { eventTimeZone, sessionSpeakers, type SpeakerData } from "../../../lib/media.js";
import { isMembersOnly, teaserParagraphsOf } from "../../../lib/members.js";
import { RichText } from "../../../lib/RichText.js";
import { buildSessionLd } from "../../../lib/schema.js";
import { Styles } from "../../../lib/Styles.js";
import { MembersWall } from "../shared/MembersWall.js";
import { Taxonomy } from "../shared/Taxonomy.js";
import cards from "../shared/cards.module.css";
import { ShareBox } from "../shared/parts.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./session.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/** The page language, the event's zone, and the session's times in that zone. */
const useWhen = (props: Props) => {
  const { currentNode, renderContext, currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  const zone = eventTimeZone(currentNode, renderContext);
  return {
    language,
    zone,
    day: props.start ? formatDate(isoInZone(props.start, zone), language, "full") : undefined,
    from: formatTime(props.start, language, zone),
    to: formatTime(props.end, language, zone),
    startIso: isoInZone(props.start, zone),
    endIso: isoInZone(props.end, zone),
  };
};

/** "09:30 to 10:15" as two <time> elements (only the start when there is no end). */
const TimeRange = ({ props }: { props: Props }) => {
  const t = useT();
  const when = useWhen(props);
  if (!when.from) return null;
  const from = <time dateTime={when.startIso}>{when.from}</time>;
  if (!when.to) return from;
  const [before, middle, after] = t("session.time", { start: "@@", end: "@@", ...RAW }).split("@@");
  return (
    <span>
      {before}
      {from}
      {middle}
      <time dateTime={when.endIso}>{when.to}</time>
      {after}
    </span>
  );
};

/** The session type label ("Panel"). */
const TypeLabel = ({ props }: { props: Props }) => {
  const t = useT();
  return props.sessionType ? (
    <span className={cards.kind}>{t(`session.type.${props.sessionType}`)}</span>
  ) : null;
};

/** "Ana Costa (Moderator), Ben Ade" in plain text. */
const speakerNames = (speakers: SpeakerData[], role: (part: string) => string) =>
  speakers.map((s) => (s.part === "speaker" ? s.name : `${s.name} (${role(s.part)})`)).join(", ");

/**
 * The session's own page, inside the main-resource template of classic-templates. It owns the
 * page's only `<h1>`: the title. Then the day and times in the event's time zone (said in words),
 * room and stream, the share box, the description, its topics and tags, the speakers as person
 * cards with the part they play, and the Event JSON-LD.
 *
 * A session switched to "Members only" (ctplmix:membersOnly) keeps all of that for every visitor
 * but its description: a visitor who is not signed in reads its opening paragraphs, then the
 * members notice (MembersWall). `perUser` says the view is cached per user ("fullPageMembers"), the
 * only place the page may tell visitors apart; the shared "fullPage" never renders the whole
 * description of such a session.
 */
export const SessionFull = ({ props, perUser = false }: { props: Props; perUser?: boolean }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const membersOnly = isMembersOnly(currentNode);
  const open =
    !membersOnly || (perUser && (renderContext.isLoggedIn() || renderContext.isEditMode()));
  const toAbsolute = useAbsoluteUrl();
  const when = useWhen(props);
  const id = currentNode.getIdentifier();
  const title = props["jcr:title"];
  const url = toAbsolute(buildNodeUrl(currentNode));
  const speakers = sessionSpeakers(currentNode, renderContext);
  return (
    <article className={classes.full} data-testid="ctmd-session-full">
      <Styles />
      <header className={classes.head}>
        <p className={classes.kicker}>
          <TypeLabel props={props} />
          {props.stream && <span>{props.stream}</span>}
        </p>
        {title ? <h1 className={classes.title}>{title}</h1> : <Untitled />}
        {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
        <dl className={classes.facts}>
          {when.day && (
            <div>
              <dt className="ctpl-visually-hidden">{t("session.when")}</dt>
              <dd>
                <time dateTime={when.startIso?.slice(0, 10)}>{when.day}</time>,{" "}
                <TimeRange props={props} />
              </dd>
            </div>
          )}
          {props.room && (
            <div>
              <dt>{t("session.room")}</dt>
              <dd>{props.room}</dd>
            </div>
          )}
        </dl>
        {when.day && (
          <p className={classes.zone}>{t("session.zone", { zone: when.zone, ...RAW })}</p>
        )}
      </header>
      <ShareBox url={url} title={title} />
      {membersOnly && <EditNote level="info">{t("session.membersEdit")}</EditNote>}
      {open ? (
        <RichText html={props.body} className={classes.body} headingLevel={2} />
      ) : (
        <MembersWall
          body={props.body}
          paragraphs={teaserParagraphsOf(currentNode)}
          kind="session"
        />
      )}
      {open && <Taxonomy />}
      {speakers.length > 0 && (
        <section aria-labelledby={`ctmd-speakers-${id}`}>
          <h2 id={`ctmd-speakers-${id}`} className={classes.speakersTitle}>
            {t("session.speakers")}
          </h2>
          <ul className={cards.grid}>
            {speakers.map((speaker) => (
              <li key={speaker.node.getIdentifier()} className={classes.speaker}>
                <p className={classes.part}>{t(`session.role.${speaker.part}`)}</p>
                <Render node={speaker.node} view="card" parameters={{ headingLevel: "3" }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {title && (
        <JsonLd
          data={buildSessionLd({
            url,
            name: title,
            description: props.teaser,
            start: when.startIso,
            end: when.endIso,
            room: props.room,
            speakers: speakers.map((s) => ({
              name: s.name ?? "",
              url: toAbsolute(buildNodeUrl(s.node)),
            })),
            language: when.language,
          })}
        />
      )}
    </article>
  );
};

/** A card (content list, a person's page): type, linked title, day and time, room, speakers. */
export const SessionCard = ({ props }: { props: Props }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const when = useWhen(props);
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const speakers = sessionSpeakers(currentNode, renderContext);
  return (
    <article className={cards.card} data-testid="ctmd-session-card">
      <Styles />
      <div className={cards.body}>
        <p className={cards.meta}>
          <TypeLabel props={props} />
          {isMembersOnly(currentNode) && (
            <span className={cards.badge}>{t("session.membersLabel")}</span>
          )}
          {when.day && <span>{when.day}</span>}
        </p>
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
        <p className={cards.meta}>
          <TimeRange props={props} />
          {props.room && <span>{props.room}</span>}
        </p>
        {speakers.length > 0 && (
          <p className={cards.teaser}>
            {speakerNames(speakers, (part) => t(`session.role.${part}`))}
          </p>
        )}
      </div>
    </article>
  );
};

/** An agenda row: times, type, the linked title, room and stream, speakers, summary. */
export const SessionCompact = ({ props }: { props: Props }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const speakers = sessionSpeakers(currentNode, renderContext);
  const isBreak = props.sessionType === "break";
  return (
    <article
      className={`${classes.row} ${isBreak ? classes.break : ""}`}
      data-testid="ctmd-session-row"
    >
      <Styles />
      <p className={classes.rowTime}>
        <TimeRange props={props} />
      </p>
      <div className={classes.rowBody}>
        <p className={cards.meta}>
          <TypeLabel props={props} />
          {isMembersOnly(currentNode) && (
            <span className={cards.badge}>{t("session.membersLabel")}</span>
          )}
          {props.room && <span>{props.room}</span>}
          {props.stream && <span>{props.stream}</span>}
        </p>
        <Heading level={level} className={classes.rowTitle}>
          {isBreak ? title : <a href={buildNodeUrl(currentNode)}>{title}</a>}
        </Heading>
        {speakers.length > 0 && (
          <p className={classes.rowSpeakers}>
            {speakerNames(speakers, (part) => t(`session.role.${part}`))}
          </p>
        )}
        {props.teaser && !isBreak && <p className={cards.teaser}>{props.teaser}</p>}
      </div>
    </article>
  );
};

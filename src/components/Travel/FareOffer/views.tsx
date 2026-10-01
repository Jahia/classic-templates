import { Render, buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { formatDate, isSaleOver, isoDay, periodKind, today } from "../../../lib/format.js";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { JsonLd, useAbsoluteUrl } from "../../../lib/JsonLd.js";
import { languageTag } from "../../../lib/locale.js";
import { Price } from "../../../lib/Price.js";
import { Styles } from "../../../lib/Styles.js";
import { RichText } from "../../../lib/RichText.js";
import { buildFareLd } from "../../../lib/schema.js";
import shared from "../../../lib/shared.module.css";
import { type DestinationData, fareDestination } from "../../../lib/travel.js";
import cards from "../shared/cards.module.css";
import { Untitled } from "../shared/Untitled.js";
import type { Cabin, Props } from "./types.js";
import classes from "./fare.module.css";

const CABINS = new Set<Cabin>(["economy", "premiumEconomy", "business"]);

/** Everything a fare view shows, in the page's language. */
const useFare = (props: Props) => {
  const t = useT();
  const { currentNode, renderContext, currentResource } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  // The destination is another node: it is a cache dependency of every fare view.
  const destination: DestinationData | undefined = fareDestination(currentNode, renderContext);
  const city = destination?.title;
  const cabin = props.cabin && CABINS.has(props.cabin) ? t(`cabin.${props.cabin}`) : undefined;
  const route =
    props.origin && city
      ? t("fare.route", { origin: props.origin, destination: city, ...RAW })
      : undefined;
  const kind = periodKind(props.travelFrom, props.travelTo);
  const period =
    kind === "none"
      ? undefined
      : t(`fare.period.${kind}`, {
          from: formatDate(props.travelFrom, language, "medium"),
          to: formatDate(props.travelTo, language, "medium"),
          ...RAW,
        });
  const ended = isSaleOver(props.saleEnds, today());
  return {
    t,
    currentNode,
    renderContext,
    language,
    destination,
    city,
    cabin,
    route,
    period,
    ended,
  };
};

/** Travel period and last day of sale, as a description list. */
const Facts = ({
  fare,
  saleEndsIso,
  className,
  endedClass,
  style,
}: {
  fare: ReturnType<typeof useFare>;
  saleEndsIso?: string;
  className: string;
  endedClass: string;
  style: "medium" | "long";
}) => {
  const { t, language, period, ended } = fare;
  const saleEnds = formatDate(saleEndsIso, language, style);
  if (!period && !saleEnds) return null;
  return (
    <dl className={className}>
      {period && (
        <div>
          <dt>{t("fare.travel")}</dt>
          <dd>{period}</dd>
        </div>
      )}
      {saleEnds && (
        <div>
          <dt>{ended ? t("fare.saleEnded") : t("fare.bookBy")}</dt>
          <dd className={ended ? endedClass : undefined}>
            <time dateTime={isoDay(saleEndsIso)}>{saleEnds}</time>
          </dd>
        </div>
      )}
    </dl>
  );
};

/**
 * The fare's own page, inside the main-resource template of classic-templates (header, footer,
 * `<title>` from the offer's title). This view owns the page's only `<h1>`: the offer's title, or
 * the route when the offer has none. Then the price, the travel period and end of sale, the call
 * to action, the destination's image, the conditions, and the destination as a card (through its
 * own card view).
 */
export const FareFull = ({ props }: { props: Props }) => {
  const fare = useFare(props);
  const { t, currentNode, renderContext, language, destination, city, cabin, route } = fare;
  const toAbsolute = useAbsoluteUrl();
  const id = currentNode.getIdentifier();
  const title = props["jcr:title"] || route || city;
  const image = destination?.image;
  return (
    <article className={classes.full} data-testid="ctrv-fare-full">
      <Styles />
      <div className={classes.top}>
        <header className={classes.head}>
          {(cabin || route) && (
            <p className={classes.kicker}>
              {cabin && <span>{cabin}</span>}
              {route && props["jcr:title"] && <span>{route}</span>}
            </p>
          )}
          {title ? <h1 className={classes.title}>{title}</h1> : <Untitled />}
          <Price amount={props.price} currency={props.currency} note={props.priceNote} large />
          <Facts
            fare={fare}
            saleEndsIso={props.saleEnds}
            className={classes.facts}
            endedClass={classes.ended}
            style="long"
          />
          <Cta node={currentNode} renderContext={renderContext} />
        </header>
        {image && destination && (
          <figure className={classes.figure}>
            <Image node={image} owner={destination.node} renderContext={renderContext} priority />
          </figure>
        )}
      </div>
      {props.conditions && (
        <section className={classes.block} aria-labelledby={`ctrv-conditions-${id}`}>
          <h2 id={`ctrv-conditions-${id}`}>{t("fare.conditions")}</h2>
          <RichText html={props.conditions} headingLevel={3} />
        </section>
      )}
      {destination && (
        <section className={classes.block} aria-labelledby={`ctrv-destination-${id}`}>
          <h2 id={`ctrv-destination-${id}`}>{t("fare.aboutDestination")}</h2>
          <div className={classes.destination}>
            <Render node={destination.node} view="card" parameters={{ headingLevel: "3" }} />
          </div>
        </section>
      )}
      {title && (
        <JsonLd
          data={buildFareLd({
            url: toAbsolute(buildNodeUrl(currentNode)),
            name: title,
            language,
            price: props.price,
            currency: props.currency,
            validThrough: isoDay(props.saleEnds),
            cabin,
            route,
            destinationUrl: destination ? toAbsolute(buildNodeUrl(destination.node)) : undefined,
            destinationName: city,
            image: image ? toAbsolute(buildNodeUrl(image)) : undefined,
          })}
        />
      )}
    </article>
  );
};

/** The link of a card: the city, with the cabin and the departure city for screen readers. */
const CardLink = ({
  node,
  text,
  context,
  className,
}: {
  node: JCRNodeWrapper;
  text: string;
  context?: string;
  className?: string;
}) => (
  <a className={className} href={buildNodeUrl(node)}>
    {text}
    {context && <span className={shared.visuallyHidden}>{context}</span>}
  </a>
);

/**
 * A fare card (this module's fare list, a classic-templates content list): the destination's
 * image, the cabin, the linked city, the route, the "from" price and the dates. The whole card is
 * clickable; the image is decorative. Without a destination (deleted, not published) or a title,
 * it renders nothing live.
 */
export const FareCard = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const fare = useFare(props);
  const { t, currentNode, renderContext, destination, city, cabin, route } = fare;
  const text = city || props["jcr:title"];
  if (!text) return <Untitled />;
  const context = [cabin, props.origin && t("fare.fromOrigin", { origin: props.origin, ...RAW })]
    .filter(Boolean)
    .join(", ");
  return (
    <article className={cards.card} data-testid="ctrv-fare-card">
      <Styles />
      {destination?.image && (
        <div className={cards.media}>
          <Image node={destination.image} renderContext={renderContext} decorative />
        </div>
      )}
      <div className={cards.body}>
        {cabin && (
          <p className={cards.meta}>
            <span className={cards.kind}>{cabin}</span>
          </p>
        )}
        <Heading level={level} className={cards.title}>
          <CardLink
            node={currentNode}
            text={text}
            context={context ? `, ${context}` : undefined}
            className={cards.stretched}
          />
        </Heading>
        {route && <p className={cards.teaser}>{route}</p>}
        <Price amount={props.price} currency={props.currency} note={props.priceNote} />
        <Facts
          fare={fare}
          saleEndsIso={props.saleEnds}
          className={cards.facts}
          endedClass={cards.ended}
          style="medium"
        />
      </div>
    </article>
  );
};

/** A compact row (classic-templates content list "compact list"): linked route, price, dates. */
export const FareCompact = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const fare = useFare(props);
  const { currentNode, city, cabin, route } = fare;
  const text = props["jcr:title"] || route || city;
  if (!text) return <Untitled />;
  return (
    <article className={cards.compact} data-testid="ctrv-fare-compact">
      <Styles />
      <Heading level={level} className={cards.compactTitle}>
        <CardLink node={currentNode} text={text} />
      </Heading>
      {cabin && <p className={cards.meta}>{cabin}</p>}
      <Price amount={props.price} currency={props.currency} />
      <Facts
        fare={fare}
        saleEndsIso={props.saleEnds}
        className={cards.facts}
        endedClass={cards.ended}
        style="medium"
      />
    </article>
  );
};

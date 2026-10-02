import { Render, buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { JsonLd, useAbsoluteUrl } from "../../../lib/JsonLd.js";
import { Price } from "../../../lib/Price.js";
import { Styles } from "../../../lib/Styles.js";
import { RichText } from "../../../lib/RichText.js";
import { buildDestinationLd } from "../../../lib/schema.js";
import shared from "../../../lib/shared.module.css";
import { relatedDestinations } from "../../../lib/travel.js";
import cards from "../shared/cards.module.css";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import classes from "./destination.module.css";

const FACTS = ["localCurrency", "language", "timeZone", "voltage", "diallingCode"] as const;

/** Country, then the airport code with its name for screen readers ("Airport code NRT"). */
const Place = ({ props, className }: { props: Props; className: string }) => {
  const t = useT();
  if (!props.country && !props.airportCode) return null;
  return (
    <p className={className}>
      {props.country && <span>{props.country}</span>}
      {props.airportCode && (
        <span>
          <span className={shared.visuallyHidden}>{t("destination.airportCode")} </span>
          {props.airportCode}
        </span>
      )}
    </p>
  );
};

/**
 * The destination's own page, inside the main-resource template of classic-templates, which owns
 * the header, footer, `<title>` (the city) and meta description (the teaser). Like the
 * classic-templates news and articles, this view owns the page's only `<h1>`: the city name.
 * Then the image, the description beside the key facts, and the related destinations as cards
 * (rendered through their own card view, so each is cached and refreshed on its own).
 */
export const DestinationFull = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const toAbsolute = useAbsoluteUrl();
  const id = currentNode.getIdentifier();
  const title = props["jcr:title"];
  const facts = FACTS.filter((fact) => props[fact]);
  const related = relatedDestinations(currentNode);
  return (
    <article className={classes.full} data-testid="ctrv-destination-full">
      <Styles />
      <header className={classes.head}>
        <Place props={props} className={classes.kicker} />
        {title ? <h1 className={classes.title}>{title}</h1> : <Untitled />}
        {props.teaser && <p className={classes.lead}>{props.teaser}</p>}
        <Price amount={props.price} currency={props.currency} note={props.priceNote} large />
      </header>
      {props.image && (
        <figure className={classes.figure}>
          <Image node={props.image} owner={currentNode} renderContext={renderContext} priority />
        </figure>
      )}
      {(props.body || facts.length > 0) && (
        <div className={classes.columns}>
          <RichText html={props.body} className={classes.body} headingLevel={2} />
          {facts.length > 0 && (
            <section className={classes.facts} aria-labelledby={`ctrv-facts-${id}`}>
              <h2 id={`ctrv-facts-${id}`} className={classes.factsTitle}>
                {t("destination.facts")}
              </h2>
              <dl className={classes.factList}>
                {facts.map((fact) => (
                  <div key={fact}>
                    <dt>{t(`destination.fact.${fact}`)}</dt>
                    <dd>{props[fact]}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      )}
      {related.length > 0 && (
        <section className={classes.related} aria-labelledby={`ctrv-related-${id}`}>
          <h2 id={`ctrv-related-${id}`}>{t("destination.related")}</h2>
          <ul className={cards.grid}>
            {related.map((node) => (
              <li key={node.getIdentifier()}>
                <Render node={node} view="card" parameters={{ headingLevel: "3" }} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {title && (
        <JsonLd
          data={buildDestinationLd({
            url: toAbsolute(buildNodeUrl(currentNode)),
            name: title,
            description: props.teaser,
            image: props.image ? toAbsolute(buildNodeUrl(props.image)) : undefined,
            country: props.country,
            price: props.price,
            currency: props.currency,
          })}
        />
      )}
    </article>
  );
};

/**
 * A card in a grid (this module's destination grid, a classic-templates content list, the related
 * destinations): image, country and code, the linked city name, teaser, "from" price. The whole
 * card is clickable; the image is decorative (the city name says it all). An item untitled in this
 * language renders nothing live, so a list never shows an empty link.
 */
export const DestinationCard = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  return (
    <article className={cards.card} data-testid="ctrv-destination-card">
      <Styles />
      {props.image && (
        <div className={cards.media}>
          <Image node={props.image} renderContext={renderContext} decorative />
        </div>
      )}
      <div className={cards.body}>
        <Place props={props} className={cards.meta} />
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
        {props.teaser && <p className={cards.teaser}>{props.teaser}</p>}
        <Price amount={props.price} currency={props.currency} note={props.priceNote} />
      </div>
    </article>
  );
};

/** A compact row (classic-templates content list "compact list"): linked city, country, price. */
export const DestinationCompact = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  return (
    <article className={cards.compact} data-testid="ctrv-destination-compact">
      <Styles />
      <Heading level={level} className={cards.compactTitle}>
        <a href={buildNodeUrl(currentNode)}>{title}</a>
      </Heading>
      <Place props={props} className={cards.meta} />
      <Price amount={props.price} currency={props.currency} />
    </article>
  );
};

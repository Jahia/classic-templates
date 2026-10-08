import {
  Island,
  buildNodeUrl,
  jahiaComponent,
  useServerContext,
} from "@jahia/javascript-modules-library";
import { Heading, useHeadingLevel, type Level } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { innerLevel } from "../../../lib/level.js";
import { readReferences } from "../../../lib/props.js";
import { Section } from "../../../lib/Section.js";
import shared from "../../../lib/shared.module.css";
import { Styles } from "../../../lib/Styles.js";
import { readDestination, type DestinationData } from "../../../lib/travel.js";
import { WEATHER_KINDS, type WeatherKind } from "../../../lib/weather.js";
import cards from "../shared/cards.module.css";
import type { Props } from "./types.js";
import classes from "./mosaic.module.css";
import WeatherChip from "./WeatherChip.client.js";

/** How many destinations the mosaic lays out (Figma: 1 to 4 cards). */
const MAX_CARDS = 4;

/**
 * The weather chip of a card (classic-weather action), loaded in the browser on the first hover or
 * focus of the card. Only for a destination with coordinates: the action answers 404 without them.
 */
const Weather = ({ destination }: { destination: DestinationData }) => {
  const t = useT();
  if (destination.latitude === undefined || destination.longitude === undefined) return null;
  const labels = Object.fromEntries(
    WEATHER_KINDS.map((kind) => [kind, t(`weather.kind.${kind}`)]),
  ) as Record<WeatherKind, string>;
  return (
    <Island
      component={WeatherChip}
      clientOnly
      props={{
        url: buildNodeUrl(destination.node, { extension: ".weather.do" }),
        labels,
        prefix: t("weather.now"),
        classes: {
          chip: classes.chip,
          emoji: classes.emoji,
          condition: classes.condition,
          temp: classes.temp,
          visuallyHidden: shared.visuallyHidden,
        },
      }}
    />
  );
};

/**
 * One photo card: the country above the linked city name, over the destination's photo darkened
 * at the bottom, and the current weather while the card is hovered or focused. The whole card is
 * clickable; the photo is decorative (the city name says it all).
 */
const MosaicCard = ({
  destination,
  level,
  large,
}: {
  destination: DestinationData;
  level: Level;
  large: boolean;
}) => {
  const { renderContext } = useServerContext();
  return (
    <article
      className={[classes.card, large && classes.large].filter(Boolean).join(" ")}
      data-testid="ctrv-mosaic-card"
    >
      {destination.image && (
        <Image
          node={destination.image}
          renderContext={renderContext}
          className={classes.photo}
          decorative
        />
      )}
      <div className={classes.details}>
        {destination.country && <p className={classes.country}>{destination.country}</p>}
        <Heading level={level} className={classes.place}>
          <a className={cards.stretched} href={buildNodeUrl(destination.node)}>
            {destination.title}
          </a>
        </Heading>
      </div>
      <Weather destination={destination} />
    </article>
  );
};

/**
 * A mosaic of one to four hand-picked destinations, in the order picked. The cards are read here
 * rather than rendered through a view of the destination, because their size depends on their
 * place in the mosaic; each destination is a cache dependency, so editing one refreshes the
 * mosaic. A destination untitled in this language, deleted or not published is left out; edit mode
 * says how many. Nothing on the live site when no destination is left.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:mosaic", displayName: "Destination mosaic" },
  (props: Props, { currentNode, renderContext }) => {
    const t = useT();
    const level = useHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const picked = readReferences(currentNode, "destinations");
    const shown = picked
      .map((node) => readDestination(node, renderContext))
      .filter((destination) => destination.title)
      .slice(0, MAX_CARDS);
    if (!isEdit && shown.length === 0) return null;
    const title = props["jcr:title"];
    const headingId = `ctrv-mosaic-${currentNode.getIdentifier()}`;
    const cardLevel = innerLevel(level, Boolean(title));
    const leftOut = picked.length - shown.length;
    return (
      <Section
        surface={props.ctplSurface}
        testId="ctrv-mosaic"
        labelledBy={title ? headingId : undefined}
      >
        <Styles />
        <div className="ctpl-container">
          {title && (
            <Heading level={level} id={headingId}>
              {title}
            </Heading>
          )}
          {isEdit && (shown.length === 0 || leftOut > 0) && (
            <p className={cards.panel}>
              {shown.length === 0 ? t("mosaic.empty") : t("mosaic.leftOut", { count: leftOut })}
            </p>
          )}
          {shown.length > 0 && (
            <ul className={classes.mosaic} data-count={shown.length}>
              {shown.map((destination, i) => (
                <li key={destination.node.getIdentifier()}>
                  <MosaicCard
                    destination={destination}
                    level={cardLevel}
                    large={i === 0 || shown.length <= 2}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    );
  },
);

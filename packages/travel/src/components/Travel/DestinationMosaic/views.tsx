import { Island, Render, buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Heading, useHeadingLevel, useParamHeadingLevel } from "../../../lib/Heading.js";
import { useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { innerLevel } from "../../../lib/level.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import shared from "../../../lib/shared.module.css";
import { CONDITIONS } from "../../../lib/weather.js";
import type { Props as DestinationProps } from "../Destination/types.js";
import { Untitled } from "../shared/Untitled.js";
import type { Props } from "./types.js";
import WeatherChip from "./WeatherChip.client.jsx";
import classes from "./mosaic.module.css";

/** The mosaic shows at most this many cards: the layouts are drawn for 1 to 4. */
export const MAX_CARDS = 4;

/**
 * The destination mosaic: an optional heading, then the picked destinations, each rendered through
 * its own `mosaicCard` view, so each card is a cached fragment refreshed when its destination
 * changes. More than four picked: the first four, and an edit-mode note. Nothing live when none
 * resolves here.
 */
export const DestinationMosaic = ({ props }: { props: Props }) => {
  const t = useT();
  const { currentNode, renderContext } = useServerContext();
  const level = useHeadingLevel(currentNode);
  const isEdit = renderContext.isEditMode();
  const picked = (props.destinations ?? []).filter((node): node is JCRNodeWrapper => Boolean(node));
  const destinations = picked.slice(0, MAX_CARDS);
  if (destinations.length === 0) {
    return isEdit ? <p className={shared.hint}>{t("mosaic.empty")}</p> : null;
  }
  const title = props["jcr:title"];
  const headingId = `ctrv-destination-mosaic-${currentNode.getIdentifier()}`;
  return (
    <Section
      surface={props.ctplSurface}
      testId="ctrv-destination-mosaic"
      labelledBy={title ? headingId : undefined}
    >
      <Styles />
      <div className="ctpl-container">
        {title && (
          <Heading level={level} id={headingId}>
            {title}
          </Heading>
        )}
        <ul className={classes.mosaic} data-count={destinations.length}>
          {destinations.map((destination) => (
            <li key={destination.getIdentifier()} className={classes.cell}>
              <Render
                node={destination}
                view="mosaicCard"
                // No edit-mode wrapper around each card: it would break the grid. The cards are
                // edited through the mosaic's destination picker.
                readOnly
                parameters={{ headingLevel: String(innerLevel(level, Boolean(title))) }}
              />
            </li>
          ))}
        </ul>
        {isEdit && picked.length > MAX_CARDS && (
          <p className={shared.hint}>
            {t("mosaic.tooMany", { count: picked.length, max: MAX_CARDS })}
          </p>
        )}
      </div>
    </Section>
  );
};

/**
 * A destination as a mosaic card: its photo, country and city, linked to its page. The image is
 * decorative (the city name says it all), as on the other cards. With coordinates, the card shows
 * the live weather in an island rendered in the browser only: Jahia caches this HTML, so live data
 * must not be baked into it.
 */
export const MosaicCard = ({ props }: { props: DestinationProps }) => {
  const t = useT();
  const level = useParamHeadingLevel();
  const { currentNode, renderContext } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const hasCoordinates = props.latitude !== undefined && props.longitude !== undefined;
  return (
    <article className={classes.card} data-testid="ctrv-mosaic-card">
      <Styles />
      {props.image && (
        <Image
          node={props.image}
          renderContext={renderContext}
          className={classes.image}
          decorative
        />
      )}
      <div className={classes.caption}>
        {props.country && <p className={classes.country}>{props.country}</p>}
        <Heading level={level} className={classes.city}>
          <a className={classes.link} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
      </div>
      {hasCoordinates && (
        <Island
          component={WeatherChip}
          clientOnly
          props={{
            // The classic-weather action on the live destination, called anonymously even from
            // edit mode (see WeatherChip).
            url: buildNodeUrl(currentNode, { extension: ".weather.do", mode: "live" }),
            label: t("weather.now"),
            conditions: Object.fromEntries(
              CONDITIONS.map((condition) => [condition, t(`weather.condition.${condition}`)]),
            ),
          }}
        />
      )}
    </article>
  );
};

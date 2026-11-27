import { jahiaComponent } from "@jahia/javascript-modules-library";
import { Cta } from "../../../lib/Cta.js";
import { EditNote } from "../../../lib/EditNote.js";
import { formatDate, isoDay, today } from "../../../lib/format.js";
import { Heading, useHeadingLevel } from "../../../lib/Heading.js";
import { RAW, useT } from "../../../lib/i18n.js";
import { Image } from "../../../lib/Image.js";
import { languageTag } from "../../../lib/locale.js";
import { Price } from "../../../lib/Price.js";
import { Section } from "../../../lib/Section.js";
import { Styles } from "../../../lib/Styles.js";
import { Untitled } from "../shared/Untitled.js";
import classes from "./gift-offer.module.css";
import type { Props } from "./types.js";

/**
 * A gift with purchase: picture of the gift, the offer's name (the section heading), the gift, the
 * spend that earns it in the market's currency, the last day and the conditions, and a call to
 * action. After its last day the offer leaves the live site (edit mode says so); the fragment
 * expires after an hour, so it leaves on time without a publication.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctcm:giftOffer",
    displayName: "Gift offer",
    properties: { "cache.expiration": "3600" },
  },
  (props: Props, { currentNode, renderContext, currentResource }) => {
    const t = useT();
    const level = useHeadingLevel(currentNode);
    const isEdit = renderContext.isEditMode();
    const title = props["jcr:title"];
    if (!title) return <Untitled message="gift.noTitle" />;
    const lastDay = isoDay(props.endsOn);
    const ended = lastDay !== undefined && lastDay < today();
    if (ended && !isEdit) return null;
    const language = languageTag(currentResource.getLocale());
    const headingId = `ctcm-gift-${currentNode.getIdentifier()}`;
    return (
      <Section surface={props.ctplSurface} testId="ctcm-gift-offer" labelledBy={headingId}>
        <Styles />
        <div className={`ctpl-container ${classes.offer} ${props.image ? classes.withMedia : ""}`}>
          {ended && <EditNote>{t("gift.ended")}</EditNote>}
          {props.image && (
            <div className={classes.media}>
              <Image node={props.image} owner={currentNode} renderContext={renderContext} />
            </div>
          )}
          <div className={classes.text}>
            <Heading level={level} id={headingId} className={classes.title}>
              {title}
            </Heading>
            {props.gift && <p className={classes.gift}>{props.gift}</p>}
            {props.threshold !== undefined && (
              <div className={classes.spend}>
                <span className={classes.spendLabel}>{t("gift.spend")}</span>
                <Price amount={props.threshold} currency={props.currency} from={false} />
              </div>
            )}
            {lastDay && (
              <p className={classes.until}>
                {t("gift.until", {
                  date: formatDate(props.endsOn, language, "long"),
                  ...RAW,
                })}
              </p>
            )}
            {props.conditions && <p className={classes.conditions}>{props.conditions}</p>}
            <Cta node={currentNode} renderContext={renderContext} />
          </div>
        </div>
      </Section>
    );
  },
);

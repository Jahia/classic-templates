import { useServerContext } from "@jahia/javascript-modules-library";
import { formatPrice } from "./format.js";
import { RAW, useT } from "./i18n.js";
import { languageTag } from "./locale.js";
import classes from "./price.module.css";
import shared from "./shared.module.css";

/**
 * A "from" price ("From HKD 1,280"), with its note under it. The visible price writes the currency
 * as its code; screen readers get the same sentence with the currency spelled out ("From 1,280
 * Hong Kong dollars"), since a code is read letter by letter. Nothing when the amount or the
 * currency is missing: never half a price.
 */
export const Price = ({
  amount,
  currency,
  note,
  large = false,
}: {
  amount?: number;
  currency?: string;
  note?: string;
  large?: boolean;
}) => {
  const t = useT();
  const { currentResource } = useServerContext();
  const price = formatPrice(amount, currency, languageTag(currentResource.getLocale()));
  if (!price) return null;
  return (
    <p
      className={large ? `${classes.price} ${classes.large}` : classes.price}
      data-testid="ctrv-price"
    >
      <span className={classes.label} aria-hidden="true">
        {t("price.from")}
      </span>
      <strong className={classes.amount} aria-hidden="true">
        {price.visual}
      </strong>
      <span className={shared.visuallyHidden}>
        {t("price.fromSpoken", { price: price.spoken, ...RAW })}
      </span>
      {note && <span className={classes.note}>{note}</span>}
    </p>
  );
};

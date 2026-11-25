import { buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import type { Props } from "../components/Commerce/Product/types.js";
import { variantNumber, validEntry, type CartEntry } from "./cart.js";
import { formatPrice } from "./format.js";
import { RAW, useT } from "./i18n.js";
import { languageTag } from "./locale.js";
import { productImageUrl } from "./product.js";
import classes from "./add-to-bag.module.css";

/** A multi-valued property as an array, whatever shape the engine hands it in. */
const list = <T,>(value: T[] | T | undefined): T[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

/**
 * The variants a visitor can add to the bag: those with a valid Shopify variant id and price, the
 * cheapest first. None when the product does not come from a shop (no store address).
 */
const entries = (props: Props, product: string, url: string): CartEntry[] => {
  const prices = list(props.prices).map(Number);
  const ids = list(props.variantGqlIds);
  const options = list(props.variantTitles);
  const found = ids.flatMap((gid, index) => {
    const entry = validEntry({
      variant: variantNumber(gid),
      product,
      title: props["jcr:title"],
      option: options[index] ?? "",
      price: prices[index],
      currency: props.currency,
      url,
      image: productImageUrl(props.posterPath) ?? "",
      store: props.storeUrl,
      tags: list(props.shopyTags),
    });
    return entry ? [entry] : [];
  });
  return found.sort((a, b) => a.price - b.price);
};

/**
 * "Add to bag" buttons, rendered hidden: the bag (ctcm:cartButton) reveals and wires them, so a page
 * without a bag shows none. A card offers the cheapest variant; a product page one button per
 * variant, named with the variant and its price. Page Builder shows them, inert.
 */
export const AddToBag = ({ props, all = false }: { props: Props; all?: boolean }) => {
  const t = useT();
  const { currentNode, currentResource, renderContext } = useServerContext();
  const language = languageTag(currentResource.getLocale());
  const found = entries(props, currentNode.getIdentifier(), buildNodeUrl(currentNode));
  const shown = all ? found : found.slice(0, 1);
  if (shown.length === 0) return null;
  const hidden = !renderContext.isEditMode();
  return (
    <div className={all ? classes.options : classes.single}>
      {shown.map((entry) => {
        const price = formatPrice(entry.price, entry.currency, language);
        const named = all && shown.length > 1 && entry.option;
        return (
          <button
            key={entry.variant}
            type="button"
            className={classes.button}
            data-ctcm-add={JSON.stringify(entry)}
            data-testid="ctcm-add-to-bag"
            hidden={hidden}
          >
            {named
              ? t("cart.addOption", { option: entry.option, price: price?.visual ?? "", ...RAW })
              : t("cart.add")}
          </button>
        );
      })}
    </div>
  );
};

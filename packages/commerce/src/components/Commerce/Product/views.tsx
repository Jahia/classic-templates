import { buildNodeUrl, useServerContext } from "@jahia/javascript-modules-library";
import { Heading, useParamHeadingLevel } from "../../../lib/Heading.js";
import { Price } from "../../../lib/Price.js";
import { RichText } from "../../../lib/RichText.js";
import { Styles } from "../../../lib/Styles.js";
import { displayPrice, productImageUrl } from "../../../lib/product.js";
import cards from "../shared/cards.module.css";
import { AddToBag } from "../../../lib/AddToBag.js";
import { Untitled } from "../shared/Untitled.js";
import classes from "./product.module.css";
import type { Props } from "./types.js";

/** A multi-valued property as an array, whatever shape the engine hands it in. */
const list = <T,>(value: T[] | T | undefined): T[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

/** Brand, then product type, as one small line ("Dior · Eau de parfum"). */
const Kicker = ({ props, className }: { props: Props; className: string }) => {
  const parts = [props.vendor, props.productType].filter(Boolean);
  return parts.length > 0 ? <p className={className}>{parts.join(" · ")}</p> : null;
};

const ProductPrice = ({ props, large = false }: { props: Props; large?: boolean }) => {
  const price = displayPrice(list(props.prices));
  return price ? (
    <Price amount={price.amount} currency={props.currency} from={price.from} large={large} />
  ) : null;
};

/**
 * A product card (carousels, brand spotlight, content lists): image, brand and type, the linked
 * name, the price in the shop's currency. The whole card is clickable; the image is decorative
 * (the name says it all). A product untitled in this language renders nothing live.
 */
export const ProductCard = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const image = productImageUrl(props.posterPath);
  return (
    <article className={`${cards.card} ${classes.card}`} data-testid="ctcm-product-card">
      <Styles />
      <div className={`${cards.media} ${classes.media}`}>
        {image && <img src={image} alt="" loading="lazy" decoding="async" />}
      </div>
      <div className={cards.body}>
        <Kicker props={props} className={cards.meta} />
        <Heading level={level} className={cards.title}>
          <a className={cards.stretched} href={buildNodeUrl(currentNode)}>
            {title}
          </a>
        </Heading>
        <ProductPrice props={props} />
        <AddToBag props={props} />
      </div>
    </article>
  );
};

/** A compact row ("shop the look", compact lists): small image, brand, linked name, price. */
export const ProductCompact = ({ props }: { props: Props }) => {
  const level = useParamHeadingLevel();
  const { currentNode } = useServerContext();
  const title = props["jcr:title"];
  if (!title) return <Untitled />;
  const image = productImageUrl(props.posterPath);
  return (
    <article className={classes.compact} data-testid="ctcm-product-compact">
      <Styles />
      <div className={classes.thumb}>{image && <img src={image} alt="" loading="lazy" />}</div>
      <div className={classes.compactBody}>
        <Kicker props={props} className={cards.meta} />
        <Heading level={level} className={cards.compactTitle}>
          <a href={buildNodeUrl(currentNode)}>{title}</a>
        </Heading>
        <ProductPrice props={props} />
      </div>
    </article>
  );
};

/**
 * The product's own page, inside the main-resource template of classic-templates (header, footer,
 * `<title>`). Like the classic-templates news, this view owns the page's only `<h1>`: the product
 * name. The description is HTML written in Shopify: data from another system, sanitised by the
 * module's allow-list before rendering, its headings shifted under the `<h1>`.
 */
export const ProductFull = ({ props }: { props: Props }) => {
  const title = props["jcr:title"];
  const image = productImageUrl(props.posterPath);
  return (
    <article className={classes.full} data-testid="ctcm-product-full">
      <Styles />
      <div className={classes.fullMedia}>
        {image && <img src={image} alt={title ?? ""} decoding="async" fetchPriority="high" />}
      </div>
      <div className={classes.fullBody}>
        <Kicker props={props} className={classes.fullKicker} />
        {title ? <h1 className={classes.fullTitle}>{title}</h1> : <Untitled />}
        <ProductPrice props={props} large />
        <AddToBag props={props} all />
        {/* The page language's description, else the shop's original (a connector without
            translations, a product the shop has not translated). Sanitised by RichText. */}
        <RichText
          html={props.description ?? props.bodyHtml}
          className={classes.description}
          headingLevel={2}
        />
      </div>
    </article>
  );
};

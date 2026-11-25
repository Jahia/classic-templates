import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import {
  MAX_QUANTITY,
  addItem,
  checkoutLinks,
  itemCount,
  parseCart,
  setQuantity,
  storageKey,
  subtotals,
  validEntry,
  type CartItem,
} from "../../../lib/cart.js";
import { formatPrice } from "../../../lib/format.js";
import { RAW } from "../../../lib/i18n.js";
import shared from "../../../lib/shared.module.css";
import classes from "./cart.module.css";

interface Props {
  siteKey: string;
  /** The button's label (the node's jcr:title), empty when the editor left it out. */
  label: string;
  /** Base of the ids the server renders, so that labels and controls point at each other. */
  idBase: string;
  /** Page Builder: the button is drawn, nothing opens and no "Add to bag" button is wired. */
  editMode: boolean;
}

/** Window with the jExperience tracker, when the site runs it. */
interface Tracked {
  wem?: {
    getLoadedContext?: () => { profileId?: string } | undefined;
    buildEvent: (type: string, target: unknown, source: unknown) => unknown;
    buildTarget: (id: string, type: string, properties?: Record<string, unknown>) => unknown;
    buildSourcePage: () => unknown;
    collectEvent: (event: unknown) => void;
  };
  digitalData?: { wemInitConfig?: { activateWem?: boolean } };
}

/**
 * Sends a standard click event to jExperience, only while it tracks this visitor (the tracker is
 * loaded, the visitor consented, a profile exists): the bag works the same without it.
 */
const track = (id: string, type: string, properties: Record<string, unknown>) => {
  const w = globalThis as unknown as Tracked;
  const wem = w.wem;
  if (
    !wem ||
    w.digitalData?.wemInitConfig?.activateWem !== true ||
    !wem.getLoadedContext?.()?.profileId
  )
    return;
  try {
    wem.collectEvent(
      wem.buildEvent("click", wem.buildTarget(id, type, properties), wem.buildSourcePage()),
    );
  } catch {
    // Tracking never stops the bag.
  }
};

const BAG_EVENT = "ctcm-bag";

/** The stored bag as text (the external store React reads), empty when storage is unavailable. */
const readRaw = (siteKey: string): string => {
  try {
    return globalThis.localStorage.getItem(storageKey(siteKey)) ?? "";
  } catch {
    return "";
  }
};

const read = (siteKey: string): CartItem[] => parseCart(readRaw(siteKey));

const write = (siteKey: string, cart: CartItem[]) => {
  try {
    globalThis.localStorage.setItem(storageKey(siteKey), JSON.stringify(cart));
  } catch {
    // A private window without storage: the bag lives for this page only.
  }
  globalThis.dispatchEvent(new Event(BAG_EVENT));
};

/** Changes of the bag: in this page (BAG_EVENT) and in the visitor's other tabs (storage). */
const subscribe = (onChange: () => void) => {
  globalThis.addEventListener(BAG_EVENT, onChange);
  globalThis.addEventListener("storage", onChange);
  return () => {
    globalThis.removeEventListener(BAG_EVENT, onChange);
    globalThis.removeEventListener("storage", onChange);
  };
};

/**
 * The bag: a header button with the number of items, and a drawer (a modal dialog) listing them,
 * with quantities, the subtotal and a link to complete the order in the shop. "Add to bag" buttons
 * anywhere on the page (product cards and pages, rendered hidden by the server) are revealed and
 * wired here, so that a page without a bag shows none.
 */
export default function Cart({ siteKey, label, idBase, editMode }: Props) {
  const { t } = useTranslation("classic-commerce");
  const [announce, setAnnounce] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  // The stored bag, read in the browser only (the server and the first render see an empty one).
  const raw = useSyncExternalStore(
    subscribe,
    () => (editMode ? "" : readRaw(siteKey)),
    () => "",
  );
  const cart = useMemo(() => parseCart(raw), [raw]);
  const language = typeof document === "undefined" ? "en" : document.documentElement.lang || "en";

  const update = useCallback((next: CartItem[]) => write(siteKey, next), [siteKey]);

  // "Add to bag" buttons: shown and wired once the bag is on the page.
  useEffect(() => {
    if (editMode) return;
    const buttons = document.querySelectorAll<HTMLButtonElement>("[data-ctcm-add]");
    buttons.forEach((button) => {
      button.hidden = false;
    });
    const onClick = (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
        "[data-ctcm-add]",
      );
      if (!button) return;
      let entry;
      try {
        entry = validEntry(JSON.parse(button.dataset.ctcmAdd ?? ""));
      } catch {
        entry = undefined;
      }
      if (!entry) return;
      const next = addItem(read(siteKey), entry);
      update(next);
      setAnnounce(
        t("cart.added", {
          title: entry.option ? `${entry.title}, ${entry.option}` : entry.title,
          ...RAW,
        }),
      );
      track(entry.variant, "addToCart", {
        product: entry.product,
        price: entry.price,
        currency: entry.currency,
        tags: entry.tags,
      });
      dialogRef.current?.showModal();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [siteKey, editMode, update, t]);

  const count = itemCount(cart);
  const price = (amount: number, currency: string) => formatPrice(amount, currency, language);

  const checkout = () => {
    const totals = subtotals(cart);
    track("bag", "checkout", {
      items: count,
      total: totals[0]?.amount ?? 0,
      currency: totals[0]?.currency ?? "",
    });
  };

  return (
    <>
      <button
        type="button"
        className={classes.toggle}
        aria-haspopup="dialog"
        aria-controls={`${idBase}-drawer`}
        data-testid="ctcm-cart-button"
        onClick={() => {
          if (!editMode) dialogRef.current?.showModal();
        }}
      >
        <svg className={classes.icon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 7h12l1 13H5L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
        <span>{label || t("cart.title")}</span>
        <span className={classes.badge} data-testid="ctcm-cart-count">
          <span aria-hidden="true">{count}</span>
          <span className={shared.visuallyHidden}>{t("cart.count", { count })}</span>
        </span>
      </button>
      <p className={shared.visuallyHidden} aria-live="polite">
        {announce}
      </p>
      <dialog
        ref={dialogRef}
        id={`${idBase}-drawer`}
        className={classes.drawer}
        aria-labelledby={`${idBase}-title`}
        data-testid="ctcm-cart-drawer"
        onClick={(event) => {
          // A click on the backdrop (the dialog itself, outside its panel) closes it.
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className={classes.panel}>
          <div className={classes.head}>
            <h2 id={`${idBase}-title`} className={classes.title}>
              {label || t("cart.title")}
            </h2>
            <button
              type="button"
              className={classes.close}
              onClick={() => dialogRef.current?.close()}
            >
              {t("cart.close")}
            </button>
          </div>
          {cart.length === 0 ? (
            <p className={classes.empty}>{t("cart.empty")}</p>
          ) : (
            <>
              <ul className={classes.lines} data-testid="ctcm-cart-lines">
                {cart.map((item) => {
                  const unit = price(item.price, item.currency);
                  return (
                    <li key={item.variant} className={classes.line} data-testid="ctcm-cart-line">
                      {item.image && <img src={item.image} alt="" className={classes.thumb} />}
                      <div className={classes.info}>
                        {item.url ? (
                          <a href={item.url} className={classes.name}>
                            {item.title}
                          </a>
                        ) : (
                          <span className={classes.name}>{item.title}</span>
                        )}
                        {item.option && <span className={classes.option}>{item.option}</span>}
                        {unit && (
                          <span className={classes.price}>
                            <span aria-hidden="true">{unit.visual}</span>
                            <span className={shared.visuallyHidden}>{unit.spoken}</span>
                          </span>
                        )}
                      </div>
                      <div
                        className={classes.quantity}
                        role="group"
                        aria-label={t("cart.quantityOf", { title: item.title, ...RAW })}
                      >
                        <button
                          type="button"
                          aria-label={t("cart.less")}
                          onClick={() => update(setQuantity(cart, item.variant, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span data-testid="ctcm-cart-quantity">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={t("cart.more")}
                          disabled={item.quantity >= MAX_QUANTITY}
                          onClick={() => update(setQuantity(cart, item.variant, item.quantity + 1))}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className={classes.remove}
                        onClick={() => update(setQuantity(cart, item.variant, 0))}
                      >
                        {t("cart.remove")}
                        <span className={shared.visuallyHidden}> {item.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <dl className={classes.total}>
                {subtotals(cart).map(({ currency, amount }) => {
                  const total = price(amount, currency);
                  return (
                    <div key={currency}>
                      <dt>{t("cart.subtotal")}</dt>
                      <dd data-testid="ctcm-cart-subtotal">{total?.visual}</dd>
                    </div>
                  );
                })}
              </dl>
              <p className={classes.note}>{t("cart.checkoutNote")}</p>
              {checkoutLinks(cart).map(({ store, url }) => (
                <a
                  key={store}
                  href={url}
                  className={classes.checkout}
                  onClick={checkout}
                  data-testid="ctcm-cart-checkout"
                >
                  {t("cart.checkout")}
                </a>
              ))}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}

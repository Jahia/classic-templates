/** Schemes a contributed external URL may use. Anything else (javascript:, data:, ...) is dropped. */
const SAFE_EXTERNAL = /^(?:https?:\/\/|mailto:|tel:)/i;

/** True when `url` uses a scheme a visitor may safely be sent to. */
export const isSafeExternalUrl = (url: string): boolean => SAFE_EXTERNAL.test(url.trim());

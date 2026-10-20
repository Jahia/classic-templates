/** Days a consent choice is kept when the editor sets nothing, and the range the type accepts. */
export const CONSENT_DEFAULT_DAYS = 180;
const CONSENT_MAX_DAYS = 395; // 13 months, the longest a consent cookie may live (CNIL)

/**
 * Days the consent banner keeps the visitor's choice: the editor's value rounded and kept within
 * 1-395 (the CND constraint), 180 when it is missing or not a number. The view applies it again
 * because a value written over GraphQL or an import is not always checked against the constraint.
 */
export const consentDays = (value: unknown): number => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n === 0) return CONSENT_DEFAULT_DAYS;
  return Math.min(Math.max(n, 1), CONSENT_MAX_DAYS);
};

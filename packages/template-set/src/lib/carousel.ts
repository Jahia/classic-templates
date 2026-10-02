/** Seconds a slide stays on screen during autoplay: default, minimum (WCAG 2.2.2) and maximum. */
export const CAROUSEL_DEFAULT_INTERVAL = 7;
const CAROUSEL_MIN_INTERVAL = 5;
const CAROUSEL_MAX_INTERVAL = 30;

/**
 * Seconds per slide for an autoplaying carousel: the editor's value rounded and kept within 5-30
 * (the CND constraint), 7 when it is missing or not a number. Applied again here because a value
 * written over GraphQL or an import is not always checked against the constraint, and a carousel
 * must never move faster than once every 5 seconds.
 */
export const carouselInterval = (value: unknown): number => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n === 0) return CAROUSEL_DEFAULT_INTERVAL;
  return Math.min(Math.max(n, CAROUSEL_MIN_INTERVAL), CAROUSEL_MAX_INTERVAL);
};

/**
 * Who a call to action is shown to (ctplmix:cta ctaAudience): everyone, only visitors who are not
 * signed in (a "Sign in" button), or only signed-in visitors.
 */
export type Audience = "everyone" | "guests" | "members";

/** The audience stored on a node; anything else, an absent value included, is "everyone". */
export const audienceOf = (value: string | undefined): Audience =>
  value === "guests" || value === "members" ? value : "everyone";

/** Whether a visitor, signed in or not, sees a call to action limited to `audience`. */
export const showsTo = (audience: Audience, signedIn: boolean): boolean =>
  audience === "everyone" || (audience === "members") === signedIn;

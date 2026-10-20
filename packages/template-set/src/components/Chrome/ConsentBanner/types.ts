export interface Props {
  /** Heading of the banner, for example "Your privacy". */
  "jcr:title"?: string;
  /** Explanation shown in the banner. */
  "text"?: string;
  /** Label of the button that accepts tracking. */
  "acceptLabel"?: string;
  /** Label of the button that refuses tracking, shown as prominently as the accept button. */
  "refuseLabel"?: string;
  /** Label of the always-visible button that opens the banner again ("Privacy settings"). */
  "settingsLabel"?: string;
  /** Days the visitor's choice is kept before the banner asks again (1 to 395, 180 by default). */
  "rememberDays"?: number;
  /** Text of the privacy-policy link. */
  "ctaLabel"?: string;
  "j:linkType"?: "none" | "internal" | "external";
}

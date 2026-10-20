import type { JCRNodeWrapper } from "org.jahia.services.content";

// The template set's src/lib/moderation.ts, copied: the two bundles share no code.

/** The property of ctplmix:moderated that says where a submitted item stands. */
export const MODERATION_PROPERTY = "moderationStatus";

/**
 * Whether a list may show an item with this moderation status: an item that is not moderated (no
 * status) or one that was accepted. Submitted, in review and declined items stay out of every
 * public list, whoever reads it: a list is cached for many visitors, and the authors who may open
 * their own pending item must never put it in a list another visitor is served.
 */
export const isListedStatus = (status: string | undefined): boolean =>
  status === undefined || status === "accepted";

/** Whether a list may show `node` (see isListedStatus). */
export const isListedItem = (node: JCRNodeWrapper): boolean =>
  isListedStatus(
    node.hasProperty(MODERATION_PROPERTY)
      ? node.getProperty(MODERATION_PROPERTY).getString() || undefined
      : undefined,
  );

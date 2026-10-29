package org.jahia.modules.classic.moderation;

/**
 * The rule of moderated content (the {@code ctplmix:moderated} mixin of the classic-templates template set): an item is
 * open to every visitor exactly when its status is "accepted".
 *
 * <p>Pure and stateless: {@link ModerationService} reads the node and applies the decision.</p>
 */
public final class Moderation {

    /** The mixin of moderated content. */
    public static final String MIXIN = "ctplmix:moderated";
    /** Its status property: submitted, inReview, accepted or declined. */
    public static final String STATUS = "moderationStatus";
    /** The only status that opens an item. */
    public static final String ACCEPTED = "accepted";

    /** What to do with an item after its status changed. */
    public enum Action {
        /** Grant read to every visitor, then publish the item and its files. */
        OPEN,
        /** Withdraw the read granted by {@link #OPEN}, then publish the change. */
        CLOSE,
        /** Nothing to change: already in the state its status asks for. */
        NONE
    }

    private Moderation() {
    }

    /**
     * @param status the item's moderation status, {@code null} when absent
     * @param open   whether the item is open to every visitor already (it carries the grant {@link #OPEN} writes)
     * @return what to do: open an accepted item that is still closed, close an item that is open while not accepted,
     *         nothing otherwise. Saving an accepted item again therefore never publishes it again.
     */
    public static Action decide(String status, boolean open) {
        boolean accepted = ACCEPTED.equals(status);
        if (accepted && !open) {
            return Action.OPEN;
        }
        if (!accepted && open) {
            return Action.CLOSE;
        }
        return Action.NONE;
    }

    /**
     * @param eventPath the path of a changed property
     * @return the path of the node that holds it when the property is the moderation status, {@code null} otherwise
     */
    public static String ownerOfStatus(String eventPath) {
        String suffix = "/" + STATUS;
        if (eventPath == null || !eventPath.endsWith(suffix) || eventPath.length() == suffix.length()) {
            return null;
        }
        return eventPath.substring(0, eventPath.length() - suffix.length());
    }
}

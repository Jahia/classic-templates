package org.jahia.modules.classic.moderation;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ModerationTest {

    @Test
    void anAcceptedItemThatIsStillClosedIsOpened() {
        // Verifies the transition that publishes: accepted, not open yet.
        assertEquals(Moderation.Action.OPEN, Moderation.decide("accepted", false));
    }

    @Test
    void anAcceptedItemAlreadyOpenIsLeftAlone() {
        // Verifies that saving an accepted item again publishes nothing.
        assertEquals(Moderation.Action.NONE, Moderation.decide("accepted", true));
    }

    @Test
    void anOpenItemThatLeavesAcceptedIsClosed() {
        // Verifies the withdrawal: declined, back in review or submitted while open.
        assertEquals(Moderation.Action.CLOSE, Moderation.decide("declined", true));
        assertEquals(Moderation.Action.CLOSE, Moderation.decide("inReview", true));
        assertEquals(Moderation.Action.CLOSE, Moderation.decide(null, true));
    }

    @Test
    void aClosedItemThatIsNotAcceptedIsLeftAlone() {
        // Verifies that a new submission, or a declined one, changes nothing.
        assertEquals(Moderation.Action.NONE, Moderation.decide("submitted", false));
        assertEquals(Moderation.Action.NONE, Moderation.decide("declined", false));
        assertEquals(Moderation.Action.NONE, Moderation.decide("Accepted", false));
    }

    @Test
    void theOwnerOfAStatusPropertyIsItsNode() {
        // Verifies the path a listener event gives for the status property.
        assertEquals("/sites/s/contents/stories/supplied/acme/story",
                Moderation.ownerOfStatus("/sites/s/contents/stories/supplied/acme/story/moderationStatus"));
    }

    @Test
    void anyOtherPropertyHasNoOwner() {
        // Verifies that other properties, and a bare name, are ignored.
        assertNull(Moderation.ownerOfStatus("/sites/s/contents/story/moderationNote"));
        assertNull(Moderation.ownerOfStatus("/sites/s/contents/story/xmoderationStatus"));
        assertNull(Moderation.ownerOfStatus("/moderationStatus"));
        assertNull(Moderation.ownerOfStatus(null));
    }
}

package org.jahia.modules.classic.moderation;

import org.jahia.services.content.DefaultEventListener;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

import javax.jcr.RepositoryException;
import javax.jcr.observation.Event;
import javax.jcr.observation.EventIterator;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Watches the moderation status of content in the default workspace (where editors work) and hands each item whose
 * status was set to {@link ModerationService}, with the user who set it. Events of the live workspace and those
 * replayed during a publication are ignored.
 */
@Component(service = DefaultEventListener.class, immediate = true)
public class ModerationListener extends DefaultEventListener {

    private ModerationService moderation;

    public ModerationListener() {
        setWorkspace(ModerationService.DEFAULT_WORKSPACE);
        setAvailableDuringPublish(false);
    }

    @Reference
    void setModeration(ModerationService moderation) {
        this.moderation = moderation;
    }

    @Override
    public int getEventTypes() {
        return Event.PROPERTY_ADDED | Event.PROPERTY_CHANGED;
    }

    @Override
    public String getPath() {
        return "/sites";
    }

    @Override
    public void onEvent(EventIterator events) {
        Map<String, String> changed = new LinkedHashMap<>();
        while (events.hasNext()) {
            Event event = events.nextEvent();
            try {
                String owner = Moderation.ownerOfStatus(event.getPath());
                if (owner != null && !isExternal(event)) {
                    changed.put(owner, event.getUserID());
                }
            } catch (RepositoryException e) {
                // an event whose path cannot be read concerns nothing this listener handles
            }
        }
        changed.forEach(moderation::statusChanged);
    }
}

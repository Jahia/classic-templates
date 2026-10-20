package org.jahia.modules.classic.moderation;

import org.jahia.services.content.ComplexPublicationService;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.JCRTemplate;
import org.jahia.services.content.JCRValueWrapper;
import org.jahia.services.content.decorator.JCRSiteNode;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.usermanager.JahiaUserManagerService;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.ItemNotFoundException;
import javax.jcr.PathNotFoundException;
import javax.jcr.PropertyIterator;
import javax.jcr.PropertyType;
import javax.jcr.RepositoryException;
import javax.jcr.Value;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Applies the rule of moderated content after its status changed: an accepted item and the files it references in its
 * site are opened to every visitor ({@code reader} granted to {@code u:guest} and {@code g:users} on each) and published
 * in every language of the site; an item that leaves "accepted" is closed again (those grants revoked on the item) and
 * the change published.
 *
 * <p>Security: only a user who may publish the item can trigger it. The check runs with that user's own session
 * ({@link #mayPublish}); the change then runs with a system session in the default workspace, because the item lives
 * in a folder whose rights the editor does not manage. A contributor who can edit the item but not publish it changes
 * the status without effect, and the platform's publication workflow stays the only way for them.</p>
 *
 * <p>Threading: a stateless singleton; every session lives inside one call.</p>
 */
@Component(service = ModerationService.class)
public class ModerationService {

    private static final Logger log = LoggerFactory.getLogger(ModerationService.class);

    static final String DEFAULT_WORKSPACE = "default";
    static final String GUEST = "u:guest";
    static final String USERS = "g:users";
    static final Set<String> READER = Collections.singleton("reader");
    /** The access-control entry a grant of a role to guest writes under the node's {@code j:acl}. */
    static final String GUEST_GRANT = "GRANT_u_guest";
    /** An editorial item of the template set (news, articles, stories): dated by {@link #PUBLICATION_DATE}. */
    static final String EDITORIAL_ITEM = "ctplmix:editorialItem";
    static final String PUBLICATION_DATE = "publicationDate";

    private ComplexPublicationService publication;

    @Reference
    void setPublication(ComplexPublicationService publication) {
        this.publication = publication;
    }

    /**
     * Opens, closes or leaves the moderated item at {@code nodePath} according to its status.
     *
     * @param nodePath the item whose status changed
     * @param userId   the user who changed it (the event's user)
     */
    public void statusChanged(String nodePath, String userId) {
        try {
            if (!mayPublish(nodePath, userId)) {
                log.info("[Moderation] {} changed the status of {} but may not publish it: nothing opened or closed", userId, nodePath);
                return;
            }
            JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(null, DEFAULT_WORKSPACE, null, session -> {
                apply(session, nodePath);
                return null;
            });
        } catch (RepositoryException | RuntimeException e) {
            log.warn("[Moderation] Could not apply the status of {}", nodePath, e);
        }
    }

    /** Whether {@code userId} holds the {@code publish} permission on the item, checked with their own session. */
    boolean mayPublish(String nodePath, String userId) throws RepositoryException {
        JCRUserNode user = userId == null ? null : JahiaUserManagerService.getInstance().lookupUser(userId);
        if (user == null) {
            return false;
        }
        Boolean allowed = JCRTemplate.getInstance().doExecute(user.getJahiaUser(), DEFAULT_WORKSPACE, null, session -> {
            try {
                return session.getNode(nodePath).hasPermission("publish");
            } catch (PathNotFoundException e) {
                return false;
            }
        });
        return Boolean.TRUE.equals(allowed);
    }

    private void apply(JCRSessionWrapper session, String nodePath) throws RepositoryException {
        JCRNodeWrapper node;
        try {
            node = session.getNode(nodePath);
        } catch (PathNotFoundException e) {
            return;
        }
        if (!node.isNodeType(Moderation.MIXIN)) {
            return;
        }
        String status = node.hasProperty(Moderation.STATUS) ? node.getProperty(Moderation.STATUS).getString() : null;
        Moderation.Action action = Moderation.decide(status, isOpen(node));
        if (action == Moderation.Action.NONE) {
            return;
        }
        JCRSiteNode site = node.getResolveSite();
        List<String> published = new ArrayList<>();
        published.add(node.getIdentifier());
        if (action == Moderation.Action.OPEN) {
            open(node);
            dateIfMissing(node, Calendar.getInstance());
            for (JCRNodeWrapper file : filesOf(node, site.getPath())) {
                open(file);
                published.add(file.getIdentifier());
            }
        } else {
            // the files stay open: another accepted item may show them, and a file alone is not the content
            node.revokeRolesForPrincipal(GUEST);
            node.revokeRolesForPrincipal(USERS);
        }
        session.save();
        publication.publish(published, new ArrayList<>(site.getLanguages()), session);
        log.info("[Moderation] {} {} ({} node(s) published)", action == Moderation.Action.OPEN ? "Opened" : "Closed", nodePath, published.size());
    }

    private static void open(JCRNodeWrapper node) throws RepositoryException {
        node.grantRoles(GUEST, READER);
        node.grantRoles(USERS, READER);
    }

    /**
     * Dates an accepted editorial item that has no publication date with the moment it is accepted: lists order items
     * by that date, newest first, and an undated one would never reach the top of a feed.
     *
     * @return whether a date was written
     */
    static boolean dateIfMissing(JCRNodeWrapper node, Calendar now) throws RepositoryException {
        if (!node.isNodeType(EDITORIAL_ITEM) || node.hasProperty(PUBLICATION_DATE)) {
            return false;
        }
        node.setProperty(PUBLICATION_DATE, now);
        return true;
    }

    /** Whether the item carries the grant {@link #open} writes. */
    static boolean isOpen(JCRNodeWrapper node) throws RepositoryException {
        return node.hasNode("j:acl") && node.getNode("j:acl").hasNode(GUEST_GRANT);
    }

    /**
     * The files ({@code jnt:file}) the item references, from its own properties and its translations, that sit in
     * {@code sitePath}: a story's picture, an audio file, its captions. A file of another site is never opened.
     */
    static List<JCRNodeWrapper> filesOf(JCRNodeWrapper node, String sitePath) throws RepositoryException {
        Map<String, JCRNodeWrapper> files = new LinkedHashMap<>();
        collect(node, sitePath, files);
        for (JCRNodeWrapper child : node.getNodes()) {
            if (child.getName().startsWith("j:translation_")) {
                collect(child, sitePath, files);
            }
        }
        return new ArrayList<>(files.values());
    }

    private static void collect(JCRNodeWrapper holder, String sitePath, Map<String, JCRNodeWrapper> files) throws RepositoryException {
        for (PropertyIterator it = holder.getProperties(); it.hasNext(); ) {
            JCRPropertyWrapper property = (JCRPropertyWrapper) it.nextProperty();
            int type = property.getType();
            if (type != PropertyType.REFERENCE && type != PropertyType.WEAKREFERENCE) {
                continue;
            }
            Value[] values = property.isMultiple() ? property.getValues() : new Value[] {property.getValue()};
            for (Value value : values) {
                JCRNodeWrapper target = targetOf(value);
                if (target != null && target.isNodeType("jnt:file") && target.getPath().startsWith(sitePath + "/")) {
                    files.put(target.getIdentifier(), target);
                }
            }
        }
    }

    private static JCRNodeWrapper targetOf(Value value) throws RepositoryException {
        try {
            return value instanceof JCRValueWrapper ? (JCRNodeWrapper) ((JCRValueWrapper) value).getNode() : null;
        } catch (ItemNotFoundException | PathNotFoundException e) {
            return null; // a reference to a deleted node
        }
    }
}

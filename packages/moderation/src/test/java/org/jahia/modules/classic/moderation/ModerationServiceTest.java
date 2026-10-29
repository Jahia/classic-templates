package org.jahia.modules.classic.moderation;

import org.jahia.services.content.JCRNodeIteratorWrapper;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.content.JCRValueWrapper;
import org.junit.jupiter.api.Test;

import javax.jcr.PropertyIterator;
import javax.jcr.PropertyType;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ModerationServiceTest {

    private static JCRNodeWrapper file(String path, String id) throws Exception {
        JCRNodeWrapper file = mock(JCRNodeWrapper.class);
        when(file.getPath()).thenReturn(path);
        when(file.getIdentifier()).thenReturn(id);
        when(file.isNodeType(anyString())).thenAnswer(invocation -> "jnt:file".equals(invocation.getArgument(0)));
        return file;
    }

    private static JCRPropertyWrapper reference(JCRNodeWrapper... targets) throws Exception {
        JCRPropertyWrapper property = mock(JCRPropertyWrapper.class);
        when(property.getType()).thenReturn(PropertyType.WEAKREFERENCE);
        when(property.isMultiple()).thenReturn(targets.length > 1);
        JCRValueWrapper[] values = new JCRValueWrapper[targets.length];
        for (int i = 0; i < targets.length; i++) {
            JCRValueWrapper value = mock(JCRValueWrapper.class);
            when(value.getNode()).thenReturn(targets[i]);
            values[i] = value;
        }
        when(property.getValues()).thenReturn(values);
        if (targets.length > 0) {
            when(property.getValue()).thenReturn(values[0]);
        }
        return property;
    }

    private static PropertyIterator properties(JCRPropertyWrapper... list) {
        Iterator<JCRPropertyWrapper> it = Arrays.asList(list).iterator();
        PropertyIterator properties = mock(PropertyIterator.class);
        when(properties.hasNext()).thenAnswer(invocation -> it.hasNext());
        when(properties.nextProperty()).thenAnswer(invocation -> it.next());
        return properties;
    }

    private static JCRNodeIteratorWrapper noChildren() {
        JCRNodeIteratorWrapper children = mock(JCRNodeIteratorWrapper.class);
        when(children.iterator()).thenReturn(java.util.Collections.emptyIterator());
        when(children.hasNext()).thenReturn(false);
        return children;
    }

    @Test
    void anAcceptedEditorialItemWithoutDateIsDatedNow() throws Exception {
        // Verifies that an undated story gets the moment of acceptance, so it reaches the top of the feeds.
        JCRNodeWrapper item = mock(JCRNodeWrapper.class);
        when(item.isNodeType("ctplmix:editorialItem")).thenReturn(true);
        java.util.Calendar now = java.util.Calendar.getInstance();
        assertTrue(ModerationService.dateIfMissing(item, now));
        org.mockito.Mockito.verify(item).setProperty("publicationDate", now);
    }

    @Test
    void aDatedItemOrOneThatIsNotEditorialKeepsItsDate() throws Exception {
        // Verifies that an editor's date is kept, and that a non-editorial item is never dated.
        JCRNodeWrapper dated = mock(JCRNodeWrapper.class);
        when(dated.isNodeType("ctplmix:editorialItem")).thenReturn(true);
        when(dated.hasProperty("publicationDate")).thenReturn(true);
        assertFalse(ModerationService.dateIfMissing(dated, java.util.Calendar.getInstance()));
        JCRNodeWrapper other = mock(JCRNodeWrapper.class);
        assertFalse(ModerationService.dateIfMissing(other, java.util.Calendar.getInstance()));
        org.mockito.Mockito.verify(other, org.mockito.Mockito.never()).setProperty(anyString(), org.mockito.ArgumentMatchers.any(java.util.Calendar.class));
    }

    @Test
    void anItemIsOpenWhenItsAclHoldsTheGuestGrant() throws Exception {
        // Verifies the open state read from the access-control entries.
        JCRNodeWrapper acl = mock(JCRNodeWrapper.class);
        when(acl.hasNode("GRANT_u_guest")).thenReturn(true);
        JCRNodeWrapper item = mock(JCRNodeWrapper.class);
        when(item.hasNode("j:acl")).thenReturn(true);
        when(item.getNode("j:acl")).thenReturn(acl);
        assertTrue(ModerationService.isOpen(item));
    }

    @Test
    void anItemWithoutAclOrWithoutTheGrantIsClosed() throws Exception {
        // Verifies the closed state: no j:acl, or one without the guest grant.
        JCRNodeWrapper bare = mock(JCRNodeWrapper.class);
        assertFalse(ModerationService.isOpen(bare));
        JCRNodeWrapper acl = mock(JCRNodeWrapper.class);
        JCRNodeWrapper item = mock(JCRNodeWrapper.class);
        when(item.hasNode("j:acl")).thenReturn(true);
        when(item.getNode("j:acl")).thenReturn(acl);
        assertFalse(ModerationService.isOpen(item));
    }

    @Test
    void theFilesOfTheSiteThatTheItemReferencesAreCollectedOnce() throws Exception {
        // Verifies that a picture referenced twice counts once, and that another site's file and a non-file are left out.
        JCRNodeWrapper picture = file("/sites/signal/files/supplied/acme/photo.jpg", "p1");
        JCRNodeWrapper elsewhere = file("/sites/portal/files/x.jpg", "p2");
        JCRNodeWrapper page = mock(JCRNodeWrapper.class);
        when(page.getPath()).thenReturn("/sites/signal/home/briefs");
        when(page.getIdentifier()).thenReturn("b1");
        JCRNodeWrapper item = mock(JCRNodeWrapper.class);
        JCRPropertyWrapper image = reference(picture);
        JCRPropertyWrapper gallery = reference(picture, elsewhere);
        JCRPropertyWrapper brief = reference(page);
        PropertyIterator all = properties(image, gallery, brief);
        when(item.getProperties()).thenReturn(all);
        JCRNodeIteratorWrapper children = noChildren();
        when(item.getNodes()).thenReturn(children);
        List<JCRNodeWrapper> files = ModerationService.filesOf(item, "/sites/signal");
        assertEquals(1, files.size());
        assertEquals("p1", files.get(0).getIdentifier());
    }
}

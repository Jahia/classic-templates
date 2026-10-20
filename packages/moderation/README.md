# classic-moderation

An OSGi bundle for the classic-templates template set: it opens **moderated content**
(`ctplmix:moderated`) to every visitor and publishes it once an editor accepts it.

- A listener watches `moderationStatus` in the default workspace (where editors work).
- When an editor who holds the **publish** permission on the item sets it to `accepted`, the bundle
  grants `reader` to `u:guest` and `g:users` on the item and on the files (`jnt:file`) it references
  in its own site, from its properties and its translations, then publishes them in every language
  of the site.
- When the status of an open item leaves `accepted`, the item's grants are revoked and the change
  published (its files stay readable: another page may show them).
- It acts on a change only: saving an accepted item again publishes nothing.
- A user who may edit the item but not publish it changes the status without effect (logged).

Lists of the template set and of classic-media leave out moderated items that are not accepted
whatever this bundle does; the bundle only decides who may open the item. Store submitted items in
a folder whose rights let only their authors and the editors read them.

Build with the repository (`mvn clean install` at the root, JDK 17). Java package
`org.jahia.modules.classic.moderation`; editor guide: [docs/guides/moderated-content.md](../../docs/guides/moderated-content.md).

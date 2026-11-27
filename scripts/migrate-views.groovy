/*
 * classic-templates 0.13.0: moves the renderings chosen by a legacy choice field to the view chosen
 * in Layout > Select a view (j:view, jmix:renderable), so each rendering is a view of its own:
 *
 * - ctpl:cardGrid    display      "iconTiles" / "logos" -> j:view "iconTiles" / "logos", display = "cards"
 * - ctpl:siteHeader  headerLayout "twoRows"            -> j:view "twoRows",            headerLayout = "oneRow"
 *
 * The legacy field is set back to its default so it no longer competes with j:view: an editor who
 * later picks the default view gets it. Nodes already on the default value are left alone.
 *
 * Run once with DRY_RUN = true, read the log, run with DRY_RUN = false, then run again: the summary
 * must show nothing to migrate.
 *
 * Writes the default workspace only, as root with a system session (it rewrites content no single
 * user authored), and does not publish: live keeps the legacy value until the next publication, and
 * the default views still read it, so visitors see no change. A node whose j:view is already set to
 * another view is logged and left alone (conflict). Run it through the provisioning API:
 *
 *   printf -- "- executeScript: 'migrate-views.groovy'\n" > migrate.yaml
 *   curl -sS -u root:<password> -F "script=@migrate.yaml;type=text/yaml" \
 *     -F "file=@scripts/migrate-views.groovy" <Jahia URL>/modules/api/provisioning
 *
 * and read the lines of the "migrate-views" logger in the Jahia log.
 */
import javax.jcr.query.Query
import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRNodeWrapper
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.usermanager.JahiaUserManagerService
import org.slf4j.LoggerFactory

final boolean DRY_RUN = true

/* type, legacy property, its default (the default view), the values that are views of their own */
final List<Map> MOVES = [
        [type: "ctpl:cardGrid", property: "display", fallback: "cards", views: ["iconTiles", "logos"]],
        [type: "ctpl:siteHeader", property: "headerLayout", fallback: "oneRow", views: ["twoRows"]],
]

final int BATCH = 500
final def logger = LoggerFactory.getLogger("migrate-views")
final def root = JahiaUserManagerService.getInstance().lookupRootUser().getJahiaUser()

JCRTemplate.getInstance().doExecuteWithSystemSessionAsUser(root, "default", null, { JCRSessionWrapper session ->
    def counts = [migrated: 0, defaultView: 0, unknownValue: 0, conflict: 0, locked: 0]
    MOVES.each { Map move ->
        def nodes = session.getWorkspace().getQueryManager()
                .createQuery("SELECT * FROM [" + move.type + "] WHERE ISDESCENDANTNODE('/sites')", Query.JCR_SQL2)
                .execute().getNodes()
        nodes.each { JCRNodeWrapper node ->
            String value = node.hasProperty(move.property) ? node.getProperty(move.property).getString() : null
            if (value == null || value == move.fallback) {
                counts.defaultView++
                return
            }
            if (!move.views.contains(value)) {
                logger.warn("{}: {}='{}' is not a value of {}: left alone", node.getPath(), move.property, value, move.type)
                counts.unknownValue++
                return
            }
            String view = node.hasProperty("j:view") ? node.getProperty("j:view").getString() : null
            if (view && view != "default" && view != value) {
                logger.warn("{}: {}='{}' but j:view='{}' is already set: left alone, check it in Page Builder",
                        node.getPath(), move.property, value, view)
                counts.conflict++
                return
            }
            if (node.isLocked()) {
                // Usually an editor holding the node open in Content Editor; the system session writes through it
                logger.warn("{} is locked by {}: migrated anyway, tell its editor before they save", node.getPath(), node.getLockOwner())
                counts.locked++
            }
            logger.info("{}: {}='{}' -> j:view='{}', {}='{}'{}", node.getPath(), move.property, value, value,
                    move.property, move.fallback, DRY_RUN ? " (dry run)" : "")
            counts.migrated++
            if (!DRY_RUN) {
                session.checkout(node)
                node.setProperty("j:view", value)
                node.setProperty(move.property, move.fallback)
                if (counts.migrated % BATCH == 0) {
                    session.save()
                }
            }
        }
    }
    if (!DRY_RUN) {
        session.save()
    }
    logger.info("migrate-views done{}: {}", DRY_RUN ? " (dry run, nothing saved)" : "", counts)
    return null
} as JCRCallback)

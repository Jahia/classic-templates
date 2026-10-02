# classic-templates

Monorepo of three Jahia packages, one version (root `pom.xml`):

- `packages/template-set`: the classic-templates JavaScript template set (React 19, Vite),
  namespaces `ctpl` / `ctplmix`.
- `packages/travel`: classic-travel, a JavaScript module on the template set, namespaces `ctrv` /
  `ctrvmix`.
- `packages/prepackaged-site`: the `classic-dev` demo site as a pre-packaged project, written by
  `scripts/export-prepackaged.py`.

Start with [`.agents/README.md`](.agents/README.md): it maps each task to the AIStartupKit skill to
use, lists the non-negotiables, and links the architecture decisions and the gates a change must
pass.

- Build and deploy a JavaScript package from its folder: `yarn build && yarn deploy` (never
  `yarn dev` from an agent). Build everything as the CI does: `mvn clean install` at the root
  (Java 17).
- Local Jahia: http://localhost:8080, `root` / `root1234`.
- Every GraphQL `curl` sends `-H "Origin: http://localhost:8080"`; content operations go through the
  `jahia` MCP server first.

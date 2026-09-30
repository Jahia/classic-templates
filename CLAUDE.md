# classic-templates

Jahia JavaScript template set (React 19, Vite), namespaces `ctpl` / `ctplmix`.

Start with [`.agents/README.md`](.agents/README.md): it maps each task to the AIStartupKit skill to
use, lists this module's non-negotiables, and links the architecture decisions and the gates a
change must pass.

- Build and deploy: `yarn build && yarn deploy` (never `yarn dev` from an agent).
- Local Jahia: http://localhost:8080, `root` / `root1234`.
- Every GraphQL `curl` sends `-H "Origin: http://localhost:8080"`; content operations go through the
  `jahia` MCP server first.

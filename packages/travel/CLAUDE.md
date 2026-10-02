# classic-travel

Jahia JavaScript module (React 19, Vite), namespaces `ctrv` (types) / `ctrvmix` (mixins), a
companion of the classic-templates template set (declared module dependency).

Start with [`.agents/README.md`](.agents/README.md): it maps each task to the AIStartupKit skill to
use, lists this module's non-negotiables, and links the architecture decisions and the gates.

- Build and deploy: `yarn build && yarn deploy` (never `yarn dev` from an agent).
- Local Jahia: http://localhost:8080, `root` / `root1234`.
- Every GraphQL `curl` sends `-H "Origin: http://localhost:8080"`; content operations go through the
  `jahia` MCP server first.

# Gates

A change is done when every gate below passes. Run them from the module root (Node 22:
`source ~/.nvm/nvm.sh && nvm use 22`), with `AISTARTUPKIT` set to the AIStartupKit checkout.

| Gate               | Command                                                                                                                                                                                                         | Passes when                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Type-check + build | `yarn build`                                                                                                                                                                                                    | exit 0, `dist/package.tgz` produced                                                |
| Unit tests         | `TZ=UTC yarn test` (also under another time zone when touching dates)                                                                                                                                           | all pass                                                                           |
| Lint + format      | `yarn lint && yarn prettier --check .`                                                                                                                                                                          | no error                                                                           |
| CND                | `node $AISTARTUPKIT/.agents/skills/jahia-dev-review-cnd/scripts/check-cnd.mjs .`                                                                                                                                | PASS                                                                               |
| No literal colours | `yarn check:tokens`                                                                                                                                                                                             | nothing outside the classic-templates tokens                                       |
| Deploy             | `yarn deploy`, then `curl -s -u root:root1234 http://localhost:8080/modules/api/bundles/org.jahia.modules.javascript/classic-travel/*/_info`                                                                    | `ACTIVE` / `STARTED`, and the `ctrv:*` types listed by GraphQL `jcr { nodeTypes }` |
| Live check         | `python3 scripts/seed-test-site.py` (site `ctrv-test`), then axe (all rules) on the travel page, a destination and a fare offer, EN and FR, light and dark (site settings `ctplColorScheme`), and 320 px reflow | no violation, no horizontal scroll                                                 |

## Traps met while setting up

- `0.Modules/` has its own `package.json`: the committed `yarn.lock` marks the module as a
  standalone project. Run Yarn from the module root.
- The scaffold's create-module CLI is interactive only; it was driven with `expect` ("An empty
  module").
- A CND prefix already registered elsewhere fails silently: `ctrv` / `ctrvmix` were checked free on
  the instance (Jahia `NodeTypeRegistry` namespaces and the Jackrabbit namespace registry) before
  the first deploy.
- Theme and scheme switches from zsh: `for look in "a b"` does not split; drive them from bash.

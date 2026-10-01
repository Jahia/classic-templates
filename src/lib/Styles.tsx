import { AddResources, buildModuleFileUrl } from "@jahia/javascript-modules-library";

/**
 * Adds the module's stylesheet (every CSS module of the views, bundled by Vite) to the page. Each
 * view that can be rendered on its own includes it: this module has no page template, so nothing
 * else loads it. Jahia adds a resource once per page, however many views ask for it.
 */
export const Styles = () => (
  <AddResources type="css" resources={buildModuleFileUrl("dist/assets/style.css")} />
);

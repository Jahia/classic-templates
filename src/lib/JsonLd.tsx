import { useServerContext } from "@jahia/javascript-modules-library";
import { absolute, jsonForScript, originOf } from "./schema.js";

/** A function turning a site-relative URL into an absolute one, for the current request. */
export const useAbsoluteUrl = () => {
  const { renderContext } = useServerContext();
  const request = renderContext.getRequest();
  const origin = originOf(request.getScheme(), request.getServerName(), request.getServerPort());
  return (url: string) => absolute(origin, url);
};

/**
 * One schema.org entity as JSON-LD. The JSON is the text of the script element: React writes a
 * script's text unescaped (it only neutralises a closing tag) and jsonForScript writes every `<` as
 * `\u003c`, so no raw-HTML sink is needed and no value can end the script.
 */
export const JsonLd = ({ data }: { data: unknown }) => (
  <script type="application/ld+json">{jsonForScript(data)}</script>
);

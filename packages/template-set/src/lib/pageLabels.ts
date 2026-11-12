import { useServerContext } from "@jahia/javascript-modules-library";
import { useLabels } from "./labels.js";

/**
 * The module's `t()` in a server component, for the locale being rendered: Traditional Chinese
 * labels on a `zh_HK`, `zh_TW` or `zh_MO` page (see `useLabels`). Server only: an island takes the
 * locale as a prop and calls `useLabels`.
 */
export const usePageLabels = () =>
  useLabels(useServerContext().currentResource.getLocale().toString());

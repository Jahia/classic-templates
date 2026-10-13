import { useTranslation } from "react-i18next";

/** The i18next namespace of this module: its Jahia module name (package.json jahia.name). */
export const NAMESPACE = "classic-media";

/**
 * `t` bound to this module's namespace. Views of this module are rendered inside pages of another
 * module (classic-templates), so the namespace is always named, never left to the default.
 */
export const useT = () => useTranslation(NAMESPACE).t;

/**
 * Interpolation options for values that come from content (a name, a date): React escapes the
 * output, so i18next must not escape it a second time ("O&#39;Brien").
 */
export const RAW = { interpolation: { escapeValue: false } } as const;

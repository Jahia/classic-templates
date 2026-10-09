import { useTranslation } from "react-i18next";
import classes from "./members-badge.module.css";

/**
 * The "Members only" badge of a flagged news item, article or page: a small lock and the words, so
 * the status never rests on the icon alone. Shown on cards, rows, tiles and the item's own page,
 * to every visitor: it describes the item, not the visitor.
 */
export const MembersBadge = () => {
  const { t } = useTranslation("classic-templates");
  return (
    <span className={classes.badge} data-testid="ctpl-members-badge">
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <rect x="3" y="7" width="10" height="7" rx="1.5" fill="currentColor" />
        <path
          d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
      {t("members.badge")}
    </span>
  );
};

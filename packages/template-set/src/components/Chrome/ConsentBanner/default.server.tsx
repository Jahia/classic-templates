import {
  AddResources,
  buildModuleFileUrl,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { consentDays } from "../../../lib/consent.js";
import type { Props } from "./types.js";
import classes from "./consent-banner.module.css";
import { EditNote } from "../../../lib/EditNote.js";

/**
 * The tracking-consent banner, placed once in the shared footer area (home page): a region with
 * its heading, the explanation, the privacy-policy link (ctplmix:cta) and two buttons of equal
 * weight, Accept and Refuse; a "privacy settings" button after the footer opens it again, so a
 * visitor withdraws as easily as they agreed.
 *
 * - The page is the same for every visitor (cached): the banner is rendered hidden and
 *   static/js/consent-banner.js shows it while the visitor has not chosen. The choice lives in the
 *   `ctpl-consent` cookie (every site of the host), for rememberDays days.
 * - With jExperience on the page the script also calls wem.enableWem() / wem.disableWem(), so its
 *   tracking follows the choice; it always fires a `ctpl:consent` event for other scripts. Nothing
 *   is tracked before consent only when the site switches tracking off by default (jExperience:
 *   wemmix:deactivateJSExecution = all on the site node), which the edit-mode hint says.
 * - Without JavaScript nothing shows: no banner, no button that could not work.
 * - Accept, Refuse and settings labels are all required: without one of them the live site shows
 *   nothing (a banner that cannot be refused or withdrawn is no consent), edit mode says which.
 * - Edit mode shows the banner in place, never fixed, and loads no script.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:consentBanner", displayName: "Consent banner" },
  (props: Props, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const isEdit = renderContext.isEditMode();
    const title = props["jcr:title"];
    const { acceptLabel, refuseLabel, settingsLabel } = props;
    const complete = Boolean(acceptLabel && refuseLabel && settingsLabel);
    if (!isEdit && !complete) return null;

    const titleId = `ctpl-consent-${currentNode.getIdentifier()}`;

    return (
      <div
        className={isEdit ? `${classes.root} ${classes.edit}` : classes.root}
        data-testid="ctpl-consent"
        data-ctpl-consent={isEdit ? undefined : ""}
        data-ctpl-consent-days={consentDays(props.rememberDays)}
      >
        {!isEdit && (
          <AddResources
            type="javascript"
            resources={buildModuleFileUrl("static/js/consent-banner.js")}
            key="ctpl-consent-banner"
          />
        )}
        <section
          className={classes.banner}
          aria-labelledby={titleId}
          hidden={!isEdit}
          data-ctpl-consent-banner
          data-testid="ctpl-consent-banner"
        >
          <div className={`ctpl-container ${classes.inner}`}>
            <div className={classes.body}>
              <h2 id={titleId} className={title ? classes.title : "ctpl-visually-hidden"}>
                {title || t("consent.label")}
              </h2>
              {props.text && <p className={classes.text}>{props.text}</p>}
              <Cta node={currentNode} renderContext={renderContext} variant="link" />
              {isEdit && (
                <EditNote
                  level={complete ? "info" : "hidden"}
                  className={classes.hint}
                  testId="ctpl-consent-hint"
                >
                  {complete ? t("consent.editHint") : t("consent.missingLabels")}
                </EditNote>
              )}
            </div>
            <div className={classes.actions}>
              {acceptLabel && (
                <button
                  type="button"
                  className={classes.choice}
                  data-ctpl-consent-choice="granted"
                  data-testid="ctpl-consent-accept"
                >
                  {acceptLabel}
                </button>
              )}
              {refuseLabel && (
                <button
                  type="button"
                  className={classes.choice}
                  data-ctpl-consent-choice="denied"
                  data-testid="ctpl-consent-refuse"
                >
                  {refuseLabel}
                </button>
              )}
            </div>
          </div>
        </section>
        {isEdit && settingsLabel && (
          <p className={classes.settings}>
            <span className={`ctpl-container ${classes.settingsInner}`}>
              <span className={classes.settingsButton}>{settingsLabel}</span>
            </span>
          </p>
        )}
        {!isEdit && (
          <template data-ctpl-consent-settings>
            <div className={classes.settings}>
              <div className={`ctpl-container ${classes.settingsInner}`}>
                <button
                  type="button"
                  className={classes.settingsButton}
                  data-testid="ctpl-consent-settings"
                >
                  {settingsLabel}
                </button>
              </div>
            </div>
          </template>
        )}
      </div>
    );
  },
);

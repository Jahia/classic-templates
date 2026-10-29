import { jahiaComponent, useServerContext } from "@jahia/javascript-modules-library";
import { useTranslation } from "react-i18next";
import { audienceOf, showsTo } from "./audience.js";
import { Cta } from "./Cta.js";
import { readString } from "./props.js";
import classes from "./cta.module.css";
import { EditNote } from "./EditNote.js";

type Variant = "primary" | "secondary" | "onOverlay" | "link";
const VARIANTS: ReadonlySet<string> = new Set(["primary", "secondary", "onOverlay", "link"]);
const isVariant = (value: unknown): value is Variant =>
  typeof value === "string" && VARIANTS.has(value);

/** The button style the section asked for (the `variant` parameter of Cta), else "primary". */
const useVariant = (): Variant => {
  const { currentResource } = useServerContext();
  try {
    const param = currentResource.getModuleParams().get("variant");
    return isVariant(param) ? param : "primary";
  } catch {
    return "primary";
  }
};

/**
 * A call to action limited to visitors who are not signed in, or to signed-in visitors
 * (ctplmix:cta ctaAudience): the button when this visitor is in the audience, nothing otherwise.
 *
 * Cached per user (`cache.perUser`): Cta renders it as a fragment of its own inside the section's
 * fragment, so a supplier who signed in never gets the "Sign in" button a guest rendered first, and
 * the section itself stays shared. In edit mode the button is always shown, with who sees it.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctplmix:cta",
    name: "ctaForAudience",
    displayName: "Call to action for an audience",
    properties: { "cache.perUser": "true" },
  },
  (_props: Record<string, unknown>, { currentNode, renderContext }) => {
    const { t } = useTranslation("classic-templates");
    const variant = useVariant();
    const audience = audienceOf(readString(currentNode, "ctaAudience"));
    const button = (
      <Cta node={currentNode} renderContext={renderContext} variant={variant} audienceChecked />
    );
    if (renderContext.isEditMode()) {
      return (
        <>
          {button}
          {audience !== "everyone" && (
            <EditNote level="info" className={classes.hint} testId="ctpl-cta-audience">
              {t(`cta.audience.${audience}`)}
            </EditNote>
          )}
        </>
      );
    }
    return showsTo(audience, renderContext.isLoggedIn()) ? button : null;
  },
);

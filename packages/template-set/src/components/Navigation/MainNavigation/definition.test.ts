import { describe, expect, it } from "vitest";
import cnd from "./definition.cnd?raw";
import shared from "../../../../settings/definitions.cnd?raw";
import en from "../../../../settings/resources/classic-templates_en.properties?raw";
import fr from "../../../../settings/resources/classic-templates_fr.properties?raw";

/** True when `bundle` has a non-empty value for `key`. */
const label = (bundle: string, key: string) =>
  bundle.split("\n").some((line) => line.startsWith(`${key}=`) && line.length > key.length + 1);

describe("main navigation menu style", () => {
  it("offers dropdown (the default) and mega, each labelled in every language", () => {
    expect(cnd).toMatch(
      /- navStyle \(string, choicelist\[resourceBundle\]\) = 'dropdown' autocreated indexed=no < 'dropdown', 'mega'/,
    );
    for (const bundle of [en, fr]) {
      for (const key of ["", ".ui.tooltip", ".dropdown", ".mega"]) {
        expect(label(bundle, `ctpl_mainNavigation.navStyle${key}`)).toBe(true);
      }
    }
  });
});

describe("menu promotion of a page", () => {
  it("is a page option built on the shared media and call-to-action mixins", () => {
    expect(shared).toMatch(
      /\[ctplmix:navPromo\] > ctplmix:media, ctplmix:cta mixin\s+extends = jnt:page\s+- promoTitle \(string\) i18n\s+- promoText \(string, textarea\) i18n\s+- promoLink \(weakreference, picker\[type='editoriallink'\]\) i18n < 'jmix:droppableContent', 'jnt:page'\s+- promoUrl \(string\) i18n/,
    );
  });

  it("labels the option and its own fields, with tooltips, in every language", () => {
    for (const bundle of [en, fr]) {
      for (const key of [
        "ctplmix_navPromo",
        "ctplmix_navPromo.ui.tooltip",
        "ctplmix_navPromo.promoTitle",
        "ctplmix_navPromo.promoTitle.ui.tooltip",
        "ctplmix_navPromo.promoText",
        "ctplmix_navPromo.promoText.ui.tooltip",
        "ctplmix_navPromo.promoLink",
        "ctplmix_navPromo.promoLink.ui.tooltip",
        "ctplmix_navPromo.promoUrl",
        "ctplmix_navPromo.promoUrl.ui.tooltip",
      ]) {
        expect(label(bundle, key)).toBe(true);
      }
    }
  });
});

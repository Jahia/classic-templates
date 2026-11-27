import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  logo?: JCRNodeWrapper;
  logoDark?: JCRNodeWrapper;
  brandName?: string;
  showBrandName?: boolean;
  brandCaption?: string;
  /** Legacy (hidden since 0.13.0): the two-rows rendering is the "twoRows" view (j:view). */
  headerLayout?: "oneRow" | "twoRows";
  showAccount?: boolean;
  showSearch?: boolean;
  accountLanding?: JCRNodeWrapper;
  signInPage?: JCRNodeWrapper;
  registerPage?: JCRNodeWrapper;
  searchPage?: JCRNodeWrapper;
}

import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  logo?: JCRNodeWrapper;
  logoDark?: JCRNodeWrapper;
  brandName?: string;
  showBrandName?: boolean;
  showAccount?: boolean;
  accountLanding?: JCRNodeWrapper;
  signInPage?: JCRNodeWrapper;
}

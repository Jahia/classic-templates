import type { JCRNodeWrapper } from "org.jahia.services.content";

export interface Props {
  navDepth?: number;
  navStyle?: "dropdown" | "mega";
  menuSource?: "pageTree" | "menu";
  menu?: JCRNodeWrapper;
}

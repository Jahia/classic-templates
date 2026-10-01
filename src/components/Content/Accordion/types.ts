/** ctpl:accordion */
export interface Props {
  "jcr:title"?: string;
  "introText"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
}

/** ctpl:accordionItem */
export interface ItemProps {
  "jcr:title"?: string;
  "body"?: string;
  "openByDefault"?: boolean;
}

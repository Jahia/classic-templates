/** Page properties every template reads (jnt:page + the optional ctplmix:pageOptions mixin). */
export interface PageProps {
  "jcr:title"?: string;
  "jcr:description"?: string;
  "ctplHideTitle"?: boolean;
}

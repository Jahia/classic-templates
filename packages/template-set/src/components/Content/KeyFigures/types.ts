/** ctpl:keyFigures */
export interface Props {
  "jcr:title"?: string;
  "introText"?: string;
  "ctplSurface"?: "default" | "sunken" | "accent";
}

/** ctpl:keyFigure */
export interface KeyFigureProps {
  /** The figure as displayed, for example "98%" or "24/7". */
  value?: string;
  label?: string;
  detail?: string;
}

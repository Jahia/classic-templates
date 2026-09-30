import type { ReactNode } from "react";
import classes from "./section.module.css";

export type Surface = "default" | "sunken" | "accent";

/**
 * A page section on one of the theme's surfaces (ctplmix:sectionStyle). "default" sits on the page
 * background and takes its spacing from the page shell; "sunken" and "accent" are full-width bands
 * with their own vertical padding. Content inside is centred by the caller with .ctpl-container.
 */
export const Section = ({
  surface,
  testId,
  labelledBy,
  className,
  children,
}: {
  surface?: Surface;
  testId: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) => (
  <section
    className={[classes.section, classes[surface ?? "default"], className]
      .filter(Boolean)
      .join(" ")}
    data-surface={surface ?? "default"}
    data-testid={testId}
    aria-labelledby={labelledBy}
  >
    {children}
  </section>
);

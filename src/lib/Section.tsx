import type { ReactNode } from "react";
import classes from "./section.module.css";

export type Surface = "default" | "sunken" | "accent";

/**
 * A page section on one of the theme's surfaces (classic-templates ctplmix:sectionStyle):
 * "default" sits on the page background, "sunken" and "accent" are full-width bands with their own
 * vertical padding. Content inside is centred with the classic-templates `ctpl-container` class.
 */
export const Section = ({
  surface,
  testId,
  labelledBy,
  className,
  children,
}: {
  surface?: string;
  testId: string;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) => {
  const known: Surface = surface === "sunken" || surface === "accent" ? surface : "default";
  return (
    <section
      className={[classes.section, classes[known], className].filter(Boolean).join(" ")}
      data-surface={known}
      data-testid={testId}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
};

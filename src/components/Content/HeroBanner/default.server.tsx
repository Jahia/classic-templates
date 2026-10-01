import { getChildNodes, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Image } from "../../../lib/Image.js";
import type { Props } from "./types.js";
import classes from "./hero-banner.module.css";

const MODES: Record<string, "image" | "split" | "plain"> = {
  image: "image",
  split: "split",
  plain: "plain",
};

/**
 * Whether the banner's photo is likely the page's largest paint: the banner sits in the page's
 * hero area, directly or as the first slide of a carousel there. Later slides of a carousel stay
 * hidden until shown, so they never compete with the first one for an early, high-priority fetch.
 */
const placement = (banner: JCRNodeWrapper) => {
  const parent = banner.getParent() as JCRNodeWrapper;
  if (!parent.isNodeType("ctpl:heroCarousel")) {
    return { atTop: parent.isNodeType("ctpl:heroArea"), firstShown: true };
  }
  const [first] = getChildNodes(parent, -1, 0, (n: JCRNodeWrapper) =>
    n.isNodeType("ctpl:heroBanner"),
  );
  const firstShown = first?.getIdentifier() === banner.getIdentifier();
  return {
    atTop: firstShown && (parent.getParent() as JCRNodeWrapper).isNodeType("ctpl:heroArea"),
    firstShown,
  };
};

const HEIGHT = { compact: classes.heightCompact, medium: undefined, tall: classes.heightTall };

/**
 * The banner: eyebrow, heading (h2 - the page template owns the h1), subtitle and a call to action.
 *
 * - "image": the photo fills the banner behind the text, under a dark overlay whose contrast with
 *   the light text is guaranteed by the tokens (checked over a white photo, the worst case).
 * - "split": text on the left, photo on the right, on the sunken surface.
 * - "plain", or any variant without a photo: a tinted band.
 * In the page's hero area the photo is the most likely LCP element, so it loads eagerly with high
 * priority; lower in the page it loads lazily like any other image. In a carousel (see
 * HeroCarousel) only the first slide's photo gets that priority.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:heroBanner", displayName: "Hero banner" },
  (
    { "jcr:title": title, eyebrow, subtitle, variant, overlay, height, image, ctaLabel }: Props,
    { currentNode, renderContext },
  ) => {
    // No photo: always the plain band. Otherwise the editor's variant, "image" by default.
    const mode = image ? (MODES[variant ?? "image"] ?? "image") : "plain";
    const headingId = `ctpl-hero-${currentNode.getIdentifier()}`;
    const { atTop, firstShown } = placement(currentNode);

    return (
      <section
        className={[classes.hero, classes[mode], HEIGHT[height ?? "medium"]]
          .filter(Boolean)
          .join(" ")}
        data-testid="ctpl-hero-banner"
        data-variant={mode}
        aria-labelledby={title ? headingId : undefined}
      >
        {mode === "image" && image && (
          <>
            <Image
              node={image}
              owner={currentNode}
              renderContext={renderContext}
              className={classes.backdrop}
              priority={firstShown}
            />
            <div
              className={`${classes.overlay} ${overlay === "strong" ? classes.overlayStrong : classes.overlayMedium}`}
            />
          </>
        )}
        <div className={`ctpl-container ${classes.inner}`}>
          <div className={classes.text}>
            {eyebrow && <p className={classes.eyebrow}>{eyebrow}</p>}
            {title && (
              <SectionHeading node={currentNode} id={headingId} className={classes.title}>
                {title}
              </SectionHeading>
            )}
            {subtitle && <p className={classes.subtitle}>{subtitle}</p>}
            <Cta
              node={currentNode}
              label={ctaLabel}
              renderContext={renderContext}
              variant={mode === "image" ? "onOverlay" : "primary"}
            />
          </div>
          {mode === "split" && image && (
            <div className={classes.media}>
              <Image
                node={image}
                owner={currentNode}
                renderContext={renderContext}
                priority={atTop}
              />
            </div>
          )}
        </div>
      </section>
    );
  },
);

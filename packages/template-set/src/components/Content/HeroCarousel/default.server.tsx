import {
  AddResources,
  Render,
  RenderChildren,
  buildModuleFileUrl,
  getChildNodes,
  jahiaComponent,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { carouselInterval } from "../../../lib/carousel.js";
import { SectionHeading } from "../../../lib/Heading.js";
import type { Props } from "./types.js";
import classes from "./hero-carousel.module.css";

const Chevron = ({ back }: { back?: boolean }) => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
    <path
      d={back ? "M12.5 4.5L7 10l5.5 5.5" : "M7.5 4.5L13 10l-5.5 5.5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

/** Pause and play glyphs; CSS shows the one matching the button's data-playing state. */
const ToggleIcons = () => (
  <>
    <svg
      className={classes.pauseIcon}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" />
    </svg>
    <svg
      className={classes.playIcon}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 4l10 6-10 6z" fill="currentColor" />
    </svg>
  </>
);

/**
 * The Pause / Play button of an autoplaying carousel, rendered hidden: static/js/carousel.js shows
 * and wires it. It comes before the slides, in the source and on screen (above them), so it is the
 * first thing reached (RGAA 13.8).
 */
const Toggle = () => {
  const { t } = useTranslation("classic-templates");
  return (
    <div className={`ctpl-container ${classes.toolbar}`} hidden data-ctpl-carousel-controls>
      <button
        type="button"
        className={classes.control}
        data-ctpl-carousel-toggle
        data-playing="true"
        data-label-pause={t("carousel.pause")}
        data-label-play={t("carousel.play")}
        data-testid="ctpl-carousel-toggle"
      >
        <ToggleIcons />
        <span data-ctpl-carousel-toggle-label>{t("carousel.pause")}</span>
      </button>
    </div>
  );
};

/**
 * Previous, one button per slide and next, rendered hidden: static/js/carousel.js shows and wires
 * them. They come after the slides, in the source as on screen (under them), so the focus order
 * follows what the visitor sees (WCAG 2.4.3, RGAA 12.8).
 */
const Controls = ({ slideIds, trackId }: { slideIds: string[]; trackId: string }) => {
  const { t } = useTranslation("classic-templates");
  const total = slideIds.length;
  return (
    <div className={classes.controls} hidden data-ctpl-carousel-controls>
      <div className={classes.nav}>
        <button
          type="button"
          className={classes.control}
          aria-controls={trackId}
          data-ctpl-carousel-prev
          data-testid="ctpl-carousel-prev"
        >
          <Chevron back />
          <span className="ctpl-visually-hidden">{t("carousel.previous")}</span>
        </button>
        <ul className={classes.pickers}>
          {slideIds.map((slideId, i) => (
            <li key={slideId}>
              <button
                type="button"
                className={classes.picker}
                aria-controls={trackId}
                aria-current={i === 0 ? "true" : undefined}
                data-ctpl-carousel-goto={i}
                data-testid="ctpl-carousel-picker"
              >
                <span className="ctpl-visually-hidden">
                  {t("carousel.slideOf", { index: i + 1, total })}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={classes.control}
          aria-controls={trackId}
          data-ctpl-carousel-next
          data-testid="ctpl-carousel-next"
        >
          <Chevron />
          <span className="ctpl-visually-hidden">{t("carousel.next")}</span>
        </button>
      </div>
    </div>
  );
};

/** The carousel's optional heading: an h2 (or lower, see lib/Heading.tsx), maybe visually hidden. */
const CarouselHeading = ({
  node,
  id,
  title,
  hidden,
}: {
  node: JCRNodeWrapper;
  id: string;
  title?: string;
  hidden?: boolean;
}) =>
  title ? (
    <div className={hidden ? "ctpl-visually-hidden" : `ctpl-container ${classes.heading}`}>
      <SectionHeading node={node} id={id} className={classes.title}>
        {title}
      </SectionHeading>
    </div>
  ) : null;

/** Edit mode: every slide stacked and editable, with the list's add button and a short hint. */
const EditView = ({ node, title, hideTitle, total }: ViewProps & { total: number }) => {
  const { t } = useTranslation("classic-templates");
  const headingId = `ctpl-carousel-${node.getIdentifier()}`;
  return (
    <section
      className={classes.carousel}
      data-testid="ctpl-hero-carousel"
      aria-labelledby={title ? headingId : undefined}
    >
      <CarouselHeading node={node} id={headingId} title={title} hidden={hideTitle} />
      <p className={`ctpl-container ${classes.editHint}`}>
        <span className="ctpl-edit-hint">
          {t(total === 0 ? "carousel.empty" : "carousel.editStacked")}
        </span>
      </p>
      <div className={classes.track}>
        <RenderChildren />
      </div>
    </section>
  );
};

interface ViewProps {
  node: JCRNodeWrapper;
  title?: string;
  hideTitle?: boolean;
}

/**
 * Live, with two slides or more: the Pause / Play button (autoplay only), the slides, then the
 * previous / slide / next buttons and the live region, in the order they show, all wired by
 * static/js/carousel.js.
 */
const LiveView = ({
  node,
  title,
  hideTitle,
  slides,
  autoplay,
  interval,
}: ViewProps & { slides: JCRNodeWrapper[]; autoplay: boolean; interval?: number }) => {
  const { t } = useTranslation("classic-templates");
  const id = node.getIdentifier();
  const headingId = `ctpl-carousel-${id}`;
  const trackId = `ctpl-carousel-track-${id}`;
  const total = slides.length;
  return (
    <section
      className={classes.carousel}
      data-testid="ctpl-hero-carousel"
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : t("carousel.label")}
      aria-roledescription={t("carousel.roleDescription")}
      data-ctpl-carousel=""
      data-interval={autoplay ? String(carouselInterval(interval)) : undefined}
    >
      <AddResources
        type="javascript"
        resources={buildModuleFileUrl("static/js/carousel.js")}
        key="ctpl-carousel"
      />
      <CarouselHeading node={node} id={headingId} title={title} hidden={hideTitle} />
      {autoplay && <Toggle />}
      <ul id={trackId} className={`${classes.track} ${classes.list}`}>
        {slides.map((slide, i) => (
          <li
            key={slide.getIdentifier()}
            className={classes.slide}
            aria-roledescription={t("carousel.slideRole")}
            aria-label={t("carousel.slideOf", { index: i + 1, total })}
            data-ctpl-slide
            data-active={i === 0 ? "" : undefined}
            data-testid="ctpl-carousel-slide"
          >
            <Render node={slide} />
          </li>
        ))}
      </ul>
      <Controls slideIds={slides.map((slide) => slide.getIdentifier())} trackId={trackId} />
      <p
        className="ctpl-visually-hidden"
        aria-live={autoplay ? "off" : "polite"}
        aria-atomic="true"
        data-ctpl-carousel-status
      />
    </section>
  );
};

/**
 * A carousel of hero banners (its ctpl:heroBanner children, each rendered with its own view).
 *
 * - Edit mode, a single slide, or no JavaScript: the slides are stacked, every one readable and,
 *   in edit mode, editable in Page Builder (RenderChildren, with the list's add button).
 * - With JavaScript (static/js/carousel.js): one slide at a time, every slide in the same grid
 *   cell so the carousel keeps the height of its tallest slide (no layout shift); hidden slides
 *   are invisible, inert and aria-hidden; slides are list items named "Slide 2 of 4" with a
 *   "slide" role description; previous / next and one button per slide ("Slide 2 of
 *   4", aria-current); a change made by the visitor is announced politely.
 * - Autoplay only when the editor switched it on: every `interval` seconds (at least 5), once
 *   through the slides, never when the visitor asks for reduced motion, suspended by hover, focus
 *   inside and a hidden tab, stopped by any use of the slide buttons, with a Pause / Play button
 *   above the slides, first in the focus order (RGAA 13.8, WCAG 2.2.2). Announcements are off
 *   while it plays. Previous / slide / next buttons sit under the slides, after them in the source.
 * - A region named by its heading (an h2, visually hidden with hideTitle) or, untitled, by a
 *   translated "carousel" label; slide headings sit one level below a titled carousel (see
 *   lib/Heading.tsx). Nothing on the live site without a slide.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:heroCarousel", displayName: "Hero carousel" },
  (
    { "jcr:title": title, hideTitle, autoplay, interval }: Props,
    { currentNode, renderContext },
  ) => {
    const slides = getChildNodes(currentNode, -1, 0, (n: JCRNodeWrapper) =>
      n.isNodeType("ctpl:heroBanner"),
    ) as JCRNodeWrapper[];
    const view = { node: currentNode, title, hideTitle };
    if (renderContext.isEditMode()) return <EditView {...view} total={slides.length} />;
    if (slides.length === 0) return null;
    if (slides.length > 1) {
      return (
        <LiveView {...view} slides={slides} autoplay={autoplay === true} interval={interval} />
      );
    }
    // One slide: nothing to rotate, the banner shows as it would on its own.
    const headingId = `ctpl-carousel-${currentNode.getIdentifier()}`;
    return (
      <section
        className={classes.carousel}
        data-testid="ctpl-hero-carousel"
        aria-labelledby={title ? headingId : undefined}
      >
        <CarouselHeading node={currentNode} id={headingId} title={title} hidden={hideTitle} />
        <div className={classes.track}>
          <div className={classes.slide} data-ctpl-slide data-testid="ctpl-carousel-slide">
            <Render node={slides[0]} />
          </div>
        </div>
      </section>
    );
  },
);

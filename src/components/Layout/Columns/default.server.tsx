import { RenderChild, RenderChildren, jahiaComponent } from "@jahia/javascript-modules-library";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { Section } from "../../../lib/Section.js";
import type { Props } from "./types.js";
import classes from "./columns.module.css";

const COLUMNS: Record<NonNullable<Props["layout"]>, number> = {
  halves: 2,
  thirds: 3,
  quarters: 4,
  twoThirdsOneThird: 2,
  oneThirdTwoThirds: 2,
};

/**
 * A row of columns. The four columns always exist (autocreated child lists); only as many as the
 * layout needs are rendered, so switching layout never deletes what editors put in a column.
 * Columns stack on small screens; four columns go two by two on tablets. The row's call to action,
 * when switched on (ctplmix:cta), follows the columns.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:columns", displayName: "Columns" },
  ({ "jcr:title": title, layout, gap, ctplSurface }: Props, { currentNode, renderContext }) => {
    const count = COLUMNS[layout ?? "halves"] ?? 2;
    const headingId = `ctpl-cols-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-columns"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          <div
            className={[classes.grid, classes[layout ?? "halves"], classes[gap ?? "medium"]].join(
              " ",
            )}
          >
            {["col1", "col2", "col3", "col4"].slice(0, count).map((name) => (
              <RenderChild key={name} name={name} />
            ))}
          </div>
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

/** One column: the sections an editor dropped in it. */
jahiaComponent({ componentType: "view", nodeType: "ctpl:column", displayName: "Column" }, () => (
  <div className={classes.column} data-testid="ctpl-column">
    <RenderChildren />
  </div>
));

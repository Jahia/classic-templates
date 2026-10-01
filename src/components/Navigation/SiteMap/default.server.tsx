import { buildNodeUrl, jahiaComponent } from "@jahia/javascript-modules-library";
import { Cta } from "../../../lib/Cta.js";
import { SectionHeading } from "../../../lib/Heading.js";
import { buildSiteMap, type NavItem } from "../../../lib/navigation.js";
import { readString } from "../../../lib/props.js";
import { Section } from "../../../lib/Section.js";
import { chromeOwner, pageSite } from "../../../lib/site.js";
import type { Props } from "./types.js";
import classes from "./site-map.module.css";

const Tree = ({ items, nested }: { items: NavItem[]; nested?: boolean }) => (
  <ul className={nested ? classes.nested : classes.root}>
    {items.map((item) => (
      <li key={item.id}>
        {item.href ? <a href={item.href}>{item.title}</a> : <span>{item.title}</span>}
        {item.children.length > 0 && <Tree items={item.children} nested />}
      </li>
    ))}
  </ul>
);

/**
 * The site map: the home page, then every page under it as nested lists (pages hidden from the
 * menu included), menu labels as plain text, external links through the scheme allow-list.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:siteMap", displayName: "Site map" },
  ({ "jcr:title": title, depth, ctplSurface }: Props, { currentNode, renderContext }) => {
    const home = chromeOwner(pageSite(renderContext));
    const tree: NavItem = {
      id: home.getIdentifier(),
      title: readString(home, "jcr:title") ?? home.getName(),
      href: buildNodeUrl(home),
      children: buildSiteMap(home, Number(depth) || 5, renderContext),
    };
    const headingId = `ctpl-sm-${currentNode.getIdentifier()}`;
    return (
      <Section
        surface={ctplSurface}
        testId="ctpl-site-map"
        labelledBy={title ? headingId : undefined}
      >
        <div className="ctpl-container">
          {title && (
            <SectionHeading node={currentNode} id={headingId}>
              {title}
            </SectionHeading>
          )}
          <Tree items={[tree]} />
          <Cta node={currentNode} renderContext={renderContext} />
        </div>
      </Section>
    );
  },
);

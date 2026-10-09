import { getNodesByJCRQuery, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { FETCH_LIMIT, buildListQuery } from "../../../lib/query.js";
import { maxItems, regionFilter, selectDestinations } from "../../../lib/select.js";
import { destinationEntry } from "../../../lib/travel.js";
import { TravelList, useListStart } from "../shared/TravelList.js";
import type { Props } from "./types.js";

/**
 * A destination grid: the destinations found under the start node, translated into the page's
 * language, in the chosen region, from A to Z in that language, limited, rendered as cards with
 * their "from" price.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctrv:destinationGrid", displayName: "Destination grid" },
  (props: Props, { jcrSession, currentResource }) => {
    const t = useT();
    const { start, startMissing } = useListStart(props);
    const locale = currentResource.getLocale();
    let items: JCRNodeWrapper[] = [];
    let summary = "";
    if (!startMissing) {
      const rows = getNodesByJCRQuery(
        jcrSession,
        buildListQuery("ctrv:destination", start.getPath()),
        FETCH_LIMIT,
      );
      const translated = rows.filter((node) => node.hasI18N(locale as never));
      const region = regionFilter(props.region);
      const selected = selectDestinations(translated.map(destinationEntry), {
        region,
        max: maxItems(props.maxItems),
        compare: new Intl.Collator(languageTag(locale)).compare,
      });
      items = selected.map((entry) => entry.node);
      summary = t("list.destinationSummary", {
        shown: items.length,
        found: rows.length,
        untranslated: rows.length - translated.length,
      });
    }
    return (
      <TravelList
        props={props}
        items={items}
        testId="ctrv-destination-grid"
        summary={summary}
        startMissing={startMissing}
      />
    );
  },
);

import { getNodesByJCRQuery, jahiaComponent } from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { today } from "../../../lib/format.js";
import { useT } from "../../../lib/i18n.js";
import { languageTag } from "../../../lib/locale.js";
import { FETCH_LIMIT, buildListQuery } from "../../../lib/query.js";
import { fareSort, maxItems, regionFilter, selectFares } from "../../../lib/select.js";
import { fareEntry } from "../../../lib/travel.js";
import { TravelList, useListStart } from "../shared/TravelList.js";
import type { Props } from "./types.js";

/**
 * A fare list: the fare offers found under the start node, translated into the page's language,
 * whose destination resolves and is in the chosen region, still on sale today, sorted, limited,
 * rendered as cards. Region, sort and end of sale are applied in code (lib/select.ts). The list
 * depends on today's date (ended offers leave it): its cache expires after an hour.
 */
jahiaComponent(
  {
    componentType: "view",
    nodeType: "ctrv:fareList",
    displayName: "Fare list",
    properties: { "cache.expiration": "3600" },
  },
  (props: Props, { renderContext, jcrSession, currentResource }) => {
    const t = useT();
    const { start, startMissing } = useListStart(props);
    const locale = currentResource.getLocale();
    let items: JCRNodeWrapper[] = [];
    let summary = "";
    if (!startMissing) {
      const rows = getNodesByJCRQuery(
        jcrSession,
        buildListQuery("ctrv:fareOffer", start.getPath()),
        FETCH_LIMIT,
      ) as JCRNodeWrapper[];
      const translated = rows.filter((node) => node.hasI18N(locale as never));
      const entries = translated
        .map((node) => fareEntry(node, renderContext))
        .filter((entry) => entry.destinationTitle !== undefined);
      const selection = selectFares(entries, {
        region: regionFilter(props.region),
        sort: fareSort(props.sort),
        max: maxItems(props.maxItems),
        day: today(),
        compare: new Intl.Collator(languageTag(locale)).compare,
      });
      items = selection.items.map((entry) => entry.node);
      summary = t("list.fareSummary", {
        shown: items.length,
        found: rows.length,
        ended: selection.ended,
        otherRegion: selection.otherRegion,
        untranslated: rows.length - translated.length,
        noDestination: translated.length - entries.length,
      });
    }
    return (
      <TravelList
        props={props}
        items={items}
        testId="ctrv-fare-list"
        summary={summary}
        startMissing={startMissing}
      />
    );
  },
);

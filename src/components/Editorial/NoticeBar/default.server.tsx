import {
  AddResources,
  buildModuleFileUrl,
  buildNodeUrl,
  jahiaComponent,
  server,
} from "@jahia/javascript-modules-library";
import type { JCRNodeWrapper } from "org.jahia.services.content";
import { useTranslation } from "react-i18next";
import { Cta } from "../../../lib/Cta.js";
import { formatDate, isoDay } from "../../../lib/dates.js";
import { chooseItemLabel, itemLabelMode } from "../../../lib/itemLabel.js";
import { languageTag } from "../../../lib/locale.js";
import { noticeItemCount, noticeSignature } from "../../../lib/notice.js";
import { readString } from "../../../lib/props.js";
import {
  categoryIds,
  isListableType,
  pathRegex,
  runList,
  startLabelOf,
  typeLabel,
} from "../../../lib/query.js";
import { categoryTitlesOf } from "../shared/editorial.js";
import type { Props } from "./types.js";
import classes from "./notice-bar.module.css";

/** The translation key of an item's type label, as cards show it ("News", "Article"). */
const kindKey = (item: JCRNodeWrapper) =>
  item.isNodeType("ctpl:article") ? "editorial.article" : "editorial.news";

/** Publication date of an item, or its creation date when the editor left it empty. */
const dateOf = (item: JCRNodeWrapper) =>
  readString(item, "publicationDate") ?? readString(item, "jcr:created");

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
    <path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * The notice bar: a slim band of the latest items (news or articles, newest first), each a link to
 * the item with its date, after an optional label and before an optional "view all" link.
 *
 * - A region named by its label (or a translated default, for screen readers only), never a
 *   second banner landmark: in the header area it sits beside the site header, not inside it.
 * - A static list: nothing scrolls or rotates (RGAA 13.8), so it needs no pause control.
 * - Items are found like a content list's (lib/query.ts): type, start folder, categories, items
 *   not translated into the page's language left out. The bar depends on everything under its
 *   start node, so a new or edited item refreshes it, in the shared header too.
 * - Dismissible bars: static/js/notice-bar.js adds the close button from the <template> and hides
 *   the bar for the visitor's session. Without JavaScript no button shows; in edit mode neither
 *   the script nor the button is rendered, so a bar hidden while browsing is never hidden there.
 * - Nothing on the live site without an item; in edit mode a summary says what the bar lists.
 */
jahiaComponent(
  { componentType: "view", nodeType: "ctpl:noticeBar", displayName: "Notice bar" },
  (props: Props, { currentNode, renderContext, jcrSession, currentResource }) => {
    const { t } = useTranslation();
    const isEdit = renderContext.isEditMode();
    const site = renderContext.getSite();
    const startMissing = !props.startNode && currentNode.hasProperty("startNode");
    const start: JCRNodeWrapper = props.startNode ?? site;
    const type = props.type ?? "ctpl:news";
    const typeValid = isListableType(jcrSession, type);
    const locale = currentResource.getLocale();
    const language = languageTag(locale);
    const max = noticeItemCount(props.maxItems);
    const labelMode = itemLabelMode(props.itemLabel, "none");

    let items: JCRNodeWrapper[] = [];
    if (typeValid && !startMissing) {
      server.render.addCacheDependency(
        { flushOnPathMatchingRegexp: `${pathRegex(start.getPath())}(/.*)?` },
        renderContext,
      );
      items = runList({
        session: jcrSession,
        type,
        start,
        criteria: "publicationDate",
        direction: "desc",
        categories: categoryIds(props.filterCategories),
        locale,
        max,
      }).items.filter((item) => readString(item, "jcr:title"));
    }
    if (!isEdit && items.length === 0) return null;

    const id = currentNode.getIdentifier();
    const labelId = `ctpl-notice-${id}`;
    const dismissible = props.dismissible === true && !isEdit;
    let warning: string | undefined;
    if (!typeValid) warning = t("query.invalidType");
    else if (startMissing) warning = t("query.startMissing");

    return (
      <section
        className={classes.bar}
        aria-labelledby={labelId}
        data-testid="ctpl-notice-bar"
        data-ctpl-notice={dismissible ? id : undefined}
        data-ctpl-notice-signature={
          dismissible ? noticeSignature(items.map((item) => item.getIdentifier())) : undefined
        }
      >
        {dismissible && (
          <AddResources
            type="javascript"
            resources={buildModuleFileUrl("static/js/notice-bar.js")}
            key="ctpl-notice-bar"
          />
        )}
        <div className={`ctpl-container ${classes.inner}`}>
          <p id={labelId} className={props.label ? classes.label : "ctpl-visually-hidden"}>
            {props.label || t("notice.label")}
          </p>
          {isEdit && (
            <p className={`ctpl-edit-hint ${classes.hint}`} data-testid="ctpl-notice-summary">
              {warning ??
                t("query.summary", {
                  type: typeLabel(type, locale),
                  start: startLabelOf(start, site),
                  order: t("query.newest"),
                  max,
                  interpolation: { escapeValue: false },
                })}
            </p>
          )}
          {items.length > 0 && (
            <ul className={classes.items}>
              {items.map((item) => {
                const date = dateOf(item);
                const itemLabel = chooseItemLabel(
                  labelMode,
                  t(kindKey(item)),
                  labelMode === "category" ? categoryTitlesOf(item, renderContext) : [],
                );
                return (
                  <li key={item.getIdentifier()} className={classes.item} data-testid="ctpl-notice">
                    {itemLabel && (
                      <>
                        <span className={classes.kind} data-testid="ctpl-notice-label">
                          {itemLabel}
                        </span>{" "}
                      </>
                    )}
                    <a className={classes.link} href={buildNodeUrl(item)}>
                      {readString(item, "jcr:title")}
                    </a>
                    {date && " "}
                    {date && (
                      <time className={classes.date} dateTime={isoDay(date)}>
                        {formatDate(date, language)}
                      </time>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <div className={classes.actions} data-ctpl-notice-actions>
            <Cta
              node={currentNode}
              label={props.ctaLabel}
              renderContext={renderContext}
              variant="link"
            />
          </div>
          {dismissible && (
            <template data-ctpl-notice-dismiss>
              <button type="button" className={classes.dismiss} data-testid="ctpl-notice-dismiss">
                <CloseIcon />
                <span className="ctpl-visually-hidden">{t("notice.dismiss")}</span>
              </button>
            </template>
          )}
        </div>
      </section>
    );
  },
);

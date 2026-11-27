#!/usr/bin/env python3
"""Seeds the Skylantern Airways demo site (a fictional airline) on the classic-templates template set.

    python3 seed-airline.py [--site skylantern] [--theme horizon] [--scheme light] [--pass1-only]

The script:
  - creates the site on the classic-templates template set when it does not exist (EN default, FR),
    then enables jsfaq, js-media-gallery, js-store-locator and formidable-elements on it, and
    classic-travel when that module is installed;
  - uploads the generated artwork of images.py to files/skylantern, with EN and FR titles (the
    images' default text alternatives);
  - builds the page tree of airline_content.PAGE_TREE (templates home / content / fullWidth, pages
    hidden from the menu for the utility and legal pages);
  - fills the header (logo, utility links) and the footer (tagline, columns, legal and social links)
    seeded under the home page, link targets set in every language;
  - creates a small taxonomy in the system site (Skylantern Airways demo > Travel advisories, Press
    releases, Careers, Partner offers), news items and articles in content folders, filed in it;
  - places the sections of every page (pass 1): hero banners, rich text with tables, image and
    text, columns, card grids, key figures, quotes, link lists, content lists filtered by category,
    the site map, and free zones holding a FAQ (jsfaq), the sales offices (js-store-locator) and
    two Formidable forms (newsletter, contact);
  - pass 2 (skipped with --pass1-only): accordions, tabs, icon tiles and a logo strip
    (classic-templates), and with classic-travel 10 destinations, 6 fare offers, two fare lists,
    a destination grid and the travel tools with their visible demo notice;
  - pass 3: a notice bar in the home header area, a hero carousel on home (the pass-1 hero banner
    moved into it), category labels on the advisory, press and careers lists; nodes removed from
    the content since an earlier run (airline_content.RETIRED) are marked for deletion and the
    deletion published;
  - points each content folder at the page that lists it (ctplmix:listingPage), for the breadcrumb;
  - publishes, in EN and FR, only the nodes it manages that are missing from the live workspace
    (plus the nodes it changed), so a second run publishes nothing; files are published with them.

Add-only and idempotent: an existing node is never changed (a property is set only while empty or
still at the default of a property added later, a section is only reordered in the run that created
it, and moved only once, by `adopt` / `moved_from`), so a second run creates nothing.

--theme / --scheme set ctplTheme / ctplColorScheme on the site, only while they still have their
default value (the theme is checked against the deployed choicelist).

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234),
CLASSIC_TEMPLATES (path of the classic-templates checkout, default this one). One HTTP
session is reused for every call, through the helpers of classic-templates/scripts/seed-demo.py.
"""
import argparse
import importlib.util
import json
import os
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
CTPL = Path(os.environ.get("CLASSIC_TEMPLATES", HERE.parent.parent))
spec = importlib.util.spec_from_file_location("seed_demo", CTPL / "scripts" / "seed-demo.py")
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)
gql, exists, i18n, set_props, uuid_at, provisioning, store_image = (
    demo.gql, demo.exists, demo.i18n, demo.set_props, demo.uuid_at, demo.provisioning, demo.store_image)
LANGS = demo.LANGS

sys.path.insert(0, str(HERE))
import airline_content as ac  # noqa: E402
import images as art  # noqa: E402

ADDONS = ["jsfaq", "js-media-gallery", "js-store-locator", "formidable-elements"]
BUILT_IN_CTA = {"ctpl:heroBanner", "ctpl:imageText", "ctpl:jcrQuery", "ctrv:fareList", "ctrv:destinationGrid"}
CATEGORY_ROOT = "/sites/systemsite/categories"

CREATED = []   # nodes created by this run
MANAGED = []   # every node this script owns (created now or by an earlier run): publication candidates
CHANGED = []   # existing nodes whose empty properties this run filled (published without subtree)
NODES_CHANGED = []  # nodes whose own (non-i18n) properties this run set (published alone)
TRANSLATIONS_CHANGED = []  # translation nodes changed by this run (published alone, not their page)
RETIRED_DONE = []  # nodes removed by this run (airline_content.RETIRED)
UPGRADES = {"itemLabel": "type"}  # property: value an existing node may still hold from before it existed
_uuids = {}


# ---- Small helpers on top of seed-demo.py -------------------------------------------------------

def uuid(path):
    if path not in _uuids:
        _uuids[path] = uuid_at(path)
    return _uuids[path]


def add(parent, name, node_type, props, mixins=None):
    """Adds a node when it is missing (never changes an existing one). Returns its path."""
    path = f"{parent}/{name}"
    MANAGED.append(path)
    if not exists(path):
        demo.add_content(parent, name, node_type, props, mixins)
        CREATED.append(path)
    return path


def prop_value(path, name, lang=None):
    q = ("query($p:String!,$n:String!,$l:String){jcr{nodeByPath(path:$p){property(name:$n,language:$l){value values}}}}")
    p = gql(q, {"p": path, "n": name, "l": lang})["jcr"]["nodeByPath"]["property"]
    return None if not p else (p["value"] if p["value"] is not None else p["values"])


def fill(path, props, mixins=None):
    """Sets the properties that are still empty on an existing node (an editor's value is kept)."""
    missing = [p for p in props if not prop_value(path, p["name"], p.get("language"))]
    if not missing:
        return False
    if mixins:
        gql("mutation($p:String!,$m:[String]!){jcr{mutateNode(pathOrId:$p){addMixins(mixins:$m)}}}", {"p": path, "m": mixins})
    set_props(path, missing)
    CHANGED.append(path)
    return True


def internal(page_path):
    props = [{"name": "j:linkType", "value": "internal"}]
    props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": uuid(page_path), "language": lang} for lang in LANGS]
    return props, ["jmix:internalLink"]


def in_live(path):
    try:
        gql("query($p:String!){jcr(workspace:LIVE){nodeByPath(path:$p){uuid}}}", {"p": path})
        return True
    except RuntimeError as error:
        if "PathNotFoundException" in str(error) or "not found" in str(error).lower():
            return False
        raise


def children(path):
    return [c["name"] for c in gql("query($p:String!){jcr{nodeByPath(path:$p){children{nodes{name}}}}}",
                                   {"p": path})["jcr"]["nodeByPath"]["children"]["nodes"]]


def date(day):
    return f"{day}T09:00:00.000+08:00"


# ---- Site, modules, theme -----------------------------------------------------------------------

def ensure_site(key):
    site = f"/sites/{key}"
    if exists(site):
        return site
    provisioning(f'- createSite: ""\n  siteKey: {key}\n  title: "{ac.SITE["title"]}"\n  defaultLanguage: en\n'
                 f"  serverName: localhost\n  templateSet: classic-templates\n", "application/yaml")
    for _ in range(90):
        if exists(f"{site}/home/siteHeader/header"):
            break
        time.sleep(1)
    else:
        sys.exit(f"site {key} was not created from the template set (no seeded header)")
    gql("mutation($s:String!,$d:String!){jcr{mutateNode(pathOrId:$s){setPropertiesBatch(properties:["
        '{name:"j:languages",values:["en","fr"]},{name:"j:mandatoryLanguages",values:[]},'
        '{name:"j:inactiveLanguages",values:[]},{name:"j:inactiveLiveLanguages",values:[]},'
        '{name:"j:description",value:$d}]){path}}}}', {"s": site, "d": ac.SITE["description"]})
    CREATED.append(site)
    print(f"created site {key}")
    return site


def module_installed(name):
    try:
        info = json.loads(demo._request(f"/modules/api/bundles/*/{name}/*/_info"))
    except Exception:  # noqa: BLE001 - an unknown bundle answers with an error
        return False
    return any(states for states in info.values())


def enable_modules(key, site):
    installed = prop_value(site, "j:installedModules") or []
    wanted = ADDONS + (["classic-travel"] if module_installed("classic-travel") else [])
    for module in wanted:
        if module not in installed:
            provisioning(f'- enable: "{module}"\n  site: "{key}"\n', "application/yaml")
            print(f"enabled {module}")
    return wanted


def set_scheme(site, scheme):
    if scheme and prop_value(site, "ctplColorScheme") in (None, "auto"):
        gql('mutation($p:String!){jcr{mutateNode(pathOrId:$p){addMixins(mixins:["ctplmix:siteSettings"])}}}', {"p": site})
        set_props(site, [{"name": "ctplColorScheme", "value": scheme}])
        CHANGED.append(site)
        print(f"colour scheme set to {scheme}")


def set_theme(site, theme):
    if not theme:
        return
    allowed = gql('query{jcr{nodeTypeByName(name:"ctplmix:siteSettings"){properties{name constraints}}}}')
    values = next(p["constraints"] for p in allowed["jcr"]["nodeTypeByName"]["properties"] if p["name"] == "ctplTheme")
    if theme not in values:
        print(f"theme '{theme}' is not deployed (ctplTheme allows {values}): the site keeps its theme")
        return
    if prop_value(site, "ctplTheme") in (None, "default"):
        gql('mutation($p:String!){jcr{mutateNode(pathOrId:$p){addMixins(mixins:["ctplmix:siteSettings"])}}}', {"p": site})
        set_props(site, [{"name": "ctplTheme", "value": theme}])
        CHANGED.append(site)
        print(f"theme set to {theme}")


# ---- Images -------------------------------------------------------------------------------------

def seed_images(site):
    folder = add(f"{site}/files", "skylantern", "jnt:folder", [])
    for image in art.IMAGES:
        path = f"{folder}/{image['name']}"
        MANAGED.append(path)
        if exists(path):
            continue
        data, mime, size = art.render(image)
        store_image(folder, image["name"], image["title"]["en"], size, data, mime)
        set_props(path, i18n("jcr:title", image["title"]))
        CREATED.append(path)
    return folder


def image_uuid(site, name):
    return uuid(f"{site}/files/skylantern/{name}")


# ---- Pages --------------------------------------------------------------------------------------

def page_path(home, rel):
    return home if rel == "" else f"{home}/{rel}"


def seed_pages(home):
    for page in ac.PAGE_TREE:
        rel = page["path"]
        parent, name = (home + "/" + rel).rsplit("/", 1)
        has_hero = bool(ac.PAGES.get(rel, {}).get("hero"))
        props = i18n("jcr:title", page["title"]) + [{"name": "j:templateName", "value": page.get("template", "content")}]
        props += i18n("jcr:description", ac.PAGE_DESCRIPTIONS[rel])
        mixins = []
        if page.get("hidden") or has_hero:
            # A hero banner titles the page: the h1 stays for screen readers and search engines, hidden
            # from the screen ("Hide the page title"), so the title is not shown twice.
            mixins = ["ctplmix:pageOptions"]
            props += [{"name": "ctplHideFromNav", "value": "true" if page.get("hidden") else "false"},
                      {"name": "ctplHideTitle", "value": "true" if has_hero else "false"}]
        add(parent, name, "jnt:page", props, mixins)
    # Home exists (import.xml): only its description is filled while it has none, and its title is
    # replaced while it is still the template set's default ("Home" / "Accueil").
    fill(home, i18n("jcr:description", ac.PAGE_DESCRIPTIONS[""]))
    stale = {lang: v for lang, v in ac.HOME_TITLE.items() if prop_value(home, "jcr:title", lang) == ac.HOME_TITLE_SEEDED[lang]}
    if stale:
        set_props(home, i18n("jcr:title", stale))
        TRANSLATIONS_CHANGED.extend(f"{home}/j:translation_{lang}" for lang in stale)
        print(f"home title set in {', '.join(stale)}")


# ---- Header and footer --------------------------------------------------------------------------

def add_link(list_path, name, page=None, title=None, url=None, new_tab=False):
    path = f"{list_path}/{name}"
    MANAGED.append(path)
    if exists(path):
        return path
    demo.add_link(list_path, name, title=title, page=uuid(page) if page else None, url=url, new_tab=new_tab)
    CREATED.append(path)
    return path


def seed_chrome(site, home):
    header = f"{home}/siteHeader/header"
    fill(header, [{"name": "logo", "type": "WEAKREFERENCE", "value": image_uuid(site, ac.HEADER["logo"])},
                  {"name": "logoDark", "type": "WEAKREFERENCE", "value": image_uuid(site, ac.HEADER["logoDark"])}]
         + i18n("brandName", ac.HEADER["brandName"]))
    if header in CHANGED and prop_value(header, "showBrandName") is not False:
        set_props(header, [{"name": "showBrandName", "value": ac.HEADER["showBrandName"]}])
    for name, page in ac.HEADER["utility"]:
        add_link(f"{header}/utilityLinks", name, page=page_path(home, page))
    seed_notice_bar(site, home)

    footer = f"{home}/siteFooter/footer"
    fill(footer, i18n("tagline", ac.FOOTER["tagline"]))
    # import.xml seeds a generic copyright: replaced by ours while it is still the seeded one.
    seeded = {"en": "© {year}. All rights reserved.", "fr": "© {year}. Tous droits réservés."}
    stale = {lang: v for lang, v in ac.FOOTER["copyright"].items() if prop_value(footer, "copyright", lang) in (None, seeded[lang])}
    if stale:
        set_props(footer, i18n("copyright", stale))
        CHANGED.append(footer)
    for column in ac.FOOTER["columns"]:
        lst = add(f"{footer}/columns", column["name"], "ctpl:linkList", i18n("jcr:title", column["title"]))
        for name, page in column["links"]:
            add_link(lst, name, page=page_path(home, page))
    for name, page, label in ac.FOOTER["legal"]:
        add_link(f"{footer}/legal", name, page=page_path(home, page), title=label)
    for name, label, url in ac.FOOTER["social"]:
        add_link(f"{footer}/social", name, title=label, url=url, new_tab=True)


def seed_notice_bar(site, home):
    """The notice bar of the home page's header area (shared by every page), above the site header."""
    nb = ac.HEADER.get("notice_bar")
    if not nb or not exists(f"{home}/siteHeader"):
        return
    try:
        gql('query{jcr{nodeTypeByName(name:"ctpl:noticeBar"){name}}}')
    except RuntimeError:
        print("ctpl:noticeBar is not deployed: notice bar skipped")
        return
    link_props, mixins = internal(page_path(home, nb["cta"]["page"]))
    props = (i18n("label", nb["label"]) + i18n("ctaLabel", nb["cta"]["label"]) + link_props
             + [{"name": "type", "value": nb["type"]}, {"name": "maxItems", "type": "LONG", "value": nb["maxItems"]},
                {"name": "itemLabel", "value": nb["itemLabel"]}, {"name": "dismissible", "type": "BOOLEAN", "value": nb["dismissible"]},
                {"name": "startNode", "type": "WEAKREFERENCE", "value": uuid(f"{site}/contents/{nb['folder']}")},
                {"name": "filterCategories", "type": "WEAKREFERENCE", "values": [category(c) for c in nb["categories"]]}])
    area = f"{home}/siteHeader"
    path = add(area, nb["name"], "ctpl:noticeBar", props, mixins)
    if path in CREATED and len(children(area)) > 1:
        order = [nb["name"]] + [n for n in children(area) if n != nb["name"]]
        gql("mutation($p:String!,$n:[String]!){jcr{mutateNode(pathOrId:$p){reorderChildren(names:$n)}}}", {"p": area, "n": order})
        CHANGED.append(area)


def retire(home):
    """Removes the nodes that earlier versions of this seeder created and the content no longer has
    (airline_content.RETIRED): mark for deletion, then publish the deletion, which removes the node
    from both workspaces. Publishing first would republish it instead."""
    for rel in getattr(ac, "RETIRED", []):
        path = f"{home}/{rel}"
        if not exists(path):
            continue
        mixins = gql("query($p:String!){jcr{nodeByPath(path:$p){mixinTypes{name}}}}", {"p": path})["jcr"]["nodeByPath"]["mixinTypes"]
        if not any(m["name"] == "jmix:markedForDeletion" for m in mixins):
            gql("mutation($p:String!){jcr{mutateNode(pathOrId:$p){markForDeletion(comment:\"Retired by seed-airline.py\")}}}", {"p": path})
        if in_live(path):
            publish(path, True)
        else:  # never published: nothing to publish, the marked node is removed directly
            gql("mutation($p:String!){jcr{mutateNode(pathOrId:$p){delete}}}", {"p": path})
        for _ in range(60):  # the deletion is published by a background job
            if not exists(path) and not in_live(path):
                break
            time.sleep(1)
        print(f"retired {path}" + ("" if not exists(path) else " (still present: check the publication queue)"))
        RETIRED_DONE.append(path)


# ---- Taxonomy, editorial items ------------------------------------------------------------------

def seed_categories():
    key, title = ac.CATEGORIES["root"]
    root = add(CATEGORY_ROOT, key, "jnt:category", i18n("jcr:title", title))
    for name, label in ac.CATEGORIES["items"]:
        add(root, name, "jnt:category", i18n("jcr:title", label))
    return root


def category(name):
    return uuid(f"{CATEGORY_ROOT}/{ac.CATEGORIES['root'][0]}/{name}")


def seed_editorial(site):
    contents = f"{site}/contents"
    for folder, typ, title in (("news", "ctpl:news", ac.T("News", "Actualités")), ("articles", "ctpl:article", ac.T("Articles", "Articles"))):
        add(contents, folder, "jnt:contentFolder", i18n("jcr:title", title) + [{"name": "j:contributeTypes", "values": [typ]}],
            ["jmix:contributeMode"])
    for folder, typ, items in (("news", "ctpl:news", ac.NEWS), ("articles", "ctpl:article", ac.ARTICLES)):
        for item in items:
            props = (i18n("jcr:title", item["title"]) + i18n("teaser", item["teaser"]) + i18n("body", item["body"])
                     + [{"name": "publicationDate", "type": "DATE", "value": date(item["date"])},
                        {"name": "j:defaultCategory", "type": "WEAKREFERENCE", "values": [category(item["category"])]}])
            if item.get("image"):
                props.append({"name": "image", "type": "WEAKREFERENCE", "value": image_uuid(site, item["image"])})
            if item.get("author"):
                props.append({"name": "author", "value": item["author"]})
            props += i18n("jcr:description", item["seo"])
            path = add(f"{contents}/{folder}", item["name"], typ, props, ["jmix:categorized"])
            if path not in CREATED:  # items of an earlier run: the description is filled while empty
                fill(path, i18n("jcr:description", item["seo"]))


# ---- Add-ons in free zones ------------------------------------------------------------------------

def seed_faq(zone):
    faq = ac.FAQ
    page = add(zone, "faq", "jsfaqnt:faqPage", i18n("jcr:title", faq["title"]) + [{"name": "headingLevel", "value": faq["headingLevel"]}])
    for section in faq["sections"]:
        sec = add(page, section["name"], "jsfaqnt:faqSection", i18n("jcr:title", section["title"]) + i18n("sectionTitle", section["title"]))
        for name, question, answer in section["items"]:
            add(sec, name, "jsfaqnt:faqItem", i18n("jcr:title", question) + i18n("question", question) + i18n("answer", answer))


def seed_offices(site, zone):
    name, title = ac.OFFICES["folder"]
    folder = add(f"{site}/contents", name, "jnt:contentFolder", i18n("jcr:title", title))
    for office in ac.OFFICES["items"]:
        props = (i18n("jcr:title", office["title"]) + i18n("name", office["title"]) + i18n("description", office["description"])
                 + [{"name": "streetAddress", "value": office["street"]}, {"name": "addressLocality", "value": office["city"]},
                    {"name": "addressCountry", "value": office["country"]},
                    {"name": "latitude", "type": "DOUBLE", "value": str(office["lat"])},
                    {"name": "longitude", "type": "DOUBLE", "value": str(office["lon"])},
                    {"name": "telephone", "value": office["phone"]},
                    {"name": "openingHours", "values": [json.dumps({"dayOfWeek": d, "opens": o, "closes": c}) for d, o, c in office["hours"]]}])
        if office["postal"]:
            props.append({"name": "postalCode", "value": office["postal"]})
        add(folder, office["name"], "jsstorelocnt:store", props)
    loc = ac.OFFICES["locator"]
    add(zone, "locator", "jsstorelocnt:storeLocatorApp",
        i18n("jcr:title", loc["title"]) + i18n("welcomeTitle", loc["welcomeTitle"]) + i18n("welcomeMessage", loc["welcomeMessage"])
        + [{"name": "storesFolder", "type": "WEAKREFERENCE", "value": uuid(folder)}])


def seed_form(site, zone, key):
    spec_ = ac.FORMS[key]
    forms = add(f"{site}/contents", "forms", "jnt:contentFolder", i18n("jcr:title", ac.T("Forms", "Formulaires")))
    form = f"{forms}/{key}"
    MANAGED.append(form)
    if not exists(form):
        def field(name, typ, label, autocomplete, required):
            return {"name": name, "primaryNodeType": typ,
                    "properties": i18n("jcr:title", label) + [{"name": "required", "type": "BOOLEAN", "value": str(required).lower()}]
                    + ([{"name": "autocomplete", "value": autocomplete}] if autocomplete else [])}
        gql("mutation($p:String!,$n:String!,$props:[InputJCRProperty],$c:[InputJCRNode]){jcr{addNode(parentPathOrId:$p,name:$n,"
            "primaryNodeType:\"fmdb:form\",properties:$props,children:$c){uuid}}}", {
                "p": forms, "n": key,
                "props": i18n("jcr:title", spec_["title"]) + i18n("intro", spec_["intro"]) + i18n("submitBtnLabel", spec_["submit"])
                + i18n("submissionMessage", spec_["done"]),
                "c": [{"name": "fields", "primaryNodeType": "fmdb:fieldList", "children": [field(*f) for f in spec_["fields"]]},
                      {"name": "actions", "primaryNodeType": "fmdb:actionList", "children": [
                          {"name": "store", "primaryNodeType": "fmdb:save2jcrAction", "properties": i18n("jcr:title", spec_["action"])}]}]})
        CREATED.append(form)
    add(zone, "form", "fmdb:formReference", [{"name": "j:node", "type": "WEAKREFERENCE", "value": uuid(form)}])


# ---- Sections -----------------------------------------------------------------------------------

def props_of(site, home, section):
    props, mixins = [], []
    for name, value in section.get("props", {}).items():
        props += i18n(name, value) if isinstance(value, dict) else [{"name": name, "value": value}]
    if "image" in section:
        props.append({"name": "image", "type": "WEAKREFERENCE", "value": image_uuid(site, section["image"])})
    if "cta" in section:
        link_props, link_mixins = internal(page_path(home, section["cta"]["page"]))
        props += link_props + i18n("ctaLabel", section["cta"]["label"])
        mixins += link_mixins + ([] if section["type"] in BUILT_IN_CTA else ["ctplmix:cta"])
    if section.get("link"):
        link_props, link_mixins = internal(page_path(home, section["link"]))
        props += link_props
        mixins += link_mixins
    if "travel_folder" in section:  # classic-travel lists: where to look
        props.append({"name": "startNode", "type": "WEAKREFERENCE", "value": uuid(f"{site}/contents/{section['travel_folder']}")})
    if "query" in section:
        q = section["query"]
        props.append({"name": "startNode", "type": "WEAKREFERENCE", "value": uuid(f"{site}/contents/{q['folder']}")})
        if q.get("categories"):
            props.append({"name": "filterCategories", "type": "WEAKREFERENCE", "values": [category(c) for c in q["categories"]]})
    return props, mixins


def add_section(site, home, parent, section):
    props, mixins = props_of(site, home, section)
    path = f"{parent}/{section['name']}"
    adopt = [n for n in section.get("adopt", []) if exists(f"{parent}/{n}")]
    if adopt and not exists(path):
        # A container that replaces sections of an earlier version: create it, then move those
        # sections into it, so what editors changed in them is kept.
        add(parent, section["name"], section["type"], props, mixins)
        for name in adopt:
            gql("mutation($p:String!,$to:String!){jcr{mutateNode(pathOrId:$p){move(parentPathOrId:$to)}}}",
                {"p": f"{parent}/{name}", "to": path})
            print(f"moved {parent}/{name} into {path}")
        CHANGED.append(parent)
    if section.get("moved_from") and not exists(path) and exists(f"{home}/{section['moved_from']}"):
        # The section lived elsewhere in an earlier version: move the node (its links and an editor's
        # changes are kept) instead of creating a second one.
        source = f"{home}/{section['moved_from']}"
        gql("mutation($p:String!,$to:String!){jcr{mutateNode(pathOrId:$p){move(parentPathOrId:$to)}}}", {"p": source, "to": parent})
        print(f"moved {source} into {parent}")
        CHANGED.append(source.rsplit("/", 1)[0])
    existed = exists(path)
    path = add(parent, section["name"], section["type"], props, mixins)
    if existed:  # properties added to the type after the node was created: default value -> ours
        for prop in props:
            if prop["name"] in UPGRADES and prop_value(path, prop["name"]) in (None, UPGRADES[prop["name"]]) \
                    and prop["value"] != UPGRADES[prop["name"]]:
                set_props(path, [prop])
                CHANGED.append(path)
    for child in section.get("children", []):
        child_props, child_mixins = props_of(site, home, child)
        add(path, child["name"], child["type"], child_props, child_mixins)
    for column, inner in section.get("columns", {}).items():
        for s in inner:
            add_section(site, home, f"{path}/{column}", s)
    for name, page in section.get("links", []):
        add_link(path, name, page=page_path(home, page))
    addon = section.get("addon")
    if addon == "faq":
        seed_faq(path)
    elif addon == "offices":
        seed_offices(site, path)
    elif addon in ("contact-form", "newsletter-form"):
        seed_form(site, path, addon.split("-")[0])
    return path


def seed_sections(site, home):
    for rel, areas in ac.PAGES.items():
        page = page_path(home, rel)
        for area_name, sections in areas.items():
            if not sections:
                continue
            area = add(page, area_name, "ctpl:heroArea" if area_name == "hero" else "ctpl:pageArea", [])
            before = children(area)
            for section in sections:
                add_section(site, home, area, section)
            new = [s["name"] for s in sections if s["name"] not in before]
            if before and new:
                # A section added to an area that already had content goes right after the section
                # that precedes it in the data (or first); what the editor added stays where it is.
                order = children(area)
                for i, s in enumerate(sections):
                    if s["name"] not in new:
                        continue
                    order.remove(s["name"])
                    prev = next((p["name"] for p in reversed(sections[:i]) if p["name"] in order), None)
                    order.insert(order.index(prev) + 1 if prev else 0, s["name"])
                if len(order) > 1:
                    gql("mutation($p:String!,$n:[String]!){jcr{mutateNode(pathOrId:$p){reorderChildren(names:$n)}}}", {"p": area, "n": order})
                    CHANGED.append(area)


# ---- Pass 2: accordion, tabs, card grid displays, classic-travel ------------------------------------

def slug(text_):
    import re
    return re.sub(r"[^a-z0-9]+", "-", text_.lower()).strip("-")[:40]


PLACEMENTS = []


def place(area, name, after):
    """Queues a section to put right after `after` once every pass-2 section exists (see place_all)."""
    PLACEMENTS.append((area, name, after))


def place_all():
    """Puts each section created by this run right after `after` (first when after is None or
    missing). Sections that existed before the run are never moved."""
    for area, name, after in PLACEMENTS:
        _place(area, name, after)


def _place(area, name, after):
    if f"{area}/{name}" not in CREATED:
        return
    order = children(area)
    if len(order) < 2:
        return
    order.remove(name)
    order.insert(order.index(after) + 1 if after in order else 0, name)
    gql("mutation($p:String!,$n:[String]!){jcr{mutateNode(pathOrId:$p){reorderChildren(names:$n)}}}", {"p": area, "n": order})
    CHANGED.append(area)


def card_props(site, home, item):
    props = i18n("jcr:title", item["title"]) + [{"name": "image", "type": "WEAKREFERENCE", "value": image_uuid(site, item["image"])}]
    if item.get("text"):
        props += i18n("text", item["text"])
    mixins = []
    if item.get("link"):
        link_props, mixins = internal(page_path(home, item["link"]))
        props += link_props
    return props, mixins


def seed_destinations(site):
    folder = add(f"{site}/contents", "destinations", "jnt:contentFolder",
                 i18n("jcr:title", ac.T("Destinations", "Destinations")) + [{"name": "j:contributeTypes", "values": ["ctrv:destination"]}],
                 ["jmix:contributeMode"])
    paths = {}
    for d in ac.DESTINATIONS:
        f = d["facts"]
        props = (i18n("jcr:title", d["city"]) + i18n("jcr:description", d["seo"]) + i18n("country", d["country"])
                 + i18n("teaser", d["intro"]) + i18n("body", d["description_html"]) + i18n("priceNote", d["price_note"])
                 + i18n("localCurrency", f["local_currency"]) + i18n("language", f["language"]) + i18n("timeZone", f["time_zone"])
                 + i18n("voltage", f["voltage"])
                 + [{"name": "airportCode", "value": d["code"]}, {"name": "region", "value": d["region"]},
                    {"name": "price", "type": "DOUBLE", "value": str(d["from_price"])}, {"name": "currency", "value": d["currency"]},
                    {"name": "diallingCode", "value": f["dialling_code"]},
                    {"name": "image", "type": "WEAKREFERENCE", "value": image_uuid(site, d["image"])}])
        paths[d["code"]] = add(folder, slug(d["city"]["en"]), "ctrv:destination", props)
    for d in ac.DESTINATIONS:  # related destinations, once they all exist
        fill(paths[d["code"]], [{"name": "relatedDestinations", "type": "WEAKREFERENCE",
                                 "values": [uuid(paths[c]) for c in d["related"]]}])
    return folder, paths


def seed_fares(site, home, destinations):
    folder = add(f"{site}/contents", "fares", "jnt:contentFolder",
                 i18n("jcr:title", ac.T("Fare offers", "Offres tarifaires")) + [{"name": "j:contributeTypes", "values": ["ctrv:fareOffer"]}],
                 ["jmix:contributeMode"])
    for f in ac.FARE_OFFERS:
        link_props, mixins = internal(page_path(home, f["cta_target_page"]))
        props = (i18n("jcr:title", f["title"]) + i18n("jcr:description", f["seo"]) + i18n("origin", f["origin"])
                 + i18n("priceNote", f["price_note"]) + i18n("conditions", f["conditions_html"]) + i18n("ctaLabel", f["cta_label"])
                 + [{"name": "destination", "type": "WEAKREFERENCE", "value": uuid(destinations[f["destination"]])},
                    {"name": "cabin", "value": f["cabin"]}, {"name": "price", "type": "DOUBLE", "value": str(f["price"])},
                    {"name": "currency", "value": f["currency"]},
                    {"name": "travelFrom", "type": "DATE", "value": f"{f['travel_from']}T00:00:00.000+08:00"},
                    {"name": "travelTo", "type": "DATE", "value": f"{f['travel_to']}T00:00:00.000+08:00"},
                    {"name": "saleEnds", "type": "DATE", "value": f"{f['sale_ends']}T23:59:00.000+08:00"}] + link_props)
        add(folder, f["name"], "ctrv:fareOffer", props, mixins)
    return folder


def seed_pass2(site, home):
    """Creates the content of the components added after pass 1: accordions, tabs, icon tiles and the
    logo strip (classic-templates), destinations, fare offers, fare lists, the destination grid and
    the travel tools (classic-travel). Add-only, like the rest; new sections go after the section
    named in their "after" key."""
    travel = "classic-travel" in (prop_value(site, "j:installedModules") or [])
    if travel:  # destinations and fares first: lists inside tabs point at their folders
        _, destinations = seed_destinations(site)
        seed_fares(site, home, destinations)
    for rel, items in ac.ACCORDIONS.items():
        area = f"{page_path(home, rel)}/main"
        for acc in items:
            props = i18n("jcr:title", acc["title"]) + (i18n("introText", acc["intro"]) if acc.get("intro") else [])
            path = add(area, acc["name"], "ctpl:accordion", props)
            for item in acc["items"]:
                add(path, slug(item["question"]["en"]), "ctpl:accordionItem",
                    i18n("jcr:title", item["question"]) + i18n("body", item["answer_html"]))
            place(area, acc["name"], acc.get("after"))
    for rel, items in ac.TABS.items():
        area = f"{page_path(home, rel)}/main"
        for tabs in items:
            path = add(area, tabs["name"], "ctpl:tabs", i18n("jcr:title", tabs["title"]))
            for tab in tabs["tabs"]:
                sections = [x for x in tab["sections"] if travel or not x["type"].startswith("ctrv:")]
                if not sections:
                    continue
                tab_name = tab.get("name") or slug(tab["label"]["en"])
                tab_path = add(path, tab_name, "ctpl:tab", i18n("jcr:title", tab["label"]))
                for section in sections:
                    add_section(site, home, tab_path, section)
                if tab.get("first"):
                    place(path, tab_name, None)
            place(area, tabs["name"], tabs.get("after"))
    for kind, display in ((ac.ICON_TILES, "iconTiles"), (ac.LOGO_STRIPS, "logos")):
        for rel, items in kind.items():
            area = f"{page_path(home, rel)}/main"
            for g in items:
                props = i18n("jcr:title", g["title"]) + [{"name": "display", "value": display}]
                if g.get("intro"):
                    props += i18n("introText", g["intro"])
                if display == "iconTiles":
                    props += [{"name": "columns", "value": "3"}]
                path = add(area, g["name"], "ctpl:cardGrid", props)
                for item in g["items"]:
                    item_props, mixins = card_props(site, home, item)
                    add(path, slug(item["title"]["en"]), "ctpl:card", item_props, mixins)
                place(area, g["name"], g.get("after"))

    if not travel:
        print("classic-travel is not enabled on the site: destinations, fares and travel tools skipped")
        place_all()
        return
    # Travel tools first: the home fare list is placed after them.
    tt = ac.TRAVEL_TOOLS
    area = f"{page_path(home, tt['page'])}/main"
    tools = add(area, tt["name"], "ctrv:travelTools", i18n("jcr:title", tt["title"]) + i18n("notice", tt["notice"]))
    for tool in tt["tools"]:
        link_props, mixins = internal(page_path(home, tool["cta_target_page"]))
        add(tools, slug(tool["label"]["en"]), "ctrv:travelTool",
            i18n("jcr:title", tool["label"]) + i18n("text", tool["text_html"]) + i18n("ctaLabel", tool["cta_label"]) + link_props, mixins)
    place(area, tt["name"], tt.get("after"))
    for rel, items in ac.TRAVEL_LISTS.items():
        area = f"{page_path(home, rel)}/main"
        for lst in items:
            section = {"name": lst["name"], "type": lst["type"], "props": {"jcr:title": lst["title"], **lst["props"]}}
            if lst.get("cta"):
                section["cta"] = lst["cta"]
            props, mixins = props_of(site, home, section)
            props = [p if p["name"] != "maxItems" else {**p, "type": "LONG"} for p in props]
            props.append({"name": "startNode", "type": "WEAKREFERENCE", "value": uuid(f"{site}/contents/{lst['folder']}")})
            add(area, lst["name"], lst["type"], props, mixins)
            place(area, lst["name"], lst.get("after"))
    place_all()


def seed_listing_pages(site, home):
    """Points each content folder at the page that lists it (ctplmix:listingPage), so the breadcrumb
    of an item's page goes through that page. Set only while the folder has no listing page."""
    try:
        gql('query{jcr{nodeTypeByName(name:"ctplmix:listingPage"){name}}}')
    except RuntimeError:
        print("ctplmix:listingPage is not deployed: listing pages skipped")
        return
    for folder, page in ac.LISTING_PAGES.items():
        path = f"{site}/contents/{folder}"
        if not exists(path) or prop_value(path, "ctplListingPage"):
            continue
        gql('mutation($p:String!,$v:String!){jcr{mutateNode(pathOrId:$p){addMixins(mixins:["ctplmix:listingPage"]) '
            'mutateProperty(name:"ctplListingPage"){setValue(type:WEAKREFERENCE,value:$v)}}}}',
            {"p": path, "v": uuid(page_path(home, page))})
        NODES_CHANGED.append(path)
        print(f"listing page of {path}: {page}")


# ---- Publication --------------------------------------------------------------------------------

def publish(path, subtree):
    gql("mutation($s:String!,$t:Boolean){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
        "publishSubNodes:$t,includeSubTree:$t)}}}", {"s": path, "t": subtree})


def publish_missing(site, home):
    """Publishes the managed nodes missing from live (whole subtrees, from the topmost one), then the
    existing nodes this run changed (node and its translations only)."""
    candidates = [site, home, f"{home}/siteHeader/header", f"{home}/siteFooter/footer", f"{site}/files",
                  f"{site}/contents"] + MANAGED
    roots = []
    for path in sorted(dict.fromkeys(candidates), key=lambda p: (p.count("/"), p)):
        if any(path == r or path.startswith(r + "/") for r in roots):
            continue
        if not in_live(path):
            roots.append(path)
    for root in roots:
        publish(root, True)
    changed = [p for p in dict.fromkeys(CHANGED) if not any(p == r or p.startswith(r + "/") for r in roots)]
    for path in changed:
        publish(path, False)
        for lang in LANGS:
            if exists(f"{path}/j:translation_{lang}"):
                publish(f"{path}/j:translation_{lang}", False)
    for path in TRANSLATIONS_CHANGED + NODES_CHANGED:
        if not any(path == r or path.startswith(r + "/") for r in roots):
            publish(path, False)
    for _ in range(120):  # publication runs as a background job
        if all(in_live(r) for r in roots):
            break
        time.sleep(1)
    else:
        print("warning: some published roots are not in live yet: " + ", ".join(r for r in roots if not in_live(r)))
    return roots, changed


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="skylantern")
    ap.add_argument("--theme", help="set ctplTheme (only when deployed and the site still has the default theme)")
    ap.add_argument("--scheme", choices=["auto", "light", "dark"], help="set ctplColorScheme (only while it is auto)")
    ap.add_argument("--pass1-only", action="store_true", help="do not seed the pass-2 components")
    args = ap.parse_args()
    if args.site in ("classic-dev", "classic-addons", "ctrv-test"):
        sys.exit(f"refusing to seed {args.site}: it belongs to another demo")
    problems = ac.validate()
    if problems:
        sys.exit("content errors:\n" + "\n".join(problems))
    site = f"/sites/{args.site}"
    home = f"{site}/home"
    ensure_site(args.site)
    modules = enable_modules(args.site, site)
    set_theme(site, args.theme)
    set_scheme(site, args.scheme)
    seed_images(site)
    seed_pages(home)
    retire(home)
    seed_chrome(site, home)
    seed_categories()
    seed_editorial(site)
    seed_sections(site, home)
    seed_listing_pages(site, home)
    if not args.pass1_only:
        seed_pass2(site, home)
    roots, changed = publish_missing(site, home)
    print(f"created {len(CREATED)} nodes, retired {len(RETIRED_DONE)}, changed {len(set(CHANGED)) + len(TRANSLATIONS_CHANGED) + len(NODES_CHANGED)}, published {len(roots)} roots and {len(changed)} changed nodes")
    for path in CREATED[:40]:
        print("  + " + path)
    if len(CREATED) > 40:
        print(f"  ... and {len(CREATED) - 40} more")
    print(f"{demo.URL}/sites/{args.site}/home.html")


if __name__ == "__main__":
    main()

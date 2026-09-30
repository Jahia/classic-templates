#!/usr/bin/env python3
"""Seeds a demonstration site on the classic-templates template set (EN + FR).

    python3 scripts/seed-demo.py [--site classic-dev] [--recreate]

--recreate deletes the site first, then creates it from the template set, so import.xml runs again
(home page, areas, header and footer singletons). Then the script:
  - sets the site languages (en, fr) and description;
  - builds a three-level page tree, with two pages hidden from the navigation (legal, privacy);
  - fills the header utility links and the footer columns, legal links and social links, with link
    targets set in EVERY language (link targets are i18n: a target set in one language only is
    missing in the others);
  - uploads three generated abstract images (Pillow) to files/demo, with titles as alt text;
  - fills the home, about and landing pages with sections (hero banners, image and text, columns,
    rich text);
  - publishes the site in both languages, files included (publishing content never publishes the
    images it references).

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234).
One HTTP session is reused for every call (fresh basic auth per call exhausts the licence's
authenticated-visitor cap).
"""
import argparse
import base64
import io
import math
import http.cookiejar
import json
import os
import sys
import time
import urllib.request

URL = os.environ.get("JAHIA_URL", "http://localhost:8080").rstrip("/")
USER = os.environ.get("JAHIA_USER", "root:root1234")
LANGS = ["en", "fr"]

_jar = http.cookiejar.CookieJar()
_http = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_jar))
_auth = "Basic " + base64.b64encode(USER.encode()).decode()


def _request(path, data=None, headers=None):
    req = urllib.request.Request(URL + path, data=data, headers=headers or {})
    if not any(c.name == "JSESSIONID" for c in _jar):
        req.add_header("Authorization", _auth)
    with _http.open(req, timeout=120) as res:
        return res.read().decode()


def gql(query, variables=None):
    body = json.dumps({"query": query, "variables": variables or {}}).encode()
    out = json.loads(
        _request("/modules/graphql", body, {"Content-Type": "application/json", "Origin": URL})
    )
    if out.get("errors"):
        raise RuntimeError(json.dumps(out["errors"])[:800])
    return out["data"]


def provisioning(yaml_or_json, content_type):
    return _request("/modules/api/provisioning", yaml_or_json.encode(), {"Content-Type": content_type})


def exists(path):
    try:
        gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})
        return True
    except RuntimeError:
        return False


def recreate_site(site):
    groovy = (
        "import org.jahia.services.sites.JahiaSitesService\n"
        "def s = JahiaSitesService.getInstance()\n"
        f'def site = s.getSiteByKey("{site}")\n'
        "if (site != null) s.removeSite(site)\n"
    )
    boundary = "----ctplseed"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="script"\r\n\r\n'
        '[{"executeScript":"delete-site.groovy"}]\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="delete-site.groovy"\r\n'
        f"Content-Type: text/plain\r\n\r\n{groovy}\r\n--{boundary}--\r\n"
    )
    _request("/modules/api/provisioning", body.encode(), {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    provisioning(
        f'- createSite: ""\n  siteKey: {site}\n  title: "Classic Dev"\n  defaultLanguage: en\n'
        f"  serverName: localhost\n  templateSet: classic-templates\n",
        "application/yaml",
    )
    for _ in range(60):
        if exists(f"/sites/{site}/home/siteHeader/header"):
            return
        time.sleep(1)
    sys.exit(f"site {site} was not created from the template set (no seeded header)")


def upload_image(folder, name, title, size, palette):
    """Draws an abstract image and stores it as a jnt:file + jmix:image under `folder`."""
    from PIL import Image, ImageDraw, ImageFilter

    path = f"{folder}/{name}"
    if exists(path):
        return gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})["jcr"]["nodeByPath"]["uuid"]
    w, h = size
    img = Image.new("RGB", size, palette[0])
    d = ImageDraw.Draw(img)
    for y in range(h):  # vertical gradient between the first two colours
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(palette[0], palette[1])))
    for i, colour in enumerate(palette[2:]):
        r = int(min(w, h) * (0.45 - i * 0.1))
        cx, cy = int(w * (0.3 + 0.25 * i)), int(h * (0.45 + 0.1 * math.sin(i)))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=colour)
    img = img.filter(ImageFilter.GaussianBlur(2))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=82)

    query = (
        "mutation($parent:String!,$name:String!,$title:String!,$handle:String!,$w:String!,$h:String!){jcr{"
        ' addNode(parentPathOrId:$parent,name:$name,primaryNodeType:"jnt:file",mixins:["jmix:image"]){uuid'
        '  title: mutateProperty(name:"jcr:title"){setValue(value:$title)}'
        '  width: mutateProperty(name:"j:width"){setValue(value:$w)}'
        '  height: mutateProperty(name:"j:height"){setValue(value:$h)}'
        '  content: addChild(name:"jcr:content",primaryNodeType:"jnt:resource"){'
        '   data: mutateProperty(name:"jcr:data"){setValue(type:BINARY,value:$handle)}'
        '   mime: mutateProperty(name:"jcr:mimeType"){setValue(value:"image/jpeg")}}}}}'
    )
    operations = json.dumps({"query": query, "variables": {
        "parent": folder, "name": name, "title": title, "handle": "image", "w": str(w), "h": str(h)}})
    boundary = "----ctplimage"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{operations}\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{name}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + buf.getvalue() + f"\r\n--{boundary}--\r\n".encode()
    out = json.loads(_request("/modules/graphql", body, {
        "Content-Type": f"multipart/form-data; boundary={boundary}", "Origin": URL}))
    if out.get("errors"):
        raise RuntimeError(json.dumps(out["errors"])[:800])
    # Never trust the mutation's word: the known failure stores a Java object name, not the image.
    stored = gql('query($p:String!){jcr{nodeByPath(path:$p){c:descendant(relPath:"jcr:content"){'
                 'p:property(name:"jcr:data"){value}}}}}', {"p": path})["jcr"]["nodeByPath"]["c"]["p"]["value"] or ""
    if stored.startswith("org.apache."):
        sys.exit(f"upload of {name} stored a Java object reference instead of the image")
    return out["data"]["jcr"]["addNode"]["uuid"]


def add_content(parent, name, node_type, props, mixins=None):
    """Adds a content node (idempotent: skipped when it exists). Returns its path."""
    path = f"{parent}/{name}"
    if not exists(path):
        gql(
            "mutation($parent:String!,$name:String!,$type:String!,$mixins:[String],$props:[InputJCRProperty]){"
            "jcr{mutateNode(pathOrId:$parent){addChild(name:$name,primaryNodeType:$type,mixins:$mixins,"
            "properties:$props){uuid}}}}",
            {"parent": parent, "name": name, "type": node_type, "mixins": mixins or [], "props": props},
        )
    return path


def ensure_area(page, name, node_type):
    """Page areas are created on first render; create them up front, with the template's type."""
    return add_content(page, name, node_type, [])


def cta(page_uuid, label):
    """Properties + mixins of a ctplmix:cta pointing at an internal page in both languages."""
    props = i18n("ctaLabel", label) + [{"name": "j:linkType", "value": "internal"}]
    props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": page_uuid, "language": lang} for lang in LANGS]
    return props, ["jmix:internalLink"]


def i18n(name, values):
    """Properties for an i18n field given as {lang: value}."""
    return [{"name": name, "value": v, "language": lang} for lang, v in values.items()]


def add_page(parent, name, title, template="content", hidden=False, description=None):
    path = f"{parent}/{name}"
    if exists(path):
        return gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})["jcr"]["nodeByPath"]["uuid"]
    props = i18n("jcr:title", title) + [{"name": "j:templateName", "value": template}]
    if description:
        props += i18n("jcr:description", description)
    mixins = ["ctplmix:pageOptions"] if hidden else []
    if hidden:
        props.append({"name": "ctplHideFromNav", "value": "true"})
    data = gql(
        "mutation($parent:String!,$name:String!,$mixins:[String],$props:[InputJCRProperty]){"
        "jcr{mutateNode(pathOrId:$parent){addChild(name:$name,primaryNodeType:\"jnt:page\","
        "mixins:$mixins,properties:$props){uuid}}}}",
        {"parent": parent, "name": name, "mixins": mixins, "props": props},
    )
    return data["jcr"]["mutateNode"]["addChild"]["uuid"]


def add_link(list_path, name, title=None, page=None, url=None, new_tab=False):
    """A ctpl:link under list_path: internal (page uuid) or external (url), target set per language."""
    if exists(f"{list_path}/{name}"):
        return
    props = i18n("jcr:title", title) if title else []
    if page:
        mixins, kind = ["jmix:internalLink"], "internal"
        props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": page, "language": lang} for lang in LANGS]
    else:
        mixins, kind = ["jmix:externalLink"], "external"
        props += i18n("j:url", {lang: url for lang in LANGS})
    props += [{"name": "j:linkType", "value": kind}, {"name": "openInNewTab", "value": str(new_tab).lower()}]
    gql(
        "mutation($parent:String!,$name:String!,$mixins:[String],$props:[InputJCRProperty]){"
        "jcr{mutateNode(pathOrId:$parent){addChild(name:$name,primaryNodeType:\"ctpl:link\","
        "mixins:$mixins,properties:$props){uuid}}}}",
        {"parent": list_path, "name": name, "mixins": mixins, "props": props},
    )


def add_list(parent, name, title):
    if not exists(f"{parent}/{name}"):
        gql(
            "mutation($parent:String!,$name:String!,$props:[InputJCRProperty]){"
            "jcr{mutateNode(pathOrId:$parent){addChild(name:$name,primaryNodeType:\"ctpl:linkList\","
            "properties:$props){uuid}}}}",
            {"parent": parent, "name": name, "props": i18n("jcr:title", title)},
        )
    return f"{parent}/{name}"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="classic-dev")
    ap.add_argument("--recreate", action="store_true")
    args = ap.parse_args()
    site = f"/sites/{args.site}"
    home = f"{site}/home"

    if args.recreate or not exists(site):
        recreate_site(args.site)

    gql(
        "mutation($s:String!){jcr{mutateNode(pathOrId:$s){setPropertiesBatch(properties:["
        '{name:"j:languages",values:["en","fr"]},{name:"j:mandatoryLanguages",values:[]},'
        '{name:"j:inactiveLanguages",values:[]},{name:"j:inactiveLiveLanguages",values:[]},'
        '{name:"j:description",value:"A demonstration site for the classic-templates template set."}'
        "]){path}}}}",
        {"s": site},
    )

    p = {}
    p["about"] = add_page(home, "about", {"en": "About us", "fr": "À propos"},
                          description={"en": "Who we are and what we do.", "fr": "Qui nous sommes et ce que nous faisons."})
    p["team"] = add_page(f"{home}/about", "team", {"en": "Our team", "fr": "Notre équipe"})
    p["history"] = add_page(f"{home}/about", "history", {"en": "History", "fr": "Histoire"})
    p["services"] = add_page(home, "services", {"en": "Services", "fr": "Services"})
    p["consulting"] = add_page(f"{home}/services", "consulting", {"en": "Consulting", "fr": "Conseil"})
    add_page(f"{home}/services/consulting", "strategy", {"en": "Strategy", "fr": "Stratégie"})
    add_page(f"{home}/services/consulting", "operations", {"en": "Operations", "fr": "Opérations"})
    p["training"] = add_page(f"{home}/services", "training", {"en": "Training", "fr": "Formation"})
    add_page(f"{home}/services/training", "workshops", {"en": "Workshops", "fr": "Ateliers"})
    p["support"] = add_page(f"{home}/services", "support", {"en": "Support", "fr": "Assistance"})
    p["news"] = add_page(home, "news", {"en": "News", "fr": "Actualités"})
    p["contact"] = add_page(home, "contact", {"en": "Contact", "fr": "Contact"})
    p["landing"] = add_page(home, "landing", {"en": "Landing", "fr": "Page d'atterrissage"}, template="fullWidth", hidden=True)
    p["legal"] = add_page(home, "legal", {"en": "Legal notice", "fr": "Mentions légales"}, hidden=True)
    p["privacy"] = add_page(home, "privacy", {"en": "Privacy policy", "fr": "Politique de confidentialité"}, hidden=True)

    utility = f"{home}/siteHeader/header/utilityLinks"
    add_link(utility, "news", page=p["news"])
    add_link(utility, "contact", page=p["contact"])
    add_link(utility, "academy", {"en": "Jahia Academy", "fr": "Jahia Academy"}, url="https://academy.jahia.com", new_tab=True)

    footer = f"{home}/siteFooter/footer"
    gql(
        "mutation($f:String!,$props:[InputJCRProperty]){jcr{mutateNode(pathOrId:$f){setPropertiesBatch(properties:$props){path}}}}",
        {"f": footer, "props": i18n("tagline", {
            "en": "A classic, themeable website built with the classic-templates template set for Jahia.",
            "fr": "Un site classique et personnalisable, construit avec le jeu de gabarits classic-templates pour Jahia.",
        })},
    )
    company = add_list(f"{footer}/columns", "company", {"en": "Company", "fr": "Société"})
    add_link(company, "about", page=p["about"])
    add_link(company, "team", page=p["team"])
    add_link(company, "history", page=p["history"])
    services = add_list(f"{footer}/columns", "services", {"en": "Services", "fr": "Services"})
    add_link(services, "consulting", page=p["consulting"])
    add_link(services, "training", page=p["training"])
    add_link(services, "support", page=p["support"])
    resources = add_list(f"{footer}/columns", "resources", {"en": "Resources", "fr": "Ressources"})
    add_link(resources, "news", page=p["news"])
    add_link(resources, "contact", page=p["contact"])
    add_link(f"{footer}/legal", "legal", page=p["legal"])
    add_link(f"{footer}/legal", "privacy", page=p["privacy"])
    add_link(f"{footer}/social", "linkedin", {"en": "LinkedIn", "fr": "LinkedIn"}, url="https://www.linkedin.com/company/jahia-solutions", new_tab=True)
    add_link(f"{footer}/social", "github", {"en": "GitHub", "fr": "GitHub"}, url="https://github.com/Jahia", new_tab=True)

    # ---- Media -------------------------------------------------------------------------
    demo = f"{site}/files/demo"
    if not exists(demo):
        gql('mutation($p:String!){jcr{addNode(parentPathOrId:$p,name:"demo",primaryNodeType:"jnt:folder"){uuid}}}',
            {"p": f"{site}/files"})
    img = {
        "wide": upload_image(demo, "abstract-blue.jpg", "Abstract composition of blue and teal circles on a dark gradient",
                             (1600, 900), [(20, 40, 80), (40, 110, 140), (70, 150, 200), (110, 200, 190), (230, 240, 250)]),
        "square": upload_image(demo, "abstract-warm.jpg", "Abstract composition of warm orange and red circles",
                               (1200, 1200), [(120, 50, 30), (200, 110, 70), (240, 170, 110), (180, 60, 50)]),
        "tall": upload_image(demo, "abstract-green.jpg", "Abstract composition of green circles on a pale gradient",
                             (1200, 1500), [(210, 230, 215), (120, 170, 140), (40, 110, 80), (160, 200, 120)]),
    }

    # ---- Home page sections ----------------------------------------------------------------
    hero = ensure_area(home, "hero", "ctpl:heroArea")
    main = ensure_area(home, "main", "ctpl:pageArea")
    props, mixins = cta(p["about"], {"en": "Discover the template set", "fr": "Découvrir le jeu de gabarits"})
    add_content(hero, "welcome", "ctpl:heroBanner", i18n("jcr:title", {
        "en": "A classic website, themed in one click", "fr": "Un site classique, personnalisé en un clic"})
        + i18n("eyebrow", {"en": "Classic templates", "fr": "Classic templates"})
        + i18n("subtitle", {"en": "Header, navigation, footer and reusable sections, all editable in Page Builder.",
                             "fr": "En-tête, navigation, pied de page et sections réutilisables, tout se modifie dans Page Builder."})
        + [{"name": "image", "type": "WEAKREFERENCE", "value": img["wide"]}, {"name": "variant", "value": "image"},
           {"name": "height", "value": "tall"}] + props, mixins)
    props, mixins = cta(p["services"], {"en": "See our services", "fr": "Voir nos services"})
    add_content(main, "editors", "ctpl:imageText", i18n("jcr:title", {"en": "Designed for editors", "fr": "Pensé pour les rédacteurs"})
        + i18n("body", {"en": "<p>Every text, image and link comes from content. Change the theme of the whole site from its settings, "
                              "without touching a line of code.</p><ul><li>Light and dark</li><li>Three themes</li><li>English and French</li></ul>",
                        "fr": "<p>Chaque texte, image et lien vient du contenu. Changez le thème de tout le site depuis ses réglages, "
                              "sans toucher une ligne de code.</p><ul><li>Clair et sombre</li><li>Trois thèmes</li><li>Anglais et français</li></ul>"})
        + [{"name": "image", "type": "WEAKREFERENCE", "value": img["square"]}, {"name": "imageRatio", "value": "square"}] + props, mixins)
    cols = add_content(main, "offer", "ctpl:columns", i18n("jcr:title", {"en": "What we do", "fr": "Ce que nous faisons"})
        + [{"name": "layout", "value": "thirds"}, {"name": "ctplSurface", "value": "accent"}])
    for i, (en_t, fr_t, en_b, fr_b) in enumerate([
        ("Consulting", "Conseil", "Strategy and operations, from first workshop to launch.", "Stratégie et opérations, du premier atelier au lancement."),
        ("Training", "Formation", "Workshops that make your team autonomous.", "Des ateliers qui rendent votre équipe autonome."),
        ("Support", "Assistance", "A single contact who knows your site.", "Un interlocuteur unique qui connaît votre site."),
    ], start=1):
        add_content(f"{cols}/col{i}", "text", "ctpl:richText", i18n("jcr:title", {"en": en_t, "fr": fr_t})
            + i18n("body", {"en": f"<p>{en_b}</p>", "fr": f"<p>{fr_b}</p>"}))
    add_content(main, "approach", "ctpl:richText", i18n("jcr:title", {"en": "Our approach", "fr": "Notre approche"})
        + i18n("body", {"en": "<p>We start from your content, not from a mock-up. Pages are assembled from a small set of sections "
                              "that editors combine freely, so the site keeps its consistency as it grows.</p>"
                              "<blockquote>Good structure makes good pages.</blockquote>",
                        "fr": "<p>Nous partons de votre contenu, pas d'une maquette. Les pages s'assemblent à partir d'un petit jeu de sections "
                              "que les rédacteurs combinent librement : le site reste cohérent en grandissant.</p>"
                              "<blockquote>Une bonne structure fait de bonnes pages.</blockquote>"}))

    # ---- About page (content template) and landing page (full width) ---------------------------
    about = f"{home}/about"
    props, mixins = cta(p["contact"], {"en": "Contact us", "fr": "Nous contacter"})
    add_content(ensure_area(about, "hero", "ctpl:heroArea"), "intro", "ctpl:heroBanner",
        i18n("jcr:title", {"en": "People who build websites that last", "fr": "Des gens qui construisent des sites durables"})
        + i18n("subtitle", {"en": "Founded to make content management simple and robust.", "fr": "Fondés pour rendre la gestion de contenu simple et robuste."})
        + [{"name": "image", "type": "WEAKREFERENCE", "value": img["wide"]}, {"name": "variant", "value": "split"}] + props, mixins)
    add_content(ensure_area(about, "main", "ctpl:pageArea"), "story", "ctpl:imageText",
        i18n("jcr:title", {"en": "Our story", "fr": "Notre histoire"})
        + i18n("body", {"en": "<p>What started as a small studio is now a team of specialists in content, design and engineering.</p>",
                        "fr": "<p>Ce qui a commencé comme un petit studio est aujourd'hui une équipe de spécialistes du contenu, du design et de l'ingénierie.</p>"})
        + [{"name": "image", "type": "WEAKREFERENCE", "value": img["tall"]}, {"name": "imagePosition", "value": "right"},
           {"name": "imageRatio", "value": "portrait"}, {"name": "ctplSurface", "value": "sunken"}])
    add_content(ensure_area(f"{home}/landing", "main", "ctpl:pageArea"), "banner", "ctpl:heroBanner",
        i18n("jcr:title", {"en": "A landing page, full width", "fr": "Une page d'atterrissage pleine largeur"})
        + i18n("subtitle", {"en": "A plain banner: no photo, a tint of the theme's accent.", "fr": "Une bannière simple : pas de photo, une teinte de l'accent du thème."})
        + [{"name": "variant", "value": "plain"}, {"name": "height", "value": "compact"}])

    for root in (site, f"{site}/files"):
        gql(
            "mutation($s:String!){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],publishSubNodes:true,includeSubTree:true)}}}",
            {"s": root},
        )
    for _ in range(60):
        try:
            if "ctpl-site-footer" in urllib.request.urlopen(f"{URL}/sites/{args.site}/home/about.html").read().decode():
                print(f"seeded and published {site}")
                return
        except urllib.error.HTTPError:
            pass
        time.sleep(1)
    sys.exit("published, but the live about page does not show the footer yet")


if __name__ == "__main__":
    main()

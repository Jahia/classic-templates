#!/usr/bin/env python3
"""Seeds a demonstration site on the classic-templates template set (EN + FR).

    python3 scripts/seed-demo.py [--site classic-dev] [--recreate | --sections-only]

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
  - creates a small demo taxonomy (system site categories: Product > Features, Events) and files
    the news items in it;
  - creates the news and articles folders with six news items and three articles (EN + FR, dates,
    images, tags), and content lists on home (latest news as cards, articles as a list) and on the
    news page;
  - fills the landing page with a card grid (written cards and a news teaser), key figures and a
    quote, and adds example sections to the home, about, services and team pages;
  - adds a site map page and an accessibility statement, linked from the footer (the statement link
    carries the "Accessibility: partially compliant" mention);
  - publishes the site in both languages, files included (publishing content never publishes the
    images it references).

--sections-only only adds the example sections to an existing site (card grids, key figures,
quotes, a call-to-action banner, the site map and accessibility pages and their footer links;
nodes that already exist are left alone) and publishes the pages it touched: it never changes
existing content, so it is safe on a site editors have changed.

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


def uuid_at(path):
    return gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})["jcr"]["nodeByPath"]["uuid"]


def seed_landing_sections(site):
    """Card grid, key figures and quote on the landing page (all targets resolved by path)."""
    home = f"{site}/home"
    main = ensure_area(f"{home}/landing", "main", "ctpl:pageArea")
    images = f"{site}/files/demo"
    grid = add_content(main, "next", "ctpl:cardGrid",
        i18n("jcr:title", {"en": "Where to go next", "fr": "Pour aller plus loin"})
        + i18n("introText", {"en": "Written cards and a teaser of the latest news, side by side.",
                             "fr": "Des cartes rédigées et l'aperçu de la dernière actualité, côte à côte."})
        + [{"name": "columns", "value": "3"}])
    for name, page, image, text, label in (
        ("about", "about", "abstract-blue.jpg",
         {"en": "Who we are, how we work and the people behind the site.", "fr": "Qui nous sommes, comment nous travaillons et l'équipe derrière le site."},
         {"en": "Meet us", "fr": "Nous découvrir"}),
        ("services", "services", "abstract-warm.jpg",
         {"en": "Consulting, training and support, from the first workshop on.", "fr": "Conseil, formation et assistance, dès le premier atelier."},
         {"en": "See the services", "fr": "Voir les services"}),
    ):
        props = i18n("text", text) + i18n("linkLabel", label) + [
            {"name": "image", "type": "WEAKREFERENCE", "value": uuid_at(f"{images}/{image}")},
            {"name": "j:linkType", "value": "internal"}]
        props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": uuid_at(f"{home}/{page}"), "language": lang}
                  for lang in LANGS]
        add_content(grid, name, "ctpl:card", props, ["jmix:internalLink"])
    add_content(grid, "launch", "ctpl:contentTeaser",
                [{"name": "j:node", "type": "WEAKREFERENCE", "value": uuid_at(f"{site}/contents/news/launch")}])

    figures = add_content(main, "numbers", "ctpl:keyFigures",
        i18n("jcr:title", {"en": "In numbers", "fr": "En chiffres"}) + [{"name": "ctplSurface", "value": "sunken"}])
    for name, value, label, detail in (
        ("satisfaction", {"en": "98%", "fr": "98 %"}, {"en": "of editors satisfied", "fr": "de rédacteurs satisfaits"},
         {"en": "Survey of 2026 training sessions.", "fr": "Enquête sur les formations 2026."}),
        ("pages", {"en": "12,000", "fr": "12 000"}, {"en": "pages published", "fr": "pages publiées"}, None),
        ("support", {"en": "24/7", "fr": "24 h/24"}, {"en": "support", "fr": "assistance"}, None),
        ("languages", {"en": "2", "fr": "2"}, {"en": "languages on every page", "fr": "langues sur chaque page"}, None),
    ):
        props = i18n("value", value) + i18n("label", label) + (i18n("detail", detail) if detail else [])
        add_content(figures, name, "ctpl:keyFigure", props)

    add_content(main, "testimonial", "ctpl:quote",
        i18n("quote", {"en": "We rebuilt our site in three weeks, and our editors never had to wait for a deploy.",
                       "fr": "Nous avons refait notre site en trois semaines, et nos rédacteurs n'ont jamais attendu un déploiement."})
        + i18n("authorRole", {"en": "Head of digital, Example Company", "fr": "Responsable du numérique, Example Company"})
        + [{"name": "author", "value": "Claire Dubois"}, {"name": "variant", "value": "large"},
           {"name": "image", "type": "WEAKREFERENCE", "value": uuid_at(f"{images}/abstract-green.jpg")}])


def internal_link(page_uuid):
    """Properties + mixins of a ctplmix:linkTo pointing at a page, target set in every language."""
    props = [{"name": "j:linkType", "value": "internal"}]
    props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": page_uuid, "language": lang} for lang in LANGS]
    return props, ["jmix:internalLink"]


def add_card(grid, name, page_uuid, image_uuid, text, label):
    props, mixins = internal_link(page_uuid)
    props += i18n("text", text) + i18n("linkLabel", label)
    if image_uuid:
        props.append({"name": "image", "type": "WEAKREFERENCE", "value": image_uuid})
    return add_content(grid, name, "ctpl:card", props, mixins)


def add_quote(parent, name, quote, author, role, image_uuid=None, variant="standard", surface="default"):
    props = i18n("quote", quote) + i18n("authorRole", role) + [
        {"name": "author", "value": author}, {"name": "variant", "value": variant},
        {"name": "ctplSurface", "value": surface}]
    if image_uuid:
        props.append({"name": "image", "type": "WEAKREFERENCE", "value": image_uuid})
    return add_content(parent, name, "ctpl:quote", props)


def place_after(parent, name, after):
    """Moves a freshly created child right after `after` (editors' own order is never touched)."""
    names = [c["name"] for c in gql("query($p:String!){jcr{nodeByPath(path:$p){children{nodes{name}}}}}",
                                    {"p": parent})["jcr"]["nodeByPath"]["children"]["nodes"]]
    if name not in names or after not in names:
        return
    names.remove(name)
    names.insert(names.index(after) + 1, name)
    gql("mutation($p:String!,$n:[String]!){jcr{mutateNode(pathOrId:$p){reorderChildren(names:$n)}}}",
        {"p": parent, "n": names})


STATEMENT = {
    "en": "<p>Classic Dev commits to making its website accessible, in accordance with article 47 of French law "
          "2005-102 of 11 February 2005. This statement applies to the site <strong>Classic Dev</strong> (an example "
          "statement for the classic-templates demonstration: a real site publishes the results of its own audit).</p>"
          "<h2>Compliance status</h2><p>The site is <strong>partially compliant</strong> with RGAA version 4.1.2.</p>"
          "<h2>Test results</h2><p>An internal audit on 30 September 2026 found that 94% of the applicable RGAA criteria "
          "are met.</p><h2>Content that is not accessible</h2><ul><li>Components from other modules (a FAQ, a media "
          "gallery, a store locator, forms) are not covered by this statement.</li><li>Some demonstration images use "
          "their title as text alternative instead of a description written for each use.</li></ul>"
          "<h2>Preparation of this statement</h2><p>Established on 30 September 2026. Technologies used: HTML, CSS, "
          "JavaScript. Tools: axe-core and Lighthouse in Chromium (desktop and 320 px wide), in six themes, and a manual "
          "review of the RGAA criteria (keyboard, focus, text spacing, reflow, zoom, styles off). Screen readers have "
          "not been tested yet (NVDA with Firefox and VoiceOver with Safari are planned). Pages tested (sixteen): home, "
          "about, team, services, a service page, landing, news list, a news item, an article, site map, accessibility, "
          "in English and French.</p><h2>Feedback and contact</h2><p>If you cannot access a "
          "content or a service, contact us so that we direct you to an accessible alternative or send you the "
          "content in another form.</p><h2>Remedies</h2><p>If you reported an accessibility defect and did not get a "
          "satisfactory answer, you can write to the Défenseur des droits, use the contact form of its website, contact "
          "its delegate in your region, or write free of charge to: Défenseur des droits, Libre réponse 71120, 75342 "
          "Paris CEDEX 07, France.</p>",
    "fr": "<p>Classic Dev s'engage à rendre son site internet accessible conformément à l'article 47 de la loi "
          "n° 2005-102 du 11 février 2005. Cette déclaration d'accessibilité s'applique au site <strong>Classic "
          "Dev</strong> (déclaration d'exemple pour la démonstration classic-templates : un vrai site publie les "
          "résultats de son propre audit).</p><h2>État de conformité</h2><p>Le site est <strong>partiellement "
          "conforme</strong> avec le RGAA version 4.1.2.</p><h2>Résultats des tests</h2><p>L'audit interne du 30 "
          "septembre 2026 révèle que 94 % des critères du RGAA applicables sont respectés.</p><h2>Contenus non "
          "accessibles</h2><ul><li>Les composants d'autres modules (une FAQ, une galerie de médias, un localisateur de "
          "magasins, des formulaires) ne sont pas couverts par cette déclaration.</li><li>Certaines images de "
          "démonstration utilisent leur titre comme alternative textuelle, au lieu d'une description rédigée pour "
          "chaque usage.</li></ul><h2>Établissement de cette déclaration</h2><p>Établie le 30 septembre 2026. "
          "Technologies utilisées : HTML, CSS, JavaScript. Outils : axe-core et Lighthouse dans Chromium (bureau et "
          "320 px de large), dans six thèmes, et revue manuelle des critères du RGAA (clavier, focus, espacement du "
          "texte, redistribution, zoom, styles désactivés). Les lecteurs d'écran n'ont pas encore été testés (NVDA avec "
          "Firefox et VoiceOver avec Safari sont prévus). Pages testées (seize) : accueil, à propos, équipe, services, "
          "une page de service, page d'atterrissage, liste des actualités, une actualité, un article, plan du site, "
          "accessibilité, en anglais et en français.</p><h2>Retour d'information et contact</h2><p>Si vous n'arrivez pas à accéder à "
          "un contenu ou à un service, contactez-nous pour être orienté vers une alternative accessible ou obtenir le "
          "contenu sous une autre forme.</p><h2>Voies de recours</h2><p>Si vous avez signalé un défaut d'accessibilité "
          "sans obtenir de réponse satisfaisante, vous pouvez écrire au Défenseur des droits, utiliser le formulaire de "
          "contact de son site, contacter son délégué dans votre région, ou écrire gratuitement à : Défenseur des "
          "droits, Libre réponse 71120, 75342 Paris CEDEX 07.</p>",
}

LEGAL = {
    "en": "<p>Example legal notice of the classic-templates demonstration site.</p><h2>Publisher</h2><p>Classic Dev, an "
          "example company. Publication director: the site owner.</p><h2>Hosting</h2><p>The host of the site, its "
          "address and telephone number.</p><h2>Intellectual property</h2><p>Texts and images of this demonstration "
          "are examples.</p>",
    "fr": "<p>Mentions légales d'exemple du site de démonstration classic-templates.</p><h2>Éditeur</h2><p>Classic "
          "Dev, société d'exemple. Directeur de la publication : le propriétaire du site.</p><h2>Hébergement</h2><p>"
          "L'hébergeur du site, son adresse et son numéro de téléphone.</p><h2>Propriété intellectuelle</h2><p>Les "
          "textes et images de cette démonstration sont des exemples.</p>",
}

IMAGE_TITLES_FR = {
    "abstract-blue.jpg": "Composition abstraite de cercles bleus et turquoise sur un dégradé sombre",
    "abstract-warm.jpg": "Composition abstraite de cercles orange et rouges",
    "abstract-green.jpg": "Composition abstraite de cercles verts sur un dégradé clair",
}


def set_props(path, props):
    gql("mutation($p:String!,$props:[InputJCRProperty]){jcr{mutateNode(pathOrId:$p){setPropertiesBatch(properties:$props){path}}}}",
        {"p": path, "props": props})


def seed_accessibility(site):
    """Demo content the RGAA audit asked for: French image titles (they are the images' default
    text alternatives), the home backdrop marked decorative, a complete example accessibility
    statement and an example legal notice. Only touches nodes this script creates."""
    home = f"{site}/home"
    for name, title in IMAGE_TITLES_FR.items():
        set_props(f"{site}/files/demo/{name}", [{"name": "jcr:title", "value": title, "language": "fr"}])
    if exists(f"{home}/hero/welcome"):
        set_props(f"{home}/hero/welcome", [{"name": "imageDecorative", "value": "true"}])
    set_props(f"{home}/accessibility/main/statement", i18n("body", STATEMENT))
    add_content(ensure_area(f"{home}/legal", "main", "ctpl:pageArea"), "notice", "ctpl:richText", i18n("body", LEGAL))
    return [(f"{site}/files/demo", True), (f"{home}/hero/welcome", True),
            (f"{home}/accessibility/main/statement", True), (f"{home}/legal/main", True)]


def seed_examples(site):
    """Example content with every section type on the home, about, services and team pages, plus a
    site map page and an accessibility statement linked from the footer. Only adds what is missing.
    Returns (path, whole subtree?) pairs to publish: the new nodes with their subtree, and the lists
    they were added to without theirs (for the order), so an editor's unpublished work elsewhere on
    those pages stays unpublished."""
    home = f"{site}/home"
    images = f"{site}/files/demo"
    img = {k: uuid_at(f"{images}/{v}") for k, v in
           (("wide", "abstract-blue.jpg"), ("square", "abstract-warm.jpg"), ("tall", "abstract-green.jpg"))}
    touched = [(f"{home}/landing/main", True)]

    # ---- Home: key figures after the offer, a testimonial after the approach ------------------
    main = f"{home}/main"
    if not exists(f"{main}/figures"):
        figures = add_content(main, "figures", "ctpl:keyFigures",
            i18n("jcr:title", {"en": "Our year in numbers", "fr": "Notre année en chiffres"})
            + [{"name": "ctplSurface", "value": "sunken"}])
        for name, value, label in (
            ("projects", {"en": "140", "fr": "140"}, {"en": "sites launched", "fr": "sites lancés"}),
            ("editors", {"en": "1,200", "fr": "1 200"}, {"en": "editors trained", "fr": "rédacteurs formés"}),
            ("uptime", {"en": "99.9%", "fr": "99,9 %"}, {"en": "availability", "fr": "de disponibilité"}),
        ):
            add_content(figures, name, "ctpl:keyFigure", i18n("value", value) + i18n("label", label))
        place_after(main, "figures", "offer")
    if not exists(f"{main}/testimonial"):
        add_quote(main, "testimonial",
                  {"en": "The pages look like us, and we change them ourselves, in both languages.",
                   "fr": "Les pages nous ressemblent, et nous les modifions nous-mêmes, dans les deux langues."},
                  "Marc Lefèvre", {"en": "Communication manager, Example Group", "fr": "Responsable communication, Example Group"},
                  img["square"])
        place_after(main, "testimonial", "approach")
    touched += [(f"{main}/figures", True), (f"{main}/testimonial", True), (main, False)]

    # ---- About: cards to its sub-pages and a founder quote ----------------------------------
    about = f"{home}/about"
    about_main = ensure_area(about, "main", "ctpl:pageArea")
    grid = add_content(about_main, "more", "ctpl:cardGrid",
        i18n("jcr:title", {"en": "Get to know us", "fr": "Faire connaissance"}) + [{"name": "columns", "value": "2"}])
    add_card(grid, "team", uuid_at(f"{about}/team"), img["square"],
             {"en": "Designers, editors and engineers who build sites that last.", "fr": "Designers, rédacteurs et ingénieurs qui construisent des sites durables."},
             {"en": "Meet the team", "fr": "Rencontrer l'équipe"})
    add_card(grid, "history", uuid_at(f"{about}/history"), img["tall"],
             {"en": "From a two-person studio to a team of forty.", "fr": "D'un studio de deux personnes à une équipe de quarante."},
             {"en": "Read our story", "fr": "Lire notre histoire"})
    add_quote(about_main, "founder",
              {"en": "We started with one rule: every word on a page belongs to the people who write it.",
               "fr": "Nous sommes partis d'une règle : chaque mot d'une page appartient à ceux qui l'écrivent."},
              "Ada Martin", {"en": "Co-founder", "fr": "Cofondatrice"}, img["tall"], variant="large", surface="sunken")
    touched += [(f"{about_main}/more", True), (f"{about_main}/founder", True), (about_main, False)]

    # ---- Services: a card per service and a call-to-action banner ----------------------------
    services = f"{home}/services"
    svc_main = ensure_area(services, "main", "ctpl:pageArea")
    grid = add_content(svc_main, "all", "ctpl:cardGrid",
        i18n("jcr:title", {"en": "What we can do for you", "fr": "Ce que nous pouvons faire pour vous"})
        + i18n("introText", {"en": "Three ways to work together, alone or combined.", "fr": "Trois façons de travailler ensemble, seules ou combinées."})
        + [{"name": "columns", "value": "3"}])
    for name, image, text, label in (
        ("consulting", "wide", {"en": "Strategy and operations, from first workshop to launch.", "fr": "Stratégie et opérations, du premier atelier au lancement."},
         {"en": "Our consulting", "fr": "Notre conseil"}),
        ("training", "square", {"en": "Workshops that make your team autonomous.", "fr": "Des ateliers qui rendent votre équipe autonome."},
         {"en": "Our training", "fr": "Nos formations"}),
        ("support", "tall", {"en": "A single contact who knows your site.", "fr": "Un interlocuteur unique qui connaît votre site."},
         {"en": "Our support", "fr": "Notre assistance"}),
    ):
        add_card(grid, name, uuid_at(f"{services}/{name}"), img[image], text, label)
    props, mixins = cta(uuid_at(f"{home}/contact"), {"en": "Book a call", "fr": "Prendre rendez-vous"})
    add_content(svc_main, "talk", "ctpl:richText",
        i18n("jcr:title", {"en": "Not sure where to start?", "fr": "Vous ne savez pas par où commencer ?"})
        + i18n("body", {"en": "<p>A thirty-minute call is enough to find the right mix.</p>",
                        "fr": "<p>Un appel de trente minutes suffit pour trouver la bonne formule.</p>"})
        + [{"name": "ctplSurface", "value": "accent"}] + props, ["ctplmix:cta"] + mixins)
    touched += [(svc_main, True)]

    # ---- Team: two quotes side by side -----------------------------------------------------
    team = f"{home}/about/team"
    row = add_content(ensure_area(team, "main", "ctpl:pageArea"), "voices", "ctpl:columns",
        i18n("jcr:title", {"en": "In their words", "fr": "Avec leurs mots"}) + [{"name": "layout", "value": "halves"}])
    add_quote(f"{row}/col1", "quote", {"en": "I publish in French and English without asking anyone.",
                                       "fr": "Je publie en français et en anglais sans rien demander à personne."},
              "Louis Bernard", {"en": "Editor", "fr": "Rédacteur"})
    add_quote(f"{row}/col2", "quote", {"en": "Changing the theme took an afternoon, not a project.",
                                       "fr": "Changer de thème a pris un après-midi, pas un projet."},
              "Nora Haddad", {"en": "Designer", "fr": "Designer"})
    touched += [(row, True), (f"{team}/main", False)]

    # ---- Site map and accessibility statement, linked from the footer ------------------------
    sitemap = add_page(home, "sitemap", {"en": "Site map", "fr": "Plan du site"}, hidden=True,
                       description={"en": "Every page of the site.", "fr": "Toutes les pages du site."})
    add_content(ensure_area(f"{home}/sitemap", "main", "ctpl:pageArea"), "map", "ctpl:siteMap", [])
    statement = add_page(home, "accessibility", {"en": "Accessibility", "fr": "Accessibilité"}, hidden=True,
                         description={"en": "Accessibility statement of the site.", "fr": "Déclaration d'accessibilité du site."})
    props, mixins = cta(uuid_at(f"{home}/contact"), {"en": "Report a problem", "fr": "Signaler un problème"})
    add_content(ensure_area(f"{home}/accessibility", "main", "ctpl:pageArea"), "statement", "ctpl:richText",
        i18n("body", {
            "en": "<p>This demonstration site is <strong>partially compliant</strong> with the French accessibility "
                  "standard RGAA 4.1.2 (an example statement: a real site publishes the results of its own audit).</p>"
                  "<h2>Content that is not accessible</h2><ul><li>Add-on components from other modules are not covered "
                  "by this statement.</li></ul><h2>Feedback and contact</h2><p>If you cannot reach a content or a service, "
                  "contact us so that we send it to you in another form.</p>",
            "fr": "<p>Ce site de démonstration est <strong>partiellement conforme</strong> au référentiel général "
                  "d'amélioration de l'accessibilité RGAA 4.1.2 (déclaration d'exemple : un vrai site publie les résultats "
                  "de son propre audit).</p><h2>Contenus non accessibles</h2><ul><li>Les composants d'autres modules ne sont "
                  "pas couverts par cette déclaration.</li></ul><h2>Retour d'information et contact</h2><p>Si vous ne "
                  "parvenez pas à accéder à un contenu ou à un service, contactez-nous pour qu'il vous soit transmis sous "
                  "une autre forme.</p>"})
        + props, ["ctplmix:cta"] + mixins)
    legal = f"{home}/siteFooter/footer/legal"
    add_link(legal, "sitemap", page=sitemap)
    # The mention the law asks for on the home page (loi 2005-102, art. 47): the footer shows it on every page.
    add_link(legal, "accessibility", {"en": "Accessibility: partially compliant", "fr": "Accessibilité : partiellement conforme"},
             page=statement)
    touched += [(f"{home}/sitemap", True), (f"{home}/accessibility", True),
                (f"{legal}/sitemap", True), (f"{legal}/accessibility", True), (legal, False)]
    return touched


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="classic-dev")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--recreate", action="store_true")
    mode.add_argument("--sections-only", action="store_true")
    args = ap.parse_args()
    site = f"/sites/{args.site}"
    home = f"{site}/home"

    if args.sections_only:
        seed_landing_sections(site)
        for path, subtree in seed_examples(site) + seed_accessibility(site):
            gql("mutation($s:String!,$t:Boolean){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
                "publishSubNodes:$t,includeSubTree:$t)}}}", {"s": path, "t": subtree})
        print(f"example sections seeded and published on {site}")
        return

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
    # A call-to-action banner: rich text on the accent surface with the optional ctplmix:cta on.
    props, mixins = cta(p["contact"], {"en": "Talk to us", "fr": "Parlons-en"})
    add_content(f"{home}/landing/main", "talk", "ctpl:richText",
        i18n("jcr:title", {"en": "Ready to start?", "fr": "Prêt à commencer ?"})
        + i18n("body", {"en": "<p>Tell us about your site: we answer within a day.</p>",
                        "fr": "<p>Parlez-nous de votre site : nous répondons sous un jour.</p>"})
        + [{"name": "ctplSurface", "value": "accent"}] + props, ["ctplmix:cta"] + mixins)

    # ---- News and articles (main resources in content folders) + content lists ---------------
    contents = f"{site}/contents"
    for folder, typ, en, fr in (("news", "ctpl:news", "News", "Actualités"), ("articles", "ctpl:article", "Articles", "Articles")):
        if not exists(f"{contents}/{folder}"):
            add_content(contents, folder, "jnt:contentFolder",
                        i18n("jcr:title", {"en": en, "fr": fr}) + [{"name": "j:contributeTypes", "values": [typ]}],
                        ["jmix:contributeMode"])
    news_items = [
        ("launch", "2026-09-28", "Classic templates is out", "Classic templates est disponible",
         "A themeable template set with header, footer and reusable sections.", "Un jeu de gabarits personnalisable avec en-tête, pied de page et sections réutilisables.",
         "wide", ["release", "templates"]),
        ("dark-mode", "2026-09-21", "Dark mode for every theme", "Le mode sombre pour chaque thème",
         "Visitors get light or dark automatically; administrators can force one.", "Les visiteurs ont le clair ou le sombre automatiquement ; les administrateurs peuvent en imposer un.",
         "square", ["design"]),
        ("accessibility", "2026-09-14", "Accessibility checked on every page", "L'accessibilité vérifiée sur chaque page",
         "Every page passes the full axe rule set in each theme.", "Chaque page passe l'ensemble des règles axe dans chaque thème.",
         "tall", ["accessibility"]),
        ("french", "2026-09-07", "Fully bilingual", "Entièrement bilingue",
         "Every label, link and page exists in English and French.", "Chaque libellé, lien et page existe en anglais et en français.",
         None, ["i18n"]),
        ("columns", "2026-08-31", "Columns that keep your content", "Des colonnes qui gardent votre contenu",
         "Switch from four columns to two and back without losing anything.", "Passez de quatre colonnes à deux et revenez sans rien perdre.",
         "wide", ["editing"]),
        ("workshop", "2026-08-24", "Autumn editor workshop", "Atelier rédacteurs d'automne",
         "Two hours to master Page Builder with the classic templates.", "Deux heures pour maîtriser Page Builder avec les classic templates.",
         "square", ["training"]),
    ]
    for name, day, en_t, fr_t, en_s, fr_s, image, tags in news_items:
        props = (i18n("jcr:title", {"en": en_t, "fr": fr_t}) + i18n("teaser", {"en": en_s, "fr": fr_s})
                 + i18n("body", {"en": f"<p>{en_s}</p><p>This demonstration item is part of the classic-templates demo site.</p>",
                                 "fr": f"<p>{fr_s}</p><p>Cet élément de démonstration fait partie du site de démonstration classic-templates.</p>"})
                 + [{"name": "publicationDate", "type": "DATE", "value": f"{day}T09:00:00.000+02:00"},
                    {"name": "j:tagList", "values": tags}])
        if image:
            props.append({"name": "image", "type": "WEAKREFERENCE", "value": img[image]})
        add_content(f"{contents}/news", name, "ctpl:news", props, ["jmix:tagged"])
    long_body = {
        "en": "".join(f"<p>{s}</p>" for s in [
            "A template set is a contract between developers and editors.",
            "Developers promise that every visible string is content and every colour is a token; editors get pages they can assemble and restyle without asking for a deploy.",
            "The classic templates keep that promise with a small vocabulary: a hero banner, image and text, rich text, columns and content lists. " * 6]),
        "fr": "".join(f"<p>{s}</p>" for s in [
            "Un jeu de gabarits est un contrat entre développeurs et rédacteurs.",
            "Les développeurs promettent que chaque texte visible est du contenu et chaque couleur un jeton ; les rédacteurs obtiennent des pages qu'ils assemblent et restylent sans attendre un déploiement.",
            "Les classic templates tiennent cette promesse avec un petit vocabulaire : bannière, image et texte, texte riche, colonnes et listes de contenus. " * 6]),
    }
    for name, day, author, en_t, fr_t, en_s, fr_s, image in [
        ("contract", "2026-09-25", "Ada Martin", "The template set as a contract", "Le jeu de gabarits comme contrat",
         "Why every visible string is content and every colour a token.", "Pourquoi chaque texte visible est du contenu et chaque couleur un jeton.", "tall"),
        ("tokens", "2026-09-10", "Louis Bernard", "Three tiers of design tokens", "Trois niveaux de jetons de design",
         "Primitives, semantic roles and component knobs, and why components only read the middle one.", "Primitives, rôles sémantiques et réglages de composant, et pourquoi les composants ne lisent que le niveau du milieu.", "wide"),
        ("navigation", "2026-08-20", "Ada Martin", "A menu that works without JavaScript", "Un menu qui fonctionne sans JavaScript",
         "Server-rendered first, enhanced second: the disclosure pattern in practice.", "Rendu serveur d'abord, amélioré ensuite : le motif disclosure en pratique.", None),
    ]:
        props = (i18n("jcr:title", {"en": en_t, "fr": fr_t}) + i18n("teaser", {"en": en_s, "fr": fr_s}) + i18n("body", long_body)
                 + [{"name": "publicationDate", "type": "DATE", "value": f"{day}T09:00:00.000+02:00"}, {"name": "author", "value": author}])
        if image:
            props.append({"name": "image", "type": "WEAKREFERENCE", "value": img[image]})
        add_content(f"{contents}/articles", name, "ctpl:article", props)

    # ---- Demo categories (system site) and their use on news items ------------------------------
    cats_root = "/sites/systemsite/categories"
    demo_cats = add_content(cats_root, "classic-templates-demo", "jnt:category",
                            i18n("jcr:title", {"en": "Classic templates demo", "fr": "Démo classic templates"}))
    product = add_content(demo_cats, "product", "jnt:category", i18n("jcr:title", {"en": "Product", "fr": "Produit"}))
    features = add_content(product, "features", "jnt:category", i18n("jcr:title", {"en": "Features", "fr": "Fonctionnalités"}))
    events = add_content(demo_cats, "events", "jnt:category", i18n("jcr:title", {"en": "Events", "fr": "Événements"}))
    uuid_of = lambda path: gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})["jcr"]["nodeByPath"]["uuid"]
    for item, category in (("launch", product), ("columns", product), ("dark-mode", features),
                           ("accessibility", features), ("workshop", events)):
        gql('mutation($p:String!,$c:[String]){jcr{mutateNode(pathOrId:$p){addMixins(mixins:["jmix:categorized"]) '
            'mutateProperty(name:"j:defaultCategory"){setValues(values:$c,type:WEAKREFERENCE)}}}}',
            {"p": f"{contents}/news/{item}", "c": [uuid_of(category)]})

    news_folder = gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": f"{contents}/news"})["jcr"]["nodeByPath"]["uuid"]
    articles_folder = gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": f"{contents}/articles"})["jcr"]["nodeByPath"]["uuid"]
    props, mixins = cta(p["news"], {"en": "All news", "fr": "Toutes les actualités"})
    add_content(main, "latest", "ctpl:jcrQuery", i18n("jcr:title", {"en": "Latest news", "fr": "Dernières actualités"})
        + [{"name": "type", "value": "ctpl:news"}, {"name": "startNode", "type": "WEAKREFERENCE", "value": news_folder},
           {"name": "maxItems", "value": "3"}, {"name": "layout", "value": "grid"}] + props, mixins)
    add_content(main, "reading", "ctpl:jcrQuery", i18n("jcr:title", {"en": "Articles", "fr": "Articles"})
        + [{"name": "type", "value": "ctpl:article"}, {"name": "startNode", "type": "WEAKREFERENCE", "value": articles_folder},
           {"name": "maxItems", "value": "3"}, {"name": "layout", "value": "list"}, {"name": "ctplSurface", "value": "sunken"}])
    # "Product news": items in Product, including those filed under its subcategory Features.
    add_content(ensure_area(f"{home}/news", "main", "ctpl:pageArea"), "product", "ctpl:jcrQuery",
        i18n("jcr:title", {"en": "Product news", "fr": "Actualités produit"})
        + [{"name": "type", "value": "ctpl:news"}, {"name": "startNode", "type": "WEAKREFERENCE", "value": news_folder},
           {"name": "maxItems", "value": "6"}, {"name": "layout", "value": "list"},
           {"name": "filterCategories", "type": "WEAKREFERENCE", "values": [uuid_of(product)]}])
    add_content(ensure_area(f"{home}/news", "main", "ctpl:pageArea"), "all", "ctpl:jcrQuery",
        i18n("noResultText", {"en": "No news yet.", "fr": "Pas encore d'actualités."})
        + [{"name": "type", "value": "ctpl:news"}, {"name": "startNode", "type": "WEAKREFERENCE", "value": news_folder},
           {"name": "maxItems", "value": "24"}, {"name": "layout", "value": "grid"}])

    seed_landing_sections(site)
    seed_examples(site)
    seed_accessibility(site)

    for root in (site, f"{site}/files", demo_cats):
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

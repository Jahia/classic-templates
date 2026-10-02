#!/usr/bin/env python3
"""Seeds a small test site for classic-travel on the classic-templates template set (EN + FR).

    python3 scripts/seed-test-site.py [--site ctrv-test]

The script:
  - creates the site on the classic-templates template set when it does not exist, with EN and FR;
  - enables classic-travel on it;
  - uploads three generated images (Pillow) to files/travel, with titles as alt text;
  - adds a content folder "travel" with three destinations and, under it, "fares" with two fare
    offers (EN + FR, prices, dates, conditions, a call to action to the booking page);
  - adds a "Travel" page holding a fare list, a destination grid and a travel tools section with
    three tools and a demonstration notice, and a "Booking information" page the links point to;
  - publishes the site and its files in both languages.
Nodes that already exist are left alone, so the script can be run again. Link targets are set in
every language (they are i18n). One HTTP session is reused for every call (a fresh basic auth per
call exhausts the licence's authenticated-visitor cap).

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234).
"""
import argparse
import base64
import http.cookiejar
import io
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
    out = json.loads(_request("/modules/graphql", body, {"Content-Type": "application/json", "Origin": URL}))
    if out.get("errors"):
        raise RuntimeError(json.dumps(out["errors"])[:800])
    return out["data"]


def provisioning(script):
    return _request("/modules/api/provisioning", script.encode(), {"Content-Type": "application/yaml"})


def exists(path):
    try:
        gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})
        return True
    except RuntimeError:
        return False


def uuid_at(path):
    return gql("query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", {"p": path})["jcr"]["nodeByPath"]["uuid"]


def i18n(name, values):
    """Properties for an i18n field given as {lang: value}."""
    return [{"name": name, "value": v, "language": lang} for lang, v in values.items()]


def add_content(parent, name, node_type, props, mixins=None):
    """Adds a node (skipped when it exists). Returns its path."""
    path = f"{parent}/{name}"
    if not exists(path):
        gql("mutation($parent:String!,$name:String!,$type:String!,$mixins:[String],$props:[InputJCRProperty]){"
            "jcr{mutateNode(pathOrId:$parent){addChild(name:$name,primaryNodeType:$type,mixins:$mixins,"
            "properties:$props){uuid}}}}",
            {"parent": parent, "name": name, "type": node_type, "mixins": mixins or [], "props": props})
    return path


def add_page(parent, name, title, description=None):
    props = i18n("jcr:title", title) + [{"name": "j:templateName", "value": "content"}]
    if description:
        props += i18n("jcr:description", description)
    return add_content(parent, name, "jnt:page", props)


def internal_cta(target_uuid, label):
    """Properties + mixins of a classic-templates ctplmix:cta pointing at a page, in every language."""
    props = i18n("ctaLabel", label) + [{"name": "j:linkType", "value": "internal"}]
    props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": target_uuid, "language": lang}
              for lang in LANGS]
    return props, ["jmix:internalLink"]


def upload_image(folder, name, title, size, colours):
    """Draws a simple travel-poster image (sky, sun, hills) and stores it as jnt:file + jmix:image."""
    from PIL import Image, ImageDraw, ImageFilter

    path = f"{folder}/{name}"
    if exists(path):
        return uuid_at(path)
    w, h = size
    sky_top, sky_bottom, sun, hills = colours
    img = Image.new("RGB", size, sky_top)
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(sky_top, sky_bottom)))
    r = h // 5
    d.ellipse([w * 0.62 - r, h * 0.35 - r, w * 0.62 + r, h * 0.35 + r], fill=sun)
    d.polygon([(0, h), (0, h * 0.7), (w * 0.3, h * 0.55), (w * 0.6, h * 0.72), (w, h * 0.6), (w, h)], fill=hills)
    img = img.filter(ImageFilter.GaussianBlur(1))
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
    boundary = "----ctrvimage"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{operations}\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{name}"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + buf.getvalue() + f"\r\n--{boundary}--\r\n".encode()
    out = json.loads(_request("/modules/graphql", body, {
        "Content-Type": f"multipart/form-data; boundary={boundary}", "Origin": URL}))
    if out.get("errors"):
        raise RuntimeError(json.dumps(out["errors"])[:800])
    stored = gql('query($p:String!){jcr{nodeByPath(path:$p){c:descendant(relPath:"jcr:content"){'
                 'p:property(name:"jcr:data"){value}}}}}', {"p": path})["jcr"]["nodeByPath"]["c"]["p"]["value"] or ""
    if stored.startswith("org.apache."):
        sys.exit(f"upload of {name} stored a Java object reference instead of the image")
    return out["data"]["jcr"]["addNode"]["uuid"]


def create_site(key):
    provisioning(f'- createSite: ""\n  siteKey: {key}\n  title: "Classic Travel Test"\n  defaultLanguage: en\n'
                 f"  serverName: localhost\n  templateSet: classic-templates\n")
    for _ in range(60):
        if exists(f"/sites/{key}/home/siteHeader/header"):
            break
        time.sleep(1)
    else:
        sys.exit(f"site {key} was not created from the template set (no seeded header)")


DESTINATIONS = (
    ("tokyo", {"en": "Tokyo", "fr": "Tokyo"}, "NRT", {"en": "Japan", "fr": "Japon"}, "japanKorea", 2980,
     {"en": "Neon streets, quiet temples and the best noodles of your life.",
      "fr": "Rues de néon, temples paisibles et les meilleures nouilles de votre vie."},
     {"en": "<p>Tokyo mixes the very old and the very new. Spend a morning in Asakusa, an afternoon in "
            "Shibuya and an evening in a small izakaya.</p><h2>When to go</h2><p>Spring for the cherry "
            "blossoms, autumn for the colours.</p>",
      "fr": "<p>Tokyo mêle le très ancien et le très moderne. Passez une matinée à Asakusa, un après-midi à "
            "Shibuya et une soirée dans un petit izakaya.</p><h2>Quand partir</h2><p>Au printemps pour les "
            "cerisiers en fleurs, à l'automne pour les couleurs.</p>"},
     {"en": "Japanese yen (JPY)", "fr": "Yen japonais (JPY)"}, {"en": "Japanese", "fr": "Japonais"},
     {"en": "UTC+9, one hour ahead of Hong Kong", "fr": "UTC+9, une heure de plus qu'à Hong Kong"},
     {"en": "100 V, plugs of type A and B", "fr": "100 V, prises de type A et B"}, "+81",
     {"en": "One way, economy, taxes included. Demonstration price.",
      "fr": "Aller simple, classe économique, taxes incluses. Prix de démonstration."},
     ((30, 60, 120), (240, 170, 150), (250, 236, 200), (60, 40, 80)), "Tokyo skyline at dusk"),
    ("bangkok", {"en": "Bangkok", "fr": "Bangkok"}, "BKK", {"en": "Thailand", "fr": "Thaïlande"}, "southeastAsia", 1280,
     {"en": "Golden temples, river boats and street food at every corner.",
      "fr": "Temples dorés, bateaux sur le fleuve et cuisine de rue à chaque coin."},
     {"en": "<p>Ride a long-tail boat on the Chao Phraya, then get lost in the night markets.</p>",
      "fr": "<p>Montez à bord d'un bateau à longue queue sur le Chao Phraya, puis perdez-vous dans les marchés "
            "de nuit.</p>"},
     {"en": "Thai baht (THB)", "fr": "Baht thaïlandais (THB)"}, {"en": "Thai", "fr": "Thaï"},
     {"en": "UTC+7, one hour behind Hong Kong", "fr": "UTC+7, une heure de moins qu'à Hong Kong"},
     {"en": "220 V, plugs of type A, B, C and O", "fr": "220 V, prises de type A, B, C et O"}, "+66",
     {"en": "One way, economy, taxes included. Demonstration price.",
      "fr": "Aller simple, classe économique, taxes incluses. Prix de démonstration."},
     ((250, 160, 60), (250, 220, 150), (255, 245, 210), (20, 90, 80)), "Bangkok temple roofs in the sun"),
    ("sydney", {"en": "Sydney", "fr": "Sydney"}, "SYD", {"en": "Australia", "fr": "Australie"}, "oceania", 4580,
     {"en": "Harbour views, golden beaches and a coastal walk to remember.",
      "fr": "Vue sur la baie, plages dorées et une balade côtière inoubliable."},
     {"en": "<p>Walk from Bondi to Coogee, then take the ferry to Manly at sunset.</p>",
      "fr": "<p>Marchez de Bondi à Coogee, puis prenez le ferry pour Manly au coucher du soleil.</p>"},
     {"en": "Australian dollar (AUD)", "fr": "Dollar australien (AUD)"}, {"en": "English", "fr": "Anglais"},
     {"en": "UTC+10, two hours ahead of Hong Kong", "fr": "UTC+10, deux heures de plus qu'à Hong Kong"},
     {"en": "230 V, plugs of type I", "fr": "230 V, prises de type I"}, "+61",
     {"en": "One way, economy, taxes included. Demonstration price.",
      "fr": "Aller simple, classe économique, taxes incluses. Prix de démonstration."},
     ((40, 120, 200), (170, 220, 240), (255, 250, 230), (200, 160, 90)), "Sydney harbour and beach"),
)


def seed_destinations(site):
    folder = add_content(f"{site}/contents", "travel", "jnt:contentFolder",
                         i18n("jcr:title", {"en": "Travel", "fr": "Voyage"}))
    images = add_content(f"{site}/files", "travel", "jnt:folder", [])
    paths = {}
    for (name, title, code, country, region, price, teaser, body, currency, language, tz, voltage, dial,
         note, colours, alt) in DESTINATIONS:
        image = upload_image(images, f"{name}.jpg", alt, (1200, 675), colours)
        paths[name] = add_content(folder, name, "ctrv:destination",
                                  i18n("jcr:title", title) + i18n("country", country) + i18n("teaser", teaser)
                                  + i18n("body", body) + i18n("localCurrency", currency) + i18n("language", language)
                                  + i18n("timeZone", tz) + i18n("voltage", voltage) + i18n("priceNote", note)
                                  + [{"name": "airportCode", "value": code}, {"name": "region", "value": region},
                                     {"name": "price", "type": "DOUBLE", "value": str(price)},
                                     {"name": "currency", "value": "HKD"},
                                     {"name": "diallingCode", "value": dial},
                                     {"name": "image", "type": "WEAKREFERENCE", "value": image}])
    # Related destinations (set once all three exist).
    gql("mutation($p:String!,$v:[String]){jcr{mutateNode(pathOrId:$p){mutateProperty(name:\"relatedDestinations\")"
        "{setValues(type:WEAKREFERENCE,values:$v)}}}}",
        {"p": paths["tokyo"], "v": [uuid_at(paths["bangkok"]), uuid_at(paths["sydney"])]})
    return folder, paths


def seed_fares(folder, destinations, booking_uuid):
    fares = add_content(folder, "fares", "jnt:contentFolder", i18n("jcr:title", {"en": "Fares", "fr": "Tarifs"}))
    for name, title, dest, cabin, price, travel_from, travel_to, sale_ends, label in (
        ("tokyo-economy", {"en": "Tokyo in economy from Hong Kong", "fr": "Tokyo en économique au départ de Hong Kong"},
         "tokyo", "economy", 2980, "2026-11-01", "2027-03-31", "2026-12-15",
         {"en": "Book this fare", "fr": "Réserver ce tarif"}),
        ("bangkok-business", {"en": "Bangkok in business from Hong Kong", "fr": "Bangkok en affaires au départ de Hong Kong"},
         "bangkok", "business", 6880, "2026-10-15", "2027-01-31", "2026-11-30",
         {"en": "Book this fare", "fr": "Réserver ce tarif"}),
    ):
        props, mixins = internal_cta(booking_uuid, label)
        add_content(fares, name, "ctrv:fareOffer",
                    i18n("jcr:title", title) + i18n("origin", {"en": "Hong Kong", "fr": "Hong Kong"})
                    + i18n("priceNote", {"en": "Return, taxes included. Demonstration price.",
                                         "fr": "Aller-retour, taxes incluses. Prix de démonstration."})
                    + i18n("conditions", {
                        "en": "<p>Changes allowed for a fee. No refund.</p><h2>Baggage</h2><p>One checked bag of 23 kg.</p>",
                        "fr": "<p>Modifications possibles avec frais. Non remboursable.</p><h2>Bagages</h2>"
                              "<p>Un bagage en soute de 23 kg.</p>"})
                    + [{"name": "destination", "type": "WEAKREFERENCE", "value": uuid_at(destinations[dest])},
                       {"name": "cabin", "value": cabin},
                       {"name": "price", "type": "DOUBLE", "value": str(price)},
                       {"name": "currency", "value": "HKD"},
                       {"name": "travelFrom", "type": "DATE", "value": f"{travel_from}T00:00:00.000Z"},
                       {"name": "travelTo", "type": "DATE", "value": f"{travel_to}T00:00:00.000Z"},
                       {"name": "saleEnds", "type": "DATE", "value": f"{sale_ends}T00:00:00.000Z"}] + props,
                    mixins)
    return fares


def seed_page(home, folder, fares, booking_uuid):
    page = add_page(home, "travel", {"en": "Travel", "fr": "Voyager"},
                    {"en": "Fares, destinations and travel tools.", "fr": "Tarifs, destinations et outils de voyage."})
    area = add_content(page, "main", "ctpl:pageArea", [])
    add_content(area, "fares", "ctrv:fareList",
                i18n("jcr:title", {"en": "Fares of the moment", "fr": "Tarifs du moment"})
                + [{"name": "startNode", "type": "WEAKREFERENCE", "value": uuid_at(fares)},
                   {"name": "sort", "value": "priceAsc"}, {"name": "maxItems", "type": "LONG", "value": "6"}])
    add_content(area, "destinations", "ctrv:destinationGrid",
                i18n("jcr:title", {"en": "Our destinations", "fr": "Nos destinations"})
                + [{"name": "startNode", "type": "WEAKREFERENCE", "value": uuid_at(folder)},
                   {"name": "ctplSurface", "value": "sunken"}])
    tools = add_content(area, "tools", "ctrv:travelTools",
                        i18n("jcr:title", {"en": "Travel tools", "fr": "Outils de voyage"})
                        + i18n("notice", {"en": "This is a demonstration site: no booking is made.",
                                          "fr": "Ce site est une démonstration : aucune réservation n'est effectuée."}))
    for name, title, text, label in (
        ("book", {"en": "Book a flight", "fr": "Réserver un vol"},
         {"en": "<p>Choose your departure city, your destination and your dates.</p>",
          "fr": "<p>Choisissez votre ville de départ, votre destination et vos dates.</p>"},
         {"en": "How booking works", "fr": "Comment réserver"}),
        ("manage", {"en": "Manage a booking", "fr": "Gérer une réservation"},
         {"en": "<p>Change your seat, add a bag or update your contact details.</p>",
          "fr": "<p>Changez de siège, ajoutez un bagage ou mettez à jour vos coordonnées.</p>"},
         {"en": "Manage my booking", "fr": "Gérer ma réservation"}),
        ("checkin", {"en": "Check in", "fr": "Enregistrement"},
         {"en": "<p>Online check-in opens 48 hours before departure.</p>",
          "fr": "<p>L'enregistrement en ligne ouvre 48 heures avant le départ.</p>"},
         {"en": "Check in online", "fr": "S'enregistrer en ligne"}),
    ):
        props, mixins = internal_cta(booking_uuid, label)
        add_content(tools, name, "ctrv:travelTool", i18n("jcr:title", title) + i18n("text", text) + props, mixins)
    # A classic-templates content list of fare offers (compact rows): ctrv types are ctplmix:listable.
    add_content(area, "offers-list", "ctpl:jcrQuery",
                i18n("jcr:title", {"en": "All offers (content list)", "fr": "Toutes les offres (liste de contenus)"})
                + [{"name": "type", "value": "ctrv:fareOffer"},
                   {"name": "startNode", "type": "WEAKREFERENCE", "value": uuid_at(fares)},
                   {"name": "criteria", "value": "jcr:title"}, {"name": "sortDirection", "value": "asc"},
                   {"name": "layout", "value": "list"}])
    return page


def publish(path, subtree=True):
    gql("mutation($s:String!,$t:Boolean){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
        "publishSubNodes:$t,includeSubTree:$t)}}}", {"s": path, "t": subtree})


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="ctrv-test")
    args = ap.parse_args()
    site = f"/sites/{args.site}"
    home = f"{site}/home"
    if not exists(site):
        create_site(args.site)
    gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){setPropertiesBatch(properties:["
        '{name:"j:languages",values:["en","fr"]},{name:"j:mandatoryLanguages",values:[]},'
        '{name:"j:inactiveLanguages",values:[]},{name:"j:inactiveLiveLanguages",values:[]},'
        '{name:"j:description",value:"A test site for the classic-travel module."}'
        "]){path}}}}", {"s": site})
    provisioning(f'- enable: "classic-travel"\n  site: "{args.site}"\n')
    booking = add_page(home, "booking", {"en": "Booking information", "fr": "Informations de réservation"},
                       {"en": "How booking works on this demonstration site.",
                        "fr": "Comment fonctionne la réservation sur ce site de démonstration."})
    booking_uuid = uuid_at(booking)
    folder, destinations = seed_destinations(site)
    fares = seed_fares(folder, destinations, booking_uuid)
    seed_page(home, folder, fares, booking_uuid)
    publish(site, subtree=False)
    for path in (f"{site}/files/travel", f"{site}/contents/travel", home):
        publish(path)
    print(f"{site} seeded and published: {URL}/sites/{args.site}/home/travel.html")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Seeds a demonstration site of add-on modules inside classic-templates pages (EN + FR).

    python3 scripts/seed-addons.py [--site classic-addons]
    python3 scripts/seed-addons.py --contact-only --site classic-dev

A separate site from classic-dev on purpose: classic-dev shows the template set's own components
(plus a Formidable contact form), this one the components of other modules. The script:
  - creates the site on the classic-templates template set when it does not exist (EN + FR);
  - enables jsfaq, js-media-gallery, js-store-locator and formidable-elements on it;
  - uploads the three demo images;
  - adds one page per add-on, each holding a ctpl:freeZone with the add-on's component: a FAQ, an
    image gallery, a store locator over three stores, and a Formidable contact form (name, email,
    message; submissions saved in the JCR) placed with a form reference;
  - publishes the site and its files.
Nodes that already exist are left alone. Same environment and session rules as seed-demo.py.

--contact-only only enables formidable-elements and adds the contact
form to the site's existing contact page, then publishes the new nodes: this is how classic-dev
gets the form its accessibility statement points to.

--showcase enables jsfaq, js-media-gallery and js-store-locator on the site (classic-dev) and adds
a "Practical information" page written in the demo studio's voice: a FAQ about visiting and
workshops, the studio's colour studies as a gallery, and a locator of the studio and the partner
rooms used in Paris and Geneva. Only the new page and the new stores folder are published.
"""
import argparse
import json
import importlib.util
import time
from pathlib import Path

spec = importlib.util.spec_from_file_location("seed_demo", Path(__file__).with_name("seed-demo.py"))
demo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(demo)
gql, exists, add_content, ensure_area, i18n, add_page, uuid_at, provisioning, upload_image = (
    demo.gql, demo.exists, demo.add_content, demo.ensure_area, demo.i18n, demo.add_page, demo.uuid_at,
    demo.provisioning, demo.upload_image)

ADDONS = ["jsfaq", "js-media-gallery", "js-store-locator", "formidable-elements"]


def create_site(key):
    provisioning(
        f'- createSite: ""\n  siteKey: {key}\n  title: "Classic Add-ons"\n  defaultLanguage: en\n'
        f"  serverName: localhost\n  templateSet: classic-templates\n", "application/yaml")
    for _ in range(60):
        if exists(f"/sites/{key}/home/siteHeader/header"):
            break
        time.sleep(1)
    gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){setPropertiesBatch(properties:["
        '{name:"j:languages",values:["en","fr"]},{name:"j:mandatoryLanguages",values:[]},'
        '{name:"j:inactiveLanguages",values:[]},{name:"j:inactiveLiveLanguages",values:[]},'
        '{name:"j:description",value:"Components of other modules inside classic-templates pages."}'
        "]){path}}}}", {"s": f"/sites/{key}"})


def zone(page, name, title):
    """A free zone at page width; no title when the add-on renders its own section heading."""
    return add_content(ensure_area(page, "main", "ctpl:pageArea"), name, "ctpl:freeZone",
                       (i18n("jcr:title", title) if title else []) + [{"name": "width", "value": "container"}])


def seed_faq(site, home):
    page = f"{home}/faq"
    add_page(home, "faq", {"en": "FAQ", "fr": "FAQ"},
             description={"en": "Frequently asked questions.", "fr": "Questions fréquentes."})
    faq = add_content(zone(page, "questions", {"en": "Questions and answers", "fr": "Questions et réponses"}),
                      "faq", "jsfaqnt:faqPage", i18n("jcr:title", {"en": "Frequently asked questions", "fr": "Questions fréquentes"})
                      # Under the free zone's h2: the FAQ title is an h3, its questions follow.
                      + [{"name": "headingLevel", "value": "3"}])
    for name, q, a in (
        ("theme", {"en": "How do I change the theme?", "fr": "Comment changer de thème ?"},
         {"en": "<p>Open the site in jContent, edit the site and pick a theme and a colour scheme.</p>",
          "fr": "<p>Ouvrez le site dans jContent, modifiez le site et choisissez un thème et un schéma de couleurs.</p>"}),
        ("languages", {"en": "Which languages are supported?", "fr": "Quelles langues sont prises en charge ?"},
         {"en": "<p>Every text is content: add a language to the site and translate the pages.</p>",
          "fr": "<p>Chaque texte est du contenu : ajoutez une langue au site et traduisez les pages.</p>"}),
        ("addons", {"en": "Can I use components of other modules?", "fr": "Puis-je utiliser des composants d'autres modules ?"},
         {"en": "<p>Yes: drop them in a free zone, they follow the site's theme.</p>",
          "fr": "<p>Oui : déposez-les dans une zone libre, ils suivent le thème du site.</p>"}),
    ):
        add_content(faq, name, "jsfaqnt:faqItem", i18n("question", q) + i18n("answer", a) + i18n("jcr:title", q))


def seed_gallery(site, home, images):
    page = f"{home}/gallery"
    add_page(home, "gallery", {"en": "Gallery", "fr": "Galerie"},
             description={"en": "An image gallery.", "fr": "Une galerie d'images."})
    add_content(zone(page, "pictures", {"en": "Pictures", "fr": "Images"}), "gallery", "jsmediagallerynt:imageGallery",
                i18n("jcr:title", {"en": "Abstract compositions", "fr": "Compositions abstraites"})
                + [{"name": "imgGalleryType", "value": "imgFile"},
                   {"name": "imagesList", "type": "WEAKREFERENCE", "values": images}],
                ["jsmediagallerymix:imagesLink"])


def seed_stores(site, home):
    page = f"{home}/stores"
    add_page(home, "stores", {"en": "Our stores", "fr": "Nos magasins"},
             description={"en": "Find a store near you.", "fr": "Trouvez un magasin près de chez vous."})
    folder = add_content(f"{site}/contents", "stores", "jnt:contentFolder",
                         i18n("jcr:title", {"en": "Stores", "fr": "Magasins"}))
    for name, city, street, postal, lat, lon in (
        ("paris", "Paris", "10 rue de Rivoli", "75001", 48.8606, 2.3376),
        ("lyon", "Lyon", "5 place Bellecour", "69002", 45.7578, 4.8320),
        ("geneva", "Genève", "12 rue du Rhône", "1204", 46.2044, 6.1432),
    ):
        add_content(folder, name, "jsstorelocnt:store",
                    i18n("jcr:title", {"en": f"Store {city}", "fr": f"Magasin {city}"})
                    + i18n("name", {"en": f"Store {city}", "fr": f"Magasin {city}"})
                    + [{"name": "streetAddress", "value": street}, {"name": "addressLocality", "value": city},
                       {"name": "postalCode", "value": postal},
                       {"name": "addressCountry", "value": "CH" if name == "geneva" else "FR"},
                       {"name": "latitude", "type": "DOUBLE", "value": str(lat)},
                       {"name": "longitude", "type": "DOUBLE", "value": str(lon)},
                       {"name": "telephone", "value": "+33 1 00 00 00 00"}])
    add_content(zone(page, "map", {"en": "Find a store", "fr": "Trouver un magasin"}), "locator", "jsstorelocnt:storeLocatorApp",
                i18n("jcr:title", {"en": "Store locator", "fr": "Localisateur de magasins"})
                + i18n("welcomeTitle", {"en": "Our stores", "fr": "Nos magasins"})
                + i18n("welcomeMessage", {"en": "Pick a store on the map or in the list.", "fr": "Choisissez un magasin sur la carte ou dans la liste."})
                + [{"name": "storesFolder", "type": "WEAKREFERENCE", "value": uuid_at(folder)}])


def seed_contact(site, home):
    page = f"{home}/contact"
    add_page(home, "contact", {"en": "Contact", "fr": "Contact"},
             description={"en": "Write to us.", "fr": "Écrivez-nous."})
    forms = add_content(f"{site}/contents", "forms", "jnt:contentFolder", i18n("jcr:title", {"en": "Forms", "fr": "Formulaires"}))
    form = f"{forms}/contact"
    if not exists(form):
        field = lambda name, typ, label, autocomplete: {
            "name": name, "primaryNodeType": typ,
            "properties": i18n("jcr:title", label) + [{"name": "required", "type": "BOOLEAN", "value": "true"}]
            + ([{"name": "autocomplete", "value": autocomplete}] if autocomplete else [])}
        gql("mutation($p:String!,$c:[InputJCRNode]){jcr{addNode(parentPathOrId:$p,name:\"contact\",primaryNodeType:\"fmdb:form\","
            "properties:[{name:\"jcr:title\",value:\"Contact us\",language:\"en\"},{name:\"jcr:title\",value:\"Nous contacter\",language:\"fr\"}],"
            "children:$c){uuid}}}", {"p": forms, "c": [
                {"name": "fields", "primaryNodeType": "fmdb:fieldList", "children": [
                    field("fullName", "fmdb:inputText", {"en": "Your name", "fr": "Votre nom"}, "name"),
                    field("email", "fmdb:inputEmail", {"en": "Your email address", "fr": "Votre adresse e-mail"}, "email"),
                    field("message", "fmdb:textarea", {"en": "Your message", "fr": "Votre message"}, None)]},
                {"name": "actions", "primaryNodeType": "fmdb:actionList", "children": [
                    {"name": "store", "primaryNodeType": "fmdb:save2jcrAction",
                     "properties": i18n("jcr:title", {"en": "Save the message", "fr": "Enregistrer le message"})}]}]})
    add_content(zone(page, "write", {"en": "Write to us", "fr": "Écrivez-nous"}), "form", "fmdb:formReference",
                [{"name": "j:node", "type": "WEAKREFERENCE", "value": uuid_at(form)}])
    return forms


SHOWCASE_FAQ = (
    ("getting-here", {"en": "How do I get to the studio?", "fr": "Comment venir au studio ?"},
     {"en": "<p>Take metro line C to Croix-Rousse, then walk five minutes. Buses C13 and 38 stop at Croix-Rousse too. "
            "Parking is rare on the plateau, so we recommend public transport or the bike-share station at the corner "
            "of the street.</p>",
      "fr": "<p>Prenez la ligne C du métro jusqu'à Croix-Rousse, puis cinq minutes à pied. Les bus C13 et 38 s'arrêtent "
            "aussi à Croix-Rousse. Le stationnement est rare sur le plateau : nous conseillons les transports en commun "
            "ou la station de vélos en libre-service au coin de la rue.</p>"}),
    ("access", {"en": "Is the studio accessible to wheelchair users?", "fr": "Le studio est-il accessible en fauteuil roulant ?"},
     {"en": "<p>Yes. The training room is on the ground floor, with step-free access and an accessible toilet. Tell us "
            "before your visit if you need anything else, such as a sign language interpreter or printed material in "
            "large type.</p>",
      "fr": "<p>Oui. La salle de formation est de plain-pied, avec une entrée sans marche et des toilettes accessibles. "
            "Prévenez-nous avant votre venue si vous avez besoin d'autre chose, comme un interprète en langue des signes "
            "ou des documents imprimés en gros caractères.</p>"}),
    ("hours", {"en": "When is the studio open?", "fr": "Quand le studio est-il ouvert ?"},
     {"en": "<p>Monday to Friday, from 9:00 to 18:00, except on public holidays. Workshops start at 9:30; come a few "
            "minutes early for coffee.</p>",
      "fr": "<p>Du lundi au vendredi, de 9 h à 18 h, sauf les jours fériés. Les ateliers commencent à 9 h 30 : venez "
            "quelques minutes plus tôt pour le café.</p>"}),
    ("outside-lyon", {"en": "Do you run workshops outside Lyon?", "fr": "Organisez-vous des ateliers hors de Lyon ?"},
     {"en": "<p>Yes. A trainer can come to your premises, and for clients without a training room we book partner rooms "
            "in Paris and Geneva. The three places are on the map below. Every workshop is also available online.</p>",
      "fr": "<p>Oui. Un formateur peut venir dans vos locaux et, pour les clients sans salle de formation, nous "
            "réservons des salles partenaires à Paris et à Genève. Les trois lieux figurent sur la carte ci-dessous. "
            "Chaque atelier existe aussi à distance.</p>"}),
    ("equipment", {"en": "What should I bring to a workshop?", "fr": "Que faut-il apporter à un atelier ?"},
     {"en": "<p>Nothing but your questions: laptops are provided in our rooms, already connected to a practice site. If "
            "you prefer your own computer, any recent browser will do.</p>",
      "fr": "<p>Seulement vos questions : des ordinateurs sont fournis dans nos salles, déjà connectés à un site "
            "d'exercice. Si vous préférez votre propre ordinateur, un navigateur récent suffit.</p>"}),
)

SHOWCASE_PLACES = (
    ("lyon", {"en": "Classic Dev studio", "fr": "Studio Classic Dev"},
     {"en": "Our studio and training room on the Croix-Rousse plateau, in a former silk workshop.",
      "fr": "Notre studio et sa salle de formation sur le plateau de la Croix-Rousse, dans un ancien atelier de soyeux."},
     "27 rue des Tisseurs-Bleus", "Lyon", "69004", "FR", 45.7745, 4.8310, "+33 4 00 00 00 00"),
    ("paris", {"en": "Partner room, Paris", "fr": "Salle partenaire, Paris"},
     {"en": "A training room for eight near Gare de Lyon, booked for our clients' workshops in Paris.",
      "fr": "Une salle de formation pour huit personnes près de la gare de Lyon, réservée pour les ateliers de nos clients parisiens."},
     "14 rue de Bercy", "Paris", "75012", "FR", 48.8443, 2.3740, "+33 4 00 00 00 00"),
    ("geneva", {"en": "Partner room, Geneva", "fr": "Salle partenaire, Genève"},
     {"en": "A meeting room near Cornavin station, booked for our clients' workshops in Switzerland.",
      "fr": "Une salle de réunion près de la gare Cornavin, réservée pour les ateliers de nos clients suisses."},
     "8 rue de Lausanne", "Genève", "1201", "CH", 46.2105, 6.1430, "+33 4 00 00 00 00"),
)

SHOWCASE_IMAGES = ("abstract-violet.jpg", "abstract-sand.jpg", "abstract-teal.jpg",
                   "abstract-rose.jpg", "abstract-slate.jpg", "abstract-gold.jpg")


def seed_showcase(site, home):
    """The "Practical information" page of classic-dev: the three reviewed add-ons in free zones."""
    page = f"{home}/practical"
    add_page(home, "practical", {"en": "Practical information", "fr": "Infos pratiques"},
             description={"en": "Visiting the Classic Dev studio in Lyon: answers to common questions, the studio's "
                                "colour studies and a map of the places where we hold workshops.",
                          "fr": "Venir au studio Classic Dev à Lyon : réponses aux questions fréquentes, études de "
                                "couleurs du studio et carte des lieux où se tiennent nos ateliers."})
    main = ensure_area(page, "main", "ctpl:pageArea")
    add_content(main, "intro", "ctpl:richText", i18n("body", {
        "en": "<p>Everything you need before coming to a meeting or a workshop: how to reach the studio, what to "
              "bring, and where we meet clients outside Lyon.</p>",
        "fr": "<p>Tout ce qu'il faut savoir avant une réunion ou un atelier : comment venir au studio, quoi "
              "apporter, et où nous retrouvons nos clients hors de Lyon.</p>"}))

    faq = add_content(zone(page, "questions", {"en": "Questions before your visit", "fr": "Questions avant votre venue"}),
                      "faq", "jsfaqnt:faqPage",
                      i18n("jcr:title", {"en": "Visits and workshops", "fr": "Visites et ateliers"})
                      + [{"name": "headingLevel", "value": "3"}])
    for name, q, a in SHOWCASE_FAQ:
        add_content(faq, name, "jsfaqnt:faqItem", i18n("question", q) + i18n("answer", a) + i18n("jcr:title", q))

    images = [uuid_at(f"{site}/files/demo/{name}") for name in SHOWCASE_IMAGES]
    # The gallery's title is an h2 with no level option: its zone has no heading of its own.
    add_content(zone(page, "studies", None), "gallery", "jsmediagallerynt:imageGallery",
                i18n("jcr:title", {"en": "Colour studies from the studio walls", "fr": "Études de couleurs aux murs du studio"})
                + [{"name": "imgGalleryType", "value": "imgFile"},
                   {"name": "imagesList", "type": "WEAKREFERENCE", "values": images}],
                ["jsmediagallerymix:imagesLink"])

    folder = f"{site}/contents/places"
    add_content(f"{site}/contents", "places", "jnt:contentFolder",
                i18n("jcr:title", {"en": "Workshop places", "fr": "Lieux des ateliers"}))
    for name, title, description, street, city, postal, country, lat, lon, phone in SHOWCASE_PLACES:
        add_content(folder, name, "jsstorelocnt:store",
                    i18n("jcr:title", title) + i18n("name", title) + i18n("description", description)
                    + [{"name": "streetAddress", "value": street}, {"name": "addressLocality", "value": city},
                       {"name": "postalCode", "value": postal}, {"name": "addressCountry", "value": country},
                       {"name": "latitude", "type": "DOUBLE", "value": str(lat)},
                       {"name": "longitude", "type": "DOUBLE", "value": str(lon)},
                       {"name": "telephone", "value": phone},
                       {"name": "openingHours", "values": [
                           json.dumps({"dayOfWeek": day, "opens": "09:00", "closes": "18:00"})
                           for day in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")]}])
    add_content(zone(page, "places", {"en": "Where we hold workshops", "fr": "Où se tiennent nos ateliers"}),
                "locator", "jsstorelocnt:storeLocatorApp",
                i18n("jcr:title", {"en": "Workshop places", "fr": "Lieux des ateliers"})
                + i18n("welcomeTitle", {"en": "Our studio and partner rooms", "fr": "Notre studio et nos salles partenaires"})
                + i18n("welcomeMessage", {"en": "Pick a place on the map or in the list to see its address and how to get there.",
                                          "fr": "Choisissez un lieu sur la carte ou dans la liste pour voir son adresse et comment y aller."})
                + [{"name": "storesFolder", "type": "WEAKREFERENCE", "value": uuid_at(folder)}])
    # Published when not live yet, so a run interrupted after creating them still publishes them.
    return [path for path in (page, folder) if not in_live(path)]


def in_live(path):
    try:
        gql("query($p:String!){jcr(workspace:LIVE){nodeByPath(path:$p){uuid}}}", {"p": path})
        return True
    except RuntimeError as error:
        if "PathNotFoundException" in str(error):
            return False
        raise


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="classic-addons")
    ap.add_argument("--contact-only", action="store_true")
    ap.add_argument("--showcase", action="store_true")
    args = ap.parse_args()
    site = f"/sites/{args.site}"
    home = f"{site}/home"
    if args.showcase:
        for module in ADDONS[:3]:
            provisioning(f'- enable: "{module}"\n  site: "{args.site}"\n', "application/yaml")
        for path in seed_showcase(site, home):
            gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
                "publishSubNodes:true,includeSubTree:true)}}}", {"s": path})
        print(f"practical information page seeded on {site} (new nodes published)")
        return
    if args.contact_only:
        provisioning(f'- enable: "formidable-elements"\n  site: "{args.site}"\n', "application/yaml")
        forms = seed_contact(site, home)
        for path in (forms, f"{home}/contact/main"):
            gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
                "publishSubNodes:true,includeSubTree:true)}}}", {"s": path})
        print(f"contact form seeded and published on {site}")
        return
    if not exists(site):
        create_site(args.site)
    for module in ADDONS:
        provisioning(f'- enable: "{module}"\n  site: "{args.site}"\n', "application/yaml")

    files = f"{site}/files/demo"
    if not exists(files):
        gql('mutation($p:String!){jcr{addNode(parentPathOrId:$p,name:"demo",primaryNodeType:"jnt:folder"){uuid}}}',
            {"p": f"{site}/files"})
    images = [
        upload_image(files, "abstract-blue.jpg", "Abstract composition of blue and teal circles on a dark gradient",
                     (1600, 900), [(20, 40, 80), (40, 110, 140), (70, 150, 200), (110, 200, 190), (230, 240, 250)]),
        upload_image(files, "abstract-warm.jpg", "Abstract composition of warm orange and red circles",
                     (1200, 1200), [(120, 50, 30), (200, 110, 70), (240, 170, 110), (180, 60, 50)]),
        upload_image(files, "abstract-green.jpg", "Abstract composition of green circles on a pale gradient",
                     (1200, 1500), [(210, 230, 215), (120, 170, 140), (40, 110, 80), (160, 200, 120)]),
    ]
    seed_faq(site, home)
    seed_gallery(site, home, images)
    seed_stores(site, home)
    seed_contact(site, home)
    for root in (site, f"{site}/files"):
        gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],"
            "publishSubNodes:true,includeSubTree:true)}}}", {"s": root})
    print(f"add-on demo seeded and published on {site}")


if __name__ == "__main__":
    main()

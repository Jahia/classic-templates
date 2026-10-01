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
"""
import argparse
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
    return add_content(ensure_area(page, "main", "ctpl:pageArea"), name, "ctpl:freeZone",
                       i18n("jcr:title", title) + [{"name": "width", "value": "container"}])


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


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="classic-addons")
    ap.add_argument("--contact-only", action="store_true")
    args = ap.parse_args()
    site = f"/sites/{args.site}"
    home = f"{site}/home"
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

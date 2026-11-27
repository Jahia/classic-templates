# -*- coding: utf-8 -*-
"""Content of the Skylantern Airways demo site (EN + FR), read by seed-airline.py.

Skylantern Airways is a FICTIONAL full-service airline based at Hong Kong International Airport.
Every fact, fare, person, phone number, address, press release, job offer, advisory and legal text
below is invented for a demonstration of the classic-templates template set for Jahia. No booking
can be made on the site.

Plain data only, in the shape of classic-templates/scripts/demo_content.py:
  - PAGE_TREE: the pages, in menu order (path relative to the home page, title, template, hidden);
  - PAGE_DESCRIPTIONS: meta descriptions (120 to 160 characters);
  - PAGES: "<path>": {"hero": [...], "main": [...]}; each section is
    {name, type, props: {field: {en, fr} | value}, image, cta: {page, label}, link, children, columns}
    plus two keys of this site: "query" (a content list: folder, categories) and "addon" (what a free
    zone holds: faq, offices, contact-form, newsletter-form);
  - HEADER, FOOTER, CATEGORIES, NEWS, ARTICLES, FAQ, OFFICES, FORMS;
  - the content of the components of pass 2 (not deployed yet), in separate structures with
    neutral keys: ACCORDIONS, TABS, ICON_TILES, LOGO_STRIPS, DESTINATIONS, FARE_OFFERS, TRAVEL_TOOLS.

Run it to check the data: python3 airline_content.py (both languages everywhere, description
lengths, no long dashes, rich text headings starting at h2).

Writing rules: rich text headings start at h2 (the RichText component renumbers them under the
section's own heading); links between pages are page paths, never URLs; prices of pass 2 are
numbers (the components format them); no en or em dash anywhere.
"""


def T(en, fr):
    return {"en": en, "fr": fr}


def table(caption, head, rows, lang):
    """A table with a caption, column headers and a row header in the first column."""
    ths = "".join(f'<th scope="col">{h}</th>' for h in head)
    trs = "".join(f'<tr><th scope="row">{r[0]}</th>' + "".join(f"<td>{c}</td>" for c in r[1:]) + "</tr>" for r in rows)
    return f"<table><caption>{caption}</caption><thead><tr>{ths}</tr></thead><tbody>{trs}</tbody></table>"


def tables(spec):
    """{"en": html, "fr": html} from {"caption": T, "head": T(tuple, tuple), "rows": [T(tuple, tuple)]}."""
    return {lang: table(spec["caption"][lang], spec["head"][lang], [r[lang] for r in spec["rows"]], lang)
            for lang in ("en", "fr")}


def join(*parts):
    """Concatenates {"en", "fr"} fragments."""
    return {lang: "".join(p[lang] for p in parts) for lang in ("en", "fr")}


SITE = {
    "title": "Skylantern Airways",
    "description": "Demonstration website of Skylantern Airways, a fictional airline, built with the classic-templates template set for Jahia.",
}

# ---------------------------------------------------------------------------------------------
# 1. Page tree (menu order). template: home | content | fullWidth. hidden = not in the menu (the
#    site map lists every page).
# ---------------------------------------------------------------------------------------------
PAGE_TREE = [
    {"path": "offers", "title": T("Offers", "Offres")},
    {"path": "offers/current-deals", "title": T("Current deals", "Bons plans du moment")},
    {"path": "offers/partner-offers", "title": T("Partner offers", "Offres partenaires")},
    {"path": "destinations", "title": T("Destinations", "Destinations")},
    {"path": "book", "title": T("Book", "Réserver")},
    {"path": "book/fare-options", "title": T("Fare options", "Nos tarifs"), "template": "fullWidth"},
    {"path": "book/children-infants", "title": T("Children and infants", "Enfants et bébés")},
    {"path": "book/extras", "title": T("Extras", "Options")},
    {"path": "book/extras/baggage", "title": T("Extra baggage", "Bagages supplémentaires")},
    {"path": "book/extras/seats", "title": T("Seat selection", "Choix du siège")},
    {"path": "book/extras/meals", "title": T("Pre-ordered meals", "Repas à réserver")},
    {"path": "travel-information", "title": T("Travel information", "Infos voyageurs")},
    {"path": "travel-information/baggage", "title": T("Baggage allowance", "Franchise bagages")},
    {"path": "travel-information/travel-documents", "title": T("Travel documents", "Documents de voyage")},
    {"path": "travel-information/check-in", "title": T("Check-in", "Enregistrement")},
    {"path": "travel-information/airport", "title": T("Airport information", "Infos aéroport")},
    {"path": "travel-information/special-assistance", "title": T("Special assistance", "Assistance spéciale")},
    {"path": "travel-information/advisories", "title": T("Travel advisories", "Avis aux voyageurs")},
    {"path": "experience", "title": T("Experience", "À bord")},
    {"path": "experience/fleet", "title": T("Our fleet", "Notre flotte")},
    {"path": "experience/inflight", "title": T("Inflight services", "Services à bord")},
    {"path": "about", "title": T("About", "À propos")},
    {"path": "about/story", "title": T("Our story", "Notre histoire")},
    {"path": "about/media-room", "title": T("Media room", "Espace presse")},
    {"path": "about/careers", "title": T("Careers", "Carrières")},
    {"path": "about/contact", "title": T("Contact", "Contact")},
    {"path": "help", "title": T("Help", "Aide")},
    {"path": "help/faq", "title": T("Frequently asked questions", "Questions fréquentes")},
    # Utility pages (header links) and legal pages (footer links), hidden from the menu.
    {"path": "manage-booking", "title": T("Manage booking", "Gérer ma réservation"), "hidden": True},
    {"path": "flight-status", "title": T("Flight status", "État des vols"), "hidden": True},
    {"path": "legal", "title": T("Legal notice", "Mentions légales"), "hidden": True},
    {"path": "privacy", "title": T("Privacy policy", "Politique de confidentialité"), "hidden": True},
    {"path": "conditions-of-carriage", "title": T("Conditions of carriage", "Conditions de transport"), "hidden": True},
    {"path": "accessibility", "title": T("Accessibility statement", "Déclaration d'accessibilité"), "hidden": True},
    {"path": "sitemap", "title": T("Site map", "Plan du site"), "hidden": True, "template": "fullWidth"},
]

# The home page's title (its h1, hidden, and the start of the browser title). The template set seeds
# "Home" / "Accueil"; the seeder replaces those defaults only, never an editor's title. Note: the
# breadcrumb's first crumb and the site map's root show this title too (no navigation title field).
HOME_TITLE = T("Flights from Hong Kong across Asia", "Vols depuis Hong Kong vers l'Asie")
HOME_TITLE_SEEDED = T("Home", "Accueil")

# ---------------------------------------------------------------------------------------------
# 2. Meta descriptions (120 to 160 characters)
# ---------------------------------------------------------------------------------------------
PAGE_DESCRIPTIONS = {
    "": T("Skylantern Airways, a fictional Hong Kong airline for a Jahia demo: ten Asian cities, fare options, travel information and services on board.",
          "Skylantern Airways, compagnie fictive de Hong Kong pour une démo Jahia : dix villes d'Asie, tarifs, infos voyageurs et services à bord."),
    "offers": T("Fares and offers of Skylantern Airways from Hong Kong: current deals on ten Asian routes and offers from our hotel, card and car rental partners.",
                "Tarifs et offres de Skylantern Airways au départ de Hong Kong : bons plans sur dix lignes d'Asie et offres de nos partenaires hôtels, carte et location."),
    "offers/current-deals": T("Current Skylantern Airways deals from Hong Kong: one-way 'from' fares in HKD, travel periods, booking deadlines and the conditions that apply.",
                              "Les bons plans Skylantern Airways au départ de Hong Kong : tarifs aller simple dès un prix en HKD, périodes de voyage, dates limites et conditions."),
    "offers/partner-offers": T("Offers from Skylantern Airways partners: hotel stays in Hong Kong, a travel card that rewards your flights and car rental at our destinations.",
                               "Les offres des partenaires de Skylantern Airways : séjours à l'hôtel à Hong Kong, carte qui récompense vos vols et location de voiture sur place."),
    "destinations": T("Where Skylantern Airways flies from Hong Kong: Tokyo, Osaka, Sapporo, Fukuoka, Seoul, Taipei, Bangkok, Singapore, Manila and Da Nang.",
                      "Où vole Skylantern Airways depuis Hong Kong : Tokyo, Osaka, Sapporo, Fukuoka, Séoul, Taipei, Bangkok, Singapour, Manille et Da Nang."),
    "book": T("How to book a Skylantern Airways flight, what each fare includes, fares for children and infants, and the extras you can add before you fly.",
              "Comment réserver un vol Skylantern Airways, ce que comprend chaque tarif, les tarifs enfants et bébés, et les options à ajouter avant le départ."),
    "book/fare-options": T("Compare the four Skylantern Airways fares, Lite, Classic, Flex and Business: baggage, seat choice, changes, refunds and fees side by side.",
                           "Comparez les quatre tarifs Skylantern Airways, Lite, Classic, Flex et Business : bagages, siège, modifications, remboursement et frais."),
    "book/children-infants": T("Flying with children and infants on Skylantern Airways: child and infant fares, bassinets, strollers and our service for children travelling alone.",
                               "Voyager avec des enfants et des bébés sur Skylantern Airways : tarifs, berceaux, poussettes et notre service pour les enfants voyageant seuls."),
    "book/extras": T("Add extras to your Skylantern Airways flight before you travel: extra checked baggage, a seat of your choice and meals ordered in advance.",
                     "Ajoutez des options à votre vol Skylantern Airways avant le départ : bagage supplémentaire, siège de votre choix et repas commandés à l'avance."),
    "book/extras/baggage": T("Prepay extra checked baggage on Skylantern Airways and save up to 40% on airport rates: prices by weight and by route, rules and deadlines.",
                             "Réservez un bagage en soute supplémentaire sur Skylantern Airways et économisez jusqu'à 40 % : prix selon le poids et la ligne, règles et délais."),
    "book/extras/seats": T("Choose your seat on Skylantern Airways: front rows, extra legroom or standard seats, with prices per flight and the rules for exit rows.",
                           "Choisissez votre siège sur Skylantern Airways : premiers rangs, espace pour les jambes ou siège standard, avec les prix et les règles des issues."),
    "book/extras/meals": T("Order a meal before your Skylantern Airways flight: three hot menus, a vegetarian dish and a children's tray, served first on board.",
                           "Commandez votre repas avant votre vol Skylantern Airways : trois menus chauds, un plat végétarien et un plateau enfant, servis en premier."),
    "travel-information": T("Everything to know before a Skylantern Airways flight: baggage, travel documents, check-in, the airport, special assistance and advisories.",
                            "Tout savoir avant un vol Skylantern Airways : bagages, documents de voyage, enregistrement, aéroport, assistance spéciale et avis aux voyageurs."),
    "travel-information/baggage": T("Skylantern Airways baggage allowance by fare: cabin bag, checked bags, infants, sports equipment and the items you must not pack.",
                                    "La franchise bagages Skylantern Airways selon le tarif : bagage cabine, bagages en soute, bébés, équipements de sport et objets interdits."),
    "travel-information/travel-documents": T("Travel documents for Skylantern Airways flights: passport validity, visas and entry rules, transit in Hong Kong and travelling with children.",
                                             "Les documents de voyage pour un vol Skylantern Airways : validité du passeport, visas et entrée, transit à Hong Kong et voyage avec des enfants."),
    "travel-information/check-in": T("Check in for a Skylantern Airways flight online, at a kiosk or at the counter: opening times, deadlines and the steps to follow.",
                                     "Enregistrez-vous pour un vol Skylantern Airways en ligne, sur une borne ou au comptoir : horaires d'ouverture, heures limites et étapes."),
    "travel-information/airport": T("Skylantern Airways at Hong Kong International Airport: check-in aisle, counter closing times, lounges, gates and transfers between flights.",
                                    "Skylantern Airways à l'aéroport international de Hong Kong : rangée d'enregistrement, fermeture des comptoirs, salons, portes et correspondances."),
    "travel-information/special-assistance": T("Special assistance on Skylantern Airways: reduced mobility, sight or hearing loss, medical needs and service dogs, and how to ask for help.",
                                               "L'assistance spéciale sur Skylantern Airways : mobilité réduite, déficience visuelle ou auditive, besoins médicaux, chiens guides et demande d'aide."),
    "travel-information/advisories": T("Travel advisories of Skylantern Airways: schedule changes, weather, airport works and rules on board that may affect your next trip.",
                                       "Les avis aux voyageurs de Skylantern Airways : changements d'horaires, météo, travaux à l'aéroport et règles à bord pour votre prochain voyage."),
    "experience": T("Life on board Skylantern Airways: a young fleet of A321neo and A330-300 aircraft, Business and Economy cabins, meals and entertainment.",
                    "La vie à bord de Skylantern Airways : une flotte jeune d'A321neo et d'A330-300, cabines Business et Économie, repas et divertissement."),
    "experience/fleet": T("The Skylantern Airways fleet: ten A321neo and four A330-300 aircraft, an average age under five years, seats, range and cabin layouts.",
                          "La flotte Skylantern Airways : dix A321neo et quatre A330-300, moins de cinq ans d'âge moyen, sièges, autonomie et aménagement des cabines."),
    "experience/inflight": T("Inflight services on Skylantern Airways: hot meals cooked in Hong Kong, streaming to your own device, Business comfort and care for families.",
                             "Les services à bord de Skylantern Airways : repas chauds préparés à Hong Kong, divertissement sur votre appareil, confort Business et familles."),
    "about": T("About Skylantern Airways, a fictional Hong Kong airline created for a demonstration: our story, the media room, careers and how to contact us.",
               "À propos de Skylantern Airways, compagnie fictive de Hong Kong créée pour une démonstration : histoire, espace presse, carrières et contact."),
    "about/story": T("The story of Skylantern Airways: a harbour, a lantern and ten years of flights from Hong Kong to Japan, Korea, Taiwan and Southeast Asia.",
                     "L'histoire de Skylantern Airways : un port, une lanterne et dix ans de vols de Hong Kong vers le Japon, la Corée, Taïwan et l'Asie du Sud-Est."),
    "about/media-room": T("Media room of Skylantern Airways: press releases on routes, fleet and service, figures for journalists and the contacts of our press office.",
                          "L'espace presse de Skylantern Airways : communiqués sur les lignes, la flotte et le service, chiffres clés et contacts du service de presse."),
    "about/careers": T("Careers at Skylantern Airways in Hong Kong: open positions for cabin crew, pilots and airport staff, what we offer and how to apply.",
                       "Carrières chez Skylantern Airways à Hong Kong : postes ouverts pour le personnel de cabine, les pilotes et l'aéroport, avantages et candidature."),
    "about/contact": T("Contact Skylantern Airways: customer service hours, phone numbers by market, our sales offices in Asia on a map and a form to write to us.",
                       "Contacter Skylantern Airways : horaires du service client, numéros par pays, nos agences en Asie sur une carte et un formulaire pour nous écrire."),
    "help": T("Help with your Skylantern Airways trip: answers to frequent questions, travel advisories, special assistance and the ways to reach our team.",
              "De l'aide pour votre voyage Skylantern Airways : réponses aux questions fréquentes, avis aux voyageurs, assistance spéciale et moyens de nous joindre."),
    "help/faq": T("Frequently asked questions about Skylantern Airways flights: booking and payment, baggage, check-in, changes and refunds, and special needs.",
                  "Les questions fréquentes sur les vols Skylantern Airways : réservation et paiement, bagages, enregistrement, modifications, remboursements et besoins."),
    "manage-booking": T("Manage a Skylantern Airways booking: change a date, add extras, update contact details or request a refund. This demo site takes no bookings.",
                        "Gérer une réservation Skylantern Airways : changer de date, ajouter des options, modifier vos coordonnées ou demander un remboursement. Site de démo."),
    "flight-status": T("Flight status for Skylantern Airways: where to find live departure and arrival times, how we notify delays and what to do if your flight changes.",
                       "L'état des vols Skylantern Airways : où trouver les horaires réels de départ et d'arrivée, comment nous signalons un retard et que faire alors."),
    "legal": T("Legal notice of the Skylantern Airways demonstration website: publisher, publication director, hosting, intellectual property and fictional content.",
               "Mentions légales du site de démonstration Skylantern Airways : éditeur, directeur de la publication, hébergement, propriété intellectuelle et fiction."),
    "privacy": T("How the Skylantern Airways demo site handles personal data: newsletter and contact forms, purposes, retention, your rights and no tracking cookie.",
                 "Comment le site de démo Skylantern Airways traite vos données : formulaires de lettre et de contact, finalités, conservation, droits, aucun traceur."),
    "conditions-of-carriage": T("Summary of the conditions of carriage of Skylantern Airways, a fictional airline: tickets, fares, check-in, baggage, delays, refunds and liability.",
                                "Résumé des conditions de transport de Skylantern Airways, compagnie fictive : billets, tarifs, enregistrement, bagages, retards et responsabilité."),
    "accessibility": T("Accessibility statement of the Skylantern Airways demo site: partially compliant with RGAA 4.1.2, content not yet audited and how to report a problem.",
                       "Déclaration d'accessibilité du site de démo Skylantern Airways : partiellement conforme au RGAA 4.1.2, contenus pas encore audités, signalement."),
    "sitemap": T("Site map of Skylantern Airways: every page of the site, from offers and destinations to travel information, our fleet, the media room and help.",
                 "Plan du site Skylantern Airways : toutes les pages, des offres et destinations aux infos voyageurs, en passant par la flotte, la presse et l'aide."),
}

# ---------------------------------------------------------------------------------------------
# 3. Tables used in rich text
# ---------------------------------------------------------------------------------------------
NETWORK_TABLE = tables({
    "caption": T("Our routes from Hong Kong (winter schedule 2026 to 2027)", "Nos lignes au départ de Hong Kong (programme d'hiver 2026 à 2027)"),
    "head": T(("City", "Country or territory", "Airport", "Flight time", "Flights per week"),
              ("Ville", "Pays ou territoire", "Aéroport", "Durée du vol", "Vols par semaine")),
    "rows": [
        T(("Tokyo", "Japan", "Narita (NRT)", "4 h 25", "14"), ("Tokyo", "Japon", "Narita (NRT)", "4 h 25", "14")),
        T(("Osaka", "Japan", "Kansai (KIX)", "3 h 55", "14"), ("Osaka", "Japon", "Kansai (KIX)", "3 h 55", "14")),
        T(("Sapporo", "Japan", "New Chitose (CTS)", "5 h 10", "7"), ("Sapporo", "Japon", "New Chitose (CTS)", "5 h 10", "7")),
        T(("Fukuoka", "Japan", "Fukuoka (FUK)", "3 h 20", "7"), ("Fukuoka", "Japon", "Fukuoka (FUK)", "3 h 20", "7")),
        T(("Seoul", "South Korea", "Incheon (ICN)", "3 h 40", "10"), ("Séoul", "Corée du Sud", "Incheon (ICN)", "3 h 40", "10")),
        T(("Taipei", "Taiwan", "Taoyuan (TPE)", "1 h 45", "21"), ("Taipei", "Taïwan", "Taoyuan (TPE)", "1 h 45", "21")),
        T(("Bangkok", "Thailand", "Suvarnabhumi (BKK)", "2 h 50", "14"), ("Bangkok", "Thaïlande", "Suvarnabhumi (BKK)", "2 h 50", "14")),
        T(("Singapore", "Singapore", "Changi (SIN)", "3 h 50", "7"), ("Singapour", "Singapour", "Changi (SIN)", "3 h 50", "7")),
        T(("Manila", "Philippines", "Ninoy Aquino (MNL)", "2 h 05", "10"), ("Manille", "Philippines", "Ninoy Aquino (MNL)", "2 h 05", "10")),
        T(("Da Nang", "Vietnam", "Da Nang (DAD)", "1 h 55", "4"), ("Da Nang", "Viêt Nam", "Da Nang (DAD)", "1 h 55", "4")),
    ],
})

FARES_TABLE = tables({
    "caption": T("What each fare includes (Economy fares and Business)", "Ce que comprend chaque tarif (tarifs Économie et Business)"),
    "head": T(("Included", "Lite", "Classic", "Flex", "Business"), ("Inclus", "Lite", "Classic", "Flex", "Business")),
    "rows": [
        T(("Cabin bag", "1 bag, 7 kg", "1 bag, 7 kg", "1 bag, 7 kg", "2 bags, 7 kg each"),
          ("Bagage cabine", "1 bagage, 7 kg", "1 bagage, 7 kg", "1 bagage, 7 kg", "2 bagages, 7 kg chacun")),
        T(("Checked baggage", "Not included", "1 bag, 23 kg", "2 bags, 23 kg each", "2 bags, 32 kg each"),
          ("Bagage en soute", "Non inclus", "1 bagage, 23 kg", "2 bagages, 23 kg chacun", "2 bagages, 32 kg chacun")),
        T(("Seat selection", "From HKD 60", "Standard seats free", "All seats free", "All seats free"),
          ("Choix du siège", "Dès 60 HKD", "Sièges standard offerts", "Tous les sièges offerts", "Tous les sièges offerts")),
        T(("Date change", "Not allowed", "HKD 450 plus fare difference", "Free, fare difference only", "Free, fare difference only"),
          ("Changement de date", "Non autorisé", "450 HKD plus la différence tarifaire", "Gratuit, différence tarifaire seule", "Gratuit, différence tarifaire seule")),
        T(("Refund before departure", "Taxes only", "HKD 800 fee", "HKD 300 fee", "Free"),
          ("Remboursement avant le départ", "Taxes seules", "Frais de 800 HKD", "Frais de 300 HKD", "Gratuit")),
        T(("No-show", "Fare not refundable", "HKD 1,200 fee", "HKD 600 fee", "HKD 600 fee"),
          ("Absence à l'embarquement", "Tarif non remboursable", "Frais de 1 200 HKD", "Frais de 600 HKD", "Frais de 600 HKD")),
        T(("Meal", "To buy on board", "Hot meal included", "Hot meal included", "Three-course meal"),
          ("Repas", "À acheter à bord", "Repas chaud inclus", "Repas chaud inclus", "Repas en trois services")),
        T(("Priority check-in and boarding", "No", "No", "Yes", "Yes, with lounge access"),
          ("Enregistrement et embarquement prioritaires", "Non", "Non", "Oui", "Oui, avec accès au salon")),
    ],
})

CHILD_FARES_TABLE = tables({
    "caption": T("Fares for children and infants", "Tarifs des enfants et des bébés"),
    "head": T(("Age on the day of travel", "Fare", "Seat", "Baggage"), ("Âge le jour du voyage", "Tarif", "Siège", "Bagages")),
    "rows": [
        T(("Under 2 years, on your lap", "10% of the adult fare, plus taxes", "No seat of their own", "1 checked bag of 10 kg and a folding stroller"),
          ("Moins de 2 ans, sur vos genoux", "10 % du tarif adulte, plus les taxes", "Pas de siège attitré", "1 bagage en soute de 10 kg et une poussette pliante")),
        T(("Under 2 years, own seat", "75% of the adult fare", "Own seat with an approved car seat", "Allowance of the fare bought"),
          ("Moins de 2 ans, avec un siège", "75 % du tarif adulte", "Siège attitré avec un siège auto homologué", "Franchise du tarif acheté")),
        T(("2 to 11 years", "75% of the adult fare", "Own seat", "Allowance of the fare bought"),
          ("2 à 11 ans", "75 % du tarif adulte", "Siège attitré", "Franchise du tarif acheté")),
        T(("12 years and over", "Adult fare", "Own seat", "Allowance of the fare bought"),
          ("12 ans et plus", "Tarif adulte", "Siège attitré", "Franchise du tarif acheté")),
    ],
})

PREPAID_BAGS_TABLE = tables({
    "caption": T("Extra checked bag, one way, per bag", "Bagage en soute supplémentaire, aller simple, par bagage"),
    "head": T(("Route group", "Up to 15 kg, online", "Up to 23 kg, online", "Up to 23 kg, at the airport"),
              ("Groupe de lignes", "Jusqu'à 15 kg, en ligne", "Jusqu'à 23 kg, en ligne", "Jusqu'à 23 kg, à l'aéroport")),
    "rows": [
        T(("Taipei, Manila, Da Nang", "HKD 180", "HKD 260", "HKD 420"), ("Taipei, Manille, Da Nang", "180 HKD", "260 HKD", "420 HKD")),
        T(("Bangkok, Singapore", "HKD 220", "HKD 320", "HKD 520"), ("Bangkok, Singapour", "220 HKD", "320 HKD", "520 HKD")),
        T(("Japan and Korea", "HKD 260", "HKD 380", "HKD 620"), ("Japon et Corée", "260 HKD", "380 HKD", "620 HKD")),
    ],
})

SEATS_TABLE = tables({
    "caption": T("Seat prices per flight on Lite fares", "Prix des sièges par vol en tarif Lite"),
    "head": T(("Seat type", "Where", "Short flights", "Japan and Korea"), ("Type de siège", "Où", "Vols courts", "Japon et Corée")),
    "rows": [
        T(("Front row", "Rows 4 to 8, first off the aircraft", "HKD 120", "HKD 180"), ("Premiers rangs", "Rangs 4 à 8, premiers à débarquer", "120 HKD", "180 HKD")),
        T(("Extra legroom", "Exit rows and row 9, 15 cm more space", "HKD 220", "HKD 320"), ("Espace pour les jambes", "Rangs des issues et rang 9, 15 cm de plus", "220 HKD", "320 HKD")),
        T(("Standard", "Any other seat", "HKD 60", "HKD 90"), ("Standard", "Tous les autres sièges", "60 HKD", "90 HKD")),
    ],
})

ALLOWANCE_TABLE = tables({
    "caption": T("Baggage allowance per passenger and per fare", "Franchise bagages par passager et par tarif"),
    "head": T(("Fare", "Cabin bag", "Personal item", "Checked baggage"), ("Tarif", "Bagage cabine", "Accessoire", "Bagage en soute")),
    "rows": [
        T(("Lite", "1 bag, 7 kg", "1 small bag", "None, can be added"), ("Lite", "1 bagage, 7 kg", "1 petit sac", "Aucun, en option")),
        T(("Classic", "1 bag, 7 kg", "1 small bag", "1 bag, 23 kg"), ("Classic", "1 bagage, 7 kg", "1 petit sac", "1 bagage, 23 kg")),
        T(("Flex", "1 bag, 7 kg", "1 small bag", "2 bags, 23 kg each"), ("Flex", "1 bagage, 7 kg", "1 petit sac", "2 bagages, 23 kg chacun")),
        T(("Business", "2 bags, 7 kg each", "1 small bag", "2 bags, 32 kg each"), ("Business", "2 bagages, 7 kg chacun", "1 petit sac", "2 bagages, 32 kg chacun")),
        T(("Infant under 2", "None", "1 bag for the baby", "1 bag, 10 kg, and a stroller"), ("Bébé de moins de 2 ans", "Aucun", "1 sac pour le bébé", "1 bagage, 10 kg, et une poussette")),
    ],
})

COUNTERS_TABLE = tables({
    "caption": T("Check-in times at Hong Kong International Airport", "Horaires d'enregistrement à l'aéroport international de Hong Kong"),
    "head": T(("Service", "Opens", "Closes"), ("Service", "Ouverture", "Fermeture")),
    "rows": [
        T(("Online check-in", "48 hours before departure", "90 minutes before departure"), ("Enregistrement en ligne", "48 heures avant le départ", "90 minutes avant le départ")),
        T(("Kiosks, Aisle K", "24 hours before departure", "60 minutes before departure"), ("Bornes, rangée K", "24 heures avant le départ", "60 minutes avant le départ")),
        T(("Counters, Aisle K", "3 hours before departure", "60 minutes before departure"), ("Comptoirs, rangée K", "3 heures avant le départ", "60 minutes avant le départ")),
        T(("Bag drop for online check-in", "3 hours before departure", "60 minutes before departure"), ("Dépose-bagages après enregistrement en ligne", "3 heures avant le départ", "60 minutes avant le départ")),
        T(("Boarding gate", "50 minutes before departure", "20 minutes before departure"), ("Porte d'embarquement", "50 minutes avant le départ", "20 minutes avant le départ")),
    ],
})

FLEET_TABLE = tables({
    "caption": T("Our aircraft at a glance", "Nos avions en un coup d'œil"),
    "head": T(("Aircraft", "In service", "Seats", "Business", "Economy", "Range"),
              ("Avion", "En service", "Sièges", "Business", "Économie", "Autonomie")),
    "rows": [
        T(("Airbus A321neo", "10", "186", "12", "174", "6,500 km"), ("Airbus A321neo", "10", "186", "12", "174", "6 500 km")),
        T(("Airbus A330-300", "4", "292", "24", "268", "11,000 km"), ("Airbus A330-300", "4", "292", "24", "268", "11 000 km")),
    ],
})

PHONES_TABLE = tables({
    "caption": T("Customer service by phone", "Service client par téléphone"),
    "head": T(("Market", "Number", "Hours (local time)"), ("Pays ou territoire", "Numéro", "Horaires (heure locale)")),
    "rows": [
        T(("Hong Kong", "+852 0000 0000", "Every day, 7 am to 11 pm"), ("Hong Kong", "+852 0000 0000", "Tous les jours, de 7 h à 23 h")),
        T(("Japan", "+81 0 0000 0000", "Monday to Saturday, 9 am to 6 pm"), ("Japon", "+81 0 0000 0000", "Du lundi au samedi, de 9 h à 18 h")),
        T(("South Korea", "+82 0 0000 0000", "Monday to Friday, 9 am to 6 pm"), ("Corée du Sud", "+82 0 0000 0000", "Du lundi au vendredi, de 9 h à 18 h")),
        T(("Taiwan", "+886 0 0000 0000", "Every day, 9 am to 9 pm"), ("Taïwan", "+886 0 0000 0000", "Tous les jours, de 9 h à 21 h")),
        T(("Southeast Asia", "+65 0000 0000", "Every day, 8 am to 8 pm"), ("Asie du Sud-Est", "+65 0000 0000", "Tous les jours, de 8 h à 20 h")),
    ],
})

DEMO_NOTE = T("<p><strong>Demonstration site.</strong> Skylantern Airways is a fictional airline: no booking, payment or check-in "
              "can be made here, and every fare, name and number on this site is invented.</p>",
              "<p><strong>Site de démonstration.</strong> Skylantern Airways est une compagnie fictive : aucune réservation, aucun "
              "paiement ni aucun enregistrement n'est possible ici, et chaque tarif, nom et numéro de ce site est inventé.</p>")

# ---------------------------------------------------------------------------------------------
# 4. Sections of each page
# ---------------------------------------------------------------------------------------------

def hero(name, image, title, subtitle, eyebrow=None, cta=None, height="medium", variant="image", overlay="strong"):
    section = {"name": name, "type": "ctpl:heroBanner", "image": image, "props": {
        "jcr:title": title, "subtitle": subtitle, "variant": variant, "overlay": overlay, "height": height,
        "imageDecorative": "true"}}
    if eyebrow:
        section["props"]["eyebrow"] = eyebrow
    if cta:
        section["cta"] = cta
    return section


def text(name, title, body, surface="default", width="readable", cta=None):
    section = {"name": name, "type": "ctpl:richText", "props": {"body": body, "ctplSurface": surface, "width": width}}
    if title:
        section["props"]["jcr:title"] = title
    if cta:
        section["cta"] = cta
    return section


def image_text(name, title, body, image, position="left", ratio="landscape", surface="default", cta=None):
    section = {"name": name, "type": "ctpl:imageText", "image": image, "props": {
        "jcr:title": title, "body": body, "imagePosition": position, "imageRatio": ratio, "ctplSurface": surface}}
    if cta:
        section["cta"] = cta
    return section


def card(name, title, text_, link=None, label=None, image=None):
    c = {"name": name, "type": "ctpl:card", "props": {"jcr:title": title, "text": text_}}
    if label:
        c["props"]["linkLabel"] = label
    if link is not None:
        c["link"] = link
    if image:
        c["image"] = image
    return c


def grid(name, title, cards, columns="3", intro=None, surface="default"):
    section = {"name": name, "type": "ctpl:cardGrid", "props": {"jcr:title": title, "columns": columns, "ctplSurface": surface},
               "children": cards}
    if intro:
        section["props"]["introText"] = intro
    return section


def figures(name, title, items, intro=None, surface="sunken"):
    section = {"name": name, "type": "ctpl:keyFigures", "props": {"jcr:title": title, "ctplSurface": surface},
               "children": [{"name": n, "type": "ctpl:keyFigure", "props": {k: v for k, v in (("value", value), ("label", label), ("detail", detail)) if v}}
                            for n, value, label, detail in items]}
    if intro:
        section["props"]["introText"] = intro
    return section


def columns(name, title, layout, cols, surface="default", gap="medium"):
    section = {"name": name, "type": "ctpl:columns", "props": {"layout": layout, "gap": gap, "ctplSurface": surface},
               "columns": {f"col{i}": [c] for i, c in enumerate(cols, start=1)}}
    if title:
        section["props"]["jcr:title"] = title
    return section


def col_text(name, title, body):
    return {"name": name, "type": "ctpl:richText", "props": {"jcr:title": title, "body": body}}


def listing(name, title, typ, folder, categories, max_items, layout, surface="default", cta=None, empty=None, criteria=None,
            item_label=None):
    """A ctpl:jcrQuery; item_label "category" labels each item with its first category instead of its type."""
    section = {"name": name, "type": "ctpl:jcrQuery", "props": {
        "type": typ, "maxItems": str(max_items), "layout": layout, "ctplSurface": surface},
        "query": {"folder": folder, "categories": categories}}
    if item_label:
        section["props"]["itemLabel"] = item_label
    if title:
        section["props"]["jcr:title"] = title
    if empty:
        section["props"]["noResultText"] = empty
    if criteria:
        section["props"]["criteria"] = criteria
    if cta:
        section["cta"] = cta
    return section


def zone(name, title, addon, width="container", surface="default"):
    section = {"name": name, "type": "ctpl:freeZone", "props": {"width": width, "ctplSurface": surface}, "addon": addon}
    if title:
        section["props"]["jcr:title"] = title
    return section


def link_list(name, title, links):
    """A ctpl:linkList dropped in a page: links = [(name, page path)] (the label is the page title)."""
    return {"name": name, "type": "ctpl:linkList", "props": {"jcr:title": title}, "links": links}


PAGES = {
    # ---- Home ------------------------------------------------------------------------------
    "": {
        # Hero carousel (pass 3): the pass-1 banner "welcome" is moved into it as its first slide
        # ("adopt"), so editors' changes to it are kept; two campaign slides follow. No autoplay.
        "hero": [{"name": "highlights", "type": "ctpl:heroCarousel", "adopt": ["welcome"],
                  "props": {"jcr:title": T("Skylantern highlights", "Skylantern à la une"), "hideTitle": "true", "autoplay": "false"},
                  "children": [
                      hero("welcome", "hero-home.jpg",
                           T("Follow the lanterns across Asia", "Suivez les lanternes à travers l'Asie"),
                           T("Ten cities from Hong Kong, a young fleet and hot meals on every flight of more than two hours.",
                             "Dix villes au départ de Hong Kong, une flotte jeune et un repas chaud sur chaque vol de plus de deux heures."),
                           eyebrow=T("Skylantern Airways", "Skylantern Airways"),
                           cta={"page": "destinations", "label": T("Explore our destinations", "Découvrir nos destinations")},
                           height="tall", overlay="strong"),
                      hero("sapporo-winter", "dest-sapporo.jpg",
                           T("Sapporo every day this winter", "Sapporo chaque jour cet hiver"),
                           T("Daily flights from 1 December 2026 to 28 February 2027, skis and snowboards in your checked baggage allowance.",
                             "Des vols quotidiens du 1er décembre 2026 au 28 février 2027, skis et planches compris dans votre franchise bagages."),
                           eyebrow=T("Winter season", "Saison d'hiver"),
                           cta={"page": "offers/current-deals", "label": T("See the winter deals", "Voir les bons plans d'hiver")},
                           height="tall", overlay="strong"),
                      hero("fleet", "fleet-a330.jpg",
                           T("Fourteen aircraft, under five years old", "Quatorze avions de moins de cinq ans"),
                           T("Quieter cabins, power at every seat and up to 20% less fuel per seat on our A321neo and A330-300.",
                             "Des cabines plus calmes, une prise à chaque siège et jusqu'à 20 % de carburant en moins par siège sur nos A321neo et A330-300."),
                           eyebrow=T("Our fleet", "Notre flotte"),
                           cta={"page": "experience/fleet", "label": T("Discover our fleet", "Découvrir notre flotte")},
                           height="tall", overlay="strong"),
                  ]}],
        "main": [
            grid("plan", T("Plan your trip", "Préparez votre voyage"), [
                card("baggage", T("Extra baggage", "Bagage supplémentaire"),
                     T("Add a checked bag online and pay up to 40% less than at the airport.", "Ajoutez un bagage en ligne et payez jusqu'à 40 % de moins qu'à l'aéroport."),
                     link="book/extras/baggage", image="service-baggage.jpg"),
                card("seats", T("Choose your seat", "Choisissez votre siège"),
                     T("Front rows, extra legroom or a window: pick it when you book.", "Premiers rangs, espace pour les jambes ou hublot : choisissez en réservant."),
                     link="book/extras/seats", image="service-seats.jpg"),
                card("meals", T("Pre-order a meal", "Réservez votre repas"),
                     T("Three hot menus cooked in Hong Kong, served first on board.", "Trois menus chauds préparés à Hong Kong, servis en premier à bord."),
                     link="book/extras/meals", image="service-meals.jpg"),
                card("inflight", T("On board", "À bord"),
                     T("Stream films to your phone and rest in our quiet cabins.", "Regardez des films sur votre téléphone et reposez-vous dans nos cabines calmes."),
                     link="experience/inflight", image="cabin-economy.jpg"),
            ], columns="4", intro=T("Make the flight yours before you leave home.", "Faites de votre vol le vôtre avant même de partir.")),
            listing("advisories", T("Latest travel advisories", "Derniers avis aux voyageurs"), "ctpl:news", "news",
                    ["travel-advisories"], 3, "list", surface="sunken",
                    cta={"page": "travel-information/advisories", "label": T("All advisories", "Tous les avis")}, item_label="category"),
            image_text("fleet", T("A young fleet, quieter and lighter on fuel", "Une flotte jeune, plus silencieuse et plus sobre"),
                       T("<p>Our fourteen Airbus aircraft are under five years old on average. The A321neo flies our routes to Taiwan, "
                         "Japan and Southeast Asia; the A330-300 takes the busiest flights to Tokyo, Osaka and Seoul.</p>"
                         "<ul><li>Up to 20% less fuel per seat than the aircraft they replaced</li><li>A noise footprint halved at take-off</li>"
                         "<li>Power at every seat</li></ul>",
                         "<p>Nos quatorze Airbus ont moins de cinq ans en moyenne. L'A321neo dessert Taïwan, le Japon et l'Asie du Sud-Est ; "
                         "l'A330-300 assure les vols les plus chargés vers Tokyo, Osaka et Séoul.</p>"
                         "<ul><li>Jusqu'à 20 % de carburant en moins par siège que les avions remplacés</li><li>Une empreinte sonore réduite "
                         "de moitié au décollage</li><li>Une prise électrique à chaque siège</li></ul>"),
                       "fleet-a321neo.jpg", position="right",
                       cta={"page": "experience/fleet", "label": T("Discover our fleet", "Découvrir notre flotte")}),
            figures("numbers", T("Skylantern in numbers", "Skylantern en chiffres"), [
                ("destinations", T("10", "10"), T("destinations in Asia", "destinations en Asie"), None),
                ("aircraft", T("14", "14"), T("Airbus aircraft", "avions Airbus"), T("Ten A321neo and four A330-300", "Dix A321neo et quatre A330-300")),
                ("punctuality", T("88%", "88 %"), T("flights on time", "de vols à l'heure"), T("Summer 2026, within 15 minutes", "Été 2026, à 15 minutes près")),
                ("passengers", T("2.4 million", "2,4 millions"), T("passengers in 2025", "de passagers en 2025"), None),
            ]),
            listing("press", T("From the media room", "Depuis l'espace presse"), "ctpl:news", "news", ["press-releases"], 3, "grid",
                    cta={"page": "about/media-room", "label": T("All press releases", "Tous les communiqués")}, item_label="category"),
            zone("newsletter", T("Get our fare alerts", "Recevez nos alertes tarifs"), "newsletter-form", width="reading", surface="sunken"),
        ],
    },

    # ---- Offers ------------------------------------------------------------------------------
    "offers": {
        "hero": [hero("banner", "hero-offers.jpg", T("Fares and offers", "Tarifs et offres"),
                      T("One-way fares from Hong Kong and offers from the partners who look after the rest of your trip.",
                        "Des tarifs aller simple au départ de Hong Kong et les offres des partenaires qui s'occupent du reste de votre voyage."),
                      eyebrow=T("Offers", "Offres"))],
        "main": [
            grid("sections", T("Find an offer", "Trouver une offre"), [
                card("deals", T("Current deals", "Bons plans du moment"),
                     T("Our lowest one-way fares to each destination, with their travel dates and conditions.",
                       "Nos tarifs aller simple les plus bas vers chaque destination, avec leurs dates de voyage et leurs conditions."),
                     link="offers/current-deals", label=T("See the deals", "Voir les bons plans"), image="dest-bangkok.jpg"),
                card("partners", T("Partner offers", "Offres partenaires"),
                     T("Hotels, a travel card and car rental at a better price when you fly with us.",
                       "Hôtels, carte de voyage et location de voiture à meilleur prix quand vous volez avec nous."),
                     link="offers/partner-offers", label=T("See the partner offers", "Voir les offres partenaires"), image="partner-hotel.jpg"),
            ], columns="2"),
            text("how", T("How our fares are shown", "Comment nos tarifs sont affichés"),
                 T("<p>Every price on this site is a <strong>\"from\" price</strong>: one way, in Economy, per adult, taxes and charges "
                   "included, for the lowest fare available on at least one date of the travel period. Prices change with demand, so "
                   "the fare you find on the day may be higher.</p><p>Fares are in Hong Kong dollars (HKD). Payment card fees are not "
                   "included.</p>",
                   "<p>Chaque prix de ce site est un <strong>prix « à partir de »</strong> : aller simple, en Économie, par adulte, taxes "
                   "et frais compris, pour le tarif le plus bas disponible sur au moins une date de la période de voyage. Les prix varient "
                   "selon la demande : le tarif trouvé le jour venu peut être plus élevé.</p><p>Les tarifs sont en dollars de Hong Kong "
                   "(HKD). Les frais de carte de paiement ne sont pas inclus.</p>"),
                 surface="sunken", cta={"page": "book/fare-options", "label": T("Compare our fares", "Comparer nos tarifs")}),
        ],
    },
    "offers/current-deals": {
        "main": [
            text("intro", None, join(
                T("<p>Our current lowest fares from Hong Kong, destination by destination. Each deal shows its travel period and the "
                  "last day to book; the conditions are under each price.</p>",
                  "<p>Nos tarifs les plus bas du moment au départ de Hong Kong, destination par destination. Chaque bon plan indique sa "
                  "période de voyage et la date limite de réservation ; les conditions figurent sous chaque prix.</p>"), DEMO_NOTE)),
            columns("good-to-know", T("Good to know", "Bon à savoir"), "thirds", [
                col_text("included", T("What the price includes", "Ce que comprend le prix"),
                         T("<p>One way, Economy Lite, one cabin bag of 7 kg, taxes and airport charges.</p>",
                           "<p>Aller simple, Économie Lite, un bagage cabine de 7 kg, taxes et redevances aéroportuaires.</p>")),
                col_text("when", T("When to book", "Quand réserver"),
                         T("<p>The lowest fares go first: most deals end three to six weeks before the travel period starts.</p>",
                           "<p>Les tarifs les plus bas partent en premier : la plupart des offres se terminent trois à six semaines avant la période de voyage.</p>")),
                col_text("change", T("Changing your plans", "Si vos projets changent"),
                         T("<p>Lite fares cannot be changed. Choose Classic or Flex to keep your options open.</p>",
                           "<p>Les tarifs Lite ne sont pas modifiables. Choisissez Classic ou Flex pour garder de la souplesse.</p>")),
            ], surface="sunken"),
        ],
    },
    "offers/partner-offers": {
        "main": [
            text("intro", None, T(
                "<p>Our partners give Skylantern passengers better prices on the rest of the trip. Show your booking reference or your "
                "boarding pass when you book with them. Partners and their offers are fictional, like the airline.</p>",
                "<p>Nos partenaires proposent aux passagers Skylantern de meilleurs prix pour le reste du voyage. Présentez votre "
                "référence de réservation ou votre carte d'embarquement en réservant chez eux. Les partenaires et leurs offres sont "
                "fictifs, comme la compagnie.</p>")),
            listing("offers", T("Offers of the moment", "Les offres du moment"), "ctpl:article", "articles", ["partner-offers"], 6, "grid",
                    empty=T("No partner offer at the moment.", "Aucune offre partenaire en ce moment.")),
        ],
    },

    # ---- Destinations ----------------------------------------------------------------------------
    "destinations": {
        "hero": [hero("banner", "hero-destinations.jpg", T("Where we fly", "Où nous volons"),
                      T("Ten cities in Japan, Korea, Taiwan and Southeast Asia, all non-stop from Hong Kong.",
                        "Dix villes au Japon, en Corée, à Taïwan et en Asie du Sud-Est, toutes sans escale depuis Hong Kong."),
                      eyebrow=T("Destinations", "Destinations"))],
        "main": [
            grid("regions", T("Three regions, one hub", "Trois régions, une seule plateforme"), [
                card("japan-korea", T("Japan and Korea", "Japon et Corée"),
                     T("Tokyo, Osaka, Sapporo, Fukuoka and Seoul: up to two flights a day.", "Tokyo, Osaka, Sapporo, Fukuoka et Séoul : jusqu'à deux vols par jour."),
                     image="dest-tokyo.jpg"),
                card("taiwan", T("Taiwan", "Taïwan"),
                     T("Taipei three times a day, the shortest of our flights.", "Taipei trois fois par jour, le plus court de nos vols."),
                     image="dest-taipei.jpg"),
                card("southeast-asia", T("Southeast Asia", "Asie du Sud-Est"),
                     T("Bangkok, Singapore, Manila and Da Nang, for cities and beaches.", "Bangkok, Singapour, Manille et Da Nang, entre villes et plages."),
                     image="dest-da-nang.jpg"),
            ], intro=T("Every flight leaves from or lands at Hong Kong International Airport.", "Chaque vol part de l'aéroport international de Hong Kong ou y arrive.")),
            text("network", T("Our routes", "Nos lignes"), join(
                T("<p>Flight times are scheduled times from Hong Kong; the return can be shorter or longer with the winds.</p>",
                  "<p>Les durées sont les temps de vol programmés depuis Hong Kong ; le retour peut être plus court ou plus long selon les vents.</p>"),
                NETWORK_TABLE), width="wide", surface="sunken"),
        ],
    },

    # ---- Book --------------------------------------------------------------------------------
    "book": {
        "hero": [hero("banner", "hero-book.jpg", T("Book your flight", "Réservez votre vol"),
                      T("Pick the fare that fits your trip, then add only the extras you need.",
                        "Choisissez le tarif adapté à votre voyage, puis ajoutez seulement les options utiles."),
                      eyebrow=T("Book", "Réserver"))],
        "main": [
            text("how", T("How to book", "Comment réserver"), join(DEMO_NOTE, T(
                "<p>On a real airline site, this is where the flight search would sit. Skylantern Airways bookings are, in this "
                "story, made on our website and app, by phone with our customer service, or with a travel agent.</p>"
                "<h2>Before you book</h2><ul><li>Check that your passport is valid long enough for your destination.</li>"
                "<li>Compare our four fares: the cheapest is not always the best value once a bag is added.</li>"
                "<li>Travelling with a baby or needing assistance? Tell us when you book.</li></ul>",
                "<p>Sur le site d'une vraie compagnie, la recherche de vols serait ici. Dans cette histoire, les réservations "
                "Skylantern Airways se font sur notre site et notre application, par téléphone auprès du service client, ou dans une "
                "agence de voyages.</p><h2>Avant de réserver</h2><ul><li>Vérifiez que votre passeport est valide assez longtemps pour "
                "votre destination.</li><li>Comparez nos quatre tarifs : le moins cher n'est pas toujours le plus avantageux une fois "
                "un bagage ajouté.</li><li>Vous voyagez avec un bébé ou avez besoin d'assistance ? Signalez-le en réservant.</li></ul>"))),
            grid("next", T("Make the right choice", "Faire le bon choix"), [
                card("fares", T("Fare options", "Nos tarifs"), T("Lite, Classic, Flex or Business, side by side.", "Lite, Classic, Flex ou Business, côte à côte."),
                     link="book/fare-options", label=T("Compare the fares", "Comparer les tarifs"), image="cabin-business.jpg"),
                card("children", T("Children and infants", "Enfants et bébés"), T("Fares, bassinets and help for young travellers.", "Tarifs, berceaux et aide pour les jeunes voyageurs."),
                     link="book/children-infants", label=T("Travel as a family", "Voyager en famille"), image="dest-sapporo.jpg"),
                card("extras", T("Extras", "Options"), T("Baggage, seats and meals at the best price, before you fly.", "Bagages, sièges et repas au meilleur prix, avant le vol."),
                     link="book/extras", label=T("Add extras", "Ajouter des options"), image="service-baggage.jpg"),
            ], surface="sunken"),
        ],
    },
    "book/fare-options": {
        "main": [
            text("intro", None, T(
                "<p>Four fares on every flight. Lite is for light travellers who know their plans; Classic adds a checked bag and a "
                "meal; Flex lets you change for free; Business adds a wider seat, lounge access and priority all the way.</p>",
                "<p>Quatre tarifs sur chaque vol. Lite convient aux voyageurs légers sûrs de leurs dates ; Classic ajoute un bagage en "
                "soute et un repas ; Flex permet de changer gratuitement ; Business ajoute un siège plus large, l'accès au salon et la "
                "priorité à chaque étape.</p>")),
            text("compare", T("Our fares compared", "Nos tarifs comparés"), join(FARES_TABLE, T(
                "<p>Fees are per passenger and per flight. The fare difference applies when the new flight costs more.</p>",
                "<p>Les frais s'entendent par passager et par vol. La différence tarifaire s'applique quand le nouveau vol coûte plus cher.</p>")),
                width="wide"),
            text("taxes", T("Taxes and charges", "Taxes et frais"), T(
                "<p>Every price we show includes airport charges, security charges and the fuel surcharge in force on the day of "
                "booking. Taxes paid are refunded when you do not fly, whatever the fare, on request through our customer service.</p>",
                "<p>Chaque prix affiché comprend les redevances aéroportuaires, la taxe de sûreté et la surcharge carburant en vigueur "
                "le jour de la réservation. Les taxes payées sont remboursées si vous ne voyagez pas, quel que soit le tarif, sur "
                "demande auprès du service client.</p>"), surface="sunken",
                cta={"page": "conditions-of-carriage", "label": T("Read the conditions of carriage", "Lire les conditions de transport")}),
        ],
    },
    "book/children-infants": {
        "main": [
            text("fares", T("Fares by age", "Tarifs selon l'âge"), join(T(
                "<p>The age that counts is the age on the day of each flight. A baby who turns two during the trip needs a seat of "
                "their own for the return flight.</p>",
                "<p>L'âge retenu est celui du jour de chaque vol. Un bébé qui fête ses deux ans pendant le voyage doit avoir son propre "
                "siège au retour.</p>"), CHILD_FARES_TABLE), width="wide"),
            image_text("young", T("Children travelling alone", "Enfants voyageant seuls"), T(
                "<p>From 5 to 11 years old, children can travel without an adult on our direct flights with our Young Flyer service. "
                "A member of our team stays with them from check-in until they meet the adult named on the booking at arrival.</p>"
                "<ul><li>Service fee: HKD 500 per flight</li><li>Ask for it at least 72 hours before departure</li>"
                "<li>Available on every route except Sapporo from December to February</li></ul>",
                "<p>De 5 à 11 ans, les enfants peuvent voyager sans adulte sur nos vols directs avec notre service Jeune Voyageur. Un "
                "membre de notre équipe les accompagne de l'enregistrement jusqu'à l'adulte désigné dans la réservation, à l'arrivée.</p>"
                "<ul><li>Frais de service : 500 HKD par vol</li><li>À demander au moins 72 heures avant le départ</li>"
                "<li>Proposé sur toutes les lignes sauf Sapporo de décembre à février</li></ul>"),
                "careers-wings.jpg", position="right", surface="sunken"),
            text("babies", T("Flying with a baby", "Voyager avec un bébé"), T(
                "<h2>Bassinets</h2><p>A321neo and A330-300 aircraft have bassinets in the front row of Economy, for babies up to 10 kg "
                "and 70 cm. They are free and given in the order of requests.</p><h2>Strollers and car seats</h2><p>Bring your folding "
                "stroller to the aircraft door; we give it back to you there on arrival. Approved car seats can be used on a seat "
                "bought for the child.</p>",
                "<h2>Berceaux</h2><p>Les A321neo et les A330-300 disposent de berceaux au premier rang de la cabine Économie, pour les "
                "bébés jusqu'à 10 kg et 70 cm. Ils sont gratuits et attribués dans l'ordre des demandes.</p><h2>Poussettes et sièges "
                "auto</h2><p>Gardez votre poussette pliante jusqu'à la porte de l'avion : nous vous la rendons au même endroit à "
                "l'arrivée. Les sièges auto homologués s'utilisent sur un siège acheté pour l'enfant.</p>")),
        ],
    },
    "book/extras": {
        "main": [
            text("intro", None, T(
                "<p>Extras cost less when you add them before you fly. Add them when you book, or later from Manage booking until 24 "
                "hours before departure.</p>",
                "<p>Les options coûtent moins cher avant le vol. Ajoutez-les en réservant, ou plus tard depuis Gérer ma réservation "
                "jusqu'à 24 heures avant le départ.</p>"), cta={"page": "manage-booking", "label": T("Manage a booking", "Gérer une réservation")}),
            grid("extras", T("Our extras", "Nos options"), [
                card("baggage", T("Extra baggage", "Bagage supplémentaire"), T("15 or 23 kg, up to 40% less than at the airport.", "15 ou 23 kg, jusqu'à 40 % moins cher qu'à l'aéroport."),
                     link="book/extras/baggage", image="service-baggage.jpg"),
                card("seats", T("Seat selection", "Choix du siège"), T("Front row, extra legroom or standard seats.", "Premiers rangs, espace pour les jambes ou siège standard."),
                     link="book/extras/seats", image="service-seats.jpg"),
                card("meals", T("Pre-ordered meals", "Repas à réserver"), T("Hot menus served first, on flights of two hours or more.", "Des menus chauds servis en premier, sur les vols de deux heures et plus."),
                     link="book/extras/meals", image="service-meals.jpg"),
            ]),
        ],
    },
    "book/extras/baggage": {
        "main": [
            text("prices", T("Prices of extra checked baggage", "Prix des bagages en soute supplémentaires"), join(T(
                "<p>Prices are per bag and per flight. Each bag can weigh up to the weight bought and measure up to 158 cm "
                "(length, width and height added).</p>",
                "<p>Les prix s'entendent par bagage et par vol. Chaque bagage peut peser jusqu'au poids acheté et mesurer jusqu'à "
                "158 cm (longueur, largeur et hauteur additionnées).</p>"), PREPAID_BAGS_TABLE), width="wide"),
            text("rules", T("Rules", "Règles"), T(
                "<ul><li>Extra baggage can be bought until 3 hours before departure.</li><li>It is not refundable, but it follows "
                "your booking when you change flights.</li><li>A bag over 32 kg is never accepted, for the safety of our ground "
                "staff: split the weight into two bags.</li></ul>",
                "<ul><li>Les bagages supplémentaires s'achètent jusqu'à 3 heures avant le départ.</li><li>Ils ne sont pas "
                "remboursables, mais suivent votre réservation en cas de changement de vol.</li><li>Un bagage de plus de 32 kg n'est "
                "jamais accepté, pour la sécurité de nos agents au sol : répartissez le poids dans deux bagages.</li></ul>"),
                surface="sunken", cta={"page": "travel-information/baggage", "label": T("See the baggage allowance", "Voir la franchise bagages")}),
        ],
    },
    "book/extras/seats": {
        "main": [
            image_text("choose", T("Sit where you like", "Asseyez-vous où vous voulez"), T(
                "<p>Seats are free on Classic, Flex and Business fares. On Lite fares, choose a seat for a small fee, or get one for "
                "free at check-in.</p><p>Families with children under 12 are always seated together, whatever the fare.</p>",
                "<p>Les sièges sont offerts en tarifs Classic, Flex et Business. En tarif Lite, choisissez un siège pour un petit "
                "supplément, ou recevez-en un gratuitement à l'enregistrement.</p><p>Les familles avec des enfants de moins de 12 ans "
                "sont toujours placées ensemble, quel que soit le tarif.</p>"), "service-seats.jpg", ratio="square"),
            text("prices", T("Seat prices", "Prix des sièges"), SEATS_TABLE, width="wide", surface="sunken"),
            text("exit", T("Exit rows", "Rangs des issues de secours"), T(
                "<p>Passengers in exit rows must be 15 or older, able to open the door and willing to help in an emergency. Passengers "
                "travelling with an infant or needing assistance are seated elsewhere, for their safety.</p>",
                "<p>Les passagers assis aux issues doivent avoir 15 ans ou plus, pouvoir ouvrir la porte et accepter d'aider en cas "
                "d'urgence. Les passagers avec un bébé ou ayant besoin d'assistance sont placés ailleurs, pour leur sécurité.</p>")),
        ],
    },
    "book/extras/meals": {
        "main": [
            image_text("menus", T("Cooked in Hong Kong, served first", "Préparés à Hong Kong, servis en premier"), T(
                "<p>Order up to 24 hours before departure on flights of two hours or more. Pre-ordered meals cost HKD 90 on Lite fares "
                "and are included on other fares, where they replace the standard meal.</p>",
                "<p>Commandez jusqu'à 24 heures avant le départ sur les vols de deux heures et plus. Les repas réservés coûtent 90 HKD "
                "en tarif Lite et sont inclus dans les autres tarifs, à la place du repas standard.</p>"), "service-meals.jpg", position="right"),
            columns("choice", T("This season's menus", "Les menus de la saison"), "thirds", [
                col_text("harbour", T("Harbour rice", "Riz du port"),
                         T("<p>Steamed rice, soy-glazed chicken, pak choi and a mango pudding.</p>",
                           "<p>Riz vapeur, poulet laqué au soja, pak choï et un pudding à la mangue.</p>")),
                col_text("garden", T("Garden noodles (vegetarian)", "Nouilles du jardin (végétarien)"),
                         T("<p>Wheat noodles with mushrooms, tofu and sesame, and a fresh fruit salad.</p>",
                           "<p>Nouilles de blé aux champignons, tofu et sésame, et une salade de fruits frais.</p>")),
                col_text("little", T("Little lantern tray (children)", "Plateau petite lanterne (enfants)"),
                         T("<p>Mild chicken and rice, steamed vegetables, a yoghurt and a biscuit.</p>",
                           "<p>Poulet doux et riz, légumes vapeur, un yaourt et un biscuit.</p>")),
            ], surface="sunken"),
            text("diets", T("Special diets", "Régimes particuliers"), T(
                "<p>Vegan, gluten-free, low-salt and diabetic meals are free on every fare when ordered 48 hours before departure. "
                "Our meals may contain traces of nuts.</p>",
                "<p>Les repas végétaliens, sans gluten, pauvres en sel et pour diabétiques sont gratuits pour tous les tarifs s'ils sont "
                "commandés 48 heures avant le départ. Nos repas peuvent contenir des traces de fruits à coque.</p>")),
        ],
    },

    # ---- Travel information -------------------------------------------------------------------------
    "travel-information": {
        "hero": [hero("banner", "hero-travel.jpg", T("Before you fly", "Avant de partir"),
                      T("Baggage, documents, check-in and the airport: what to know so the trip starts calmly.",
                        "Bagages, documents, enregistrement et aéroport : ce qu'il faut savoir pour partir serein."),
                      eyebrow=T("Travel information", "Infos voyageurs"))],
        "main": [
            grid("topics", T("Travel information", "Infos voyageurs"), [
                card("baggage", T("Baggage allowance", "Franchise bagages"), T("What you can take, in the cabin and in the hold.", "Ce que vous pouvez emporter, en cabine et en soute."),
                     link="travel-information/baggage", image="service-baggage.jpg"),
                card("documents", T("Travel documents", "Documents de voyage"), T("Passports, visas and transit in Hong Kong.", "Passeports, visas et transit à Hong Kong."),
                     link="travel-information/travel-documents", image="dest-seoul.jpg"),
                card("checkin", T("Check-in", "Enregistrement"), T("Online, at a kiosk or at the counter.", "En ligne, sur une borne ou au comptoir."),
                     link="travel-information/check-in", image="service-checkin.jpg"),
                card("airport", T("Airport information", "Infos aéroport"), T("Our aisle, lounges and gates in Hong Kong.", "Notre rangée, nos salons et nos portes à Hong Kong."),
                     link="travel-information/airport", image="service-airport.jpg"),
                card("assistance", T("Special assistance", "Assistance spéciale"), T("Help at the airport and on board, free of charge.", "Une aide gratuite à l'aéroport et à bord."),
                     link="travel-information/special-assistance", image="service-assistance.jpg"),
                card("advisories", T("Travel advisories", "Avis aux voyageurs"), T("Schedule changes, weather and works.", "Changements d'horaires, météo et travaux."),
                     link="travel-information/advisories", image="hero-help.jpg"),
            ]),
        ],
    },
    "travel-information/baggage": {
        "main": [
            text("allowance", T("Your allowance", "Votre franchise"), join(T(
                "<p>The allowance depends on the fare and is shown on your booking confirmation. Cabin bags measure up to 56 x 36 x "
                "23 cm; a personal item, such as a handbag or a laptop bag, must fit under the seat in front of you.</p>",
                "<p>La franchise dépend du tarif et figure sur votre confirmation de réservation. Les bagages cabine mesurent au plus "
                "56 x 36 x 23 cm ; un accessoire, comme un sac à main ou une sacoche d'ordinateur, doit tenir sous le siège devant "
                "vous.</p>"), ALLOWANCE_TABLE), width="wide"),
            text("special", T("Sports equipment and musical instruments", "Équipements de sport et instruments de musique"), T(
                "<p>Golf bags, skis and snowboards count as one checked bag if they weigh up to 23 kg. Bicycles, surfboards and "
                "diving equipment travel for HKD 400 per flight, booked 48 hours before departure. A musical instrument up to 7 kg "
                "can travel in the cabin; a larger one needs a seat of its own.</p>",
                "<p>Les sacs de golf, skis et planches de surf des neiges comptent comme un bagage en soute s'ils pèsent jusqu'à "
                "23 kg. Les vélos, planches de surf et équipements de plongée voyagent pour 400 HKD par vol, réservés 48 heures avant "
                "le départ. Un instrument de musique jusqu'à 7 kg peut voyager en cabine ; un plus grand demande son propre "
                "siège.</p>"), surface="sunken"),
            text("forbidden", T("Items you must not pack", "Objets à ne pas emporter"), T(
                "<p>For everyone's safety, some items are forbidden in checked baggage, in the cabin, or both.</p><ul>"
                "<li><strong>Spare batteries and power banks</strong>: cabin only, up to 100 Wh each, never in the hold.</li>"
                "<li><strong>Lighters</strong>: one, carried on you, never in a bag.</li>"
                "<li><strong>Aerosols</strong>: toiletries only, up to 500 ml each.</li>"
                "<li><strong>Flammable liquids, fireworks and gas cylinders</strong>: forbidden everywhere.</li>"
                "<li><strong>Knives and sharp tools</strong>: checked baggage only.</li></ul>",
                "<p>Pour la sécurité de tous, certains objets sont interdits en soute, en cabine, ou les deux.</p><ul>"
                "<li><strong>Batteries de rechange et batteries externes</strong> : en cabine seulement, jusqu'à 100 Wh chacune, "
                "jamais en soute.</li><li><strong>Briquets</strong> : un seul, porté sur vous, jamais dans un sac.</li>"
                "<li><strong>Aérosols</strong> : produits de toilette seulement, jusqu'à 500 ml chacun.</li>"
                "<li><strong>Liquides inflammables, feux d'artifice et bouteilles de gaz</strong> : interdits partout.</li>"
                "<li><strong>Couteaux et outils tranchants</strong> : en soute seulement.</li></ul>"),
                cta={"page": "book/extras/baggage", "label": T("Add extra baggage", "Ajouter un bagage")}),
        ],
    },
    "travel-information/travel-documents": {
        "main": [
            text("passport", T("Passports and visas", "Passeports et visas"), T(
                "<p>You are responsible for travelling with the documents your destination asks for. Entry rules change: check them "
                "with the consulate of the country you visit before you book, and again a week before you leave.</p>"
                "<h2>Passport validity</h2><p>Many countries ask for a passport valid at least six months after the date you arrive, "
                "with two blank pages. We may refuse boarding when the passport does not meet the rules of the destination.</p>"
                "<h2>Visas and electronic travel authorisations</h2><p>Some nationalities need a visa or an online authorisation "
                "before travel, even for a short stay. Apply early: some take several weeks.</p>",
                "<p>Il vous appartient de voyager avec les documents exigés par votre destination. Les règles d'entrée changent : "
                "vérifiez-les auprès du consulat du pays visité avant de réserver, puis une semaine avant le départ.</p>"
                "<h2>Validité du passeport</h2><p>De nombreux pays exigent un passeport valide au moins six mois après la date "
                "d'arrivée, avec deux pages vierges. L'embarquement peut être refusé si le passeport ne respecte pas les règles de la "
                "destination.</p><h2>Visas et autorisations de voyage électroniques</h2><p>Certaines nationalités ont besoin d'un visa "
                "ou d'une autorisation en ligne avant le départ, même pour un court séjour. Faites la demande tôt : certaines prennent "
                "plusieurs semaines.</p>")),
            text("transit", T("Transit in Hong Kong", "Transit à Hong Kong"), T(
                "<p>Connecting between two Skylantern flights on one booking? Your bags go straight to your final destination and you "
                "stay airside: follow the Flight connections signs, then the screens for your gate. Allow at least 60 minutes between "
                "two flights.</p>",
                "<p>Vous enchaînez deux vols Skylantern sur une même réservation ? Vos bagages vont directement à destination finale et "
                "vous restez en zone réservée : suivez les panneaux Correspondances, puis les écrans pour votre porte. Prévoyez au moins "
                "60 minutes entre deux vols.</p>"), surface="sunken"),
            text("children", T("Children", "Enfants"), T(
                "<p>Every child needs their own passport. A child travelling with only one parent, or with another adult, may be asked "
                "for a signed consent letter from the other parent: carry one, with a copy of their passport.</p>",
                "<p>Chaque enfant doit avoir son propre passeport. Un enfant voyageant avec un seul parent, ou avec un autre adulte, peut "
                "devoir présenter une autorisation signée de l'autre parent : emportez-en une, avec la copie de son passeport.</p>"),
                cta={"page": "book/children-infants", "label": T("Flying with children", "Voyager avec des enfants")}),
        ],
    },
    "travel-information/check-in": {
        "main": [
            text("steps", T("Online check-in in five steps", "L'enregistrement en ligne en cinq étapes"), T(
                "<p>Online check-in opens 48 hours and closes 90 minutes before departure.</p><ol>"
                "<li>Open Manage booking and enter your booking reference and last name.</li>"
                "<li>Select the passengers to check in.</li>"
                "<li>Check the passport details and confirm the travel rules.</li>"
                "<li>Choose or change your seat.</li>"
                "<li>Save your boarding pass on your phone, or print it.</li></ol>"
                "<p>With checked baggage, drop it at the bag drop of Aisle K at least 60 minutes before departure.</p>",
                "<p>L'enregistrement en ligne ouvre 48 heures et ferme 90 minutes avant le départ.</p><ol>"
                "<li>Ouvrez Gérer ma réservation et saisissez votre référence de réservation et votre nom.</li>"
                "<li>Sélectionnez les passagers à enregistrer.</li>"
                "<li>Vérifiez les données du passeport et confirmez les règles de voyage.</li>"
                "<li>Choisissez ou changez votre siège.</li>"
                "<li>Enregistrez votre carte d'embarquement sur votre téléphone, ou imprimez-la.</li></ol>"
                "<p>Avec un bagage en soute, déposez-le au dépose-bagages de la rangée K au moins 60 minutes avant le départ.</p>"),
                cta={"page": "manage-booking", "label": T("Go to Manage booking", "Aller à Gérer ma réservation")}),
            columns("ways", T("Three ways to check in", "Trois façons de s'enregistrer"), "thirds", [
                col_text("online", T("Online", "En ligne"), T("<p>From 48 hours to 90 minutes before departure, on our site or app.</p>",
                                                             "<p>De 48 heures à 90 minutes avant le départ, sur notre site ou notre application.</p>")),
                col_text("kiosk", T("At a kiosk", "Sur une borne"), T("<p>In Aisle K, from 24 hours to 60 minutes before departure.</p>",
                                                                       "<p>Dans la rangée K, de 24 heures à 60 minutes avant le départ.</p>")),
                col_text("counter", T("At the counter", "Au comptoir"), T("<p>In Aisle K, from 3 hours to 60 minutes before departure.</p>",
                                                                           "<p>Dans la rangée K, de 3 heures à 60 minutes avant le départ.</p>")),
            ], surface="sunken"),
            image_text("counter", T("When the counter is the better choice", "Quand préférer le comptoir"), T(
                "<p>Go to the counter if you travel with a pet, need special assistance, carry sports equipment or a musical "
                "instrument, or if online check-in tells you that your documents must be checked.</p>",
                "<p>Passez au comptoir si vous voyagez avec un animal, avez besoin d'assistance, transportez un équipement de sport ou "
                "un instrument de musique, ou si l'enregistrement en ligne indique que vos documents doivent être vérifiés.</p>"),
                "service-checkin.jpg", ratio="square"),
        ],
    },
    "travel-information/airport": {
        "main": [
            image_text("hkg", T("Skylantern at Hong Kong International Airport", "Skylantern à l'aéroport international de Hong Kong"), T(
                "<p>All our flights leave from Terminal 1. Check-in counters, kiosks and bag drop are in <strong>Aisle K</strong>, on "
                "the departures level. Our lounge, the Lantern Room, is near gate 35 after security.</p>",
                "<p>Tous nos vols partent du terminal 1. Comptoirs, bornes et dépose-bagages se trouvent dans la <strong>rangée "
                "K</strong>, au niveau des départs. Notre salon, le Lantern Room, est près de la porte 35 après les contrôles.</p>"),
                "service-airport.jpg"),
            text("times", T("Opening and closing times", "Heures d'ouverture et de fermeture"), join(COUNTERS_TABLE, T(
                "<p>Gates close 20 minutes before departure: passengers who arrive later cannot board.</p>",
                "<p>Les portes ferment 20 minutes avant le départ : un passager arrivé plus tard ne peut pas embarquer.</p>")),
                width="wide", surface="sunken"),
            text("lounge", T("The Lantern Room", "Le Lantern Room"), T(
                "<p>Open every day from 5:30 am to the last departure, for Business passengers and Flex passengers who added lounge "
                "access. Hot dishes, showers, a quiet room and views of the runway.</p>",
                "<p>Ouvert tous les jours de 5 h 30 jusqu'au dernier départ, pour les passagers Business et les passagers Flex ayant "
                "ajouté l'accès au salon. Plats chauds, douches, salle de repos et vue sur la piste.</p>")),
        ],
    },
    "travel-information/special-assistance": {
        "main": [
            text("intro", None, T(
                "<p>Assistance is free on every fare. Ask for it when you book, or at least 48 hours before departure, so that our "
                "team is ready for you at the airport and on board.</p>",
                "<p>L'assistance est gratuite pour tous les tarifs. Demandez-la en réservant, ou au moins 48 heures avant le départ, "
                "pour que notre équipe soit prête à vous accueillir à l'aéroport et à bord.</p>")),
            columns("needs", T("What we can do for you", "Ce que nous pouvons faire pour vous"), "thirds", [
                col_text("mobility", T("Reduced mobility", "Mobilité réduite"), T(
                    "<p>A wheelchair from the counter to your seat, an aisle chair on board and help with your bags. Your own wheelchair "
                    "and mobility aids travel free.</p>",
                    "<p>Un fauteuil roulant du comptoir à votre siège, un fauteuil de cabine à bord et de l'aide pour vos bagages. Votre "
                    "fauteuil et vos aides à la mobilité voyagent gratuitement.</p>")),
                col_text("senses", T("Sight or hearing loss", "Déficience visuelle ou auditive"), T(
                    "<p>A guide through the airport, a personal safety briefing and written announcements. Guide and assistance dogs "
                    "travel in the cabin, free of charge.</p>",
                    "<p>Un accompagnement dans l'aéroport, des consignes de sécurité individuelles et des annonces écrites. Les chiens "
                    "guides et d'assistance voyagent gratuitement en cabine.</p>")),
                col_text("medical", T("Medical needs", "Besoins médicaux"), T(
                    "<p>Oxygen concentrators approved for flights, medicines in the cabin and seats near the toilets. Some conditions "
                    "need a doctor's form.</p>",
                    "<p>Concentrateurs d'oxygène homologués, médicaments en cabine et sièges proches des toilettes. Certaines situations "
                    "demandent un formulaire médical.</p>")),
            ], surface="sunken"),
            image_text("ask", T("How to ask for assistance", "Comment demander une assistance"), T(
                "<p>Call our assistance desk on +852 0000 0010, every day from 8 am to 8 pm, or write to "
                "assistance@skylantern.example with your booking reference. We confirm every request in writing.</p>",
                "<p>Appelez notre service d'assistance au +852 0000 0010, tous les jours de 8 h à 20 h, ou écrivez à "
                "assistance@skylantern.example avec votre référence de réservation. Nous confirmons chaque demande par écrit.</p>"),
                "service-assistance.jpg", position="right", ratio="square",
                cta={"page": "about/contact", "label": T("All our contacts", "Tous nos contacts")}),
        ],
    },
    "travel-information/advisories": {
        "main": [
            text("intro", None, T(
                "<p>Information that may affect your trip, newest first. When a change concerns your flight, we also write to the "
                "email address of your booking.</p>",
                "<p>Les informations susceptibles de concerner votre voyage, les plus récentes en premier. Quand un changement touche "
                "votre vol, nous écrivons aussi à l'adresse e-mail de votre réservation.</p>")),
            listing("all", None, "ctpl:news", "news", ["travel-advisories"], 20, "list",
                    empty=T("No travel advisory at the moment.", "Aucun avis aux voyageurs en ce moment."), item_label="category"),
        ],
    },

    # ---- Experience -----------------------------------------------------------------------------
    "experience": {
        "hero": [hero("banner", "hero-experience.jpg", T("Life on board", "La vie à bord"),
                      T("Calm cabins, food worth waiting for and a crew that knows each city on our map.",
                        "Des cabines calmes, des repas qui valent l'attente et un équipage qui connaît chaque ville de notre carte."),
                      eyebrow=T("Experience", "À bord"), overlay="strong")],
        "main": [
            grid("more", T("Discover the experience", "Découvrir l'expérience"), [
                card("fleet", T("Our fleet", "Notre flotte"), T("Fourteen young Airbus aircraft, two cabins.", "Quatorze Airbus récents, deux cabines."),
                     link="experience/fleet", label=T("See the aircraft", "Voir les avions"), image="fleet-a330.jpg"),
                card("inflight", T("Inflight services", "Services à bord"), T("Meals, entertainment and comfort, in Business and Economy.", "Repas, divertissement et confort, en Business et en Économie."),
                     link="experience/inflight", label=T("See the services", "Voir les services"), image="cabin-business.jpg"),
            ], columns="2"),
        ],
    },
    "experience/fleet": {
        "main": [
            figures("numbers", T("Our fleet in numbers", "Notre flotte en chiffres"), [
                ("aircraft", T("14", "14"), T("aircraft", "avions"), None),
                ("age", T("4.6 years", "4,6 ans"), T("average age", "d'âge moyen"), T("As of 1 October 2026", "Au 1er octobre 2026")),
                ("seats", T("2,028", "2 028"), T("seats in total", "sièges au total"), None),
                ("orders", T("4", "4"), T("A321neo on order", "A321neo en commande"), T("Deliveries in 2027 and 2028", "Livraisons en 2027 et 2028")),
            ], surface="default"),
            image_text("a321", T("Airbus A321neo", "Airbus A321neo"), T(
                "<p>Ten aircraft, 186 seats: 12 recliner seats in Business and 174 in Economy, with USB-C power at every seat. The "
                "A321neo flies to Taiwan, Southeast Asia, Fukuoka and Sapporo.</p>",
                "<p>Dix avions, 186 sièges : 12 fauteuils inclinables en Business et 174 sièges en Économie, avec une prise USB-C à "
                "chaque place. L'A321neo dessert Taïwan, l'Asie du Sud-Est, Fukuoka et Sapporo.</p>"), "fleet-a321neo.jpg"),
            image_text("a330", T("Airbus A330-300", "Airbus A330-300"), T(
                "<p>Four aircraft, 292 seats: 24 lie-flat seats in Business, each with direct aisle access, and 268 in Economy. The "
                "A330-300 takes our busiest flights to Tokyo, Osaka and Seoul.</p>",
                "<p>Quatre avions, 292 sièges : 24 sièges-lits en Business, tous avec accès direct à l'allée, et 268 en Économie. "
                "L'A330-300 assure nos vols les plus chargés vers Tokyo, Osaka et Séoul.</p>"), "fleet-a330.jpg", position="right", surface="sunken"),
            text("specs", T("Specifications", "Caractéristiques"), FLEET_TABLE, width="wide"),
        ],
    },
    "experience/inflight": {
        "main": [
            image_text("food", T("Meals cooked in Hong Kong", "Des repas préparés à Hong Kong"), T(
                "<p>Every flight of more than two hours serves a hot meal on Classic, Flex and Business fares. Our menus change with "
                "the seasons and always offer a vegetarian dish.</p>",
                "<p>Chaque vol de plus de deux heures sert un repas chaud en tarifs Classic, Flex et Business. Nos menus suivent les "
                "saisons et proposent toujours un plat végétarien.</p>"), "service-meals.jpg",
                cta={"page": "book/extras/meals", "label": T("Pre-order a meal", "Réserver un repas")}),
            image_text("screen", T("Entertainment on your own device", "Le divertissement sur votre appareil"), T(
                "<p>Connect to the onboard network to stream films, series, music and a live flight map to your phone, tablet or "
                "laptop. It is free, with no app to install. On the A330-300, every seat also has its own screen.</p>",
                "<p>Connectez-vous au réseau de bord pour regarder films, séries, musique et la carte du vol sur votre téléphone, votre "
                "tablette ou votre ordinateur. C'est gratuit, sans application à installer. Sur l'A330-300, chaque siège a aussi son "
                "écran.</p>"), "cabin-economy.jpg", position="right", surface="sunken"),
            columns("cabins", T("Two cabins", "Deux cabines"), "halves", [
                col_text("business", T("Business", "Business"), T(
                    "<p>A wider seat, a three-course meal served on china, an amenity kit on flights to Japan and Korea, and priority at "
                    "every step.</p>",
                    "<p>Un siège plus large, un repas en trois services sur de la porcelaine, une trousse de confort vers le Japon et la "
                    "Corée, et la priorité à chaque étape.</p>")),
                col_text("economy", T("Economy", "Économie"), T(
                    "<p>Seats with 79 cm of pitch, a hot meal on most fares, free water and tea, and snacks to buy from the menu.</p>",
                    "<p>Des sièges espacés de 79 cm, un repas chaud dans la plupart des tarifs, de l'eau et du thé offerts, et des en-cas "
                    "à acheter à la carte.</p>")),
            ]),
            {"name": "crew", "type": "ctpl:quote", "props": {
                "quote": T("On every flight we hand out one paper lantern to a child on board. It is our oldest tradition.",
                           "Sur chaque vol, nous offrons une lanterne en papier à un enfant à bord. C'est notre plus ancienne tradition."),
                "author": "Grace Lo", "authorRole": T("Cabin crew manager, Skylantern Airways", "Responsable du personnel de cabine, Skylantern Airways"),
                "variant": "large", "ctplSurface": "sunken"}},
        ],
    },

    # ---- About ---------------------------------------------------------------------------------
    "about": {
        "hero": [hero("banner", "hero-about.jpg", T("A lantern for every journey", "Une lanterne pour chaque voyage"),
                      T("A fictional airline from Hong Kong, built to show what a template set can do.",
                        "Une compagnie fictive de Hong Kong, créée pour montrer ce que peut un jeu de gabarits."),
                      eyebrow=T("About Skylantern Airways", "À propos de Skylantern Airways"))],
        "main": [
            text("fiction", None, join(DEMO_NOTE, T(
                "<p>This website demonstrates the classic-templates template set for Jahia with the content of an airline: pages, "
                "menus, content lists, tables, forms and add-on modules. Its texts and pictures were written and drawn for the "
                "demonstration.</p>",
                "<p>Ce site présente le jeu de gabarits classic-templates pour Jahia avec les contenus d'une compagnie aérienne : pages, "
                "menus, listes de contenus, tableaux, formulaires et modules complémentaires. Ses textes et ses images ont été écrits et "
                "dessinés pour la démonstration.</p>"))),
            grid("company", T("The company", "La compagnie"), [
                card("story", T("Our story", "Notre histoire"), T("A harbour, a lantern and ten years of flights.", "Un port, une lanterne et dix ans de vols."),
                     link="about/story", image="story-harbour.jpg"),
                card("media", T("Media room", "Espace presse"), T("Press releases and contacts for journalists.", "Communiqués et contacts pour les journalistes."),
                     link="about/media-room", image="hero-offers.jpg"),
                card("careers", T("Careers", "Carrières"), T("Cabin crew, pilots and airport teams.", "Personnel de cabine, pilotes et équipes au sol."),
                     link="about/careers", image="careers-wings.jpg"),
                card("contact", T("Contact", "Contact"), T("Phone, offices and a form to write to us.", "Téléphone, agences et formulaire pour nous écrire."),
                     link="about/contact", image="service-airport.jpg"),
            ], columns="4", surface="sunken"),
        ],
    },
    "about/story": {
        "main": [
            image_text("origin", T("It started with a lantern", "Tout a commencé par une lanterne"), T(
                "<p>Skylantern Airways was founded in 2016 by a group of Hong Kong aviation engineers who wanted short flights to feel "
                "like a proper journey again. The name comes from the paper lanterns of the Mid-Autumn Festival, released over the "
                "harbour on the night the airline's first licence was granted.</p>",
                "<p>Skylantern Airways a été fondée en 2016 par un groupe d'ingénieurs aéronautiques de Hong Kong qui voulaient que les "
                "vols courts redeviennent un vrai voyage. Son nom vient des lanternes en papier de la fête de la mi-automne, lâchées au "
                "-dessus du port le soir où la compagnie a obtenu sa première licence.</p>"), "story-harbour.jpg", ratio="square"),
            text("timeline", T("Ten years in five dates", "Dix ans en cinq dates"), T(
                "<h2>2016</h2><p>Founding of the company and first flight to Taipei with two leased aircraft.</p>"
                "<h2>2018</h2><p>Tokyo and Osaka join the network; the hot meal becomes the rule on every flight of more than two hours.</p>"
                "<h2>2021</h2><p>Delivery of our first A321neo and opening of the Lantern Room lounge.</p>"
                "<h2>2024</h2><p>Arrival of the A330-300 and first flights to Seoul and Singapore.</p>"
                "<h2>2026</h2><p>Ten destinations, fourteen aircraft and daily winter flights to Sapporo.</p>",
                "<h2>2016</h2><p>Création de la compagnie et premier vol vers Taipei avec deux avions loués.</p>"
                "<h2>2018</h2><p>Tokyo et Osaka rejoignent le réseau ; le repas chaud devient la règle sur tous les vols de plus de deux heures.</p>"
                "<h2>2021</h2><p>Livraison de notre premier A321neo et ouverture du salon Lantern Room.</p>"
                "<h2>2024</h2><p>Arrivée de l'A330-300 et premiers vols vers Séoul et Singapour.</p>"
                "<h2>2026</h2><p>Dix destinations, quatorze avions et des vols quotidiens vers Sapporo en hiver.</p>"), surface="sunken"),
            {"name": "ceo", "type": "ctpl:quote", "props": {
                "quote": T("We will never be the biggest airline in Asia. We want to be the one you are glad you chose.",
                           "Nous ne serons jamais la plus grande compagnie d'Asie. Nous voulons être celle que l'on est content d'avoir choisie."),
                "author": "Iris Kwan", "authorRole": T("Chief executive, Skylantern Airways", "Directrice générale, Skylantern Airways"),
                "variant": "large"}, "image": "careers-wings.jpg"},
            figures("people", T("The company today", "La compagnie aujourd'hui"), [
                ("staff", T("1,850", "1 850"), T("employees", "salariés"), T("Including 640 cabin crew", "Dont 640 membres d'équipage de cabine")),
                ("flights", T("120", "120"), T("flights a week", "vols par semaine"), None),
                ("nationalities", T("23", "23"), T("nationalities in our teams", "nationalités dans nos équipes"), None),
            ]),
        ],
    },
    "about/media-room": {
        "main": [
            text("contacts", T("Press contacts", "Contacts presse"), T(
                "<p>Journalists can reach our press office every day from 8 am to 10 pm, Hong Kong time: +852 0000 0100, "
                "press@skylantern.example. Pictures of our aircraft and cabins are available on request.</p>",
                "<p>Les journalistes peuvent joindre notre service de presse tous les jours de 8 h à 22 h, heure de Hong Kong : "
                "+852 0000 0100, press@skylantern.example. Des images de nos avions et cabines sont disponibles sur demande.</p>"),
                surface="sunken"),
            listing("releases", T("Press releases", "Communiqués de presse"), "ctpl:news", "news", ["press-releases"], 20, "list",
                    empty=T("No press release yet.", "Pas encore de communiqué."), item_label="category"),
        ],
    },
    "about/careers": {
        "main": [
            image_text("join", T("Join the crew", "Rejoignez l'équipage"), T(
                "<p>We are 1,850 people in Hong Kong and in our ten cities. We hire for kindness and train for everything else: most "
                "of our cabin managers started as cabin crew, and our training centre in Tung Chung runs all year.</p>",
                "<p>Nous sommes 1 850 personnes à Hong Kong et dans nos dix villes. Nous recrutons la bienveillance et formons au reste : "
                "la plupart de nos chefs de cabine ont commencé comme membres d'équipage, et notre centre de formation de Tung Chung "
                "fonctionne toute l'année.</p>"), "careers-wings.jpg"),
            columns("benefits", T("What we offer", "Ce que nous offrons"), "thirds", [
                col_text("travel", T("Travel", "Voyages"), T("<p>Twelve free tickets a year on our network for you and your family.</p>",
                                                            "<p>Douze billets gratuits par an sur notre réseau pour vous et votre famille.</p>")),
                col_text("health", T("Health", "Santé"), T("<p>Medical and dental cover from your first day, for you and your children.</p>",
                                                          "<p>Une couverture médicale et dentaire dès le premier jour, pour vous et vos enfants.</p>")),
                col_text("growth", T("Growth", "Évolution"), T("<p>Forty hours of training a year and a mentor for every new hire.</p>",
                                                              "<p>Quarante heures de formation par an et un mentor pour chaque nouvelle recrue.</p>")),
            ], surface="sunken"),
            listing("jobs", T("Open positions", "Postes ouverts"), "ctpl:article", "articles", ["careers"], 12, "grid",
                    empty=T("No open position at the moment.", "Aucun poste ouvert en ce moment."), item_label="category"),
        ],
    },
    "about/contact": {
        "main": [
            text("phones", T("Call us", "Appelez-nous"), join(PHONES_TABLE, T(
                "<p>You can also write to care@skylantern.example. We answer within two working days.</p>",
                "<p>Vous pouvez aussi écrire à care@skylantern.example. Nous répondons sous deux jours ouvrés.</p>")), width="wide"),
            zone("offices", T("Our sales offices", "Nos agences"), "offices", surface="sunken"),
            zone("write", T("Write to us", "Écrivez-nous"), "contact-form", width="reading"),
        ],
    },

    # ---- Help -----------------------------------------------------------------------------------
    "help": {
        "hero": [hero("banner", "hero-help.jpg", T("How can we help?", "Comment pouvons-nous vous aider ?"),
                      T("Answers to common questions, the latest advisories and the ways to reach our team.",
                        "Réponses aux questions courantes, derniers avis aux voyageurs et moyens de joindre notre équipe."),
                      eyebrow=T("Help", "Aide"))],
        "main": [
            grid("routes", T("Find an answer", "Trouver une réponse"), [
                card("faq", T("Frequently asked questions", "Questions fréquentes"), T("Booking, baggage, check-in and refunds.", "Réservation, bagages, enregistrement et remboursements."),
                     link="help/faq", image="hero-help.jpg"),
                card("advisories", T("Travel advisories", "Avis aux voyageurs"), T("What may change on your next trip.", "Ce qui peut changer pour votre prochain voyage."),
                     link="travel-information/advisories", image="hero-travel.jpg"),
                card("assistance", T("Special assistance", "Assistance spéciale"), T("Free help at the airport and on board.", "Une aide gratuite à l'aéroport et à bord."),
                     link="travel-information/special-assistance", image="service-assistance.jpg"),
                card("contact", T("Contact us", "Nous contacter"), T("Phone numbers, offices and our form.", "Téléphones, agences et formulaire."),
                     link="about/contact", image="service-airport.jpg"),
            ], columns="4"),
        ],
    },
    "help/faq": {
        "main": [
            text("intro", None, T(
                "<p>Search the questions, or open a topic. Can't find your answer? Our customer service is there every day.</p>",
                "<p>Cherchez parmi les questions, ou ouvrez un thème. Vous ne trouvez pas votre réponse ? Notre service client est là "
                "tous les jours.</p>"), cta={"page": "about/contact", "label": T("Contact customer service", "Contacter le service client")}),
            zone("questions", None, "faq"),
        ],
    },

    # ---- Utility pages ---------------------------------------------------------------------------
    "manage-booking": {
        "main": [
            text("what", T("What you can do with your booking", "Ce que vous pouvez faire avec votre réservation"), join(DEMO_NOTE, T(
                "<p>On a real airline site, you would sign in here with your booking reference and last name. With Manage booking you "
                "can:</p><ul><li>change the date or time of a flight, depending on your fare;</li><li>add baggage, a seat or a meal;</li>"
                "<li>update your phone number and email address, so we can reach you if your flight changes;</li>"
                "<li>ask for special assistance;</li><li>request a refund of an unused ticket.</li></ul>",
                "<p>Sur le site d'une vraie compagnie, vous vous connecteriez ici avec votre référence de réservation et votre nom. "
                "Gérer ma réservation permet de :</p><ul><li>changer la date ou l'heure d'un vol, selon votre tarif ;</li><li>ajouter un "
                "bagage, un siège ou un repas ;</li><li>mettre à jour votre téléphone et votre adresse e-mail, pour être prévenu si votre "
                "vol change ;</li><li>demander une assistance spéciale ;</li><li>demander le remboursement d'un billet non utilisé.</li></ul>")),
                cta={"page": "book/fare-options", "label": T("What your fare allows", "Ce que permet votre tarif")}),
            link_list("related", T("Related pages", "Pages liées"), [
                ("extras", "book/extras"), ("checkin", "travel-information/check-in"), ("assistance", "travel-information/special-assistance")]),
        ],
    },
    "flight-status": {
        "main": [
            text("live", T("Live departure and arrival times", "Horaires réels de départ et d'arrivée"), join(DEMO_NOTE, T(
                "<p>An airline publishes the status of its flights from its operations systems: this demonstration site has none, so "
                "no flight status is shown here.</p><h2>How we tell you about changes</h2><p>When the time of your flight changes by "
                "more than 30 minutes, we send a message to the phone number and email address of your booking. Check that they are "
                "up to date in Manage booking.</p><h2>If your flight is cancelled</h2><p>We rebook you on the next available flight at "
                "no cost, or refund the unused part of your ticket if you prefer not to travel.</p>",
                "<p>Une compagnie publie l'état de ses vols à partir de ses systèmes d'exploitation : ce site de démonstration n'en a "
                "pas, aucun état de vol n'est donc affiché ici.</p><h2>Comment nous vous prévenons</h2><p>Quand l'horaire de votre vol "
                "change de plus de 30 minutes, nous envoyons un message au téléphone et à l'adresse e-mail de votre réservation. "
                "Vérifiez qu'ils sont à jour dans Gérer ma réservation.</p><h2>Si votre vol est annulé</h2><p>Nous vous replaçons sans "
                "frais sur le prochain vol disponible, ou remboursons la partie non utilisée de votre billet si vous préférez ne pas "
                "voyager.</p>")), cta={"page": "travel-information/advisories", "label": T("Read the travel advisories", "Lire les avis aux voyageurs")}),
        ],
    },
    "sitemap": {"main": [{"name": "map", "type": "ctpl:siteMap", "props": {"depth": "4"}}]},
}

# Legal pages: one rich text each (bodies below).
LEGAL_BODIES = {
    "legal": T(
        "<p>This website is a demonstration. Skylantern Airways is a fictional company: it does not operate flights and sells "
        "nothing.</p><h2>Publisher</h2><p>Skylantern Airways Limited (fictional), 8/F Lantern House, 12 Skyward Road, Hong Kong "
        "International Airport, Lantau, Hong Kong. Telephone: +852 0000 0000. Email: hello@skylantern.example.</p><p>Publication "
        "director: Iris Kwan, chief executive (a fictional person).</p><h2>Hosting</h2><p>The website runs on a Jahia platform "
        "operated for the demonstration.</p><h2>Intellectual property</h2><p>Texts and pictures were written and drawn for this "
        "demonstration. Aircraft model names belong to their manufacturer. Any resemblance with an existing airline, partner or "
        "person is coincidental.</p><h2>Personal data</h2><p>How the data you send through the forms of this site is handled is "
        "described in our privacy policy.</p>",
        "<p>Ce site est une démonstration. Skylantern Airways est une société fictive : elle n'exploite aucun vol et ne vend "
        "rien.</p><h2>Éditeur</h2><p>Skylantern Airways Limited (fictive), 8/F Lantern House, 12 Skyward Road, aéroport "
        "international de Hong Kong, Lantau, Hong Kong. Téléphone : +852 0000 0000. E-mail : hello@skylantern.example.</p>"
        "<p>Directrice de la publication : Iris Kwan, directrice générale (personne fictive).</p><h2>Hébergement</h2><p>Le site "
        "fonctionne sur une plateforme Jahia exploitée pour la démonstration.</p><h2>Propriété intellectuelle</h2><p>Les textes "
        "et les images ont été écrits et dessinés pour cette démonstration. Les noms des modèles d'avions appartiennent à leur "
        "constructeur. Toute ressemblance avec une compagnie, un partenaire ou une personne existante est fortuite.</p>"
        "<h2>Données personnelles</h2><p>Le traitement des données transmises par les formulaires du site est décrit dans notre "
        "politique de confidentialité.</p>"),
    "privacy": T(
        "<p>This demonstration site collects personal data through two forms only: the fare alerts newsletter and the contact "
        "form.</p><h2>What we collect and why</h2><ul><li><strong>Newsletter</strong>: your first name and email address, to send "
        "you fare alerts. Legal basis: your consent, which you can withdraw at any time.</li><li><strong>Contact form</strong>: "
        "your name, email address, booking reference if you give one, and your message, to answer you. Legal basis: our "
        "legitimate interest in answering the questions we receive.</li></ul><h2>Where the data is kept and for how long</h2><p>"
        "Answers are stored in the content repository of the site, for 12 months for messages and until you unsubscribe for the "
        "newsletter. They are not shared with anyone.</p><h2>Cookies</h2><p>The site sets only the cookies needed for it to work "
        "(session and language). It sets no advertising or audience measurement cookie.</p><h2>Your rights</h2><p>You can ask to "
        "see, correct or delete your data, or object to its use, by writing to privacy@skylantern.example. If you are not "
        "satisfied with our answer, you can complain to the data protection authority of your country.</p>",
        "<p>Ce site de démonstration recueille des données personnelles par deux formulaires seulement : la lettre d'alertes "
        "tarifs et le formulaire de contact.</p><h2>Ce que nous recueillons et pourquoi</h2><ul><li><strong>Lettre "
        "d'information</strong> : votre prénom et votre adresse e-mail, pour vous envoyer des alertes tarifs. Base légale : votre "
        "consentement, que vous pouvez retirer à tout moment.</li><li><strong>Formulaire de contact</strong> : votre nom, votre "
        "adresse e-mail, votre référence de réservation si vous la donnez, et votre message, pour vous répondre. Base légale : "
        "notre intérêt légitime à répondre aux questions reçues.</li></ul><h2>Où et combien de temps les données sont "
        "conservées</h2><p>Les réponses sont enregistrées dans le référentiel de contenus du site, 12 mois pour les messages et "
        "jusqu'à votre désinscription pour la lettre. Elles ne sont transmises à personne.</p><h2>Cookies</h2><p>Le site ne dépose "
        "que les cookies nécessaires à son fonctionnement (session et langue). Il ne dépose aucun cookie publicitaire ni de mesure "
        "d'audience.</p><h2>Vos droits</h2><p>Vous pouvez demander à consulter, corriger ou supprimer vos données, ou vous opposer "
        "à leur utilisation, en écrivant à privacy@skylantern.example. Si notre réponse ne vous satisfait pas, vous pouvez "
        "saisir l'autorité de protection des données de votre pays.</p>"),
    "conditions-of-carriage": T(
        "<p>These conditions are a summary written for a demonstration: Skylantern Airways is fictional and carries no "
        "passenger. They show how a long legal text reads on the site.</p>"
        "<h2>1. Tickets</h2><p>A ticket is personal and cannot be transferred. Flights must be used in the order of the booking: "
        "when a flight is not used, the following ones may be cancelled.</p>"
        "<h2>2. Fares</h2><p>The fare applies to the dates, flights and cabin booked. Its rules on changes and refunds are those "
        "shown when you booked.</p>"
        "<h2>3. Check-in and boarding</h2><p>Passengers who check in after the deadline or reach the gate after it closes may "
        "lose their seat. The deadlines are shown on the Check-in page.</p>"
        "<h2>4. Baggage</h2><p>The allowance is the one of the fare. Fragile items, valuables, medicines and keys travel in the "
        "cabin. Damage or delay must be reported at the airport of arrival, within seven days for damage and twenty-one days for "
        "delay.</p>"
        "<h2>5. Refusal of carriage</h2><p>We may refuse to carry a passenger whose documents are not valid, whose behaviour "
        "puts others at risk, or who does not follow the instructions of the crew.</p>"
        "<h2>6. Schedules, delays and cancellations</h2><p>Schedules may change. When a flight is cancelled or delayed by more "
        "than three hours, the passenger chooses between another flight at no cost and the refund of the unused part of the "
        "ticket.</p>"
        "<h2>7. Refunds</h2><p>Refunds are paid by the means of payment used to book, within twenty working days.</p>"
        "<h2>8. Liability</h2><p>Our liability follows the international conventions that apply to air carriage.</p>",
        "<p>Ces conditions sont un résumé rédigé pour une démonstration : Skylantern Airways est fictive et ne transporte aucun "
        "passager. Elles montrent comment un long texte juridique se lit sur le site.</p>"
        "<h2>1. Billets</h2><p>Un billet est personnel et incessible. Les vols s'utilisent dans l'ordre de la réservation : un "
        "vol non utilisé peut entraîner l'annulation des suivants.</p>"
        "<h2>2. Tarifs</h2><p>Le tarif s'applique aux dates, vols et cabine réservés. Ses règles de modification et de "
        "remboursement sont celles affichées lors de la réservation.</p>"
        "<h2>3. Enregistrement et embarquement</h2><p>Un passager qui s'enregistre après l'heure limite ou arrive à la porte "
        "après sa fermeture peut perdre sa place. Les heures limites figurent sur la page Enregistrement.</p>"
        "<h2>4. Bagages</h2><p>La franchise est celle du tarif. Objets fragiles, objets de valeur, médicaments et clés voyagent "
        "en cabine. Un dommage ou un retard se déclare à l'aéroport d'arrivée, sous sept jours pour un dommage et vingt et un "
        "jours pour un retard.</p>"
        "<h2>5. Refus de transport</h2><p>Nous pouvons refuser de transporter un passager dont les documents ne sont pas "
        "valides, dont le comportement met les autres en danger, ou qui ne suit pas les consignes de l'équipage.</p>"
        "<h2>6. Horaires, retards et annulations</h2><p>Les horaires peuvent changer. En cas d'annulation ou de retard de plus de "
        "trois heures, le passager choisit entre un autre vol sans frais et le remboursement de la partie non utilisée du "
        "billet.</p>"
        "<h2>7. Remboursements</h2><p>Les remboursements sont versés sur le moyen de paiement utilisé lors de la réservation, sous "
        "vingt jours ouvrés.</p>"
        "<h2>8. Responsabilité</h2><p>Notre responsabilité suit les conventions internationales applicables au transport "
        "aérien.</p>"),
    "accessibility": T(
        "<p>Skylantern Airways (a fictional company) commits to making this demonstration website accessible, in accordance with "
        "article 47 of French law 2005-102 of 11 February 2005. This statement applies to the website <strong>Skylantern "
        "Airways</strong>, built on the classic-templates template set for Jahia.</p>"
        "<h2>Compliance status</h2><p>The site is <strong>partially compliant</strong> with RGAA version 4.1.2. The templates and "
        "components of the template set were audited on 30 September and 1 October 2026 and their non-compliances corrected. The "
        "content of this site and the add-on modules it uses have <strong>not been audited yet</strong>: until they are, total "
        "compliance cannot be claimed.</p>"
        "<h2>Test results</h2><p>No audit of this site has been carried out yet. Automated tests (axe-core with every rule) are run "
        "on a sample of pages after each change of content; they are not a substitute for an audit.</p>"
        "<h2>Content that may not be accessible</h2><ul><li>The FAQ, the map of our sales offices and the forms come from add-on "
        "modules (jsfaq, js-store-locator, Formidable) that this statement does not yet cover.</li><li>The map of the sales "
        "offices may be hard to use with a keyboard or a screen reader: the list of offices next to it gives the same "
        "information.</li><li>Tests with screen readers (NVDA with Firefox, VoiceOver with Safari) remain to be done.</li></ul>"
        "<h2>Preparation of this statement</h2><p>Established on 1 October 2026.</p><dl><dt>Technologies used</dt><dd>HTML, CSS, "
        "JavaScript, WAI-ARIA.</dd><dt>Planned audit</dt><dd>A full audit of a sample of pages of this site, in English and in "
        "French, before the end of 2026.</dd></dl>"
        "<h2>Feedback and contact</h2><p>If you cannot access a content or a service, write to accessibility@skylantern.example so "
        "that we direct you to an accessible alternative or send you the content in another form.</p>"
        "<h2>Remedies</h2><p>If you reported an accessibility defect and did not get a satisfactory answer, you can write to the "
        "Défenseur des droits, use the contact form of its website, or contact its delegate in your region.</p>",
        "<p>Skylantern Airways (société fictive) s'engage à rendre ce site de démonstration accessible conformément à l'article "
        "47 de la loi n° 2005-102 du 11 février 2005. Cette déclaration d'accessibilité s'applique au site <strong>Skylantern "
        "Airways</strong>, construit avec le jeu de gabarits classic-templates pour Jahia.</p>"
        "<h2>État de conformité</h2><p>Le site est <strong>partiellement conforme</strong> avec le RGAA version 4.1.2. Les "
        "gabarits et les composants du jeu de gabarits ont été audités les 30 septembre et 1er octobre 2026 et leurs "
        "non-conformités corrigées. Les contenus de ce site et les modules complémentaires qu'il utilise <strong>n'ont pas encore "
        "été audités</strong> : tant qu'ils ne le sont pas, la conformité totale ne peut pas être déclarée.</p>"
        "<h2>Résultats des tests</h2><p>Aucun audit de ce site n'a encore été mené. Des tests automatiques (axe-core avec toutes ses "
        "règles) sont lancés sur un échantillon de pages après chaque changement de contenu ; ils ne remplacent pas un audit.</p>"
        "<h2>Contenus qui peuvent ne pas être accessibles</h2><ul><li>La FAQ, la carte de nos agences et les formulaires "
        "proviennent de modules complémentaires (jsfaq, js-store-locator, Formidable) que cette déclaration ne couvre pas encore.</li>"
        "<li>La carte des agences peut être difficile à utiliser au clavier ou avec un lecteur d'écran : la liste des agences à côté "
        "donne les mêmes informations.</li><li>Les tests avec des lecteurs d'écran (NVDA avec Firefox, VoiceOver avec Safari) "
        "restent à mener.</li></ul>"
        "<h2>Établissement de cette déclaration</h2><p>Établie le 1er octobre 2026.</p><dl><dt>Technologies utilisées</dt><dd>HTML, "
        "CSS, JavaScript, WAI-ARIA.</dd><dt>Audit prévu</dt><dd>Un audit complet d'un échantillon de pages du site, en anglais et "
        "en français, avant la fin de 2026.</dd></dl>"
        "<h2>Retour d'information et contact</h2><p>Si vous n'arrivez pas à accéder à un contenu ou à un service, écrivez à "
        "accessibility@skylantern.example pour être orienté vers une alternative accessible ou obtenir le contenu sous une autre "
        "forme.</p><h2>Voies de recours</h2><p>Si vous avez signalé un défaut d'accessibilité sans obtenir de réponse "
        "satisfaisante, vous pouvez écrire au Défenseur des droits, utiliser le formulaire de contact de son site, ou contacter "
        "son délégué dans votre région.</p>"),
}
for _path, _body in LEGAL_BODIES.items():
    _section = text("body", None, _body)
    if _path == "accessibility":
        _section["cta"] = {"page": "about/contact", "label": T("Report a problem", "Signaler un problème")}
    PAGES[_path] = {"main": [_section]}

# ---------------------------------------------------------------------------------------------
# 5. Header and footer (seeded singletons under the home page)
# ---------------------------------------------------------------------------------------------
HEADER = {
    "brandName": T("Skylantern Airways", "Skylantern Airways"),
    "logo": "skylantern-logo.png",
    "logoDark": "skylantern-logo-light.png",
    "showBrandName": "false",  # the wordmark is in the logo: its text alternative is the brand name
    "utility": [("manage", "manage-booking"), ("checkin", "travel-information/check-in"), ("status", "flight-status")],
    # Notice bar (pass 3): in the home page's header area, above the site header, so it shows on every
    # page and is edited from home. Fed by the "Travel advisories" category, newest first.
    "notice_bar": {"name": "advisories", "label": T("Travel advisories", "Avis aux voyageurs"), "type": "ctpl:news",
                   "folder": "news", "categories": ["travel-advisories"], "maxItems": "3", "itemLabel": "none",
                   "dismissible": "true", "cta": {"page": "travel-information/advisories", "label": T("View all", "Tout voir")}},
}

# Nodes created by earlier versions of the seeder and removed from the content since: the seeder
# marks them for deletion and publishes the deletion (path relative to the home page).
RETIRED = [
    "main/demo",  # the pass-1 demo notice: the travel tools section now shows it on home
]

FOOTER = {
    "tagline": T("Skylantern Airways is a fictional airline from Hong Kong, created to demonstrate the classic-templates "
                 "template set for Jahia. No flight can be booked on this site.",
                 "Skylantern Airways est une compagnie fictive de Hong Kong, créée pour présenter le jeu de gabarits "
                 "classic-templates pour Jahia. Aucun vol ne peut être réservé sur ce site."),
    "copyright": T("© {year} Skylantern Airways, a fictional airline. All rights reserved.",
                   "© {year} Skylantern Airways, compagnie fictive. Tous droits réservés."),
    "columns": [
        {"name": "company", "title": T("Skylantern", "Skylantern"),
         "links": [("story", "about/story"), ("fleet", "experience/fleet"), ("media", "about/media-room"), ("careers", "about/careers"), ("contact", "about/contact")]},
        {"name": "book", "title": T("Book", "Réserver"),
         "links": [("deals", "offers/current-deals"), ("fares", "book/fare-options"), ("children", "book/children-infants"), ("extras", "book/extras")]},
        {"name": "travel", "title": T("Travel information", "Infos voyageurs"),
         "links": [("baggage", "travel-information/baggage"), ("documents", "travel-information/travel-documents"),
                   ("checkin", "travel-information/check-in"), ("airport", "travel-information/airport")]},
        {"name": "help", "title": T("Help", "Aide"),
         "links": [("faq", "help/faq"), ("advisories", "travel-information/advisories"), ("assistance", "travel-information/special-assistance"),
                   ("manage", "manage-booking")]},
    ],
    # (name, page, label or None for the page title)
    "legal": [("legal", "legal", None), ("privacy", "privacy", None), ("conditions", "conditions-of-carriage", None),
              ("sitemap", "sitemap", None),
              ("accessibility", "accessibility", T("Accessibility: partially compliant", "Accessibilité : partiellement conforme"))],
    # Placeholders on example.com (RFC 2606): no real social network is named or linked.
    "social": [("photos", T("Photo stories", "Photos de voyage"), "https://example.com/skylantern/photos"),
               ("videos", T("Videos", "Vidéos"), "https://example.com/skylantern/videos"),
               ("updates", T("Company updates", "Actualités de l'entreprise"), "https://example.com/skylantern/updates")],
}

# ---------------------------------------------------------------------------------------------
# 6. Categories (system site, like the classic-templates demo) and editorial items
# ---------------------------------------------------------------------------------------------
CATEGORIES = {
    "root": ("skylantern-demo", T("Skylantern Airways demo", "Démo Skylantern Airways")),
    "items": [
        ("travel-advisories", T("Travel advisories", "Avis aux voyageurs")),
        ("press-releases", T("Press releases", "Communiqués de presse")),
        ("careers", T("Careers", "Carrières")),
        ("partner-offers", T("Partner offers", "Offres partenaires")),
    ],
}

NEWS = [
    # ---- Travel advisories ----
    {"name": "winter-schedule-2026", "date": "2026-09-30", "category": "travel-advisories", "image": "dest-sapporo.jpg",
     "title": T("Winter schedule from 25 October 2026", "Programme d'hiver à partir du 25 octobre 2026"),
     "teaser": T("New times on several routes, daily flights to Sapporo from 1 December and four weekly flights to Da Nang.",
                 "Nouveaux horaires sur plusieurs lignes, vols quotidiens vers Sapporo dès le 1er décembre et quatre vols hebdomadaires vers Da Nang."),
     "body": T("<p>Our winter schedule starts on 25 October 2026 and runs until 27 March 2027.</p><h2>What changes</h2><ul>"
               "<li>Sapporo: daily flights from 1 December 2026 to 28 February 2027, then four a week.</li>"
               "<li>Da Nang: four flights a week instead of seven, on Monday, Wednesday, Friday and Sunday.</li>"
               "<li>Tokyo: the morning departure leaves 25 minutes earlier, at 8:05 am.</li></ul>"
               "<h2>If your flight is affected</h2><p>We have written to every passenger whose flight time changed by more than 30 "
               "minutes. You can move to another flight at no cost, or ask for a refund if the new time does not suit you.</p>",
               "<p>Notre programme d'hiver commence le 25 octobre 2026 et dure jusqu'au 27 mars 2027.</p><h2>Ce qui change</h2><ul>"
               "<li>Sapporo : vols quotidiens du 1er décembre 2026 au 28 février 2027, puis quatre par semaine.</li>"
               "<li>Da Nang : quatre vols par semaine au lieu de sept, les lundi, mercredi, vendredi et dimanche.</li>"
               "<li>Tokyo : le départ du matin est avancé de 25 minutes, à 8 h 05.</li></ul>"
               "<h2>Si votre vol est concerné</h2><p>Nous avons écrit à chaque passager dont l'horaire change de plus de 30 minutes. "
               "Vous pouvez prendre un autre vol sans frais, ou demander un remboursement si le nouvel horaire ne vous convient pas.</p>")},
    {"name": "tropical-cyclones", "date": "2026-09-24", "category": "travel-advisories", "image": "hero-help.jpg",
     "title": T("Tropical cyclones: free date changes", "Cyclones tropicaux : changements de date gratuits"),
     "teaser": T("When a strong tropical cyclone is forecast near Hong Kong, you can move your flight at no cost.",
                 "Quand un fort cyclone tropical est annoncé près de Hong Kong, vous pouvez déplacer votre vol sans frais."),
     "body": T("<p>Until the end of the cyclone season in November, when a tropical cyclone warning signal no. 8 or higher is "
               "forecast in Hong Kong, we publish a notice here and open free date changes for the flights concerned.</p>"
               "<ul><li>Change to any flight within 14 days of the original date, on the same route.</li><li>No change fee and no fare "
               "difference.</li><li>Use Manage booking or call customer service.</li></ul><p>Flights may be delayed or cancelled while "
               "a high signal is in force. Please do not travel to the airport before checking the status of your flight.</p>",
               "<p>Jusqu'à la fin de la saison des cyclones en novembre, quand un signal d'alerte de cyclone tropical n° 8 ou plus est "
               "annoncé à Hong Kong, nous publions un avis ici et ouvrons des changements de date gratuits pour les vols concernés.</p>"
               "<ul><li>Changement vers tout vol dans les 14 jours suivant la date initiale, sur la même ligne.</li><li>Sans frais de "
               "modification ni différence tarifaire.</li><li>Depuis Gérer ma réservation ou par téléphone.</li></ul><p>Les vols peuvent "
               "être retardés ou annulés tant qu'un signal élevé est en vigueur. Vérifiez l'état de votre vol avant de vous rendre à "
               "l'aéroport.</p>")},
    {"name": "power-banks", "date": "2026-09-18", "category": "travel-advisories", "image": "service-baggage.jpg",
     "title": T("Power banks on board: our rules", "Batteries externes à bord : nos règles"),
     "teaser": T("Power banks travel in the cabin only, up to 100 Wh, and cannot be used or charged during the flight.",
                 "Les batteries externes voyagent en cabine seulement, jusqu'à 100 Wh, et ne peuvent être ni utilisées ni rechargées en vol."),
     "body": T("<p>From 15 October 2026, the following rules apply on every Skylantern flight:</p><ul><li>Power banks and spare "
               "batteries travel in the cabin only, never in checked baggage.</li><li>Up to two power banks per passenger, each up to "
               "100 Wh, with the capacity printed on them.</li><li>They cannot be used to charge a device, or be charged, during the "
               "flight.</li><li>Keep them in the seat pocket or under the seat, not in the overhead bin, so that the crew can act "
               "quickly if one overheats.</li></ul>",
               "<p>À partir du 15 octobre 2026, les règles suivantes s'appliquent sur tous les vols Skylantern :</p><ul><li>Batteries "
               "externes et batteries de rechange voyagent en cabine seulement, jamais en soute.</li><li>Deux batteries externes au plus "
               "par passager, de 100 Wh chacune au maximum, avec la capacité inscrite dessus.</li><li>Elles ne peuvent ni recharger un "
               "appareil ni être rechargées pendant le vol.</li><li>Rangez-les dans la pochette du siège ou sous le siège, pas dans le "
               "coffre à bagages, pour que l'équipage puisse agir vite en cas de surchauffe.</li></ul>")},
    {"name": "aisle-k", "date": "2026-09-10", "category": "travel-advisories", "image": "service-checkin.jpg",
     "title": T("Check-in moves to Aisle K in Hong Kong", "L'enregistrement déménage dans la rangée K à Hong Kong"),
     "teaser": T("From 15 October 2026, our counters, kiosks and bag drop move to Aisle K of Terminal 1.",
                 "À partir du 15 octobre 2026, nos comptoirs, bornes et dépose-bagages s'installent dans la rangée K du terminal 1."),
     "body": T("<p>From 15 October 2026, all Skylantern check-in services at Hong Kong International Airport move to Aisle K of "
               "Terminal 1, on the departures level. The new aisle has twelve counters, eight kiosks and four automatic bag drops, "
               "and a dedicated counter for special assistance.</p><p>Follow the Skylantern signs from the Airport Express station or "
               "the bus terminus: Aisle K is a five-minute walk.</p>",
               "<p>À partir du 15 octobre 2026, tous les services d'enregistrement Skylantern de l'aéroport international de Hong Kong "
               "s'installent dans la rangée K du terminal 1, au niveau des départs. La nouvelle rangée compte douze comptoirs, huit "
               "bornes, quatre dépose-bagages automatiques et un comptoir réservé à l'assistance spéciale.</p><p>Suivez les panneaux "
               "Skylantern depuis la gare de l'Airport Express ou la gare routière : la rangée K est à cinq minutes à pied.</p>")},
    {"name": "lunar-new-year-2027", "date": "2026-09-03", "category": "travel-advisories", "image": "hero-about.jpg",
     "title": T("Lunar New Year 2027: plan ahead", "Nouvel An lunaire 2027 : anticipez"),
     "teaser": T("Between 1 and 15 February 2027 our flights will be very full: book early and come to the airport three hours before departure.",
                 "Entre le 1er et le 15 février 2027, nos vols seront très chargés : réservez tôt et venez à l'aéroport trois heures avant le départ."),
     "body": T("<p>The Lunar New Year falls on 6 February 2027. Between 1 and 15 February, most of our flights will be full and the "
               "airport very busy.</p><ul><li>Book early: extra flights to Taipei, Bangkok and Tokyo go on sale on 1 November 2026.</li>"
               "<li>Check in online and come to the airport three hours before departure.</li><li>Add extra baggage in advance: it costs "
               "less, and the bag drop is faster.</li></ul>",
               "<p>Le Nouvel An lunaire tombe le 6 février 2027. Entre le 1er et le 15 février, la plupart de nos vols seront complets "
               "et l'aéroport très fréquenté.</p><ul><li>Réservez tôt : des vols supplémentaires vers Taipei, Bangkok et Tokyo seront "
               "en vente dès le 1er novembre 2026.</li><li>Enregistrez-vous en ligne et venez à l'aéroport trois heures avant le "
               "départ.</li><li>Ajoutez vos bagages à l'avance : c'est moins cher, et le dépôt est plus rapide.</li></ul>")},
    {"name": "sapporo-winter", "date": "2026-08-27", "category": "travel-advisories", "image": "dest-sapporo.jpg",
     "title": T("Sapporo in winter: de-icing may delay departures", "Sapporo en hiver : le dégivrage peut retarder les départs"),
     "teaser": T("From December 2026 to March 2027, snow and de-icing may delay flights from Sapporo by up to an hour.",
                 "De décembre 2026 à mars 2027, la neige et le dégivrage peuvent retarder les vols au départ de Sapporo jusqu'à une heure."),
     "body": T("<p>Snow is frequent in Sapporo from December to March. Before take-off, aircraft are sprayed with a de-icing "
               "fluid, which can delay the departure by 20 to 60 minutes on snowy days.</p><p>We build this time into our schedule "
               "where we can. If you connect in Hong Kong to another flight, choose a connection of at least two hours.</p>",
               "<p>La neige est fréquente à Sapporo de décembre à mars. Avant le décollage, les avions reçoivent un liquide de "
               "dégivrage, ce qui peut retarder le départ de 20 à 60 minutes les jours de neige.</p><p>Nous intégrons ce temps à nos "
               "horaires quand c'est possible. Si vous avez une correspondance à Hong Kong, choisissez-en une d'au moins deux "
               "heures.</p>")},
    # ---- Press releases ----
    {"name": "sapporo-daily", "date": "2026-09-29", "category": "press-releases", "image": "dest-sapporo.jpg",
     "title": T("Skylantern Airways flies daily to Sapporo this winter", "Skylantern Airways vole chaque jour vers Sapporo cet hiver"),
     "teaser": T("From 1 December 2026, the Hong Kong to Sapporo route goes daily for the snow season.",
                 "Dès le 1er décembre 2026, la ligne Hong Kong Sapporo devient quotidienne pour la saison de la neige."),
     "body": T("<p>HONG KONG, 29 September 2026. Skylantern Airways will fly every day between Hong Kong and Sapporo from 1 "
               "December 2026 to 28 February 2027, up from four flights a week last winter. The route will use the A321neo, with 12 "
               "seats in Business and 174 in Economy.</p><p>\"Sapporo is the destination our passengers ask us about most in "
               "winter,\" said Iris Kwan, chief executive. \"A daily flight means a long weekend in the snow becomes easy.\"</p>"
               "<p>Ski and snowboard equipment travels free as part of the checked baggage allowance on Classic, Flex and Business "
               "fares.</p>",
               "<p>HONG KONG, 29 septembre 2026. Skylantern Airways volera chaque jour entre Hong Kong et Sapporo du 1er décembre "
               "2026 au 28 février 2027, contre quatre vols par semaine l'hiver dernier. La ligne sera assurée en A321neo, avec 12 "
               "sièges en Business et 174 en Économie.</p><p>« Sapporo est la destination que nos passagers nous demandent le plus en "
               "hiver, a déclaré Iris Kwan, directrice générale. Avec un vol quotidien, un long week-end à la neige devient "
               "simple. »</p><p>Les skis et les planches voyagent gratuitement dans la franchise bagages des tarifs Classic, Flex et "
               "Business.</p>")},
    {"name": "tenth-a321neo", "date": "2026-09-15", "category": "press-releases", "image": "fleet-a321neo.jpg",
     "title": T("Skylantern Airways welcomes its tenth A321neo", "Skylantern Airways accueille son dixième A321neo"),
     "teaser": T("The new aircraft brings the fleet to fourteen and its average age to 4.6 years.",
                 "Le nouvel avion porte la flotte à quatorze appareils et son âge moyen à 4,6 ans."),
     "body": T("<p>HONG KONG, 15 September 2026. Skylantern Airways has taken delivery of its tenth Airbus A321neo, which landed "
               "in Hong Kong on 12 September. The aircraft will enter service on the Taipei and Bangkok routes on 1 October.</p><p>"
               "With fourteen aircraft, the fleet has an average age of 4.6 years. Four more A321neo are on order for 2027 and "
               "2028.</p>",
               "<p>HONG KONG, 15 septembre 2026. Skylantern Airways a pris livraison de son dixième Airbus A321neo, arrivé à Hong "
               "Kong le 12 septembre. L'avion entrera en service sur les lignes de Taipei et de Bangkok le 1er octobre.</p><p>Avec "
               "quatorze avions, la flotte a un âge moyen de 4,6 ans. Quatre autres A321neo sont commandés pour 2027 et 2028.</p>")},
    {"name": "autumn-menu", "date": "2026-09-01", "category": "press-releases", "image": "service-meals.jpg",
     "title": T("A new autumn menu, cooked in Hong Kong", "Un nouveau menu d'automne, préparé à Hong Kong"),
     "teaser": T("Three hot dishes and a children's tray, created with our catering kitchen at the airport.",
                 "Trois plats chauds et un plateau enfant, créés avec notre cuisine de l'aéroport."),
     "body": T("<p>HONG KONG, 1 September 2026. From 1 October, Skylantern Airways serves a new autumn menu on every flight of "
               "more than two hours: harbour rice with soy-glazed chicken, garden noodles for vegetarians, and a little lantern tray "
               "for children. Each dish was tested on board by our crews before being chosen.</p>",
               "<p>HONG KONG, 1er septembre 2026. À partir du 1er octobre, Skylantern Airways sert un nouveau menu d'automne sur tous "
               "les vols de plus de deux heures : riz du port au poulet laqué au soja, nouilles du jardin pour les végétariens et "
               "plateau petite lanterne pour les enfants. Chaque plat a été goûté à bord par nos équipages avant d'être retenu.</p>")},
    {"name": "summer-punctuality", "date": "2026-08-18", "category": "press-releases", "image": "service-airport.jpg",
     "title": T("88% of our summer flights left on time", "88 % de nos vols d'été sont partis à l'heure"),
     "teaser": T("Between June and August 2026, 88% of Skylantern flights left within 15 minutes of their scheduled time.",
                 "Entre juin et août 2026, 88 % des vols Skylantern sont partis à 15 minutes près de leur horaire prévu."),
     "body": T("<p>HONG KONG, 18 August 2026. Between 1 June and 15 August 2026, 88% of Skylantern Airways flights left within 15 "
               "minutes of their scheduled time, and 99.4% of scheduled flights operated. The airline credits the new automatic bag "
               "drops and a spare aircraft kept in Hong Kong during the peak weeks.</p>",
               "<p>HONG KONG, 18 août 2026. Entre le 1er juin et le 15 août 2026, 88 % des vols Skylantern Airways sont partis à 15 "
               "minutes près de leur horaire prévu, et 99,4 % des vols programmés ont été assurés. La compagnie l'attribue aux "
               "nouveaux dépose-bagages automatiques et à un avion de réserve gardé à Hong Kong pendant les semaines de pointe.</p>")},
]

ARTICLES = [
    # ---- Careers ----
    {"name": "cabin-crew-2026", "date": "2026-09-22", "category": "careers", "author": "Skylantern People team", "image": "careers-wings.jpg",
     "title": T("Cabin crew, Hong Kong base", "Personnel de cabine, base de Hong Kong"),
     "teaser": T("Full-time positions for our A321neo and A330-300 crews, with eight weeks of paid training. Apply by 15 November 2026.",
                 "Postes à temps plein dans nos équipages d'A321neo et d'A330-300, avec huit semaines de formation payée. Candidatures avant le 15 novembre 2026."),
     "body": T("<p>We are looking for 60 cabin crew members to join our Hong Kong base from February 2027.</p><h2>Your role</h2><ul>"
               "<li>Look after the safety and comfort of passengers on flights of up to five hours.</li><li>Serve meals and help "
               "families and passengers who need assistance.</li><li>Return home every night on most rosters.</li></ul>"
               "<h2>Your profile</h2><ul><li>Aged 18 or over, with a Hong Kong right to work.</li><li>Fluent in English and in "
               "Cantonese or Mandarin; Japanese or Korean is a plus.</li><li>Able to swim 50 metres.</li></ul><h2>How to apply</h2>"
               "<p>Send your resume to careers@skylantern.example with the reference CC-2026 by 15 November 2026. Interviews take "
               "place in December.</p>",
               "<p>Nous recherchons 60 membres d'équipage de cabine pour notre base de Hong Kong à partir de février 2027.</p>"
               "<h2>Votre rôle</h2><ul><li>Veiller à la sécurité et au confort des passagers sur des vols de cinq heures au plus.</li>"
               "<li>Servir les repas et aider les familles et les passagers qui ont besoin d'assistance.</li><li>Rentrer chez vous chaque "
               "soir avec la plupart des plannings.</li></ul><h2>Votre profil</h2><ul><li>18 ans ou plus, avec le droit de travailler à "
               "Hong Kong.</li><li>Anglais courant et cantonais ou mandarin ; le japonais ou le coréen est un plus.</li><li>Savoir nager "
               "50 mètres.</li></ul><h2>Comment postuler</h2><p>Envoyez votre CV à careers@skylantern.example avec la référence "
               "CC-2026 avant le 15 novembre 2026. Les entretiens ont lieu en décembre.</p>")},
    {"name": "first-officer-a321neo", "date": "2026-09-12", "category": "careers", "author": "Skylantern People team", "image": "fleet-a321neo.jpg",
     "title": T("First officer, Airbus A321neo", "Copilote, Airbus A321neo"),
     "teaser": T("Type-rated or not: we train you on the A321neo in our partner simulator centre. Apply by 30 November 2026.",
                 "Qualifié sur type ou non : nous vous formons sur A321neo dans notre centre de simulation partenaire. Candidatures avant le 30 novembre 2026."),
     "body": T("<p>Our fleet grows by four aircraft in 2027 and 2028: we are hiring twelve first officers.</p><h2>Your profile</h2>"
               "<ul><li>A valid commercial pilot licence with an instrument rating.</li><li>At least 500 hours of flight time.</li>"
               "<li>English language proficiency at level 4 or higher.</li></ul><h2>What we offer</h2><p>Type rating paid by the "
               "company, a base in Hong Kong, rosters published six weeks ahead, and a path to captain from four years of service.</p>"
               "<h2>How to apply</h2><p>Write to careers@skylantern.example with the reference FO-321 by 30 November 2026.</p>",
               "<p>Notre flotte s'agrandit de quatre avions en 2027 et 2028 : nous recrutons douze copilotes.</p><h2>Votre profil</h2>"
               "<ul><li>Une licence de pilote professionnel valide avec qualification de vol aux instruments.</li><li>Au moins 500 heures "
               "de vol.</li><li>Un niveau d'anglais aéronautique 4 ou plus.</li></ul><h2>Ce que nous offrons</h2><p>Qualification de "
               "type payée par la compagnie, une base à Hong Kong, des plannings publiés six semaines à l'avance, et une évolution "
               "vers commandant de bord dès quatre ans d'ancienneté.</p><h2>Comment postuler</h2><p>Écrivez à "
               "careers@skylantern.example avec la référence FO-321 avant le 30 novembre 2026.</p>")},
    {"name": "airport-agent", "date": "2026-09-05", "category": "careers", "author": "Skylantern People team", "image": "service-checkin.jpg",
     "title": T("Airport customer service agent", "Agent de service client aéroport"),
     "teaser": T("Welcome our passengers in Aisle K, at the gates and at arrival. Shift work, full or part time. Apply by 31 October 2026.",
                 "Accueillez nos passagers dans la rangée K, aux portes et à l'arrivée. Travail posté, temps plein ou partiel. Candidatures avant le 31 octobre 2026."),
     "body": T("<p>Our new check-in aisle opens in October: we are hiring 25 customer service agents at Hong Kong International "
               "Airport.</p><h2>Your role</h2><ul><li>Check in passengers and their baggage, and check travel documents.</li><li>Board "
               "flights and help passengers with connections.</li><li>Find solutions when a flight is delayed or a bag is late.</li></ul>"
               "<h2>Your profile</h2><p>A taste for service, calm under pressure, and English with Cantonese or Mandarin. Previous "
               "airport experience is welcome but not required.</p><h2>How to apply</h2><p>Write to careers@skylantern.example with "
               "the reference AP-2026 by 31 October 2026.</p>",
               "<p>Notre nouvelle rangée d'enregistrement ouvre en octobre : nous recrutons 25 agents de service client à l'aéroport "
               "international de Hong Kong.</p><h2>Votre rôle</h2><ul><li>Enregistrer les passagers et leurs bagages, et contrôler les "
               "documents de voyage.</li><li>Embarquer les vols et aider les passagers en correspondance.</li><li>Trouver des solutions "
               "quand un vol est retardé ou un bagage en retard.</li></ul><h2>Votre profil</h2><p>Le goût du service, du calme sous "
               "pression, et l'anglais avec le cantonais ou le mandarin. Une expérience en aéroport est appréciée mais pas exigée.</p>"
               "<h2>Comment postuler</h2><p>Écrivez à careers@skylantern.example avec la référence AP-2026 avant le 31 octobre "
               "2026.</p>")},
    # ---- Partner offers (fictional partners) ----
    {"name": "harbourline-hotels", "date": "2026-09-26", "category": "partner-offers", "author": "Skylantern Partnerships", "image": "partner-hotel.jpg",
     "title": T("Harbourline Hotels: 15% off your stay", "Harbourline Hotels : 15 % sur votre séjour"),
     "teaser": T("Stay in Hong Kong before or after your flight and save 15% on the best available rate until 31 January 2027.",
                 "Séjournez à Hong Kong avant ou après votre vol et économisez 15 % sur le meilleur tarif disponible jusqu'au 31 janvier 2027."),
     "body": T("<p>Harbourline Hotels, our fictional hotel partner, gives Skylantern passengers 15% off the best available rate "
               "at its three hotels in Hong Kong, for stays until 31 January 2027.</p><h2>How it works</h2><ul><li>Book directly "
               "with the hotel and quote the code LANTERN15.</li><li>Show your Skylantern booking at check-in.</li><li>Breakfast "
               "included for children under 12.</li></ul><p>Subject to availability. Not combinable with other offers.</p>",
               "<p>Harbourline Hotels, notre partenaire hôtelier fictif, offre aux passagers Skylantern 15 % sur le meilleur tarif "
               "disponible dans ses trois hôtels de Hong Kong, pour des séjours jusqu'au 31 janvier 2027.</p><h2>Comment en "
               "profiter</h2><ul><li>Réservez directement auprès de l'hôtel avec le code LANTERN15.</li><li>Présentez votre "
               "réservation Skylantern à l'arrivée.</li><li>Petit-déjeuner offert aux enfants de moins de 12 ans.</li></ul><p>Dans la "
               "limite des disponibilités. Non cumulable avec d'autres offres.</p>")},
    {"name": "lumen-card", "date": "2026-09-19", "category": "partner-offers", "author": "Skylantern Partnerships", "image": "partner-card.jpg",
     "title": T("Lumen Card: a flight voucher when you join", "Lumen Card : un bon de vol à l'adhésion"),
     "teaser": T("Open a Lumen travel card before 31 December 2026 and receive a HKD 300 Skylantern flight voucher.",
                 "Ouvrez une carte de voyage Lumen avant le 31 décembre 2026 et recevez un bon de vol Skylantern de 300 HKD."),
     "body": T("<p>Lumen Card, a fictional travel card, gives new holders a HKD 300 voucher for a Skylantern flight when they "
               "spend HKD 5,000 within three months of opening their card, before 31 December 2026.</p><h2>Good to know</h2><ul>"
               "<li>The voucher is valid for 12 months on every route.</li><li>It cannot be exchanged for cash.</li></ul>"
               "<p>This offer is part of the demonstration: no card can be ordered.</p>",
               "<p>Lumen Card, une carte de voyage fictive, offre à ses nouveaux titulaires un bon de 300 HKD pour un vol Skylantern "
               "s'ils dépensent 5 000 HKD dans les trois mois suivant l'ouverture, avant le 31 décembre 2026.</p><h2>Bon à "
               "savoir</h2><ul><li>Le bon est valable 12 mois sur toutes les lignes.</li><li>Il n'est pas échangeable contre de "
               "l'argent.</li></ul><p>Cette offre fait partie de la démonstration : aucune carte ne peut être commandée.</p>")},
    {"name": "tidewater-car-rental", "date": "2026-09-08", "category": "partner-offers", "author": "Skylantern Partnerships", "image": "partner-car.jpg",
     "title": T("Tidewater Car Rental: 10% off in Japan", "Tidewater Car Rental : 10 % au Japon"),
     "teaser": T("Rent a car at Sapporo, Fukuoka or Osaka airport and save 10% until 31 March 2027, winter tyres included.",
                 "Louez une voiture aux aéroports de Sapporo, Fukuoka ou Osaka et économisez 10 % jusqu'au 31 mars 2027, pneus neige compris."),
     "body": T("<p>Tidewater Car Rental, our fictional rental partner, gives Skylantern passengers 10% off rentals picked up at "
               "Sapporo, Fukuoka and Osaka airports until 31 March 2027.</p><ul><li>Winter tyres included from December to March.</li>"
               "<li>A child seat free of charge on request.</li><li>An international driving permit may be required.</li></ul>",
               "<p>Tidewater Car Rental, notre partenaire de location fictif, offre aux passagers Skylantern 10 % sur les locations "
               "prises aux aéroports de Sapporo, Fukuoka et Osaka jusqu'au 31 mars 2027.</p><ul><li>Pneus neige compris de décembre à "
               "mars.</li><li>Un siège enfant gratuit sur demande.</li><li>Un permis de conduire international peut être exigé.</li></ul>")},
]


# Meta descriptions of the news items and articles (their teaser is shorter than a search result needs).
EDITORIAL_SEO = {
    "winter-schedule-2026": T("Skylantern Airways winter schedule from 25 October 2026: daily Sapporo flights, four a week to Da Nang and an earlier Tokyo departure.",
             "Programme d'hiver Skylantern Airways dès le 25 octobre 2026 : Sapporo chaque jour, Da Nang quatre fois par semaine, Tokyo avancé."),
    "tropical-cyclones": T("When a strong tropical cyclone is forecast near Hong Kong, Skylantern Airways opens free date changes: rules, dates and how to rebook.",
             "Quand un fort cyclone tropical menace Hong Kong, Skylantern Airways ouvre des changements de date gratuits : règles et démarches."),
    "power-banks": T("Skylantern Airways rules for power banks from 15 October 2026: cabin only, up to 100 Wh, two per passenger, no charging during the flight.",
             "Règles Skylantern Airways pour les batteries externes dès le 15 octobre 2026 : en cabine, 100 Wh au plus, deux par passager, pas de recharge."),
    "aisle-k": T("From 15 October 2026, Skylantern Airways check-in at Hong Kong International Airport moves to Aisle K of Terminal 1: counters and kiosks.",
             "Dès le 15 octobre 2026, l'enregistrement Skylantern Airways à l'aéroport de Hong Kong passe en rangée K du terminal 1 : comptoirs et bornes."),
    "lunar-new-year-2027": T("Lunar New Year 2027 with Skylantern Airways: full flights from 1 to 15 February, extra flights on sale and our advice to travel calmly.",
             "Nouvel An lunaire 2027 avec Skylantern Airways : vols complets du 1er au 15 février, vols en plus et nos conseils pour voyager serein."),
    "sapporo-winter": T("Sapporo in winter with Skylantern Airways: snow and de-icing can delay departures by up to an hour from December 2026 to March 2027.",
             "Sapporo en hiver avec Skylantern Airways : la neige et le dégivrage peuvent retarder les départs d'une heure de décembre 2026 à mars 2027."),
    "sapporo-daily": T("Press release: Skylantern Airways, a fictional airline, flies every day between Hong Kong and Sapporo from 1 December 2026 to February.",
             "Communiqué : Skylantern Airways, compagnie fictive, relie chaque jour Hong Kong et Sapporo du 1er décembre 2026 à fin février 2027."),
    "tenth-a321neo": T("Press release: Skylantern Airways, a fictional airline, takes delivery of its tenth Airbus A321neo; the fleet reaches fourteen aircraft.",
             "Communiqué : Skylantern Airways, compagnie fictive, reçoit son dixième Airbus A321neo ; la flotte atteint quatorze avions."),
    "autumn-menu": T("Press release: a new autumn menu on Skylantern Airways flights of more than two hours, with harbour rice, garden noodles and a kids tray.",
             "Communiqué : un nouveau menu d'automne sur les vols Skylantern Airways de plus de deux heures, riz du port, nouilles et plateau enfant."),
    "summer-punctuality": T("Press release: 88% of Skylantern Airways summer 2026 flights left within 15 minutes of schedule, and 99.4% of planned flights operated.",
             "Communiqué : 88 % des vols d'été 2026 de Skylantern Airways sont partis à 15 minutes près, et 99,4 % des vols prévus ont été assurés."),
    "cabin-crew-2026": T("Skylantern Airways is hiring 60 cabin crew for its Hong Kong base from February 2027, with paid training. Apply by 15 November 2026.",
             "Skylantern Airways recrute 60 membres d'équipage de cabine pour sa base de Hong Kong dès février 2027, formation payée. Avant le 15 novembre."),
    "first-officer-a321neo": T("Skylantern Airways is hiring twelve A321neo first officers in Hong Kong, type rating paid by the company. Apply by 30 November 2026.",
             "Skylantern Airways recrute douze copilotes sur A321neo à Hong Kong, qualification de type payée par la compagnie. Avant le 30 novembre 2026."),
    "airport-agent": T("Skylantern Airways is hiring 25 airport customer service agents at Hong Kong International Airport, full or part time. Apply by 31 October.",
             "Skylantern Airways recrute 25 agents de service client à l'aéroport de Hong Kong, à temps plein ou partiel. Candidatures avant le 31 octobre."),
    "harbourline-hotels": T("Harbourline Hotels, a fictional partner of Skylantern Airways, gives passengers 15% off stays in Hong Kong until 31 January 2027.",
             "Harbourline Hotels, partenaire fictif de Skylantern Airways, offre 15 % aux passagers sur leurs séjours à Hong Kong jusqu'au 31 janvier 2027."),
    "lumen-card": T("Lumen Card, a fictional travel card partner of Skylantern Airways, gives new holders a HKD 300 flight voucher until 31 December 2026.",
             "Lumen Card, carte de voyage fictive partenaire de Skylantern Airways, offre un bon de vol de 300 HKD aux nouveaux titulaires en 2026."),
    "tidewater-car-rental": T("Tidewater Car Rental, a fictional partner of Skylantern Airways, gives 10% off car rental at Sapporo, Fukuoka and Osaka airports.",
             "Tidewater Car Rental, partenaire fictif de Skylantern Airways, offre 10 % sur la location aux aéroports de Sapporo, Fukuoka et Osaka."),
}
for _item in NEWS + ARTICLES:
    _item["seo"] = EDITORIAL_SEO[_item["name"]]

# The page that lists each content folder (ctplmix:listingPage): the breadcrumb of an item's own page
# goes through it ("Home > Destinations > Tokyo"). Sub-folders inherit. "news" holds advisories (6)
# and press releases (4), "articles" careers (3) and partner offers (3), without sub-folders: each
# shared folder points at one page (the advisories for news, the careers for articles).
LISTING_PAGES = {
    "destinations": "destinations",
    "fares": "offers/current-deals",
    "news": "travel-information/advisories",
    "articles": "about/careers",
    "offices": "about/contact",  # the store pages render in the classic-templates page shell
}

# ---------------------------------------------------------------------------------------------
# 7. Add-on content: FAQ (jsfaq), sales offices (js-store-locator), forms (Formidable)
# ---------------------------------------------------------------------------------------------
FAQ = {
    # The free zone has no heading: the FAQ title is the page's first h2, sections h3, questions h4.
    "title": T("Answers before you fly", "Les réponses avant de partir"),
    "headingLevel": "2",
    "sections": [
        {"name": "booking", "title": T("Booking and payment", "Réservation et paiement"), "items": [
            ("hold", T("Can I hold a fare before paying?", "Puis-je bloquer un tarif avant de payer ?"),
             T("<p>Yes, for 48 hours on Classic, Flex and Business fares, for a fee of HKD 80 per booking, deducted from the price if "
               "you then pay.</p>",
               "<p>Oui, pendant 48 heures pour les tarifs Classic, Flex et Business, moyennant 80 HKD par réservation, déduits du prix si "
               "vous payez ensuite.</p>")),
            ("payment", T("Which payment methods do you accept?", "Quels moyens de paiement acceptez-vous ?"),
             T("<p>Major payment cards, bank transfer for bookings made 14 days or more before departure, and our gift vouchers.</p>",
               "<p>Les principales cartes de paiement, le virement pour les réservations faites 14 jours ou plus avant le départ, et "
               "nos bons cadeaux.</p>")),
            ("name", T("I made a mistake in a name. What can I do?", "J'ai fait une erreur dans un nom. Que faire ?"),
             T("<p>Up to three letters can be corrected free of charge before check-in, through customer service. A ticket cannot be "
               "given to another person.</p>",
               "<p>Jusqu'à trois lettres se corrigent gratuitement avant l'enregistrement, auprès du service client. Un billet ne peut "
               "pas être cédé à une autre personne.</p>")),
        ]},
        {"name": "baggage", "title": T("Baggage", "Bagages"), "items": [
            ("allowance", T("How much baggage can I take?", "Combien de bagages puis-je emporter ?"),
             T("<p>It depends on your fare: from a 7 kg cabin bag on Lite fares to two 32 kg checked bags in Business. The table on "
               "the Baggage allowance page gives the details.</p>",
               "<p>Cela dépend de votre tarif : d'un bagage cabine de 7 kg en Lite à deux bagages en soute de 32 kg en Business. Le "
               "tableau de la page Franchise bagages donne le détail.</p>")),
            ("delayed", T("My bag did not arrive. What should I do?", "Mon bagage n'est pas arrivé. Que faire ?"),
             T("<p>Report it at the baggage desk of the arrival airport before you leave the baggage hall. We deliver most delayed "
               "bags within 48 hours.</p>",
               "<p>Signalez-le au comptoir bagages de l'aéroport d'arrivée avant de quitter la salle de livraison. Nous livrons la "
               "plupart des bagages retardés sous 48 heures.</p>")),
        ]},
        {"name": "checkin", "title": T("Check-in and the airport", "Enregistrement et aéroport"), "items": [
            ("when", T("When should I arrive at the airport?", "Quand dois-je arriver à l'aéroport ?"),
             T("<p>Two and a half hours before departure in Hong Kong, three hours during holidays. Counters close 60 minutes before "
               "departure.</p>",
               "<p>Deux heures et demie avant le départ à Hong Kong, trois heures pendant les vacances. Les comptoirs ferment 60 minutes "
               "avant le départ.</p>")),
            ("mobile", T("Can I use a boarding pass on my phone?", "Puis-je utiliser une carte d'embarquement sur mon téléphone ?"),
             T("<p>Yes, at every airport we serve. Keep your phone charged, or print the boarding pass as a backup.</p>",
               "<p>Oui, dans tous les aéroports que nous desservons. Gardez votre téléphone chargé, ou imprimez la carte en secours.</p>")),
        ]},
        {"name": "changes", "title": T("Changes and refunds", "Modifications et remboursements"), "items": [
            ("change", T("How do I change my flight?", "Comment changer de vol ?"),
             T("<p>In Manage booking, until 3 hours before departure. Fees depend on your fare; Flex and Business fares change for "
               "free.</p>",
               "<p>Dans Gérer ma réservation, jusqu'à 3 heures avant le départ. Les frais dépendent du tarif ; les tarifs Flex et "
               "Business se modifient gratuitement.</p>")),
            ("refund", T("How long does a refund take?", "Combien de temps prend un remboursement ?"),
             T("<p>Twenty working days at most, on the means of payment used to book.</p>",
               "<p>Vingt jours ouvrés au plus, sur le moyen de paiement utilisé pour la réservation.</p>")),
        ]},
        {"name": "assistance", "title": T("Special needs", "Besoins particuliers"), "items": [
            ("wheelchair", T("How do I ask for a wheelchair?", "Comment demander un fauteuil roulant ?"),
             T("<p>When you book, or at least 48 hours before departure through our assistance desk. The service is free.</p>",
               "<p>En réservant, ou au moins 48 heures avant le départ auprès de notre service d'assistance. Le service est gratuit.</p>")),
            ("pregnant", T("Can I fly when pregnant?", "Puis-je voyager enceinte ?"),
             T("<p>Yes, until the end of the 36th week. From the 28th week, carry a medical certificate dated within 7 days of the "
               "flight.</p>",
               "<p>Oui, jusqu'à la fin de la 36e semaine. À partir de la 28e semaine, munissez-vous d'un certificat médical datant de "
               "moins de 7 jours avant le vol.</p>")),
        ]},
    ],
}

OFFICES = {
    "folder": ("offices", T("Sales offices", "Agences")),
    "locator": {"title": T("Sales offices", "Agences"), "welcomeTitle": T("Skylantern offices in Asia", "Les agences Skylantern en Asie"),
                "welcomeMessage": T("Pick an office on the map or in the list to see its address, phone number and opening hours.",
                                    "Choisissez une agence sur la carte ou dans la liste pour voir son adresse, son téléphone et ses horaires.")},
    "items": [
        {"name": "hong-kong", "title": T("Hong Kong airport office", "Agence de l'aéroport de Hong Kong"),
         "description": T("Our main ticket office, in Aisle K of Terminal 1, for bookings, changes and refunds.",
                          "Notre agence principale, dans la rangée K du terminal 1, pour les réservations, modifications et remboursements."),
         "street": "Aisle K, Terminal 1, 12 Skyward Road", "city": "Hong Kong", "postal": "", "country": "HK",
         "lat": 22.3130, "lon": 113.9145, "phone": "+852 0000 0000",
         "hours": [(d, "06:00", "23:00") for d in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")]},
        {"name": "tokyo", "title": T("Tokyo office", "Agence de Tokyo"),
         "description": T("Ticket office and customer service for Japan, five minutes from the station.",
                          "Agence et service client pour le Japon, à cinq minutes de la gare."),
         "street": "3F Lantern Building, 2-8 Hikari-dori", "city": "Tokyo", "postal": "104-0000", "country": "JP",
         "lat": 35.6740, "lon": 139.7650, "phone": "+81 0 0000 0000",
         "hours": [(d, "09:00", "18:00") for d in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")] + [("Saturday", "10:00", "16:00")]},
        {"name": "taipei", "title": T("Taipei office", "Agence de Taipei"),
         "description": T("Ticket office for Taiwan, with group and travel agency desks.",
                          "Agence pour Taïwan, avec un guichet groupes et agences de voyages."),
         "street": "8F, 100 Harbour Light Road", "city": "Taipei", "postal": "100", "country": "TW",
         "lat": 25.0470, "lon": 121.5170, "phone": "+886 0 0000 0000",
         "hours": [(d, "09:00", "21:00") for d in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")]},
        {"name": "singapore", "title": T("Singapore office", "Agence de Singapour"),
         "description": T("Ticket office and customer service for Southeast Asia.",
                          "Agence et service client pour l'Asie du Sud-Est."),
         "street": "20 Lantern Quay, #05-01", "city": "Singapore", "postal": "000000", "country": "SG",
         "lat": 1.2840, "lon": 103.8510, "phone": "+65 0000 0000",
         "hours": [(d, "08:30", "18:30") for d in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday")]},
    ],
}

FORMS = {
    "newsletter": {
        "title": T("Fare alerts", "Alertes tarifs"),
        "intro": T("One email a month with our lowest fares from Hong Kong. Unsubscribe in one click. This is a demonstration: "
                   "no email is ever sent.",
                   "Un e-mail par mois avec nos tarifs les plus bas au départ de Hong Kong. Désinscription en un clic. C'est une "
                   "démonstration : aucun e-mail n'est jamais envoyé."),
        "submit": T("Subscribe", "S'abonner"),
        "done": T("Thank you, you are subscribed.", "Merci, votre inscription est enregistrée."),
        "fields": [
            ("firstName", "fmdb:inputText", T("First name", "Prénom"), "given-name", True),
            ("email", "fmdb:inputEmail", T("Email address", "Adresse e-mail"), "email", True),
        ],
        "action": T("Save the subscription", "Enregistrer l'inscription"),
    },
    "contact": {
        "title": T("Contact us", "Nous contacter"),
        "intro": T("All fields are required except the booking reference. We answer within two working days.",
                   "Tous les champs sont obligatoires sauf la référence de réservation. Nous répondons sous deux jours ouvrés."),
        "submit": T("Send the message", "Envoyer le message"),
        "done": T("Thank you, your message has been sent.", "Merci, votre message a bien été envoyé."),
        "fields": [
            ("fullName", "fmdb:inputText", T("Your name", "Votre nom"), "name", True),
            ("email", "fmdb:inputEmail", T("Your email address", "Votre adresse e-mail"), "email", True),
            ("booking", "fmdb:inputText", T("Booking reference (optional)", "Référence de réservation (facultatif)"), "off", False),
            ("message", "fmdb:textarea", T("Your message", "Votre message"), None, True),
        ],
        "action": T("Save the message", "Enregistrer le message"),
    },
}

# =============================================================================================
# PASS 2: content of components that are not deployed yet (accordion, tabs, card grid displays,
# classic-travel destinations, fare offers and travel tools). seed_pass2() in seed-airline.py
# reads these structures and, for now, prints what it would create.
# =============================================================================================

# Accordions: {page path: [{name, title, intro, after (section name it follows), items: [{question, answer_html}]}]}
ACCORDIONS = {
    "travel-information/baggage": [{
        "name": "details", "after": "allowance", "title": T("Baggage in detail", "Les bagages en détail"),
        "intro": T("Open a topic for the rules that apply.", "Ouvrez un thème pour connaître les règles qui s'appliquent."),
        "items": [
            {"question": T("Excess baggage at the airport", "Excédent de bagages à l'aéroport"),
             "answer_html": T("<p>Bags over the allowance are charged at the airport rates, up to 40% higher than online. A bag over "
                              "32 kg is never accepted.</p>",
                              "<p>Les bagages au-delà de la franchise sont facturés au tarif aéroport, jusqu'à 40 % plus cher qu'en ligne. "
                              "Un bagage de plus de 32 kg n'est jamais accepté.</p>")},
            {"question": T("Liquids in the cabin", "Liquides en cabine"),
             "answer_html": T("<p>Containers of 100 ml or less, in one clear resealable bag of one litre per passenger. Baby food and "
                              "medicines are allowed in larger quantities.</p>",
                              "<p>Des contenants de 100 ml au plus, dans un sac transparent refermable d'un litre par passager. Les "
                              "aliments pour bébé et les médicaments sont admis en plus grande quantité.</p>")},
            {"question": T("Pets", "Animaux"),
             "answer_html": T("<p>Cats and small dogs up to 8 kg, carrier included, travel in the cabin on routes to Taipei, Bangkok "
                              "and Singapore, for HKD 600 per flight. Book 72 hours ahead.</p>",
                              "<p>Les chats et petits chiens jusqu'à 8 kg, sac compris, voyagent en cabine vers Taipei, Bangkok et "
                              "Singapour, pour 600 HKD par vol. Réservez 72 heures à l'avance.</p>")},
        ]}],
    "help/faq": [],  # the FAQ add-on covers questions and answers; no accordion needed there
    "book/fare-options": [{
        "name": "rules", "after": "brands", "title": T("More fare rules", "Autres règles tarifaires"), "intro": None,
        "items": [
            {"question": T("Changing a Lite fare", "Modifier un tarif Lite"),
             "answer_html": T("<p>Lite fares cannot be changed. You can still cancel and get the taxes back.</p>",
                              "<p>Les tarifs Lite ne sont pas modifiables. Vous pouvez toutefois annuler et récupérer les taxes.</p>")},
            {"question": T("Upgrading to Business", "Passer en Business"),
             "answer_html": T("<p>Classic and Flex passengers can upgrade at the airport from HKD 900 on short flights, depending on "
                              "seats left.</p>",
                              "<p>Les passagers Classic et Flex peuvent passer en Business à l'aéroport dès 900 HKD sur les vols courts, "
                              "selon les places restantes.</p>")},
        ]}],
}

# Tabs: {page path: [{name, title, after, tabs: [{label, sections: [section dicts as in PAGES]}]}]}
TABS = {
    # Home: the fare list first (classic-travel steps its headings down inside a tab since 168829a; on a
    # site seeded before, the list is moved here from home/main/fares), then short answers per topic.
    "": [{
        "name": "before-you-fly", "after": "advisories", "title": T("Before you fly", "Avant de partir"),
        "tabs": [
            {"label": T("Flight deals", "Bons plans vols"), "name": "flight-deals", "first": True, "sections": [
                {"name": "fares", "type": "ctrv:fareList", "moved_from": "main/fares", "travel_folder": "fares",
                 "props": {"jcr:title": T("Fares from Hong Kong", "Tarifs au départ de Hong Kong"),
                           "sort": "priceAsc", "maxItems": "6"},
                 "cta": {"page": "offers/current-deals", "label": T("All current deals", "Tous les bons plans")}}]},
            {"label": T("Baggage", "Bagages"), "sections": [text("summary", None, T(
                "<p>A 7 kg cabin bag on every fare, and up to two checked bags of 23 kg. Extra bags cost up to 40% less online.</p>",
                "<p>Un bagage cabine de 7 kg dans chaque tarif, et jusqu'à deux bagages en soute de 23 kg. Les bagages en plus coûtent "
                "jusqu'à 40 % moins cher en ligne.</p>"),
                cta={"page": "travel-information/baggage", "label": T("Baggage allowance", "Franchise bagages")})]},
            {"label": T("Check-in", "Enregistrement"), "sections": [text("summary", None, T(
                "<p>Check in online from 48 hours to 90 minutes before departure. Counters in Aisle K close 60 minutes before.</p>",
                "<p>Enregistrez-vous en ligne de 48 heures à 90 minutes avant le départ. Les comptoirs de la rangée K ferment 60 minutes avant.</p>"),
                cta={"page": "travel-information/check-in", "label": T("How to check in", "Comment s'enregistrer")})]},
            {"label": T("Assistance", "Assistance"), "sections": [text("summary", None, T(
                "<p>Free help at the airport and on board: ask for it when you book, or 48 hours before departure.</p>",
                "<p>Une aide gratuite à l'aéroport et à bord : demandez-la en réservant, ou 48 heures avant le départ.</p>"),
                cta={"page": "travel-information/special-assistance", "label": T("Special assistance", "Assistance spéciale")})]},
        ]}],
    "book/fare-options": [{
        "name": "brands", "after": "compare", "title": T("Fare rules by fare", "Règles par tarif"),
        "tabs": [
            {"label": T(brand, brand), "sections": [text("rules", None, rules)]}
            for brand, rules in (
                ("Lite", T("<p>No change. Refund of taxes only. Seat from HKD 60.</p>", "<p>Pas de modification. Remboursement des taxes seulement. Siège dès 60 HKD.</p>")),
                ("Classic", T("<p>Change for HKD 450 plus the fare difference. Refund for an HKD 800 fee.</p>", "<p>Modification pour 450 HKD plus la différence. Remboursement moyennant 800 HKD.</p>")),
                ("Flex", T("<p>Free changes. Refund for an HKD 300 fee. Priority check-in.</p>", "<p>Modifications gratuites. Remboursement moyennant 300 HKD. Enregistrement prioritaire.</p>")),
                ("Business", T("<p>Free changes and refunds before departure. Lounge access.</p>", "<p>Modifications et remboursements gratuits avant le départ. Accès au salon.</p>")),
            )]}],
}

# Icon tiles: {page path: [{name, title, intro, after, items: [{title, text, image, link}]}]}
ICON_TILES = {
    "": [{
        "name": "services", "after": "press", "title": T("More services", "Plus de services"), "intro": None,
        "items": [
            {"title": T("Frequently asked questions", "Questions fréquentes"), "text": T("Quick answers.", "Des réponses rapides."), "image": "icon-faq.png", "link": "help/faq"},
            {"title": T("Media room", "Espace presse"), "text": T("Our latest news.", "Nos dernières nouvelles."), "image": "icon-media.png", "link": "about/media-room"},
            {"title": T("Travel advisories", "Avis aux voyageurs"), "text": T("Before you go.", "Avant de partir."), "image": "icon-advisory.png", "link": "travel-information/advisories"},
            {"title": T("Special assistance", "Assistance spéciale"), "text": T("Free help.", "Une aide gratuite."), "image": "icon-assistance.png", "link": "travel-information/special-assistance"},
            {"title": T("The Lantern Room", "Le Lantern Room"), "text": T("Our lounge.", "Notre salon."), "image": "icon-lounge.png", "link": "travel-information/airport"},
            {"title": T("Contact us", "Nous contacter"), "text": T("Every day.", "Tous les jours."), "image": "icon-contact.png", "link": "about/contact"},
        ]}],
    "travel-information/baggage": [{
        "name": "dangerous-goods", "after": "forbidden", "title": T("Dangerous goods at a glance", "Les marchandises dangereuses en un coup d'œil"),
        "intro": T("What travels where, in one look.", "Ce qui voyage où, d'un coup d'œil."),
        "items": [
            {"title": T("Power banks", "Batteries externes"), "text": T("Cabin only, up to 100 Wh.", "En cabine seulement, 100 Wh au plus."), "image": "icon-battery.png", "link": None},
            {"title": T("Lighters", "Briquets"), "text": T("One, carried on you.", "Un seul, sur vous."), "image": "icon-lighter.png", "link": None},
            {"title": T("Aerosols", "Aérosols"), "text": T("Toiletries, up to 500 ml.", "Toilette, 500 ml au plus."), "image": "icon-aerosol.png", "link": None},
            {"title": T("Flammable items", "Produits inflammables"), "text": T("Forbidden everywhere.", "Interdits partout."), "image": "icon-flame.png", "link": None},
            {"title": T("Knives and blades", "Couteaux et lames"), "text": T("Checked baggage only.", "En soute seulement."), "image": "icon-blade.png", "link": None},
            {"title": T("Gas cylinders", "Bouteilles de gaz"), "text": T("Forbidden everywhere.", "Interdites partout."), "image": "icon-cylinder.png", "link": None},
        ]}],
}

# Logo strips: {page path: [{name, title, after, items: [{title, text, image, link}]}]}
LOGO_STRIPS = {
    "": [{
        "name": "partners", "after": "services", "title": T("Our partners", "Nos partenaires"),
        "items": [
            {"title": T("Harbourline Hotels", "Harbourline Hotels"), "text": None, "image": "partner-harbourline.png", "link": "offers/partner-offers"},
            {"title": T("Lumen Card", "Lumen Card"), "text": None, "image": "partner-lumen.png", "link": "offers/partner-offers"},
            {"title": T("Tidewater Car Rental", "Tidewater Car Rental"), "text": None, "image": "partner-tidewater.png", "link": "offers/partner-offers"},
            {"title": T("Northgate Travel Insurance", "Northgate Travel Insurance"), "text": None, "image": "partner-northgate.png", "link": None},
            {"title": T("Kitefield Lounges", "Kitefield Lounges"), "text": None, "image": "partner-kitefield.png", "link": None},
        ]}],
}


def _dest(code, city, country, region, image, intro, description_html, price, note, facts, related):
    return {"code": code, "city": city, "country": country, "region": region, "image": image, "intro": intro,
            "description_html": description_html, "from_price": price, "currency": "HKD", "price_note": note,
            "facts": facts, "related": related}


PRICE_NOTE = T("One way, Economy Lite, taxes included. Demo price, conditions apply.",
               "Aller simple, Économie Lite, taxes comprises. Prix de démonstration, conditions applicables.")

DESTINATIONS = [
    _dest("NRT", T("Tokyo", "Tokyo"), T("Japan", "Japon"), "japanKorea", "dest-tokyo.jpg",
          T("Neon nights, quiet gardens and the best breakfast markets in Asia.", "Nuits de néon, jardins paisibles et les meilleurs marchés du matin d'Asie."),
          T("<p>Tokyo rewards the curious: a different neighbourhood every day, trains on the minute and a mountain on the "
            "horizon on clear winter mornings.</p><h2>When to go</h2><p>Late March for the blossom, November for the autumn "
            "colours.</p>",
            "<p>Tokyo récompense les curieux : un quartier différent chaque jour, des trains à la minute et une montagne à "
            "l'horizon par les matins clairs d'hiver.</p><h2>Quand partir</h2><p>Fin mars pour les cerisiers, novembre pour les "
            "couleurs d'automne.</p>"),
          1380, PRICE_NOTE, {"local_currency": T("Japanese yen (JPY)", "Yen japonais (JPY)"), "language": T("Japanese", "Japonais"),
                             "time_zone": T("UTC+9, one hour ahead of Hong Kong", "UTC+9, une heure d'avance sur Hong Kong"),
                             "voltage": T("100 V, type A plugs", "100 V, prises de type A"), "dialling_code": "+81"},
          ["KIX", "CTS"]),
    _dest("KIX", T("Osaka", "Osaka"), T("Japan", "Japon"), "japanKorea", "dest-osaka.jpg",
          T("Street food, a castle in the city and Kyoto half an hour away.", "Cuisine de rue, un château en ville et Kyoto à une demi-heure."),
          T("<p>Osaka is Japan's kitchen: come hungry. Kyoto and Nara are a short train ride away.</p>",
            "<p>Osaka est la cuisine du Japon : venez le ventre vide. Kyoto et Nara sont à quelques minutes de train.</p>"),
          1280, PRICE_NOTE, {"local_currency": T("Japanese yen (JPY)", "Yen japonais (JPY)"), "language": T("Japanese", "Japonais"),
                             "time_zone": T("UTC+9", "UTC+9"), "voltage": T("100 V, type A plugs", "100 V, prises de type A"), "dialling_code": "+81"},
          ["NRT", "FUK"]),
    _dest("CTS", T("Sapporo", "Sapporo"), T("Japan", "Japon"), "japanKorea", "dest-sapporo.jpg",
          T("Powder snow, hot springs and a snow festival every February.", "Neige poudreuse, sources chaudes et un festival de la neige chaque février."),
          T("<p>Gateway to Hokkaido's ski slopes in winter and to its flower fields in summer.</p>",
            "<p>La porte des pistes de ski d'Hokkaido en hiver et de ses champs de fleurs en été.</p>"),
          1680, PRICE_NOTE, {"local_currency": T("Japanese yen (JPY)", "Yen japonais (JPY)"), "language": T("Japanese", "Japonais"),
                             "time_zone": T("UTC+9", "UTC+9"), "voltage": T("100 V, type A plugs", "100 V, prises de type A"), "dialling_code": "+81"},
          ["NRT"]),
    _dest("FUK", T("Fukuoka", "Fukuoka"), T("Japan", "Japon"), "japanKorea", "dest-fukuoka.jpg",
          T("A harbour city with food stalls along the river and beaches nearby.", "Une ville portuaire, ses échoppes au bord du fleuve et ses plages proches."),
          T("<p>The airport is ten minutes from the centre by subway: the easiest city break in Japan.</p>",
            "<p>L'aéroport est à dix minutes du centre en métro : le séjour en ville le plus simple du Japon.</p>"),
          1180, PRICE_NOTE, {"local_currency": T("Japanese yen (JPY)", "Yen japonais (JPY)"), "language": T("Japanese", "Japonais"),
                             "time_zone": T("UTC+9", "UTC+9"), "voltage": T("100 V, type A plugs", "100 V, prises de type A"), "dialling_code": "+81"},
          ["KIX", "ICN"]),
    _dest("ICN", T("Seoul", "Séoul"), T("South Korea", "Corée du Sud"), "japanKorea", "dest-seoul.jpg",
          T("Palaces, mountains inside the city and markets open all night.", "Palais, montagnes en pleine ville et marchés ouverts toute la nuit."),
          T("<p>Hike in the morning, visit a palace at noon and shop until midnight.</p>",
            "<p>Randonnée le matin, palais à midi et shopping jusqu'à minuit.</p>"),
          1320, PRICE_NOTE, {"local_currency": T("Korean won (KRW)", "Won coréen (KRW)"), "language": T("Korean", "Coréen"),
                             "time_zone": T("UTC+9", "UTC+9"), "voltage": T("220 V, type C and F plugs", "220 V, prises de type C et F"), "dialling_code": "+82"},
          ["FUK", "TPE"]),
    _dest("TPE", T("Taipei", "Taipei"), T("Taiwan", "Taïwan"), "greaterChina", "dest-taipei.jpg",
          T("Night markets, tea hills and hot springs a metro ride away.", "Marchés de nuit, collines de thé et sources chaudes à un trajet de métro."),
          T("<p>Our shortest flight: leave Hong Kong after work and be in a night market for dinner.</p>",
            "<p>Notre vol le plus court : quittez Hong Kong après le travail et dînez dans un marché de nuit.</p>"),
          680, PRICE_NOTE, {"local_currency": T("New Taiwan dollar (TWD)", "Nouveau dollar de Taïwan (TWD)"), "language": T("Mandarin", "Mandarin"),
                            "time_zone": T("UTC+8, same as Hong Kong", "UTC+8, comme Hong Kong"), "voltage": T("110 V, type A and B plugs", "110 V, prises de type A et B"),
                            "dialling_code": "+886"},
          ["ICN", "MNL"]),
    _dest("BKK", T("Bangkok", "Bangkok"), T("Thailand", "Thaïlande"), "southeastAsia", "dest-bangkok.jpg",
          T("Temples on the river, rooftop evenings and the best street food anywhere.", "Temples au bord du fleuve, soirées sur les toits et la meilleure cuisine de rue."),
          T("<p>Take a river boat at sunset and see the temples light up.</p>",
            "<p>Prenez un bateau sur le fleuve au coucher du soleil et regardez les temples s'illuminer.</p>"),
          980, PRICE_NOTE, {"local_currency": T("Thai baht (THB)", "Baht thaïlandais (THB)"), "language": T("Thai", "Thaï"),
                            "time_zone": T("UTC+7, one hour behind Hong Kong", "UTC+7, une heure de retard sur Hong Kong"),
                            "voltage": T("220 V, type A, B, C and O plugs", "220 V, prises de type A, B, C et O"), "dialling_code": "+66"},
          ["SIN", "DAD"]),
    _dest("SIN", T("Singapore", "Singapour"), T("Singapore", "Singapour"), "southeastAsia", "dest-singapore.jpg",
          T("A garden city of food courts, skyline walks and rainforest trails.", "Une ville-jardin de food courts, de promenades et de sentiers en forêt."),
          T("<p>Green, safe and easy: the perfect first trip to Southeast Asia.</p>",
            "<p>Verte, sûre et simple : le premier voyage idéal en Asie du Sud-Est.</p>"),
          1290, PRICE_NOTE, {"local_currency": T("Singapore dollar (SGD)", "Dollar de Singapour (SGD)"), "language": T("English, Malay, Mandarin and Tamil", "Anglais, malais, mandarin et tamoul"),
                             "time_zone": T("UTC+8", "UTC+8"), "voltage": T("230 V, type G plugs", "230 V, prises de type G"), "dialling_code": "+65"},
          ["BKK", "MNL"]),
    _dest("MNL", T("Manila", "Manille"), T("Philippines", "Philippines"), "southeastAsia", "dest-manila.jpg",
          T("Sunsets over the bay and the gateway to seven thousand islands.", "Couchers de soleil sur la baie et porte de sept mille îles."),
          T("<p>Stay a few days in the city, then fly on to the beaches of the islands.</p>",
            "<p>Restez quelques jours en ville, puis envolez-vous vers les plages des îles.</p>"),
          760, PRICE_NOTE, {"local_currency": T("Philippine peso (PHP)", "Peso philippin (PHP)"), "language": T("Filipino and English", "Filipino et anglais"),
                            "time_zone": T("UTC+8", "UTC+8"), "voltage": T("220 V, type A, B and C plugs", "220 V, prises de type A, B et C"), "dialling_code": "+63"},
          ["TPE", "SIN"]),
    _dest("DAD", T("Da Nang", "Da Nang"), T("Vietnam", "Viêt Nam"), "southeastAsia", "dest-da-nang.jpg",
          T("Long beaches, marble hills and the old town of Hoi An nearby.", "De longues plages, des collines de marbre et la vieille ville de Hoi An toute proche."),
          T("<p>Beach in the morning, lanterns in Hoi An in the evening.</p>",
            "<p>La plage le matin, les lanternes de Hoi An le soir.</p>"),
          890, PRICE_NOTE, {"local_currency": T("Vietnamese dong (VND)", "Dong vietnamien (VND)"), "language": T("Vietnamese", "Vietnamien"),
                            "time_zone": T("UTC+7", "UTC+7"), "voltage": T("220 V, type A, C and F plugs", "220 V, prises de type A, C et F"), "dialling_code": "+84"},
          ["BKK"]),
]

DESTINATION_SEO = {
    "NRT": T("Fly from Hong Kong to Tokyo Narita with Skylantern Airways, a fictional airline: when to go, local facts and a demo fare from HKD.",
              "Volez de Hong Kong à Tokyo Narita avec Skylantern Airways, compagnie fictive : quand partir, infos pratiques et un tarif de démo en HKD."),
    "KIX": T("Fly from Hong Kong to Osaka Kansai with Skylantern Airways, a fictional airline: street food, Kyoto nearby, local facts and a demo fare.",
              "Volez de Hong Kong à Osaka Kansai avec Skylantern Airways, compagnie fictive : cuisine de rue, Kyoto tout près, infos et tarif de démo."),
    "CTS": T("Fly from Hong Kong to Sapporo with Skylantern Airways, a fictional airline: snow season, hot springs, local facts and a demo fare in HKD.",
              "Volez de Hong Kong à Sapporo avec Skylantern Airways, compagnie fictive : saison de la neige, sources chaudes, infos et tarif de démo."),
    "FUK": T("Fly from Hong Kong to Fukuoka with Skylantern Airways, a fictional airline: a harbour city ten minutes from its airport and a demo fare.",
              "Volez de Hong Kong à Fukuoka avec Skylantern Airways, compagnie fictive : un port à dix minutes de son aéroport et un tarif de démo."),
    "ICN": T("Fly from Hong Kong to Seoul Incheon with Skylantern Airways, a fictional airline: palaces, mountains, local facts and a demo fare.",
              "Volez de Hong Kong à Séoul Incheon avec Skylantern Airways, compagnie fictive : palais, montagnes, infos pratiques et un tarif de démo."),
    "TPE": T("Fly from Hong Kong to Taipei with Skylantern Airways, a fictional airline: night markets, tea hills, local facts and a demo fare in HKD.",
              "Volez de Hong Kong à Taipei avec Skylantern Airways, compagnie fictive : marchés de nuit, collines de thé, infos et un tarif de démo."),
    "BKK": T("Fly from Hong Kong to Bangkok with Skylantern Airways, a fictional airline: temples on the river, street food, facts and a demo fare.",
              "Volez de Hong Kong à Bangkok avec Skylantern Airways, compagnie fictive : temples au bord du fleuve, cuisine de rue et tarif de démo."),
    "SIN": T("Fly from Hong Kong to Singapore with Skylantern Airways, a fictional airline: a garden city, local facts and a demo fare in HKD.",
              "Volez de Hong Kong à Singapour avec Skylantern Airways, compagnie fictive : une ville-jardin, infos pratiques et un tarif de démo en HKD."),
    "MNL": T("Fly from Hong Kong to Manila with Skylantern Airways, a fictional airline: bay sunsets, the islands beyond, facts and a demo fare.",
              "Volez de Hong Kong à Manille avec Skylantern Airways, compagnie fictive : couchers de soleil sur la baie, les îles et un tarif de démo."),
    "DAD": T("Fly from Hong Kong to Da Nang with Skylantern Airways, a fictional airline: long beaches, Hoi An nearby, local facts and a demo fare.",
              "Volez de Hong Kong à Da Nang avec Skylantern Airways, compagnie fictive : longues plages, Hoi An tout près, infos et un tarif de démo."),
}
for _d in DESTINATIONS:
    _d["seo"] = DESTINATION_SEO[_d["code"]]

CONDITIONS = T("<p>One way from Hong Kong, Economy Lite, per adult, taxes and charges included. Limited seats on selected dates. "
               "Prices are fictional and shown for a demonstration: no booking can be made.</p>",
               "<p>Aller simple au départ de Hong Kong, Économie Lite, par adulte, taxes et frais compris. Places limitées à certaines "
               "dates. Prix fictifs affichés pour une démonstration : aucune réservation n'est possible.</p>")

# Fare offers: destination = airport code of DESTINATIONS; dates are ISO days (sale_ends in the future, or the
# offer shows "Sale ended"). The title is the offer's own page title; cards show the destination's city.
_CITY = {d["code"]: d["city"] for d in DESTINATIONS}
FARE_OFFERS = [
    {"name": f"hkg-{code.lower()}", "destination": code, "origin": T("Hong Kong", "Hong Kong"), "cabin": "economy",
     "price": price, "currency": "HKD", "price_note": PRICE_NOTE, "travel_from": start, "travel_to": end, "sale_ends": sale,
     "conditions_html": CONDITIONS,
     "title": T(f"Hong Kong to {_CITY[code]['en']}", f"De Hong Kong à {_CITY[code]['fr']}"),
     "cta_label": T("See the fare options", "Voir les tarifs"), "cta_target_page": "book/fare-options",
     "seo": T(f"Demo deal of Skylantern Airways, a fictional airline: one-way fares from Hong Kong to {_CITY[code]['en']}, travel dates, deadline and conditions.",
              f"Bon plan de démo de Skylantern Airways, compagnie fictive : allers simples de Hong Kong à {_CITY[code]['fr']}, dates, date limite et conditions.")}
    for code, price, start, end, sale in (
        ("TPE", 590, "2026-10-15", "2026-12-15", "2026-10-31"),
        ("MNL", 690, "2026-11-01", "2027-01-31", "2026-11-15"),
        ("BKK", 890, "2026-11-01", "2027-03-27", "2026-11-30"),
        ("FUK", 1080, "2026-11-01", "2027-02-28", "2026-11-15"),
        ("NRT", 1280, "2027-01-05", "2027-03-27", "2026-12-15"),
        ("CTS", 1580, "2026-12-01", "2027-02-28", "2026-11-20"),
    )
]

# Automatic lists of classic-travel: {page path: [{name, type, title, after, folder, props, cta}]}
TRAVEL_LISTS = {
    "offers/current-deals": [{"name": "fares", "type": "ctrv:fareList", "after": "intro", "folder": "fares",
                              "title": T("Our current deals", "Nos bons plans du moment"),
                              "props": {"sort": "priceAsc", "maxItems": "12",
                                        "noResultText": T("No deal at the moment: come back soon.", "Aucun bon plan en ce moment : revenez bientôt.")}}],
    "destinations": [{"name": "all", "type": "ctrv:destinationGrid", "after": "regions", "folder": "destinations",
                      "title": T("All our destinations", "Toutes nos destinations"),
                      "props": {"maxItems": "12", "ctplSurface": "sunken"}}],
}

# Travel tools (home, after the hero): tabs of explanations and one link each; a visible notice.
TRAVEL_TOOLS = {
    "page": "", "after": None, "name": "tools", "title": T("Travel tools", "Outils de voyage"),
    "notice": T("Demonstration site: Skylantern Airways is fictional and no booking, check-in or payment can be made here.",
                "Site de démonstration : Skylantern Airways est fictive et aucune réservation, aucun enregistrement ni paiement n'est possible ici."),
    "tools": [
        {"label": T("Book a flight", "Réserver un vol"),
         "text_html": T("<p>Compare our four fares and pick the one that fits your trip.</p>", "<p>Comparez nos quatre tarifs et choisissez celui qui convient à votre voyage.</p>"),
         "cta_label": T("Compare our fares", "Comparer nos tarifs"), "cta_target_page": "book/fare-options"},
        {"label": T("Manage booking", "Gérer ma réservation"),
         "text_html": T("<p>Change a date, add baggage or a seat, or update your details.</p>", "<p>Changez une date, ajoutez un bagage ou un siège, ou mettez à jour vos coordonnées.</p>"),
         "cta_label": T("Manage a booking", "Gérer une réservation"), "cta_target_page": "manage-booking"},
        {"label": T("Check-in", "Enregistrement"),
         "text_html": T("<p>Online check-in opens 48 hours before departure.</p>", "<p>L'enregistrement en ligne ouvre 48 heures avant le départ.</p>"),
         "cta_label": T("How to check in", "Comment s'enregistrer"), "cta_target_page": "travel-information/check-in"},
        {"label": T("Flight status", "État des vols"),
         "text_html": T("<p>How we tell you about delays and what to do if your flight changes.</p>", "<p>Comment nous signalons un retard et que faire si votre vol change.</p>"),
         "cta_label": T("See flight status", "Voir l'état des vols"), "cta_target_page": "flight-status"},
    ],
}


# ---------------------------------------------------------------------------------------------
# Self-check
# ---------------------------------------------------------------------------------------------

def _walk(value, where, problems):
    import re
    if isinstance(value, dict):
        if set(value) == {"en", "fr"}:
            for lang in ("en", "fr"):
                v = value[lang]
                if isinstance(v, str):
                    if not v.strip():
                        problems.append(f"{where}: empty {lang}")
                    if "–" in v or "—" in v:
                        problems.append(f"{where}: long dash in {lang}")
                    m = re.search(r"<h([1-6])", v)
                    if m and m.group(1) != "2":
                        problems.append(f"{where}: rich text starts at h{m.group(1)} in {lang}")
            return
        for k, v in value.items():
            _walk(v, f"{where}.{k}", problems)
    elif isinstance(value, (list, tuple)):
        for i, v in enumerate(value):
            _walk(v, f"{where}[{i}]", problems)
    elif isinstance(value, str) and ("–" in value or "—" in value):
        problems.append(f"{where}: long dash")


def validate():
    problems = []
    paths = {p["path"] for p in PAGE_TREE} | {""}
    for item in DESTINATIONS + FARE_OFFERS + NEWS + ARTICLES:
        for lang, v in item["seo"].items():
            if not 120 <= len(v) <= 160:
                problems.append(f"seo of {item.get('code') or item.get('name')} {lang}: {len(v)} chars")
    for path in paths:
        d = PAGE_DESCRIPTIONS.get(path)
        if not d:
            problems.append(f"no description for '{path}'")
            continue
        for lang, v in d.items():
            if not 120 <= len(v) <= 160:
                problems.append(f"description '{path}' {lang}: {len(v)} chars")
    for path in PAGES:
        if path not in paths:
            problems.append(f"PAGES has unknown page '{path}'")
    for name in ("SITE", "PAGE_TREE", "PAGES", "HEADER", "FOOTER", "CATEGORIES", "NEWS", "ARTICLES", "FAQ", "OFFICES", "FORMS",
                 "ACCORDIONS", "TABS", "ICON_TILES", "LOGO_STRIPS", "DESTINATIONS", "FARE_OFFERS", "TRAVEL_TOOLS", "TRAVEL_LISTS"):
        _walk(globals()[name], name, problems)

    def links(value):
        if isinstance(value, dict):
            for k, v in value.items():
                if k in ("page", "link", "cta_target_page") and isinstance(v, str):
                    yield v
                else:
                    yield from links(v)
        elif isinstance(value, (list, tuple)):
            for v in value:
                yield from links(v)
    for target in list(links([PAGES, ICON_TILES, LOGO_STRIPS, TRAVEL_TOOLS, FARE_OFFERS, TABS, TRAVEL_LISTS])) + list(LISTING_PAGES.values()):
        if target not in paths:
            problems.append(f"link to unknown page '{target}'")
    return problems


if __name__ == "__main__":
    issues = validate()
    print("\n".join(issues) if issues else f"ok: {len(PAGE_TREE) + 1} pages, {len(NEWS)} news items, {len(ARTICLES)} articles, "
          f"{sum(len(s['items']) for s in FAQ['sections'])} questions, {len(DESTINATIONS)} destinations, {len(FARE_OFFERS)} fare offers")

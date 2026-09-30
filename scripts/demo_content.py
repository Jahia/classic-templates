# -*- coding: utf-8 -*-
"""Content of the Classic Dev site (EN + FR), read by the seed script.

Plain data only: images to generate, page meta descriptions, page sections, and the full bodies of
the news items and articles. Page paths are relative to the home page ("" is the home page).
"""

# ---------------------------------------------------------------------------------------------
# 1. Abstract images to generate (vertical gradient of the first two colours, circles of the rest,
#    from the largest on the left to the smallest on the right). The title is the alt text.
# ---------------------------------------------------------------------------------------------
IMAGES = [
    {
        "name": "abstract-violet.jpg",
        "title": {
            "en": "Three overlapping lilac and violet circles, from large on the left to small on the right, on a deep purple gradient",
            "fr": "Trois cercles lilas et violets qui se chevauchent, du plus grand à gauche au plus petit à droite, sur un dégradé violet profond",
        },
        "size": (1600, 900),
        "palette": [(38, 22, 68), (88, 58, 138), (150, 110, 210), (200, 170, 240), (118, 78, 178)],
    },
    {
        "name": "abstract-sand.jpg",
        "title": {
            "en": "Three overlapping ochre and beige circles on a pale sand gradient that darkens towards the bottom",
            "fr": "Trois cercles ocre et beiges qui se chevauchent sur un dégradé sable clair qui fonce vers le bas",
        },
        "size": (1600, 900),
        "palette": [(240, 229, 208), (214, 190, 150), (190, 150, 100), (232, 207, 168), (158, 118, 78)],
    },
    {
        "name": "abstract-teal.jpg",
        "title": {
            "en": "Three overlapping turquoise and mint circles on a dark teal gradient, square format",
            "fr": "Trois cercles turquoise et vert d'eau qui se chevauchent sur un dégradé bleu canard sombre, format carré",
        },
        "size": (1200, 1200),
        "palette": [(10, 58, 68), (20, 108, 114), (60, 170, 165), (140, 215, 200), (30, 130, 140)],
    },
    {
        "name": "abstract-rose.jpg",
        "title": {
            "en": "Three overlapping raspberry and pale pink circles on a soft rose gradient, square format",
            "fr": "Trois cercles framboise et rose pâle qui se chevauchent sur un dégradé rose tendre, format carré",
        },
        "size": (1200, 1200),
        "palette": [(250, 230, 234), (230, 172, 186), (208, 108, 138), (246, 202, 212), (178, 78, 108)],
    },
    {
        "name": "abstract-slate.jpg",
        "title": {
            "en": "Three overlapping grey and silver circles on a slate gradient, upright format",
            "fr": "Trois cercles gris et argentés qui se chevauchent sur un dégradé gris ardoise, format vertical",
        },
        "size": (1200, 1500),
        "palette": [(38, 46, 58), (88, 98, 114), (140, 150, 166), (192, 200, 212), (68, 78, 94)],
    },
    {
        "name": "abstract-gold.jpg",
        "title": {
            "en": "Two overlapping golden and pale yellow circles on a dark amber gradient, upright format",
            "fr": "Deux cercles dorés et jaune pâle qui se chevauchent sur un dégradé ambre sombre, format vertical",
        },
        "size": (1200, 1500),
        "palette": [(68, 48, 14), (158, 118, 40), (222, 176, 70), (246, 216, 132)],
    },
]

# ---------------------------------------------------------------------------------------------
# 2. Meta descriptions (120 to 155 characters)
# ---------------------------------------------------------------------------------------------
PAGE_DESCRIPTIONS = {
    "sitemap": {
        "en": "Every page of the Classic Dev website in one place: services, training, support, the studio, news, contact and legal information.",
        "fr": "Toutes les pages du site Classic Dev en un seul endroit : services, formation, assistance, le studio, actualités, contact et informations légales.",
    },
    "accessibility": {
        "en": "Accessibility statement of the Classic Dev website: RGAA 4.1.2 compliance status, content not yet accessible, how to report a problem.",
        "fr": "Déclaration d'accessibilité du site Classic Dev : état de conformité au RGAA 4.1.2, contenus non accessibles, comment signaler un problème.",
    },
    "": {
        "en": "Classic Dev is a web studio in Lyon: content strategy, design and engineering for bilingual, accessible websites your editors run themselves.",
        "fr": "Classic Dev, studio web à Lyon : stratégie de contenu, design et développement de sites bilingues et accessibles, gérés par vos rédacteurs.",
    },
    "about": {
        "en": "Meet Classic Dev, a Lyon studio of forty designers, editors and engineers who have built lasting, easy-to-edit websites since 2012.",
        "fr": "Découvrez Classic Dev, un studio lyonnais de quarante designers, rédacteurs et ingénieurs qui construit des sites durables depuis 2012.",
    },
    "about/team": {
        "en": "The people of Classic Dev: founders, designers, editors, trainers and support engineers who plan, build and look after your website.",
        "fr": "L'équipe de Classic Dev : fondateurs, designers, rédacteurs, formateurs et ingénieurs qui conçoivent, construisent et suivent votre site.",
    },
    "about/history": {
        "en": "From two rooms at the foot of the Croix-Rousse in 2012 to a team of forty: how Classic Dev grew, one website and one client at a time.",
        "fr": "De deux pièces au pied de la Croix-Rousse en 2012 à une équipe de quarante : comment Classic Dev a grandi, un site et un client à la fois.",
    },
    "services": {
        "en": "Consulting, training and support from Classic Dev: three ways to plan, run and maintain a content-rich website, on their own or combined.",
        "fr": "Conseil, formation et assistance par Classic Dev : trois façons de concevoir, faire vivre et maintenir un site riche en contenu.",
    },
    "services/consulting": {
        "en": "Classic Dev consulting: content strategy and content operations, in three steps, until your own team runs the website with confidence.",
        "fr": "Le conseil de Classic Dev : stratégie et opérations de contenu, en trois étapes, jusqu'à ce que votre équipe fasse vivre le site en confiance.",
    },
    "services/consulting/strategy": {
        "en": "A four-week content strategy engagement: audit, audience interviews, site structure and a publishing plan your editors can act on.",
        "fr": "Une mission de stratégie de contenu en quatre semaines : audit, entretiens, structure du site et plan de publication prêt à appliquer.",
    },
    "services/consulting/operations": {
        "en": "Content operations with Classic Dev: governance, editorial workflows and a publishing calendar that keep a website accurate after launch.",
        "fr": "Les opérations de contenu avec Classic Dev : gouvernance, circuits de validation et calendrier éditorial pour un site juste après le lancement.",
    },
    "services/training": {
        "en": "Training for editors, administrators and developers: small groups, real content, and workshops that leave your team fully autonomous.",
        "fr": "Des formations pour rédacteurs, administrateurs et développeurs : petits groupes, vrais contenus et ateliers qui rendent votre équipe autonome.",
    },
    "services/training/workshops": {
        "en": "Our workshop catalogue: Page Builder, writing for the web, accessible content, multilingual publishing, themes and template development.",
        "fr": "Notre catalogue d'ateliers : Page Builder, écriture web, contenus accessibles, publication multilingue, thèmes et développement de gabarits.",
    },
    "services/support": {
        "en": "Classic Dev support plans: named contacts, response times from one hour, and a 24/7 line for critical incidents on the websites we build.",
        "fr": "Les formules d'assistance de Classic Dev : interlocuteur dédié, réponse dès une heure et ligne 24 h/24 pour les incidents critiques.",
    },
    "news": {
        "en": "News from Classic Dev: releases of our template set, accessibility and multilingual work, and dates of our upcoming editor workshops.",
        "fr": "Les actualités de Classic Dev : versions de notre jeu de gabarits, accessibilité, multilinguisme et dates des prochains ateliers rédacteurs.",
    },
    "contact": {
        "en": "Contact Classic Dev in Lyon: address, phone, e-mail, opening hours and directions to the studio, or write to us with the form below.",
        "fr": "Contacter Classic Dev à Lyon : adresse, téléphone, e-mail, horaires et accès au studio, ou écrivez-nous avec le formulaire de cette page.",
    },
    "legal": {
        "en": "Legal notice of the Classic Dev website: publisher, publication director, hosting provider and intellectual property of texts and images.",
        "fr": "Mentions légales du site Classic Dev : éditeur, directeur de la publication, hébergeur et propriété intellectuelle des textes et images.",
    },
    "privacy": {
        "en": "How the Classic Dev website handles personal data: contact form data, purposes, legal basis, retention, your rights, and no tracking cookie.",
        "fr": "Comment le site de Classic Dev traite vos données : formulaire de contact, finalités, base légale, conservation, droits et aucun cookie de suivi.",
    },
    "landing": {
        "en": "Start a website project with Classic Dev: our services at a glance, a few figures from 2026 and what our clients say about working with us.",
        "fr": "Lancez votre projet de site avec Classic Dev : nos services en un coup d'œil, quelques chiffres 2026 et l'avis de nos clients.",
    },
}

# ---------------------------------------------------------------------------------------------
# 3. Page sections
# ---------------------------------------------------------------------------------------------
PAGES = {
    # ---- About us > History ---------------------------------------------------------------
    "about/history": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Fourteen years of websites in Lyon", "fr": "Quatorze ans de sites web à Lyon"},
                    "eyebrow": {"en": "Our history", "fr": "Notre histoire"},
                    "subtitle": {
                        "en": "Two founders, one rule about content, and the clients who trusted us from the first site on.",
                        "fr": "Deux fondateurs, une règle sur le contenu, et des clients qui nous ont fait confiance dès le premier site.",
                    },
                    "variant": "image",
                    "overlay": "strong",
                    "height": "medium",
                    "imageDecorative": "true",
                },
                "image": "abstract-sand.jpg",
                "cta": {"page": "about/team", "label": {"en": "Meet the team", "fr": "Rencontrer l'équipe"}},
            }
        ],
        "main": [
            {
                "name": "beginnings",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "2012 to 2016: the early years", "fr": "2012 à 2016 : les débuts"},
                    "body": {
                        "en": "<p>Classic Dev started in March 2012 in two rented rooms above a print shop at the foot of the "
                              "Croix-Rousse slopes. Ada Martin had spent eight years as a newspaper web editor, Thomas Garnier "
                              "as a developer for an agency in Paris. They shared one frustration: sites that looked finished "
                              "on launch day and that nobody on the client side dared to change.</p>"
                              "<p>Their first clients were a regional museum network and a wine cooperative from the Beaujolais. "
                              "Both sites were small, and both were handed over with a half-day session for the people who "
                              "would write on them. That session is still the part of a project we protect most.</p>"
                              "<h2>The first hires</h2>"
                              "<p>Louis Bernard joined in 2014 as our first full-time editor, when we built our first site in "
                              "French and English. Nora Haddad followed in 2015 and set up the design practice. In 2016 we ran "
                              "our first training day for editors who were not our clients: eleven people came, and training "
                              "became a service of its own.</p>",
                        "fr": "<p>Classic Dev est née en mars 2012 dans deux pièces louées au-dessus d'une imprimerie, au pied "
                              "des pentes de la Croix-Rousse. Ada Martin sortait de huit ans comme rédactrice web dans un quotidien, "
                              "Thomas Garnier de plusieurs années de développement dans une agence parisienne. Ils partageaient "
                              "une même frustration : des sites impeccables le jour du lancement, que personne chez le client "
                              "n'osait ensuite modifier.</p>"
                              "<p>Nos premiers clients ont été un réseau de musées régional et une cave coopérative du Beaujolais. "
                              "Deux petits sites, remis chacun avec une demi-journée de prise en main pour les personnes qui "
                              "allaient y écrire. Ce moment reste aujourd'hui la partie d'un projet que nous protégeons le plus.</p>"
                              "<h2>Les premiers recrutements</h2>"
                              "<p>Louis Bernard nous a rejoints en 2014, premier rédacteur à plein temps, au moment de notre "
                              "premier site en français et en anglais. Nora Haddad est arrivée en 2015 pour monter le pôle design. "
                              "En 2016, nous avons organisé une première journée de formation ouverte à des rédacteurs qui "
                              "n'étaient pas nos clients : onze personnes sont venues, et la formation est devenue un métier "
                              "à part entière.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "studio",
                "type": "ctpl:imageText",
                "props": {
                    "jcr:title": {"en": "A studio on the hill", "fr": "Un atelier sur la colline"},
                    "body": {
                        "en": "<p>In 2017, with fifteen people and no room left for a meeting table, we moved up the hill to "
                              "a former silk workshop on the Croix-Rousse plateau. The tall windows once lit the looms; today "
                              "they light a training room, two project spaces and a kitchen where most decisions are made.</p>"
                              "<p>We chose to stay in one place rather than open offices elsewhere. Clients from Paris, Geneva "
                              "and Marseille come to Lyon for workshops, and the team travels to them for the rest.</p>",
                        "fr": "<p>En 2017, à quinze et sans plus de place pour une table de réunion, nous sommes montés sur le "
                              "plateau de la Croix-Rousse, dans un ancien atelier de soyeux. Les hautes fenêtres éclairaient "
                              "autrefois les métiers à tisser ; elles éclairent aujourd'hui une salle de formation, deux espaces "
                              "projet et une cuisine où se prennent la plupart des décisions.</p>"
                              "<p>Nous avons choisi de rester en un seul lieu plutôt que d'ouvrir des bureaux ailleurs. Nos "
                              "clients de Paris, Genève ou Marseille viennent à Lyon pour les ateliers, et l'équipe se déplace "
                              "pour le reste.</p>",
                    },
                    "imagePosition": "right",
                    "imageRatio": "portrait",
                    "ctplSurface": "sunken",
                },
                "image": "abstract-slate.jpg",
            },
            {
                "name": "growing",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "2017 to today: growing up", "fr": "De 2017 à aujourd'hui : grandir"},
                    "body": {
                        "en": "<h2>A support desk and a remote year</h2>"
                              "<p>In 2019 we opened a support desk with written service levels, because clients kept calling "
                              "the developer who had built their site. In 2020 every workshop moved online within two weeks; "
                              "remote sessions have stayed in the catalogue ever since.</p>"
                              "<h2>Accessibility as a practice</h2>"
                              "<p>From 2022 every site we deliver is audited against the French accessibility standard RGAA "
                              "before launch, and every designer and editor in the team is trained to it. It changed how we "
                              "write components more than any framework did.</p>"
                              "<h2>Our own template set</h2>"
                              "<p>In September 2026 we published the classic templates, the template set we had refined over "
                              "two years of client projects. The studio now counts forty people, and the rule Ada and Thomas "
                              "started with has not changed.</p>",
                        "fr": "<h2>Un service d'assistance et une année à distance</h2>"
                              "<p>En 2019, nous avons ouvert un service d'assistance avec des niveaux de service écrits, parce "
                              "que nos clients continuaient d'appeler le développeur qui avait construit leur site. En 2020, "
                              "tous les ateliers sont passés en ligne en deux semaines ; les sessions à distance sont restées "
                              "au catalogue depuis.</p>"
                              "<h2>L'accessibilité comme pratique</h2>"
                              "<p>Depuis 2022, chaque site que nous livrons est audité selon le RGAA avant sa mise en ligne, et "
                              "chaque designer et rédacteur de l'équipe y est formé. Cela a changé notre façon d'écrire les "
                              "composants plus que n'importe quel framework.</p>"
                              "<h2>Notre propre jeu de gabarits</h2>"
                              "<p>En septembre 2026, nous avons publié les classic templates, le jeu de gabarits affiné pendant "
                              "deux ans de projets clients. Le studio compte désormais quarante personnes, et la règle de départ "
                              "d'Ada et Thomas n'a pas changé.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "founder",
                "type": "ctpl:quote",
                "props": {
                    "quote": {
                        "en": "We never wanted to be the agency you call to change a sentence. We wanted to be the one you no longer need to call.",
                        "fr": "Nous n'avons jamais voulu être l'agence qu'on appelle pour changer une phrase. Nous voulions être celle qu'on n'a plus besoin d'appeler.",
                    },
                    "author": "Thomas Garnier",
                    "authorRole": {"en": "Co-founder and technical director", "fr": "Cofondateur et directeur technique"},
                    "variant": "large",
                    "ctplSurface": "sunken",
                },
                "image": "abstract-gold.jpg",
            },
            {
                "name": "today",
                "type": "ctpl:keyFigures",
                "props": {
                    "jcr:title": {"en": "Classic Dev today", "fr": "Classic Dev aujourd'hui"},
                    "introText": {
                        "en": "Where fourteen years of projects have brought us.",
                        "fr": "Là où nous ont menés quatorze années de projets.",
                    },
                    "ctplSurface": "default",
                },
                "children": [
                    {"name": "founded", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "2012", "fr": "2012"},
                        "label": {"en": "founded in Lyon", "fr": "création à Lyon"}}},
                    {"name": "people", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "40", "fr": "40"},
                        "label": {"en": "people in the studio", "fr": "personnes au studio"},
                        "detail": {"en": "September 2026", "fr": "Septembre 2026"}}},
                    {"name": "languages", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "9", "fr": "9"},
                        "label": {"en": "languages spoken in the team", "fr": "langues parlées dans l'équipe"}}},
                    {"name": "loyalty", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "85%", "fr": "85 %"},
                        "label": {"en": "of clients with us for over three years", "fr": "de clients fidèles depuis plus de trois ans"},
                        "detail": {"en": "Active clients, September 2026", "fr": "Clients actifs, septembre 2026"}}},
                ],
            },
            {
                "name": "join",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Write the next chapter with us", "fr": "Écrivons la suite ensemble"},
                    "body": {
                        "en": "<p>A new site, a redesign or a team to train: tell us where you are and we will tell you honestly how we can help.</p>",
                        "fr": "<p>Un nouveau site, une refonte ou une équipe à former : dites-nous où vous en êtes, nous vous dirons franchement comment vous aider.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Get in touch", "fr": "Nous écrire"}},
            },
        ],
    },

    # ---- Services > Consulting ------------------------------------------------------------
    "services/consulting": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Consulting for content-rich sites", "fr": "Du conseil pour les sites riches en contenu"},
                    "eyebrow": {"en": "Consulting", "fr": "Conseil"},
                    "subtitle": {
                        "en": "We help you decide what your site should say, how it is organised and who keeps it up to date.",
                        "fr": "Nous vous aidons à décider ce que votre site doit dire, comment il s'organise et qui le tient à jour.",
                    },
                    "variant": "split",
                    "height": "medium",
                    "imageDecorative": "true",
                },
                "image": "abstract-violet.jpg",
                "cta": {"page": "contact", "label": {"en": "Book a first call", "fr": "Réserver un premier appel"}},
            }
        ],
        "main": [
            {
                "name": "scope",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "What consulting covers", "fr": "Ce que couvre le conseil"},
                    "body": {
                        "en": "<p>Most of the sites we are asked to rebuild do not have a design problem. They have too many "
                              "pages, no clear owner for each of them, and an editorial team that learned the tool by trial "
                              "and error. Consulting is where we fix that, before a single template is drawn.</p>"
                              "<ul><li><strong>Content strategy:</strong> what the site is for, who reads it, which pages "
                              "stay, merge or go.</li>"
                              "<li><strong>Information architecture:</strong> the page tree, the menus, the content types "
                              "and the fields editors will fill in.</li>"
                              "<li><strong>Content operations:</strong> roles, validation workflows, publishing calendar "
                              "and the routines that keep the site accurate.</li>"
                              "<li><strong>Multilingual and accessibility policy:</strong> which languages, who translates, "
                              "and how every page meets the RGAA.</li></ul>",
                        "fr": "<p>La plupart des sites qu'on nous demande de refaire n'ont pas un problème de design. Ils ont "
                              "trop de pages, personne de clairement responsable de chacune, et une équipe éditoriale qui a "
                              "appris l'outil à tâtons. Le conseil sert à régler cela, avant de dessiner le moindre gabarit.</p>"
                              "<ul><li><strong>Stratégie de contenu :</strong> à quoi sert le site, qui le lit, quelles pages "
                              "restent, fusionnent ou disparaissent.</li>"
                              "<li><strong>Architecture de l'information :</strong> l'arborescence, les menus, les types de "
                              "contenu et les champs que les rédacteurs rempliront.</li>"
                              "<li><strong>Opérations de contenu :</strong> rôles, circuits de validation, calendrier de "
                              "publication et habitudes qui gardent le site à jour.</li>"
                              "<li><strong>Politique multilingue et accessibilité :</strong> quelles langues, qui traduit, et "
                              "comment chaque page respecte le RGAA.</li></ul>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "method",
                "type": "ctpl:columns",
                "props": {
                    "jcr:title": {"en": "Our method in three steps", "fr": "Notre méthode en trois temps"},
                    "layout": "thirds",
                    "gap": "large",
                    "ctplSurface": "sunken",
                },
                "columns": {
                    "col1": [{
                        "name": "listen",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "1. Listen", "fr": "1. Écouter"},
                            "body": {
                                "en": "<p>We read your current site page by page, look at what visitors search for, and "
                                      "interview the people who write, approve and answer questions about it.</p>",
                                "fr": "<p>Nous lisons votre site page par page, regardons ce que cherchent les visiteurs et "
                                      "interrogeons ceux qui écrivent, valident et répondent aux questions qu'il suscite.</p>",
                            },
                        },
                    }],
                    "col2": [{
                        "name": "structure",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "2. Structure", "fr": "2. Structurer"},
                            "body": {
                                "en": "<p>We propose a page tree, content types and a small set of page sections, then test "
                                      "them with real texts from your team, not placeholder copy.</p>",
                                "fr": "<p>Nous proposons une arborescence, des types de contenu et un petit jeu de sections, "
                                      "puis nous les testons avec de vrais textes de votre équipe, pas du faux texte.</p>",
                            },
                        },
                    }],
                    "col3": [{
                        "name": "hand-over",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "3. Hand over", "fr": "3. Transmettre"},
                            "body": {
                                "en": "<p>We leave you with written decisions, a publishing plan and a trained team. Our "
                                      "work is done when you no longer need us for everyday changes.</p>",
                                "fr": "<p>Nous vous laissons des décisions écrites, un plan de publication et une équipe "
                                      "formée. Notre travail est fini quand vous n'avez plus besoin de nous au quotidien.</p>",
                            },
                        },
                    }],
                },
            },
            {
                "name": "areas",
                "type": "ctpl:cardGrid",
                "props": {
                    "jcr:title": {"en": "Two ways in", "fr": "Deux portes d'entrée"},
                    "introText": {
                        "en": "Start with the strategy of a new site, or with the day-to-day running of the one you have.",
                        "fr": "Commencez par la stratégie d'un nouveau site, ou par le fonctionnement quotidien de celui que vous avez.",
                    },
                    "columns": "2",
                    "ctplSurface": "default",
                },
                "children": [
                    {
                        "name": "strategy",
                        "type": "ctpl:card",
                        "props": {
                            "jcr:title": {"en": "Content strategy", "fr": "Stratégie de contenu"},
                            "text": {
                                "en": "Four weeks to decide what the site says, to whom, and how it is organised.",
                                "fr": "Quatre semaines pour décider ce que dit le site, à qui, et comment il s'organise.",
                            },
                            "linkLabel": {"en": "Plan your strategy", "fr": "Préparer votre stratégie"},
                        },
                        "image": "abstract-teal.jpg",
                        "link": "services/consulting/strategy",
                    },
                    {
                        "name": "operations",
                        "type": "ctpl:card",
                        "props": {
                            "jcr:title": {"en": "Content operations", "fr": "Opérations de contenu"},
                            "text": {
                                "en": "Roles, workflows and a publishing calendar that keep the site accurate after launch.",
                                "fr": "Des rôles, des circuits et un calendrier qui gardent le site juste après le lancement.",
                            },
                            "linkLabel": {"en": "Organise your team", "fr": "Organiser votre équipe"},
                        },
                        "image": "abstract-gold.jpg",
                        "link": "services/consulting/operations",
                    },
                ],
            },
            {
                "name": "figures",
                "type": "ctpl:keyFigures",
                "props": {
                    "jcr:title": {"en": "Consulting in numbers", "fr": "Le conseil en chiffres"},
                    "introText": {
                        "en": "What a typical engagement looks like.",
                        "fr": "À quoi ressemble une mission type.",
                    },
                    "ctplSurface": "sunken",
                },
                "children": [
                    {"name": "duration", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "4 weeks", "fr": "4 semaines"},
                        "label": {"en": "for a content strategy", "fr": "pour une stratégie de contenu"}}},
                    {"name": "consultants", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "2", "fr": "2"},
                        "label": {"en": "consultants on every project", "fr": "consultants sur chaque projet"},
                        "detail": {"en": "One content strategist, one engineer", "fr": "Une stratège de contenu, un ingénieur"}}},
                    {"name": "projects", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "60", "fr": "60"},
                        "label": {"en": "consulting projects since 2014", "fr": "missions de conseil depuis 2014"}}},
                    {"name": "reduction", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "40%", "fr": "40 %"},
                        "label": {"en": "fewer pages after the audit, on average", "fr": "de pages en moins après l'audit, en moyenne"},
                        "detail": {"en": "Projects delivered in 2025", "fr": "Projets livrés en 2025"}}},
                ],
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Tell us about your site", "fr": "Parlez-nous de votre site"},
                    "body": {
                        "en": "<p>In a first thirty-minute call we listen, ask a few questions and tell you whether consulting is the right place to start.</p>",
                        "fr": "<p>Lors d'un premier appel de trente minutes, nous écoutons, posons quelques questions et vous disons si le conseil est le bon point de départ.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Book a call", "fr": "Prendre rendez-vous"}},
            },
        ],
    },

    # ---- Services > Consulting > Strategy -------------------------------------------------
    "services/consulting/strategy": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Strategy before pages", "fr": "La stratégie avant les pages"},
                    "eyebrow": {"en": "Consulting", "fr": "Conseil"},
                    "subtitle": {
                        "en": "Four weeks to agree on what your site is for, who it speaks to and what it should stop saying.",
                        "fr": "Quatre semaines pour s'accorder sur le rôle du site, ses lecteurs et ce qu'il doit cesser de dire.",
                    },
                    "variant": "image",
                    "overlay": "medium",
                    "height": "compact",
                    "imageDecorative": "true",
                },
                "image": "abstract-teal.jpg",
                "cta": {"page": "contact", "label": {"en": "Start with a call", "fr": "Commencer par un appel"}},
            }
        ],
        "main": [
            {
                "name": "readers",
                "type": "ctpl:imageText",
                "props": {
                    "jcr:title": {"en": "Start from what readers need", "fr": "Partir des besoins des lecteurs"},
                    "body": {
                        "en": "<p>A site map drawn from the organisation chart tells visitors how you are organised, not "
                              "where to find what they came for. We start from the questions your readers actually ask: "
                              "search terms, messages sent to your team, calls to your front desk.</p>"
                              "<p>Those questions become the backbone of the new structure, and every page gets a reason "
                              "to exist and a person who owns it.</p>",
                        "fr": "<p>Une arborescence calquée sur l'organigramme dit aux visiteurs comment vous êtes organisés, "
                              "pas où trouver ce qu'ils cherchent. Nous partons des questions que vos lecteurs posent vraiment : "
                              "recherches sur le site, messages reçus par votre équipe, appels à l'accueil.</p>"
                              "<p>Ces questions deviennent la colonne vertébrale de la nouvelle structure, et chaque page reçoit "
                              "une raison d'être et un responsable.</p>",
                    },
                    "imagePosition": "left",
                    "imageRatio": "square",
                    "ctplSurface": "default",
                },
                "image": "abstract-rose.jpg",
            },
            {
                "name": "deliverables",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "What you get", "fr": "Ce que vous obtenez"},
                    "body": {
                        "en": "<p>At the end of the engagement you receive six deliverables, written for the people who will "
                              "use them rather than for a steering committee:</p>"
                              "<ol><li><strong>A content audit</strong> of every current page, with a keep, merge, rewrite "
                              "or remove decision for each.</li>"
                              "<li><strong>Reader profiles</strong> built from interviews and search data, with the top tasks "
                              "of each profile.</li>"
                              "<li><strong>A page tree</strong> up to three levels deep, tested with a card sorting exercise.</li>"
                              "<li><strong>A content model:</strong> the content types, their fields and the page sections "
                              "editors will combine.</li>"
                              "<li><strong>A tone of voice guide</strong> in each language of the site, with before and after "
                              "examples taken from your own pages.</li>"
                              "<li><strong>A publishing plan</strong> for the first six months after launch, with owners and "
                              "dates.</li></ol>",
                        "fr": "<p>À la fin de la mission, vous recevez six livrables, écrits pour ceux qui s'en serviront "
                              "plutôt que pour un comité de pilotage :</p>"
                              "<ol><li><strong>Un audit de contenu</strong> de chaque page actuelle, avec pour chacune une "
                              "décision : garder, fusionner, réécrire ou supprimer.</li>"
                              "<li><strong>Des profils de lecteurs</strong> construits à partir d'entretiens et des recherches "
                              "sur le site, avec les tâches principales de chacun.</li>"
                              "<li><strong>Une arborescence</strong> sur trois niveaux au plus, testée par un tri de cartes.</li>"
                              "<li><strong>Un modèle de contenu :</strong> les types de contenu, leurs champs et les sections que "
                              "les rédacteurs combineront.</li>"
                              "<li><strong>Un guide de ton</strong> dans chaque langue du site, avec des exemples avant et après "
                              "tirés de vos propres pages.</li>"
                              "<li><strong>Un plan de publication</strong> pour les six premiers mois après le lancement, avec "
                              "responsables et échéances.</li></ol>",
                    },
                    "width": "readable",
                    "ctplSurface": "sunken",
                },
            },
            {
                "name": "practical",
                "type": "ctpl:columns",
                "props": {
                    "layout": "halves",
                    "gap": "medium",
                    "ctplSurface": "default",
                },
                "columns": {
                    "col1": [{
                        "name": "timing",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "How long it takes", "fr": "Combien de temps"},
                            "body": {
                                "en": "<p>Four weeks for a site of up to 500 pages: one week of audit, one of interviews, "
                                      "two of structure and writing. Larger sites or several languages add a week or two.</p>",
                                "fr": "<p>Quatre semaines pour un site de 500 pages au plus : une semaine d'audit, une "
                                      "d'entretiens, deux de structure et de rédaction. Un site plus grand ou plusieurs "
                                      "langues ajoutent une à deux semaines.</p>",
                            },
                        },
                    }],
                    "col2": [{
                        "name": "people",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Who takes part", "fr": "Qui participe"},
                            "body": {
                                "en": "<p>On your side, one decision maker and two or three future editors, about half a day "
                                      "a week each. On ours, a content strategist and an engineer, from the first meeting "
                                      "to the last.</p>",
                                "fr": "<p>De votre côté, une personne qui décide et deux ou trois futurs rédacteurs, environ "
                                      "une demi-journée par semaine chacun. Du nôtre, une stratège de contenu et un ingénieur, "
                                      "de la première réunion à la dernière.</p>",
                            },
                        },
                    }],
                },
            },
            {
                "name": "client",
                "type": "ctpl:quote",
                "props": {
                    "quote": {
                        "en": "We went from 900 pages to 340, and for the first time every one of them has a name next to it.",
                        "fr": "Nous sommes passés de 900 pages à 340, et pour la première fois chacune a un nom à côté d'elle.",
                    },
                    "author": "Hélène Marchal",
                    "authorRole": {
                        "en": "Director of communications, a regional museum network",
                        "fr": "Directrice de la communication, un réseau de musées régional",
                    },
                    "variant": "large",
                    "ctplSurface": "sunken",
                },
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Planning a new site?", "fr": "Vous préparez un nouveau site ?"},
                    "body": {
                        "en": "<p>Send us the address of your current site and a few lines about your project: we come back with a first reading within a week.</p>",
                        "fr": "<p>Envoyez-nous l'adresse de votre site actuel et quelques lignes sur votre projet : nous revenons vers vous avec une première lecture sous une semaine.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Describe your project", "fr": "Décrire votre projet"}},
            },
        ],
    },

    # ---- Services > Consulting > Operations -----------------------------------------------
    "services/consulting/operations": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Content operations that last", "fr": "Des opérations de contenu durables"},
                    "eyebrow": {"en": "Consulting", "fr": "Conseil"},
                    "subtitle": {
                        "en": "A site stays accurate when everyone knows what to publish, who approves it and when it is reviewed.",
                        "fr": "Un site reste juste quand chacun sait quoi publier, qui valide et quand le contenu est relu.",
                    },
                    "variant": "plain",
                    "height": "compact",
                },
                "cta": {"page": "contact", "label": {"en": "Talk to a consultant", "fr": "Parler à nos consultants"}},
            }
        ],
        "main": [
            {
                "name": "why",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "What content operations mean", "fr": "Ce que sont les opérations de contenu"},
                    "body": {
                        "en": "<p>Launch day is the easy part. Six months later, the news page has not moved since spring, "
                              "two pages give different opening hours, and the English version lags three updates behind the "
                              "French one. None of this is a technical problem.</p>"
                              "<p>Content operations are the rules and habits that prevent it: who may publish what, who "
                              "reviews it, how translations follow, and when old pages are checked or retired. We set them up "
                              "with your team, write them down in a short handbook, and configure the publication workflows in "
                              "Jahia to match.</p>",
                        "fr": "<p>Le jour du lancement est la partie facile. Six mois plus tard, la page d'actualités n'a pas "
                              "bougé depuis le printemps, deux pages donnent des horaires différents, et la version anglaise a "
                              "trois mises à jour de retard sur la française. Rien de tout cela n'est un problème technique.</p>"
                              "<p>Les opérations de contenu sont les règles et les habitudes qui l'évitent : qui peut publier "
                              "quoi, qui relit, comment suivent les traductions, et quand les anciennes pages sont vérifiées ou "
                              "retirées. Nous les mettons en place avec votre équipe, les consignons dans un guide court et "
                              "configurons les circuits de publication de Jahia en conséquence.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "governance",
                "type": "ctpl:columns",
                "props": {
                    "jcr:title": {"en": "Governance and workflows", "fr": "Gouvernance et circuits"},
                    "layout": "halves",
                    "gap": "large",
                    "ctplSurface": "sunken",
                },
                "columns": {
                    "col1": [{
                        "name": "roles",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Governance", "fr": "Gouvernance"},
                            "body": {
                                "en": "<p>Every section of the site gets an owner, and every owner a deputy. We agree on who "
                                      "writes, who approves and who has the final word on the home page.</p>"
                                      "<ul><li>An editorial board every month</li><li>An owner and a review date on every "
                                      "page</li><li>A written rule for removing outdated content</li></ul>",
                                "fr": "<p>Chaque rubrique du site a un responsable, et chaque responsable un suppléant. Nous "
                                      "décidons qui écrit, qui valide et qui tranche pour la page d'accueil.</p>"
                                      "<ul><li>Un comité éditorial chaque mois</li><li>Un responsable et une date de relecture "
                                      "sur chaque page</li><li>Une règle écrite pour retirer les contenus périmés</li></ul>",
                            },
                        },
                    }],
                    "col2": [{
                        "name": "workflows",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Editorial workflows", "fr": "Circuits de validation"},
                            "body": {
                                "en": "<p>Workflows follow the risk of the content, not the org chart. A news item needs one "
                                      "approval; a price list or a legal page needs two.</p>"
                                      "<ul><li>One-step approval for news and events</li><li>Two-step approval for legal and "
                                      "pricing pages</li><li>Translation requested when the source page is published</li></ul>",
                                "fr": "<p>Les circuits suivent le risque du contenu, pas l'organigramme. Une actualité demande "
                                      "une validation ; une grille tarifaire ou une page juridique en demande deux.</p>"
                                      "<ul><li>Validation simple pour les actualités et les événements</li><li>Double "
                                      "validation pour les pages juridiques et tarifaires</li><li>Traduction demandée dès la "
                                      "publication de la page source</li></ul>",
                            },
                        },
                    }],
                },
            },
            {
                "name": "calendar",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "A sample publishing calendar", "fr": "Un exemple de calendrier éditorial"},
                    "body": {
                        "en": "<p>The calendar we set up for a mid-sized organisation with four editors and a site in two "
                              "languages. Yours will have its own rhythm; the point is that each task has a day and an owner.</p>"
                              "<table><caption>Weekly and monthly publishing routine</caption>"
                              "<thead><tr><th scope=\"col\">When</th><th scope=\"col\">Task</th>"
                              "<th scope=\"col\">Owner</th><th scope=\"col\">Output</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Monday, 9:30</td><td>Editorial meeting</td><td>Editor in chief</td><td>List of items for the week</td></tr>"
                              "<tr><td>Tuesday</td><td>News item written and approved</td><td>Section editors</td><td>One news item in French</td></tr>"
                              "<tr><td>Wednesday</td><td>Translation and proofreading</td><td>Translator</td><td>English version published</td></tr>"
                              "<tr><td>Thursday</td><td>Home page refresh</td><td>Editor in chief</td><td>Updated hero and featured cards</td></tr>"
                              "<tr><td>Friday</td><td>Newsletter selection</td><td>Communication officer</td><td>Three links for the newsletter</td></tr>"
                              "<tr><td>First Monday of the month</td><td>Review of pages past their date</td><td>Page owners</td><td>Pages updated or retired</td></tr>"
                              "</tbody></table>",
                        "fr": "<p>Le calendrier mis en place pour une organisation de taille moyenne, avec quatre rédacteurs "
                              "et un site en deux langues. Le vôtre aura son propre rythme ; l'essentiel est que chaque tâche "
                              "ait un jour et un responsable.</p>"
                              "<table><caption>Rythme de publication hebdomadaire et mensuel</caption>"
                              "<thead><tr><th scope=\"col\">Quand</th><th scope=\"col\">Tâche</th>"
                              "<th scope=\"col\">Responsable</th><th scope=\"col\">Résultat</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Lundi, 9 h 30</td><td>Conférence de rédaction</td><td>Rédactrice en chef</td><td>Liste des sujets de la semaine</td></tr>"
                              "<tr><td>Mardi</td><td>Actualité rédigée et validée</td><td>Rédacteurs de rubrique</td><td>Une actualité en français</td></tr>"
                              "<tr><td>Mercredi</td><td>Traduction et relecture</td><td>Traducteur</td><td>Version anglaise publiée</td></tr>"
                              "<tr><td>Jeudi</td><td>Mise à jour de l'accueil</td><td>Rédactrice en chef</td><td>Bannière et cartes à la une renouvelées</td></tr>"
                              "<tr><td>Vendredi</td><td>Sélection pour la lettre d'information</td><td>Chargée de communication</td><td>Trois liens pour la lettre</td></tr>"
                              "<tr><td>Premier lundi du mois</td><td>Revue des pages arrivées à échéance</td><td>Responsables de page</td><td>Pages mises à jour ou retirées</td></tr>"
                              "</tbody></table>",
                    },
                    "width": "wide",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "review",
                "type": "ctpl:imageText",
                "props": {
                    "jcr:title": {"en": "A quarterly content review", "fr": "Une revue de contenu trimestrielle"},
                    "body": {
                        "en": "<p>Once a quarter we spend a morning with your editors on the figures that matter: pages "
                              "nobody visits, searches that return nothing, pages past their review date. We leave with a "
                              "short list of actions and a date for the next review.</p>",
                        "fr": "<p>Une fois par trimestre, nous passons une matinée avec vos rédacteurs sur les chiffres qui "
                              "comptent : pages que personne ne visite, recherches sans résultat, pages arrivées à échéance. "
                              "Nous repartons avec une courte liste d'actions et la date de la revue suivante.</p>",
                    },
                    "imagePosition": "right",
                    "imageRatio": "portrait",
                    "ctplSurface": "sunken",
                },
                "image": "abstract-green.jpg",
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Is your site drifting?", "fr": "Votre site dérive ?"},
                    "body": {
                        "en": "<p>If nobody is sure who owns a page any more, a two-day diagnosis is usually enough to get things back on track.</p>",
                        "fr": "<p>Si plus personne ne sait qui est responsable d'une page, un diagnostic de deux jours suffit en général à reprendre la main.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Ask for a diagnosis", "fr": "Demander un diagnostic"}},
            },
        ],
    },

    # ---- Services > Training --------------------------------------------------------------
    "services/training": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Training that makes teams autonomous", "fr": "Des formations qui rendent autonome"},
                    "eyebrow": {"en": "Training", "fr": "Formation"},
                    "subtitle": {
                        "en": "Small groups, your own content, and trainers who build websites for a living.",
                        "fr": "Des petits groupes, vos propres contenus, et des formateurs qui construisent des sites au quotidien.",
                    },
                    "variant": "image",
                    "overlay": "strong",
                    "height": "medium",
                    "imageDecorative": "true",
                },
                "image": "abstract-gold.jpg",
                "cta": {"page": "services/training/workshops", "label": {"en": "See the workshops", "fr": "Voir les ateliers"}},
            }
        ],
        "main": [
            {
                "name": "what",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "What we teach", "fr": "Ce que nous enseignons"},
                    "body": {
                        "en": "<p>We train the people who keep a website alive, on the tool they use every day and on the "
                              "craft behind it. Every session works on real pages: yours if you are a client, a practice site "
                              "otherwise.</p>"
                              "<ul><li><strong>Editors:</strong> Page Builder, writing for the web, accessible content, "
                              "publishing in several languages.</li>"
                              "<li><strong>Administrators:</strong> users and rights, workflows, themes and site settings.</li>"
                              "<li><strong>Developers:</strong> content modelling and JavaScript template sets for Jahia.</li></ul>"
                              "<p>Groups are limited to eight people, so that everyone practises on their own screen and gets "
                              "their questions answered.</p>",
                        "fr": "<p>Nous formons celles et ceux qui font vivre un site, sur l'outil qu'ils utilisent chaque jour "
                              "et sur le métier qui l'accompagne. Chaque session travaille sur de vraies pages : les vôtres si "
                              "vous êtes client, un site d'entraînement sinon.</p>"
                              "<ul><li><strong>Rédacteurs :</strong> Page Builder, écriture web, contenus accessibles, "
                              "publication en plusieurs langues.</li>"
                              "<li><strong>Administrateurs :</strong> utilisateurs et droits, circuits de validation, thèmes et "
                              "réglages du site.</li>"
                              "<li><strong>Développeurs :</strong> modélisation de contenu et jeux de gabarits JavaScript pour "
                              "Jahia.</li></ul>"
                              "<p>Les groupes comptent huit personnes au plus, pour que chacun pratique sur son propre écran et "
                              "obtienne des réponses à ses questions.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "paths",
                "type": "ctpl:cardGrid",
                "props": {
                    "jcr:title": {"en": "Where to start", "fr": "Par où commencer"},
                    "introText": {
                        "en": "Pick a scheduled workshop, or ask for a session built around your team.",
                        "fr": "Choisissez un atelier programmé, ou demandez une session construite pour votre équipe.",
                    },
                    "columns": "3",
                    "ctplSurface": "sunken",
                },
                "children": [
                    {
                        "name": "workshops",
                        "type": "ctpl:card",
                        "props": {
                            "jcr:title": {"en": "Workshops", "fr": "Ateliers"},
                            "text": {
                                "en": "Six workshops from two hours to two days, in Lyon or online.",
                                "fr": "Six ateliers de deux heures à deux jours, à Lyon ou à distance.",
                            },
                            "linkLabel": {"en": "Browse the catalogue", "fr": "Parcourir le catalogue"},
                        },
                        "image": "abstract-rose.jpg",
                        "link": "services/training/workshops",
                    },
                    {
                        "name": "coaching",
                        "type": "ctpl:card",
                        "props": {
                            "jcr:title": {"en": "One-to-one coaching", "fr": "Accompagnement individuel"},
                            "text": {
                                "en": "Hour-long sessions with a trainer, on the pages you are working on this week.",
                                "fr": "Des séances d'une heure avec un formateur, sur les pages que vous préparez cette semaine.",
                            },
                            "linkLabel": {"en": "Ask for coaching", "fr": "Demander un accompagnement"},
                        },
                        "image": "abstract-warm.jpg",
                        "link": "contact",
                    },
                    {
                        "name": "programmes",
                        "type": "ctpl:card",
                        "props": {
                            "jcr:title": {"en": "A programme for your team", "fr": "Un parcours pour votre équipe"},
                            "text": {
                                "en": "Several workshops combined and adapted to your site, planned over a few weeks.",
                                "fr": "Plusieurs ateliers combinés et adaptés à votre site, répartis sur quelques semaines.",
                            },
                            "linkLabel": {"en": "Plan a programme", "fr": "Construire un parcours"},
                        },
                        "image": "abstract-blue.jpg",
                        "link": "contact",
                    },
                ],
            },
            {
                "name": "figures",
                "type": "ctpl:keyFigures",
                "props": {
                    "jcr:title": {"en": "Training in numbers", "fr": "La formation en chiffres"},
                    "ctplSurface": "default",
                },
                "children": [
                    {"name": "trained", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "1,200", "fr": "1 200"},
                        "label": {"en": "editors trained", "fr": "rédacteurs formés"},
                        "detail": {"en": "Since 2016", "fr": "Depuis 2016"}}},
                    {"name": "satisfaction", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "98%", "fr": "98 %"},
                        "label": {"en": "of trainees satisfied", "fr": "de stagiaires satisfaits"},
                        "detail": {"en": "Survey of 2026 training sessions", "fr": "Enquête sur les formations 2026"}}},
                    {"name": "group", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "8", "fr": "8"},
                        "label": {"en": "participants at most per group", "fr": "participants au plus par groupe"}}},
                    {"name": "catalogue", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "6", "fr": "6"},
                        "label": {"en": "workshops in the catalogue", "fr": "ateliers au catalogue"}}},
                ],
            },
            {
                "name": "trainee",
                "type": "ctpl:quote",
                "props": {
                    "quote": {
                        "en": "By the afternoon I had rebuilt our events page on my own, and I finally understood why the old one kept breaking.",
                        "fr": "L'après-midi, j'avais refait seule notre page d'événements, et je comprenais enfin pourquoi l'ancienne se cassait sans arrêt.",
                    },
                    "author": "Julie Moreau",
                    "authorRole": {"en": "Web editor, a public housing office", "fr": "Rédactrice web, un office public de l'habitat"},
                    "variant": "standard",
                    "ctplSurface": "sunken",
                },
                "image": "abstract-sand.jpg",
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Train your whole team", "fr": "Formez toute votre équipe"},
                    "body": {
                        "en": "<p>We come to you or welcome you in Lyon, on the dates that suit your publishing calendar.</p>",
                        "fr": "<p>Nous venons chez vous ou vous accueillons à Lyon, aux dates qui conviennent à votre calendrier éditorial.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Plan a session", "fr": "Planifier une session"}},
            },
        ],
    },

    # ---- Services > Training > Workshops --------------------------------------------------
    "services/training/workshops": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Workshops", "fr": "Ateliers"},
                    "eyebrow": {"en": "Training", "fr": "Formation"},
                    "subtitle": {
                        "en": "From a two-hour Page Builder session to two days of template development.",
                        "fr": "D'une séance de deux heures sur Page Builder à deux jours de développement de gabarits.",
                    },
                    "variant": "split",
                    "height": "compact",
                    "imageDecorative": "true",
                },
                "image": "abstract-rose.jpg",
                "cta": {"page": "contact", "label": {"en": "Book a workshop", "fr": "Réserver un atelier"}},
            }
        ],
        "main": [
            {
                "name": "catalogue",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Workshop catalogue", "fr": "Catalogue des ateliers"},
                    "body": {
                        "en": "<p>Each workshop can be taken on its own or combined into a programme. Prices are per group "
                              "of up to eight people and are sent with the programme.</p>"
                              "<table><caption>Workshops available in 2026 and 2027</caption>"
                              "<thead><tr><th scope=\"col\">Workshop</th><th scope=\"col\">Duration</th>"
                              "<th scope=\"col\">Audience</th><th scope=\"col\">Level</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Page Builder essentials</td><td>2 hours</td><td>Editors</td><td>Beginner</td></tr>"
                              "<tr><td>Writing for the web</td><td>1 day</td><td>Editors, communication teams</td><td>Beginner</td></tr>"
                              "<tr><td>Accessible content</td><td>Half a day</td><td>Editors</td><td>Intermediate</td></tr>"
                              "<tr><td>Publishing in several languages</td><td>Half a day</td><td>Editors, translators</td><td>Intermediate</td></tr>"
                              "<tr><td>Site administration and themes</td><td>1 day</td><td>Administrators</td><td>Intermediate</td></tr>"
                              "<tr><td>Building a JavaScript template set</td><td>2 days</td><td>Developers</td><td>Advanced</td></tr>"
                              "</tbody></table>",
                        "fr": "<p>Chaque atelier se suit seul ou s'intègre à un parcours. Les tarifs s'entendent par groupe "
                              "de huit personnes au plus et sont envoyés avec le programme.</p>"
                              "<table><caption>Ateliers proposés en 2026 et 2027</caption>"
                              "<thead><tr><th scope=\"col\">Atelier</th><th scope=\"col\">Durée</th>"
                              "<th scope=\"col\">Public</th><th scope=\"col\">Niveau</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Les bases de Page Builder</td><td>2 heures</td><td>Rédacteurs</td><td>Débutant</td></tr>"
                              "<tr><td>Écrire pour le web</td><td>1 jour</td><td>Rédacteurs, équipes communication</td><td>Débutant</td></tr>"
                              "<tr><td>Des contenus accessibles</td><td>Une demi-journée</td><td>Rédacteurs</td><td>Intermédiaire</td></tr>"
                              "<tr><td>Publier en plusieurs langues</td><td>Une demi-journée</td><td>Rédacteurs, traducteurs</td><td>Intermédiaire</td></tr>"
                              "<tr><td>Administration du site et thèmes</td><td>1 jour</td><td>Administrateurs</td><td>Intermédiaire</td></tr>"
                              "<tr><td>Construire un jeu de gabarits JavaScript</td><td>2 jours</td><td>Développeurs</td><td>Avancé</td></tr>"
                              "</tbody></table>",
                    },
                    "width": "wide",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "formats",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Formats", "fr": "Formats"},
                    "body": {
                        "en": "<dl>"
                              "<dt>In our Lyon studio</dt><dd>Scheduled sessions open to several organisations, in our "
                              "training room on the Croix-Rousse plateau. Laptops are provided.</dd>"
                              "<dt>At your premises</dt><dd>A trainer comes to you, anywhere in France, Switzerland or "
                              "Belgium, for a group from your organisation only.</dd>"
                              "<dt>Online</dt><dd>Live sessions split into two-hour blocks, with a practice site each "
                              "participant keeps for a month.</dd>"
                              "<dt>Coaching</dt><dd>One-hour sessions for one or two people, booked as and when you need "
                              "them.</dd>"
                              "</dl>",
                        "fr": "<dl>"
                              "<dt>Dans notre studio lyonnais</dt><dd>Des sessions programmées, ouvertes à plusieurs "
                              "organisations, dans notre salle de formation du plateau de la Croix-Rousse. Les ordinateurs "
                              "sont fournis.</dd>"
                              "<dt>Dans vos locaux</dt><dd>Un formateur se déplace partout en France, en Suisse ou en "
                              "Belgique, pour un groupe de votre seule organisation.</dd>"
                              "<dt>À distance</dt><dd>Des sessions en direct découpées en blocs de deux heures, avec un site "
                              "d'entraînement que chaque participant garde un mois.</dd>"
                              "<dt>Accompagnement</dt><dd>Des séances d'une heure pour une ou deux personnes, réservées au fil "
                              "de vos besoins.</dd>"
                              "</dl>",
                    },
                    "width": "readable",
                    "ctplSurface": "sunken",
                },
            },
            {
                "name": "practical",
                "type": "ctpl:columns",
                "props": {
                    "jcr:title": {"en": "Practical details", "fr": "En pratique"},
                    "layout": "halves",
                    "gap": "medium",
                    "ctplSurface": "default",
                },
                "columns": {
                    "col1": [{
                        "name": "before",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Before the workshop", "fr": "Avant l'atelier"},
                            "body": {
                                "en": "<p>Two weeks ahead, the trainer calls the person who booked to learn about the site "
                                      "and the group. Participants receive an editor account and a short list of pages to "
                                      "bring.</p><p>Tell us about any accessibility needs when you book: we adapt the room, "
                                      "the materials and the pace.</p>",
                                "fr": "<p>Deux semaines avant, le formateur appelle la personne qui a réservé pour connaître le "
                                      "site et le groupe. Les participants reçoivent un compte rédacteur et une courte liste de "
                                      "pages à apporter.</p><p>Signalez-nous tout besoin d'accessibilité à la réservation : "
                                      "nous adaptons la salle, les supports et le rythme.</p>",
                            },
                        },
                    }],
                    "col2": [{
                        "name": "after",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "After the workshop", "fr": "Après l'atelier"},
                            "body": {
                                "en": "<p>Each participant receives the slides, a one-page reminder and a certificate of "
                                      "attendance. For thirty days, questions sent to the trainer get an answer within two "
                                      "working days.</p><p>A satisfaction survey follows a week later; its results feed the "
                                      "next version of the workshop.</p>",
                                "fr": "<p>Chaque participant reçoit les supports, un aide-mémoire d'une page et une attestation "
                                      "de présence. Pendant trente jours, les questions envoyées au formateur reçoivent une "
                                      "réponse sous deux jours ouvrés.</p><p>Une enquête de satisfaction suit une semaine plus "
                                      "tard ; ses résultats nourrissent la version suivante de l'atelier.</p>",
                            },
                        },
                    }],
                },
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Found the right workshop?", "fr": "Vous avez trouvé votre atelier ?"},
                    "body": {
                        "en": "<p>Tell us which workshop, how many people and the dates you have in mind: we confirm within one working day.</p>",
                        "fr": "<p>Indiquez-nous l'atelier, le nombre de participants et les dates envisagées : nous confirmons sous un jour ouvré.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Book a workshop", "fr": "Réserver un atelier"}},
            },
        ],
    },

    # ---- Services > Support ---------------------------------------------------------------
    "services/support": {
        "hero": [
            {
                "name": "banner",
                "type": "ctpl:heroBanner",
                "props": {
                    "jcr:title": {"en": "Support from people who know your site", "fr": "Une assistance qui connaît votre site"},
                    "eyebrow": {"en": "Support", "fr": "Assistance"},
                    "subtitle": {
                        "en": "One named contact, clear response times, and engineers who worked on your project.",
                        "fr": "Un interlocuteur attitré, des délais de réponse clairs, et des ingénieurs qui ont travaillé sur votre projet.",
                    },
                    "variant": "image",
                    "overlay": "medium",
                    "height": "medium",
                    "imageDecorative": "true",
                },
                "image": "abstract-slate.jpg",
                "cta": {"page": "contact", "label": {"en": "Choose a plan", "fr": "Choisir une formule"}},
            }
        ],
        "main": [
            {
                "name": "levels",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Service levels", "fr": "Niveaux de service"},
                    "body": {
                        "en": "<p>Three plans, all with the same team. They differ in the hours covered, the response times "
                              "and the time included each month for small changes.</p>"
                              "<table><caption>Support plans and their commitments</caption>"
                              "<thead><tr><th scope=\"col\">Commitment</th><th scope=\"col\">Essential</th>"
                              "<th scope=\"col\">Standard</th><th scope=\"col\">Premium</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Hours covered</td><td>Weekdays, 9:00 to 18:00</td><td>Weekdays, 8:00 to 20:00</td><td>Weekdays, 8:00 to 20:00, plus 24/7 for critical incidents</td></tr>"
                              "<tr><td>First response to a critical incident</td><td>4 working hours</td><td>2 hours</td><td>1 hour</td></tr>"
                              "<tr><td>First response to other requests</td><td>2 working days</td><td>1 working day</td><td>4 working hours</td></tr>"
                              "<tr><td>Named contact</td><td>No</td><td>Yes</td><td>Yes</td></tr>"
                              "<tr><td>Small changes included each month</td><td>None</td><td>4 hours</td><td>10 hours</td></tr>"
                              "<tr><td>Workshop seats included each year</td><td>1</td><td>3</td><td>6</td></tr>"
                              "</tbody></table>",
                        "fr": "<p>Trois formules, toutes avec la même équipe. Elles diffèrent par les horaires couverts, les "
                              "délais de réponse et le temps inclus chaque mois pour les petites évolutions.</p>"
                              "<table><caption>Formules d'assistance et leurs engagements</caption>"
                              "<thead><tr><th scope=\"col\">Engagement</th><th scope=\"col\">Essentielle</th>"
                              "<th scope=\"col\">Standard</th><th scope=\"col\">Premium</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Horaires couverts</td><td>Jours ouvrés, 9 h à 18 h</td><td>Jours ouvrés, 8 h à 20 h</td><td>Jours ouvrés, 8 h à 20 h, et 24 h/24 pour les incidents critiques</td></tr>"
                              "<tr><td>Première réponse à un incident critique</td><td>4 heures ouvrées</td><td>2 heures</td><td>1 heure</td></tr>"
                              "<tr><td>Première réponse aux autres demandes</td><td>2 jours ouvrés</td><td>1 jour ouvré</td><td>4 heures ouvrées</td></tr>"
                              "<tr><td>Interlocuteur attitré</td><td>Non</td><td>Oui</td><td>Oui</td></tr>"
                              "<tr><td>Petites évolutions incluses chaque mois</td><td>Aucune</td><td>4 heures</td><td>10 heures</td></tr>"
                              "<tr><td>Places d'atelier incluses chaque année</td><td>1</td><td>3</td><td>6</td></tr>"
                              "</tbody></table>",
                    },
                    "width": "wide",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "response",
                "type": "ctpl:keyFigures",
                "props": {
                    "jcr:title": {"en": "Response times", "fr": "Délais de réponse"},
                    "introText": {
                        "en": "What our support desk achieved over the last twelve months.",
                        "fr": "Ce que notre service d'assistance a tenu sur les douze derniers mois.",
                    },
                    "ctplSurface": "sunken",
                },
                "children": [
                    {"name": "critical", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "38 min", "fr": "38 min"},
                        "label": {"en": "average first response to critical incidents", "fr": "de première réponse moyenne aux incidents critiques"},
                        "detail": {"en": "October 2025 to September 2026", "fr": "Octobre 2025 à septembre 2026"}}},
                    {"name": "on-time", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "96%", "fr": "96 %"},
                        "label": {"en": "of requests answered within the plan's time", "fr": "de demandes traitées dans le délai de la formule"},
                        "detail": {"en": "All plans", "fr": "Toutes formules"}}},
                    {"name": "on-call", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "24/7", "fr": "24 h/24"},
                        "label": {"en": "on-call line for critical incidents", "fr": "ligne d'astreinte pour les incidents critiques"},
                        "detail": {"en": "Premium plan", "fr": "Formule Premium"}}},
                    {"name": "desk", "type": "ctpl:keyFigure", "props": {
                        "value": {"en": "6", "fr": "6"},
                        "label": {"en": "engineers on the support desk", "fr": "ingénieurs au service d'assistance"}}},
                ],
            },
            {
                "name": "scope",
                "type": "ctpl:columns",
                "props": {
                    "jcr:title": {"en": "What support covers", "fr": "Ce que couvre l'assistance"},
                    "layout": "halves",
                    "gap": "large",
                    "ctplSurface": "default",
                },
                "columns": {
                    "col1": [{
                        "name": "included",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Included", "fr": "Inclus"},
                            "body": {
                                "en": "<ul><li>Fixing defects in the templates and components we delivered</li>"
                                      "<li>Help for editors on how to do something in Page Builder or jContent</li>"
                                      "<li>Module updates and Jahia patch releases, tested on a copy of your site first</li>"
                                      "<li>Monitoring of availability and certificate expiry</li>"
                                      "<li>A monthly report of requests, times and open topics</li></ul>",
                                "fr": "<ul><li>La correction des anomalies des gabarits et composants que nous avons livrés</li>"
                                      "<li>L'aide aux rédacteurs pour réaliser une action dans Page Builder ou jContent</li>"
                                      "<li>Les mises à jour des modules et les correctifs de Jahia, testés d'abord sur une copie "
                                      "de votre site</li>"
                                      "<li>La surveillance de la disponibilité et de l'expiration des certificats</li>"
                                      "<li>Un rapport mensuel des demandes, des délais et des sujets en cours</li></ul>",
                            },
                        },
                    }],
                    "col2": [{
                        "name": "excluded",
                        "type": "ctpl:richText",
                        "props": {
                            "jcr:title": {"en": "Not included", "fr": "Non inclus"},
                            "body": {
                                "en": "<ul><li>New components or page templates: we quote them as small projects</li>"
                                      "<li>Writing or translating content on your behalf</li>"
                                      "<li>Code written by another provider, until we have reviewed it</li>"
                                      "<li>Major Jahia version upgrades, planned as a project of their own</li></ul>"
                                      "<p>When a request falls outside the plan, we say so before starting and send an estimate.</p>",
                                "fr": "<ul><li>Les nouveaux composants ou gabarits de page : nous les chiffrons comme de petits "
                                      "projets</li>"
                                      "<li>La rédaction ou la traduction de contenus à votre place</li>"
                                      "<li>Le code écrit par un autre prestataire, tant que nous ne l'avons pas relu</li>"
                                      "<li>Les montées de version majeures de Jahia, planifiées comme un projet à part</li></ul>"
                                      "<p>Quand une demande sort de la formule, nous le disons avant de commencer et envoyons une "
                                      "estimation.</p>",
                            },
                        },
                    }],
                },
            },
            {
                "name": "client",
                "type": "ctpl:quote",
                "props": {
                    "quote": {
                        "en": "Our site went down on a Sunday night before a product launch. Someone who knew our setup answered in twenty minutes.",
                        "fr": "Notre site est tombé un dimanche soir, la veille d'un lancement. Quelqu'un qui connaissait notre installation a répondu en vingt minutes.",
                    },
                    "author": "Pierre Garcia",
                    "authorRole": {"en": "IT manager, an outdoor equipment maker", "fr": "Responsable informatique, un fabricant d'équipement de plein air"},
                    "variant": "standard",
                    "ctplSurface": "sunken",
                },
            },
            {
                "name": "talk",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Which plan fits your site?", "fr": "Quelle formule pour votre site ?"},
                    "body": {
                        "en": "<p>Tell us how many editors you have and how critical the site is to your business: we recommend a plan, and you can change it every year.</p>",
                        "fr": "<p>Dites-nous combien de rédacteurs vous avez et quelle place le site tient dans votre activité : nous vous conseillons une formule, modifiable chaque année.</p>",
                    },
                    "ctplSurface": "accent",
                },
                "cta": {"page": "contact", "label": {"en": "Get a recommendation", "fr": "Obtenir un conseil"}},
            },
        ],
    },

    # ---- Privacy policy -------------------------------------------------------------------
    "privacy": {
        "hero": [],
        "main": [
            {
                "name": "who",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Who we are", "fr": "Qui sommes-nous"},
                    "body": {
                        "en": "<p>This is an example privacy policy, written for a fictional company and to be replaced by "
                              "each organisation's own policy. It explains how Classic Dev handles the personal data it "
                              "collects through this website, in accordance with the General Data Protection Regulation (GDPR) "
                              "and the French Data Protection Act.</p>"
                              "<p>The data controller is Classic Dev, 27 rue des Tisseurs-Bleus, 69004 Lyon, France. The "
                              "website is hosted in the European Union, and no personal data collected on it leaves the "
                              "European Union.</p>",
                        "fr": "<p>Ceci est une politique de confidentialité d'exemple, rédigée pour une société fictive, que "
                              "chaque organisation remplace par la sienne. Elle explique comment Classic Dev traite les données "
                              "personnelles recueillies sur ce site, conformément au Règlement général sur la protection des "
                              "données (RGPD) et à la loi Informatique et Libertés.</p>"
                              "<p>Le responsable du traitement est Classic Dev, 27 rue des Tisseurs-Bleus, 69004 Lyon. Le site "
                              "est hébergé dans l'Union européenne, et aucune donnée personnelle recueillie sur le site ne quitte "
                              "l'Union européenne.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "data",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Data we collect and why", "fr": "Données recueillies et finalités"},
                    "body": {
                        "en": "<h2>The contact form</h2>"
                              "<p>The only personal data this site collects is what you type in the contact form: your name, "
                              "your e-mail address, and the message you write, plus your organisation and phone number if you "
                              "choose to give them. We do not buy, rent or enrich this data from other sources.</p>"
                              "<h2>Purposes and legal basis</h2>"
                              "<table><caption>Why we use your data and on what basis</caption>"
                              "<thead><tr><th scope=\"col\">Purpose</th><th scope=\"col\">Legal basis</th>"
                              "<th scope=\"col\">Retention</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Answering your message</td><td>Steps taken at your request before a contract</td><td>3 years after our last exchange</td></tr>"
                              "<tr><td>Registering you for a workshop you asked for</td><td>Performance of a contract</td><td>Duration of the contract, then 5 years</td></tr>"
                              "<tr><td>Keeping a record of requests to defend our rights</td><td>Legitimate interest</td><td>5 years</td></tr>"
                              "</tbody></table>"
                              "<p>We never use the form data to send you a newsletter or commercial offers you did not ask for. "
                              "Only the members of our team who answer your request can read it.</p>",
                        "fr": "<h2>Le formulaire de contact</h2>"
                              "<p>Les seules données personnelles recueillies par ce site sont celles que vous saisissez dans le "
                              "formulaire de contact : votre nom, votre adresse e-mail et votre message, ainsi que votre "
                              "organisation et votre numéro de téléphone si vous choisissez de les indiquer. Nous n'achetons, ne "
                              "louons ni n'enrichissons ces données auprès d'autres sources.</p>"
                              "<h2>Finalités et bases légales</h2>"
                              "<table><caption>Pourquoi nous utilisons vos données et sur quelle base</caption>"
                              "<thead><tr><th scope=\"col\">Finalité</th><th scope=\"col\">Base légale</th>"
                              "<th scope=\"col\">Durée de conservation</th></tr></thead>"
                              "<tbody>"
                              "<tr><td>Répondre à votre message</td><td>Mesures précontractuelles prises à votre demande</td><td>3 ans après notre dernier échange</td></tr>"
                              "<tr><td>Vous inscrire à un atelier demandé</td><td>Exécution d'un contrat</td><td>Durée du contrat, puis 5 ans</td></tr>"
                              "<tr><td>Garder trace des demandes pour défendre nos droits</td><td>Intérêt légitime</td><td>5 ans</td></tr>"
                              "</tbody></table>"
                              "<p>Nous n'utilisons jamais les données du formulaire pour vous envoyer une lettre d'information ou "
                              "des offres commerciales que vous n'avez pas demandées. Seuls les membres de l'équipe qui traitent "
                              "votre demande peuvent la lire.</p>",
                    },
                    "width": "wide",
                    "ctplSurface": "sunken",
                },
            },
            {
                "name": "rights",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Your rights", "fr": "Vos droits"},
                    "body": {
                        "en": "<p>You can at any time exercise the following rights on the data we hold about you:</p>"
                              "<ul><li>access your data and obtain a copy;</li><li>have it corrected or completed;</li>"
                              "<li>have it erased;</li><li>restrict or object to its processing;</li>"
                              "<li>receive it in a portable format;</li>"
                              "<li>give instructions on what happens to it after your death.</li></ul>"
                              "<p>Write to our data protection officer, Nadia Lambert, at dpo@classic-dev.example or by post "
                              "to Classic Dev, Data protection officer, 27 rue des Tisseurs-Bleus, 69004 Lyon. We answer within "
                              "one month. If you believe your rights are not respected, you can lodge a complaint with the "
                              "CNIL, the French data protection authority.</p>",
                        "fr": "<p>Vous pouvez à tout moment exercer les droits suivants sur les données que nous détenons "
                              "à votre sujet :</p>"
                              "<ul><li>y accéder et en obtenir une copie ;</li><li>les faire rectifier ou compléter ;</li>"
                              "<li>les faire effacer ;</li><li>en limiter le traitement ou vous y opposer ;</li>"
                              "<li>les recevoir dans un format portable ;</li>"
                              "<li>définir des directives sur leur sort après votre décès.</li></ul>"
                              "<p>Écrivez à notre déléguée à la protection des données, Nadia Lambert, à dpo@classic-dev.example "
                              "ou par courrier à Classic Dev, Déléguée à la protection des données, 27 rue des Tisseurs-Bleus, "
                              "69004 Lyon. Nous répondons sous un mois. Si vous estimez que vos droits ne sont pas respectés, "
                              "vous pouvez adresser une réclamation à la CNIL.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "cookies",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Cookies", "fr": "Cookies"},
                    "body": {
                        "en": "<p>This site sets no tracking cookie, no advertising cookie and no audience measurement "
                              "cookie, and it embeds no social network button that would set one. That is why it shows no "
                              "cookie banner.</p>"
                              "<p>The only cookies used are strictly necessary for the site to work: a session cookie while "
                              "you send the contact form, and the sign-in cookie of our own editors. They are deleted when "
                              "you close your browser.</p>"
                              "<p><strong>Last update:</strong> 30 September 2026.</p>",
                        "fr": "<p>Ce site ne dépose aucun cookie de suivi, de publicité ou de mesure d'audience, et n'intègre "
                              "aucun bouton de réseau social qui en déposerait. C'est pourquoi il n'affiche pas de bandeau de "
                              "cookies.</p>"
                              "<p>Les seuls cookies utilisés sont strictement nécessaires au fonctionnement du site : un cookie "
                              "de session pendant l'envoi du formulaire de contact, et le cookie de connexion de nos propres "
                              "rédacteurs. Ils sont supprimés à la fermeture de votre navigateur.</p>"
                              "<p><strong>Dernière mise à jour :</strong> 30 septembre 2026.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "sunken",
                },
            },
        ],
    },

    # ---- About us > Our team (new sections only) -------------------------------------------
    "about/team": {
        "main": [
            {
                "name": "people",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Forty people, one studio", "fr": "Quarante personnes, un studio"},
                    "body": {
                        "en": "<p>Content strategists, designers, editors, engineers, trainers and support engineers, all "
                              "working from the same studio in Lyon. Every project team mixes at least three of these "
                              "trades, and the people who build your site are the ones who train your editors and answer "
                              "your support requests.</p>"
                              "<p>Here are some of the faces you are likely to meet first.</p>",
                        "fr": "<p>Stratèges de contenu, designers, rédacteurs, ingénieurs, formateurs et ingénieurs "
                              "d'assistance, tous réunis dans le même studio à Lyon. Chaque équipe projet mêle au moins trois "
                              "de ces métiers, et ceux qui construisent votre site sont aussi ceux qui forment vos rédacteurs "
                              "et répondent à vos demandes d'assistance.</p>"
                              "<p>Voici quelques-uns des visages que vous rencontrerez sans doute en premier.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "members",
                "type": "ctpl:cardGrid",
                "props": {
                    "jcr:title": {"en": "Who you will work with", "fr": "Avec qui vous travaillerez"},
                    "columns": "3",
                    "ctplSurface": "sunken",
                },
                "children": [
                    {"name": "ada-martin", "type": "ctpl:card", "image": "abstract-violet.jpg", "props": {
                        "jcr:title": {"en": "Ada Martin", "fr": "Ada Martin"},
                        "text": {"en": "Co-founder, content strategy. Former newspaper web editor, she leads every audit.",
                                 "fr": "Cofondatrice, stratégie de contenu. Ancienne rédactrice web de presse, elle mène chaque audit."}}},
                    {"name": "thomas-garnier", "type": "ctpl:card", "image": "abstract-slate.jpg", "props": {
                        "jcr:title": {"en": "Thomas Garnier", "fr": "Thomas Garnier"},
                        "text": {"en": "Co-founder, technical director. He reviews every component before it reaches a client.",
                                 "fr": "Cofondateur, directeur technique. Il relit chaque composant avant qu'il n'arrive chez un client."}}},
                    {"name": "nora-haddad", "type": "ctpl:card", "image": "abstract-rose.jpg", "props": {
                        "jcr:title": {"en": "Nora Haddad", "fr": "Nora Haddad"},
                        "text": {"en": "Lead designer. She designs themes that stay readable in light and dark.",
                                 "fr": "Directrice artistique. Elle dessine des thèmes qui restent lisibles en clair comme en sombre."}}},
                    {"name": "louis-bernard", "type": "ctpl:card", "image": "abstract-sand.jpg", "props": {
                        "jcr:title": {"en": "Louis Bernard", "fr": "Louis Bernard"},
                        "text": {"en": "Editor and technical writer. He writes our guides in French and English.",
                                 "fr": "Rédacteur et rédacteur technique. Il écrit nos guides en français et en anglais."}}},
                    {"name": "camille-roche", "type": "ctpl:card", "image": "abstract-gold.jpg", "props": {
                        "jcr:title": {"en": "Camille Roche", "fr": "Camille Roche"},
                        "text": {"en": "Training lead. She has run more than two hundred editor workshops since 2018.",
                                 "fr": "Responsable formation. Elle a animé plus de deux cents ateliers rédacteurs depuis 2018."}}},
                    {"name": "karim-benali", "type": "ctpl:card", "image": "abstract-teal.jpg", "props": {
                        "jcr:title": {"en": "Karim Benali", "fr": "Karim Benali"},
                        "text": {"en": "Support manager. His team answers the on-call line, weekends included.",
                                 "fr": "Responsable de l'assistance. Son équipe tient la ligne d'astreinte, week-ends compris."}}},
                ],
            },
        ],
    },

    # ---- Contact (new sections only, placed before the existing form) -----------------------
    "contact": {
        "main": [
            {
                "name": "visit",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Visit or call us", "fr": "Nous rendre visite ou nous appeler"},
                    "body": {
                        "en": "<h2>Address</h2>"
                              "<p>Classic Dev<br>27 rue des Tisseurs-Bleus<br>69004 Lyon<br>France</p>"
                              "<h2>Phone and e-mail</h2>"
                              "<p>Phone: +33 4 00 00 00 00<br>E-mail: hello@classic-dev.example</p>"
                              "<h2>Opening hours</h2>"
                              "<p>Monday to Friday, 9:00 to 18:00. The studio is closed on public holidays. Support clients "
                              "on the Premium plan reach the on-call line at any time with the number given in their "
                              "contract.</p>"
                              "<h2>Getting here</h2>"
                              "<ul><li><strong>Metro:</strong> line C to Croix-Rousse, then five minutes on foot.</li>"
                              "<li><strong>Bus:</strong> lines C13 and 38, stop Croix-Rousse.</li>"
                              "<li><strong>Train:</strong> from Lyon Part-Dieu station, allow about 25 minutes by metro.</li>"
                              "<li><strong>Bike:</strong> a bike-share station and bike racks are at the corner of the street.</li>"
                              "<li><strong>Car:</strong> street parking is rare on the plateau; we recommend public transport.</li></ul>"
                              "<p>The studio is on the ground floor, with step-free access and an accessible toilet. Ring the "
                              "bell marked Classic Dev.</p>",
                        "fr": "<h2>Adresse</h2>"
                              "<p>Classic Dev<br>27 rue des Tisseurs-Bleus<br>69004 Lyon<br>France</p>"
                              "<h2>Téléphone et e-mail</h2>"
                              "<p>Téléphone : +33 4 00 00 00 00<br>E-mail : hello@classic-dev.example</p>"
                              "<h2>Horaires</h2>"
                              "<p>Du lundi au vendredi, de 9 h à 18 h. Le studio est fermé les jours fériés. Les clients de la "
                              "formule d'assistance Premium joignent la ligne d'astreinte à toute heure au numéro indiqué dans "
                              "leur contrat.</p>"
                              "<h2>Venir au studio</h2>"
                              "<ul><li><strong>Métro :</strong> ligne C jusqu'à Croix-Rousse, puis cinq minutes à pied.</li>"
                              "<li><strong>Bus :</strong> lignes C13 et 38, arrêt Croix-Rousse.</li>"
                              "<li><strong>Train :</strong> depuis la gare de Lyon Part-Dieu, comptez environ 25 minutes en métro.</li>"
                              "<li><strong>Vélo :</strong> une station Vélo'v et des arceaux se trouvent au coin de la rue.</li>"
                              "<li><strong>Voiture :</strong> le stationnement est rare sur le plateau ; nous conseillons les transports en commun.</li></ul>"
                              "<p>Le studio est de plain-pied, avec un accès sans marche et des toilettes accessibles. Sonnez à "
                              "Classic Dev.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "default",
                },
            },
            {
                "name": "before-writing",
                "type": "ctpl:richText",
                "props": {
                    "jcr:title": {"en": "Before you write", "fr": "Avant de nous écrire"},
                    "body": {
                        "en": "<p>We answer every message within one working day. To help us send the right person, tell us "
                              "the address of your current site if you have one, the number of editors, the languages you "
                              "publish in, and when you would like to start.</p>",
                        "fr": "<p>Nous répondons à chaque message sous un jour ouvré. Pour que la bonne personne vous réponde, "
                              "indiquez l'adresse de votre site actuel s'il existe, le nombre de rédacteurs, les langues de "
                              "publication et la date à laquelle vous souhaitez commencer.</p>",
                    },
                    "width": "readable",
                    "ctplSurface": "sunken",
                },
            },
        ],
    },
}

# ---------------------------------------------------------------------------------------------
# 4. News bodies
# ---------------------------------------------------------------------------------------------
NEWS_BODIES = {
    "launch": {
        "en": "<p>After two years of client projects, we are publishing the template set we build our sites with. The "
              "classic templates give a Jahia site a header, a three-level menu, a footer and a set of page sections "
              "that editors combine freely in Page Builder.</p>"
              "<h2>What is inside</h2>"
              "<ul><li>Hero banners, image and text, rich text, columns and free zones</li>"
              "<li>Card grids, key figures and quotes</li>"
              "<li>News items, articles and automatic content lists</li>"
              "<li>A site map and a language switcher</li></ul>"
              "<p>Every text, image and link comes from content, and every colour comes from the theme. Administrators "
              "switch the whole site to another theme, or to dark mode, from its settings.</p>"
              "<p>The template set is installed on every new site we build from this autumn. Existing clients can move "
              "to it during their next redesign: ask your contact for a migration estimate.</p>",
        "fr": "<p>Après deux ans de projets clients, nous publions le jeu de gabarits avec lequel nous construisons nos "
              "sites. Les classic templates apportent à un site Jahia un en-tête, un menu sur trois niveaux, un pied de "
              "page et un ensemble de sections que les rédacteurs combinent librement dans Page Builder.</p>"
              "<h2>Ce qu'il contient</h2>"
              "<ul><li>Bannières, image et texte, texte riche, colonnes et zones libres</li>"
              "<li>Grilles de cartes, chiffres clés et citations</li>"
              "<li>Actualités, articles et listes de contenus automatiques</li>"
              "<li>Un plan du site et un sélecteur de langue</li></ul>"
              "<p>Chaque texte, image et lien vient du contenu, et chaque couleur vient du thème. Les administrateurs "
              "passent tout le site à un autre thème, ou en mode sombre, depuis ses réglages.</p>"
              "<p>Le jeu de gabarits équipe tous les nouveaux sites que nous construisons dès cet automne. Nos clients "
              "actuels peuvent l'adopter lors de leur prochaine refonte : demandez une estimation de migration à votre "
              "interlocuteur.</p>",
    },
    "dark-mode": {
        "en": "<p>Every theme of the classic templates now comes in a light and a dark version. By default the site "
              "follows the visitor's system setting: someone reading on a phone set to dark mode at night gets the dark "
              "version without doing anything.</p>"
              "<p>Administrators can also force one of the two from the site settings, for a brand that is always dark or "
              "an intranet that must stay light. The choice applies to every page at once, with no change to any "
              "component.</p>"
              "<p>Dark mode is not an inverted colour filter. Nora Haddad and the design team chose each colour of the "
              "dark palettes by hand, and the contrast of every text is checked against WCAG AA in both versions of "
              "every theme.</p>"
              "<p>One thing to prepare: if your logo is dark, upload a light version in the header settings. It is shown "
              "automatically when the site displays in dark mode.</p>",
        "fr": "<p>Chaque thème des classic templates existe désormais en version claire et en version sombre. Par "
              "défaut, le site suit le réglage du système du visiteur : quelqu'un qui lit le soir sur un téléphone en mode "
              "sombre obtient la version sombre sans rien faire.</p>"
              "<p>Les administrateurs peuvent aussi imposer l'une des deux depuis les réglages du site, pour une marque "
              "toujours sombre ou un intranet qui doit rester clair. Le choix s'applique à toutes les pages d'un coup, "
              "sans modifier aucun composant.</p>"
              "<p>Le mode sombre n'est pas un filtre qui inverse les couleurs. Nora Haddad et l'équipe design ont choisi à "
              "la main chaque couleur des palettes sombres, et le contraste de chaque texte est vérifié au niveau AA des "
              "WCAG dans les deux versions de chaque thème.</p>"
              "<p>Un point à préparer : si votre logo est foncé, déposez-en une version claire dans les réglages de "
              "l'en-tête. Elle s'affiche automatiquement quand le site passe en mode sombre.</p>",
    },
    "accessibility": {
        "en": "<p>Before this release, every page of the site was run through the full axe rule set, in each theme, in "
              "light and dark mode, on a desktop screen and at 320 pixels wide. No violation remains, at any severity.</p>"
              "<p>Automated tools only catch part of the problems, so the team also reviewed the RGAA criteria by hand: "
              "keyboard navigation, visible focus, text spacing, zoom to 200%, reflow on small screens and pages with "
              "styles turned off. Our internal audit of 30 September 2026 found 94% of the applicable criteria met.</p>"
              "<h2>What is left to do</h2>"
              "<ul><li>Test with screen readers: NVDA with Firefox, and VoiceOver with Safari</li>"
              "<li>Replace the image titles used as text alternatives with descriptions written for each use</li></ul>"
              "<p>The details are in the accessibility statement, linked from the footer of every page. If something on "
              "the site does not work for you, tell us: we will send you the content in another form.</p>",
        "fr": "<p>Avant cette version, chaque page du site a été passée à l'ensemble des règles axe, dans chaque thème, "
              "en mode clair et sombre, sur un écran de bureau et sur 320 pixels de large. Il ne reste aucune violation, "
              "quel que soit son niveau de gravité.</p>"
              "<p>Les outils automatiques ne détectent qu'une partie des problèmes : l'équipe a donc aussi revu les "
              "critères du RGAA à la main. Navigation au clavier, focus visible, espacement du texte, zoom à 200 %, "
              "affichage sur petit écran et pages sans styles. Notre audit interne du 30 septembre 2026 relève 94 % des "
              "critères applicables respectés.</p>"
              "<h2>Ce qu'il reste à faire</h2>"
              "<ul><li>Tester avec des lecteurs d'écran : NVDA avec Firefox, et VoiceOver avec Safari</li>"
              "<li>Remplacer les titres d'images utilisés comme alternatives textuelles par des descriptions rédigées "
              "pour chaque usage</li></ul>"
              "<p>Le détail figure dans la déclaration d'accessibilité, accessible depuis le pied de chaque page. Si un "
              "élément du site ne fonctionne pas pour vous, dites-le-nous : nous vous transmettrons le contenu sous une "
              "autre forme.</p>",
    },
    "french": {
        "en": "<p>The site is now fully bilingual: every page, menu entry, button, link and message exists in English "
              "and French. Visitors switch language from the header and land on the same page in the other language.</p>"
              "<p>Being bilingual goes further than translated labels. Link targets are set per language, so a French "
              "button can point to a French page and an English one to its English version. Quotation marks follow the "
              "language of the page, and figures are written the way each language writes them: 12,000 in English, "
              "12 000 in French.</p>"
              "<p>The language switcher only offers a language once the current page is translated into it, so nobody "
              "clicks through to an empty page. In edit mode, a hint shows editors which buttons still lack a target in "
              "the language they are working in.</p>"
              "<p>Louis Bernard wrote both versions of this site's texts himself, rather than translating one from the "
              "other. It takes a little longer, and reads much better.</p>",
        "fr": "<p>Le site est désormais entièrement bilingue : chaque page, entrée de menu, bouton, lien et message "
              "existe en anglais et en français. Les visiteurs changent de langue depuis l'en-tête et arrivent sur la "
              "même page dans l'autre langue.</p>"
              "<p>Être bilingue va plus loin que des libellés traduits. Les cibles des liens se règlent par langue : un "
              "bouton français peut mener à une page française et son équivalent anglais à la version anglaise. Les "
              "guillemets suivent la langue de la page, et les nombres s'écrivent comme chaque langue les écrit : 12,000 "
              "en anglais, 12 000 en français.</p>"
              "<p>Le sélecteur de langue ne propose une langue que lorsque la page courante y est traduite : personne "
              "n'arrive sur une page vide. En mode édition, un message signale aux rédacteurs les boutons qui n'ont pas "
              "encore de cible dans la langue en cours.</p>"
              "<p>Louis Bernard a écrit lui-même les deux versions des textes de ce site, plutôt que de traduire l'une à "
              "partir de l'autre. C'est un peu plus long, et cela se lit beaucoup mieux.</p>",
    },
    "columns": {
        "en": "<p>Editors often change their mind about a layout: four columns become two on a second read, then three "
              "when a new offer arrives. With most page builders, content in the columns that disappear is lost along the "
              "way.</p>"
              "<p>In the classic templates, every columns row always has four columns. The layout you pick only decides "
              "how many of them are shown, starting from the first. Switch from four to two and the third and fourth "
              "columns keep their content, hidden; switch back and it reappears exactly as it was.</p>"
              "<h2>Five layouts</h2>"
              "<ul><li>Two, three or four equal columns</li>"
              "<li>A wide column then a narrow one</li>"
              "<li>A narrow column then a wide one</li></ul>"
              "<p>One habit to keep: before handing a page over, check that no forgotten text waits in a hidden column. "
              "It will not show on the site, but it will come back the day someone picks four columns again.</p>",
        "fr": "<p>Les rédacteurs changent souvent d'avis sur une mise en page : quatre colonnes deviennent deux à la "
              "relecture, puis trois quand une nouvelle offre arrive. Avec la plupart des outils de mise en page, le "
              "contenu des colonnes qui disparaissent se perd en chemin.</p>"
              "<p>Dans les classic templates, chaque rangée de colonnes compte toujours quatre colonnes. La disposition "
              "choisie décide seulement combien sont affichées, en partant de la première. Passez de quatre à deux : la "
              "troisième et la quatrième gardent leur contenu, masqué. Revenez en arrière : il réapparaît tel quel.</p>"
              "<h2>Cinq dispositions</h2>"
              "<ul><li>Deux, trois ou quatre colonnes égales</li>"
              "<li>Une colonne large puis une étroite</li>"
              "<li>Une colonne étroite puis une large</li></ul>"
              "<p>Une habitude à garder : avant de livrer une page, vérifiez qu'aucun texte oublié n'attend dans une "
              "colonne masquée. Il ne s'affiche pas sur le site, mais il reviendra le jour où quelqu'un choisira de "
              "nouveau quatre colonnes.</p>",
    },
    "workshop": {
        "en": "<p>Our autumn editor workshop takes place on Thursday 15 October 2026, from 9:30 to 11:30, in our Lyon "
              "studio and online at the same time. In two hours, Camille Roche takes you from an empty page to a "
              "complete, published one, built with the classic templates.</p>"
              "<h2>Programme</h2>"
              "<ul><li>Adding and ordering sections in Page Builder</li>"
              "<li>Hero banners, cards and calls to action that work in both languages</li>"
              "<li>Images and their text alternatives</li>"
              "<li>Previewing, publishing and checking the page in the other language</li></ul>"
              "<p>The workshop is open to editors of any site built on the classic templates, beginners included. Each "
              "participant works on a practice site of their own, which stays available for a month afterwards.</p>"
              "<p>There are eight seats. Seats are included in the Standard and Premium support plans; to book one, "
              "write to us from the contact page with your name and the site you work on.</p>",
        "fr": "<p>Notre atelier rédacteurs d'automne a lieu le jeudi 15 octobre 2026, de 9 h 30 à 11 h 30, dans notre "
              "studio lyonnais et à distance en même temps. En deux heures, Camille Roche vous mène d'une page vide à "
              "une page complète et publiée, construite avec les classic templates.</p>"
              "<h2>Au programme</h2>"
              "<ul><li>Ajouter et ordonner des sections dans Page Builder</li>"
              "<li>Bannières, cartes et boutons d'action qui fonctionnent dans les deux langues</li>"
              "<li>Les images et leurs alternatives textuelles</li>"
              "<li>Prévisualiser, publier et vérifier la page dans l'autre langue</li></ul>"
              "<p>L'atelier est ouvert aux rédacteurs de tout site construit avec les classic templates, débutants "
              "compris. Chaque participant travaille sur son propre site d'entraînement, qui reste disponible un mois "
              "après la séance.</p>"
              "<p>Huit places sont proposées. Elles sont incluses dans les formules d'assistance Standard et Premium ; "
              "pour en réserver une, écrivez-nous depuis la page de contact avec votre nom et le site sur lequel vous "
              "travaillez.</p>",
    },
}

# ---------------------------------------------------------------------------------------------
# 5. Article bodies
# ---------------------------------------------------------------------------------------------
ARTICLE_BODIES = {
    "contract": {
        "en": "<p>Every site we build rests on an agreement that nobody signs. Developers deliver templates, editors fill "
              "them in, and for a few months everyone is happy. Then an editor needs to change a button label, finds it "
              "hardcoded, and opens a ticket. The agreement was there all along; it was simply never written down.</p>"
              "<p>We now write it down. A template set is a contract between developers and editors, and ours holds two "
              "promises.</p>"
              "<h2>The two promises</h2>"
              "<p>The first promise is that every visible string is content. If a visitor can read it, an editor can "
              "change it, in every language of the site: headings, button labels, the footer tagline, even the text that "
              "shows when a list is empty. Nothing a visitor reads lives in the code.</p>"
              "<p>The second promise is that every colour is a token. Components never say \"dark blue\"; they say "
              "\"text\", \"surface\" or \"accent\", and the theme decides what those mean. A new theme, or dark mode, is a "
              "set of new values for the same names, and no component changes.</p>"
              "<h2>What editors get in return</h2>"
              "<p>In exchange, editors work with a small, stable vocabulary of sections they can combine on any page:</p>"
              "<ul><li>hero banners and calls to action;</li><li>image and text, rich text and columns;</li>"
              "<li>card grids, key figures and quotes;</li><li>news items, articles and automatic lists.</li></ul>"
              "<p>They restyle the whole site from its settings, publish in two languages without asking anyone, and "
              "never wait for a deploy to fix a typo.</p>"
              "<h2>Where contracts break</h2>"
              "<p>Contracts rarely break loudly. They break with a \"Learn more\" left in English on a French page, a "
              "colour typed as a code that ignores dark mode, or a link pasted as an address that dies the day the page "
              "is renamed. Each one is small; together they are why sites become impossible to edit.</p>"
              "<blockquote>A rule nobody checks is only a wish.</blockquote>"
              "<p>So we check ours with scripts rather than good intentions. The build fails when a component style "
              "contains a literal colour, when a label has no French or English entry, or when a link is stored as plain "
              "text. The contract is also part of every handover: one page that tells editors what they can change, and "
              "developers what they must never hardcode.</p>",
        "fr": "<p>Chaque site que nous construisons repose sur un accord que personne ne signe. Les développeurs livrent "
              "des gabarits, les rédacteurs les remplissent, et pendant quelques mois tout le monde est content. Puis un "
              "rédacteur veut changer le libellé d'un bouton, découvre qu'il est écrit en dur, et ouvre un ticket. "
              "L'accord existait depuis le début ; il n'avait simplement jamais été écrit.</p>"
              "<p>Désormais, nous l'écrivons. Un jeu de gabarits est un contrat entre développeurs et rédacteurs, et le "
              "nôtre tient en deux promesses.</p>"
              "<h2>Les deux promesses</h2>"
              "<p>La première promesse : chaque texte visible est du contenu. Si un visiteur peut le lire, un rédacteur "
              "peut le modifier, dans chaque langue du site : titres, libellés de boutons, accroche du pied de page, et "
              "jusqu'au message affiché quand une liste est vide. Rien de ce que lit un visiteur ne vit dans le code.</p>"
              "<p>La seconde promesse : chaque couleur est un jeton. Les composants ne disent jamais « bleu foncé » ; ils "
              "disent « texte », « surface » ou « accent », et le thème décide de ce que cela signifie. Un nouveau thème, "
              "ou le mode sombre, n'est qu'un jeu de nouvelles valeurs pour les mêmes noms, sans toucher à aucun "
              "composant.</p>"
              "<h2>Ce que les rédacteurs y gagnent</h2>"
              "<p>En échange, les rédacteurs disposent d'un vocabulaire réduit et stable de sections à combiner sur "
              "n'importe quelle page :</p>"
              "<ul><li>bannières et boutons d'action ;</li><li>image et texte, texte riche et colonnes ;</li>"
              "<li>grilles de cartes, chiffres clés et citations ;</li><li>actualités, articles et listes "
              "automatiques.</li></ul>"
              "<p>Ils changent le style de tout le site depuis ses réglages, publient en deux langues sans rien demander "
              "à personne, et n'attendent jamais un déploiement pour corriger une coquille.</p>"
              "<h2>Là où les contrats se rompent</h2>"
              "<p>Les contrats se rompent rarement avec fracas. Ils cèdent sur un « En savoir plus » resté en anglais sur "
              "une page française, une couleur saisie en code qui ignore le mode sombre, ou un lien collé sous forme "
              "d'adresse qui meurt le jour où la page change de nom. Chaque écart est minime ; ensemble, ils expliquent "
              "pourquoi un site devient impossible à modifier.</p>"
              "<blockquote>Une règle que personne ne vérifie n'est qu'un souhait.</blockquote>"
              "<p>Nous vérifions donc la nôtre avec des scripts plutôt qu'avec de bonnes intentions. La construction "
              "échoue quand le style d'un composant contient une couleur en dur, quand un libellé n'a pas sa version "
              "française ou anglaise, ou quand un lien est stocké en simple texte. Le contrat fait aussi partie de chaque "
              "livraison : une page qui dit aux rédacteurs ce qu'ils peuvent changer, et aux développeurs ce qu'ils ne "
              "doivent jamais écrire en dur.</p>",
    },
    "tokens": {
        "en": "<p>I am an editor, not a developer. But the day I changed the look of an entire site in an afternoon, "
              "without asking anyone, I wanted to understand how it worked. The answer is a small idea called design "
              "tokens, arranged in three tiers.</p>"
              "<p>A token is simply a named value: a colour, a size, a spacing, a font. What makes them useful is not the "
              "values but the way the names are organised.</p>"
              "<h2>Tier one: primitives</h2>"
              "<p>Primitives are the raw palette of a theme: a slate grey in ten shades, a teal, a clay red, a spacing "
              "scale, a set of font sizes. Their names describe what they are, such as \"slate 900\" or \"space 4\". They "
              "say nothing about where they are used, and no component is allowed to read them.</p>"
              "<h2>Tier two: semantic roles</h2>"
              "<p>The middle tier gives each value a job. Instead of \"slate 900\", a component asks for the colour of "
              "text; instead of \"teal 600\", it asks for the accent. A typical set of roles looks like this:</p>"
              "<ul><li>surfaces: page, raised, sunken;</li><li>text: default, muted, on accent;</li>"
              "<li>accent and its hover state;</li><li>borders, focus ring and overlay.</li></ul>"
              "<p>A theme is nothing more than a new mapping from these roles to primitives. The dark version of a theme "
              "maps \"text\" to a light grey and \"surface\" to a near black, and every component follows.</p>"
              "<h2>Tier three: component knobs</h2>"
              "<p>Some components need a setting of their own, like how dark the layer behind a hero banner's text should "
              "be. These knobs live inside the component and always fall back to a semantic role, so a theme can tune "
              "them without reaching into the component's code.</p>"
              "<h2>Why components only read the middle</h2>"
              "<p>If a card read \"slate 900\" directly, switching to dark mode would leave dark text on a dark card. By "
              "reading only roles, components stay correct in every theme, including ones that do not exist yet. Our "
              "build even refuses a component that mentions a primitive.</p>"
              "<p>For editors, the result is simple: themes are chosen in the site settings, contrast is checked for "
              "each of them, and nothing on the page needs to be touched.</p>",
        "fr": "<p>Je suis rédacteur, pas développeur. Mais le jour où j'ai changé l'apparence d'un site entier en un "
              "après-midi, sans rien demander à personne, j'ai voulu comprendre comment cela fonctionnait. La réponse "
              "tient dans une idée simple, les jetons de design, rangés sur trois niveaux.</p>"
              "<p>Un jeton n'est qu'une valeur qui porte un nom : une couleur, une taille, un espacement, une police. Leur "
              "intérêt ne tient pas aux valeurs, mais à la manière dont les noms sont organisés.</p>"
              "<h2>Premier niveau : les primitives</h2>"
              "<p>Les primitives forment la palette brute d'un thème : un gris ardoise en dix nuances, un bleu canard, un "
              "rouge argile, une échelle d'espacements, une série de tailles de texte. Leur nom dit ce qu'elles sont, "
              "comme « ardoise 900 » ou « espace 4 ». Il ne dit rien de leur usage, et aucun composant n'a le droit de "
              "les lire.</p>"
              "<h2>Deuxième niveau : les rôles sémantiques</h2>"
              "<p>Le niveau du milieu donne un rôle à chaque valeur. Au lieu de « ardoise 900 », un composant demande la "
              "couleur du texte ; au lieu de « bleu canard 600 », il demande l'accent. Un jeu de rôles typique "
              "ressemble à ceci :</p>"
              "<ul><li>surfaces : page, en relief, en retrait ;</li><li>texte : normal, atténué, sur accent ;</li>"
              "<li>l'accent et son état au survol ;</li><li>bordures, contour de focus et voile.</li></ul>"
              "<p>Un thème n'est rien d'autre qu'une nouvelle correspondance entre ces rôles et des primitives. La "
              "version sombre d'un thème associe « texte » à un gris clair et « surface » à un presque noir, et tous les "
              "composants suivent.</p>"
              "<h2>Troisième niveau : les réglages de composant</h2>"
              "<p>Certains composants ont besoin d'un réglage à eux, comme l'opacité du voile sous le texte d'une "
              "bannière. Ces réglages vivent dans le composant et retombent toujours sur un rôle sémantique : un thème "
              "peut les ajuster sans toucher au code du composant.</p>"
              "<h2>Pourquoi les composants ne lisent que le milieu</h2>"
              "<p>Si une carte lisait directement « ardoise 900 », le passage en mode sombre laisserait un texte foncé sur "
              "une carte foncée. En ne lisant que des rôles, les composants restent justes dans chaque thème, y compris "
              "ceux qui n'existent pas encore. Notre construction refuse même un composant qui cite une primitive.</p>"
              "<p>Pour les rédacteurs, le résultat est simple : les thèmes se choisissent dans les réglages du site, le "
              "contraste de chacun est vérifié, et rien n'est à retoucher sur les pages.</p>",
    },
    "navigation": {
        "en": "<p>A site menu is the one component every visitor uses, and often the first one to fail. Scripts load "
              "late on a slow connection, a browser extension blocks them, or an error elsewhere on the page stops them "
              "from running. When the menu depends on JavaScript, the whole site goes with it.</p>"
              "<p>Our menu is built the other way round: rendered on the server first, enhanced in the browser second.</p>"
              "<h2>Start with links</h2>"
              "<p>The server sends the complete menu as nested lists of ordinary links, three levels deep, built from "
              "the page tree. Without any script, it already works. On small screens every level is listed in full; on "
              "large screens each panel opens when the pointer hovers over its entry or when the keyboard focus moves "
              "into it.</p>"
              "<h2>The disclosure pattern</h2>"
              "<p>When JavaScript is available, each entry with sub-pages gets a small button next to its link. This is "
              "the disclosure pattern: the link still goes to the page, and the button only opens or closes the panel. "
              "The button says whether its panel is expanded, so screen readers announce it correctly.</p>"
              "<p>We deliberately avoided the menu pattern used by desktop applications. Websites are navigated with "
              "Tab, links and buttons, and visitors should not have to learn arrow key shortcuts to reach a page.</p>"
              "<h2>What the script adds</h2>"
              "<ul><li>Escape closes the open panel and returns focus to its button.</li>"
              "<li>A click elsewhere, or focus moving out of the entry, closes it too.</li>"
              "<li>On phones, a Menu button folds the whole list away until it is needed.</li></ul>"
              "<blockquote>If the script fails, the visitor loses a convenience, never a page.</blockquote>"
              "<p>We test the menu three ways before each release: with the keyboard only, with JavaScript turned off, "
              "and at 320 pixels wide. It takes ten minutes, and it is the best protection we know against a menu that "
              "only works on the developer's laptop.</p>",
        "fr": "<p>Le menu est le seul composant que tous les visiteurs utilisent, et souvent le premier à tomber en "
              "panne. Les scripts se chargent tard sur une connexion lente, une extension du navigateur les bloque, ou "
              "une erreur ailleurs dans la page les empêche de s'exécuter. Quand le menu dépend de JavaScript, tout le "
              "site tombe avec lui.</p>"
              "<p>Notre menu est construit dans l'autre sens : rendu par le serveur d'abord, amélioré dans le navigateur "
              "ensuite.</p>"
              "<h2>Partir des liens</h2>"
              "<p>Le serveur envoie le menu complet sous forme de listes imbriquées de liens ordinaires, sur trois "
              "niveaux, construites à partir de l'arborescence. Sans aucun script, il fonctionne déjà. Sur petit écran, "
              "tous les niveaux sont listés ; sur grand écran, chaque panneau s'ouvre quand le pointeur survole son "
              "entrée ou quand le focus clavier y entre.</p>"
              "<h2>Le motif disclosure</h2>"
              "<p>Quand JavaScript est disponible, chaque entrée qui a des sous-pages reçoit un petit bouton à côté de "
              "son lien. C'est le motif disclosure : le lien mène toujours à la page, et le bouton ne fait qu'ouvrir ou "
              "fermer le panneau. Le bouton indique si son panneau est déplié, et les lecteurs d'écran l'annoncent "
              "correctement.</p>"
              "<p>Nous avons volontairement écarté le motif de menu des applications de bureau. Un site se parcourt "
              "avec la touche Tab, des liens et des boutons, et les visiteurs ne devraient pas avoir à apprendre des "
              "raccourcis aux flèches pour atteindre une page.</p>"
              "<h2>Ce qu'ajoute le script</h2>"
              "<ul><li>Échap ferme le panneau ouvert et ramène le focus sur son bouton.</li>"
              "<li>Un clic ailleurs, ou un focus qui quitte l'entrée, le ferme aussi.</li>"
              "<li>Sur téléphone, un bouton Menu replie toute la liste jusqu'à ce qu'on en ait besoin.</li></ul>"
              "<blockquote>Si le script échoue, le visiteur perd un confort, jamais une page.</blockquote>"
              "<p>Avant chaque version, nous testons le menu de trois façons : au clavier seul, JavaScript désactivé, et "
              "sur 320 pixels de large. Cela prend dix minutes, et c'est la meilleure protection que nous connaissions "
              "contre un menu qui ne fonctionne que sur l'ordinateur du développeur.</p>",
    },
}

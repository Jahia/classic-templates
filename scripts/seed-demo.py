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
  - publishes the site in both languages.

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234).
One HTTP session is reused for every call (fresh basic auth per call exhausts the licence's
authenticated-visitor cap).
"""
import argparse
import base64
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

    gql(
        "mutation($s:String!){jcr{mutateNode(pathOrId:$s){publish(languages:[\"en\",\"fr\"],publishSubNodes:true,includeSubTree:true)}}}",
        {"s": site},
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

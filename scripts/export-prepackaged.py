#!/usr/bin/env python3
"""Exports a demo site into its pre-packaged project (packages/prepackaged-site for classic-dev,
packages/prepackaged-skylantern for skylantern).

    python3 scripts/export-prepackaged.py [--site classic-dev|skylantern] [--from-zip export.zip] [--check]

A pre-packaged project must install on an instance that has only the modules of this repository it
depends on (plus the platform modules default, siteSettings and site-settings-seo), so the script
keeps the content of those modules only. What each site keeps is described in PROFILES below.

  1. Logs in once (one HTTP session for every call) and exports the site with its live content and
     without users: GET /cms/export/default/<site>_export.zip?exportformat=site&live=true&users=false.
     Only the inner <site>.zip is kept (never roles.zip or mounts.zip). --from-zip reads a
     previously downloaded export instead.
  2. Rewrites the add-on content that has an equivalent in the template set (the profile's
     conversions: the jsfaq questions of skylantern become accordions).
  3. Removes, in repository.xml and live-repository.xml alike:
     - every node whose primary type or one of its mixins belongs to a namespace that neither the
       platform nor the profile's packages declare (the allow-list is read from their CND files:
       add-on modules such as Formidable, jsfaq, js-media-gallery or js-store-locator are left out
       whatever their prefixes);
     - the pages, folders and items that exist only to show add-ons (the profile's
       only_for_addons);
     - every free zone that held nothing but removed nodes;
     - every reference to a removed node (path tokens of reference properties). A link item left
       without a target is removed; another node with an internal link and no target left gets
       the link type "none".
     It fails when a remaining value still names a removed path or uuid, or when the export
     carries a user (a member of a site group comes with their profile and password history).
  4. Adjusts the demo texts that describe add-on content (the profile's text_edits).
  5. Rewrites site.properties: the profile's installed modules only, server name localhost, not the
     default site of the instance.
  6. Writes the result unzipped to packages/<package>/src/main/<site>/ (site.properties,
     repository.xml, live-repository.xml, content/, live-content/), in Jahia's own XML layout, and
     the export descriptor to packages/<package>/src/main/prepackagedSites/export.properties.
     The output only depends on the site content: running the script twice gives the same files.

--check exports to a temporary folder and exits 1 when the result differs from the committed one.

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234).
"""
import argparse
import base64
import filecmp
import http.cookiejar
import io
import os
import re
import shutil
import sys
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

URL = os.environ.get("JAHIA_URL", "http://localhost:8080").rstrip("/")
USER = os.environ.get("JAHIA_USER", "root:root1234")

REPO = Path(__file__).resolve().parent.parent
PACKAGES = REPO / "packages"

NS = {"j": "http://www.jahia.org/jahia/1.0", "jcr": "http://www.jcp.org/jcr/1.0"}
J = "{%s}" % NS["j"]
JCR = "{%s}" % NS["jcr"]

# JCR built-in prefixes, declared by the repository itself rather than by a CND file
BUILT_IN_PREFIXES = {"nt", "mix", "jcr", "rep"}

PLATFORM_MODULES = ["default", "siteSettings", "site-settings-seo"]

# An export made with users=false still embeds every user who is a member of a site group, with
# their profile and password history: the script refuses to package one
USER_TYPE = "jnt:user"

# One profile per pre-packaged site:
#   package          the folder under packages/ that receives the export
#   sources          the packages whose CND namespaces the site keeps
#   installed        the modules the imported site runs with (site.properties), nothing else
#   only_for_addons  site-relative paths of nodes that exist only to show add-on modules
#   conversions      site-relative path -> function rewriting add-on content into template set
#                    content (applied before the removals)
#   text_edits       exact replacements in property values (rich text bodies, page descriptions,
#                    card texts) that described add-on content; one not found is reported, never
#                    guessed
PROFILES = {
    "classic-dev": {
        "package": "prepackaged-site",
        "sources": ["template-set"],
        "installed": ["classic-templates"] + PLATFORM_MODULES,
        "only_for_addons": ["home/practical", "contents/forms", "contents/places"],
        "conversions": {},
        "text_edits": [
            (
                "accessibility statement (en)",
                "<li>The contact form comes from the Formidable module, which this audit did not review"
                " in depth; automated tests report no error on it.</li>",
                "",
            ),
            (
                "accessibility statement (fr)",
                "<li>Le formulaire de contact provient du module Formidable, que cet audit n'a pas"
                " examiné en détail ; les tests automatiques n'y relèvent aucune erreur.</li>",
                "",
            ),
            (
                "contact page description (en)",
                "opening hours and directions to the studio, or write to us with the form below.",
                "opening hours and directions to the studio.",
            ),
            (
                "contact page description (fr)",
                "horaires et accès au studio, ou écrivez-nous avec le formulaire de cette page.",
                "horaires et accès au studio.",
            ),
        ],
    },
    "skylantern": {
        "package": "prepackaged-skylantern",
        "sources": ["template-set", "travel"],
        "installed": ["classic-templates", "classic-travel"] + PLATFORM_MODULES,
        # The newsletter and contact forms (Formidable) and the sales offices (js-store-locator)
        "only_for_addons": ["contents/forms", "contents/offices"],
        # The help centre questions (jsfaq) become accordions of the template set
        "conversions": {"home/help/faq/main/questions": "jsfaq_to_accordions"},
        "text_edits": [
            (
                "FAQ introduction (en)",
                "<p>Search the questions, or open a topic.",
                "<p>Open a topic to read its questions.",
            ),
            (
                "FAQ introduction (fr)",
                "<p>Cherchez parmi les questions, ou ouvrez un thème.",
                "<p>Ouvrez un thème pour lire ses questions.",
            ),
            (
                "contact page description (en)",
                "customer service hours, phone numbers by market, our sales offices in Asia on a map"
                " and a form to write to us.",
                "customer service phone numbers and opening hours for Hong Kong, Japan, South Korea,"
                " Taiwan and Southeast Asia, or write by email.",
            ),
            (
                "contact page description (fr)",
                "horaires du service client, numéros par pays, nos agences en Asie sur une carte et"
                " un formulaire pour nous écrire.",
                "numéros et horaires du service client pour Hong Kong, le Japon, la Corée du Sud,"
                " Taïwan et l'Asie du Sud-Est, ou par e-mail.",
            ),
            ("about card (en)", "Phone, offices and a form to write to us.", "Service hours and phone numbers."),
            ("about card (fr)", "Téléphone, agences et formulaire pour nous écrire.",
             "Horaires du service et numéros de téléphone."),
            ("help card (en)", "Phone numbers, offices and our form.", "Phone numbers and service hours."),
            ("help card (fr)", "Téléphones, agences et formulaire.", "Téléphones et horaires du service."),
            (
                "privacy page description (en)",
                "handles personal data: newsletter and contact forms, purposes, retention, your rights"
                " and no tracking cookie.",
                "handles personal data: it has no form and collects none, sets no tracking cookie,"
                " and how to exercise your rights.",
            ),
            (
                "privacy page description (fr)",
                "traite vos données : formulaires de lettre et de contact, finalités, conservation,"
                " droits, aucun traceur.",
                "traite vos données : aucun formulaire, aucune donnée recueillie, aucun traceur, et"
                " comment exercer vos droits.",
            ),
            (
                "privacy policy (en)",
                re.compile(r"<p>This demonstration site collects personal data through two forms only:.*?"
                           r"They are not shared with anyone\.</p>", re.S),
                "<p>This demonstration site has no form: it collects no personal data.</p>",
            ),
            (
                "privacy policy (fr)",
                re.compile(r"<p>Ce site de démonstration recueille des données personnelles par deux"
                           r" formulaires seulement :.*?Elles ne sont transmises à personne\.</p>", re.S),
                "<p>Ce site de démonstration n'a aucun formulaire : il ne recueille aucune donnée"
                " personnelle.</p>",
            ),
            (
                "accessibility statement scope (en)",
                "The content of this site and the add-on modules it uses have <strong>not been audited"
                " yet</strong>",
                "The content of this site has <strong>not been audited yet</strong>",
            ),
            (
                "accessibility statement scope (fr)",
                "Les contenus de ce site et les modules complémentaires qu'il utilise <strong>n'ont pas"
                " encore été audités</strong>",
                "Les contenus de ce site <strong>n'ont pas encore été audités</strong>",
            ),
            (
                "accessibility statement add-ons (en)",
                re.compile(r"<li>The FAQ, the map of our sales offices and the forms come from add-on"
                           r" modules.*?gives the same information\.</li>", re.S),
                "",
            ),
            (
                "accessibility statement add-ons (fr)",
                re.compile(r"<li>La FAQ, la carte de nos agences et les formulaires proviennent de"
                           r" modules complémentaires.*?donne les mêmes informations\.</li>", re.S),
                "",
            ),
        ],
    },
}

# ---------------------------------------------------------------------------------------------
# Export download (one session)

_jar = http.cookiejar.CookieJar()
_http = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_jar))
_auth = "Basic " + base64.b64encode(USER.encode()).decode()


def download_export(site):
    path = f"/cms/export/default/{site}_export.zip?exportformat=site&live=true&users=false&sitebox={site}"
    req = urllib.request.Request(URL + path)
    if not any(c.name == "JSESSIONID" for c in _jar):
        req.add_header("Authorization", _auth)
    with _http.open(req, timeout=600) as res:
        return res.read()


def read_export(outer_bytes, site):
    """Returns (files of the inner site zip as {name: bytes}, export.properties text)."""
    with zipfile.ZipFile(io.BytesIO(outer_bytes)) as outer:
        names = outer.namelist()
        if f"{site}.zip" not in names:
            sys.exit(f"The export has no {site}.zip (found: {', '.join(names)})")
        descriptor = outer.read("export.properties").decode("utf-8") if "export.properties" in names else ""
        inner_bytes = outer.read(f"{site}.zip")
    with zipfile.ZipFile(io.BytesIO(inner_bytes)) as inner:
        files = {n: inner.read(n) for n in inner.namelist() if not n.endswith("/")}
    return files, descriptor


# ---------------------------------------------------------------------------------------------
# Namespaces


def allowed_prefixes(sources):
    """Prefixes declared by the CND files of the given packages, plus the JCR built-ins."""
    prefixes = set(BUILT_IN_PREFIXES)
    cnds = []
    for source in sources:
        folder = PACKAGES / source
        found = list((folder / "settings").glob("*.cnd")) + list((folder / "src").rglob("*.cnd"))
        if not found:
            sys.exit(f"No CND file found under {folder}")
        cnds += found
    for cnd in cnds:
        prefixes.update(re.findall(r"<\s*([A-Za-z][\w-]*)\s*=\s*'[^']+'\s*>", cnd.read_text(encoding="utf-8")))
    return prefixes


def prefix(type_name):
    return type_name.split(":", 1)[0] if ":" in type_name else ""


def node_types(element):
    types = [element.get(JCR + "primaryType") or ""]
    types += (element.get(JCR + "mixinTypes") or "").split()
    return [t for t in types if t]


# ---------------------------------------------------------------------------------------------
# Jahia's XML layout: one attribute per line, aligned under the first, three-space indent


def qname(name):
    for p, uri in NS.items():
        if name.startswith("{%s}" % uri):
            return p + ":" + name[len(uri) + 2:]
    if name.startswith("{"):
        raise ValueError(f"Unexpected namespace in {name}")
    return name


def escape(value):
    return (value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&#34;").replace("\n", "&#10;").replace("\r", "&#13;").replace("\t", "&#9;"))


def write_element(element, depth, out):
    indent = "   " * depth
    tag = qname(element.tag)
    attrs = [f'{qname(k)}="{escape(v)}"' for k, v in element.attrib.items()]
    if depth == 0:
        attrs = [f'xmlns:{p}="{uri}"' for p, uri in NS.items()] + attrs
        head = f"<{tag}" + "".join(" " + a for a in attrs)
    else:
        pad = "\n" + indent + " " * (len(tag) + 2)
        head = f"{indent}<{tag}" + ((" " + pad.join(attrs)) if attrs else "")
    children = list(element)
    if not children:
        out.append(head + "/>\n")
        return
    out.append(head + ">\n")
    for child in children:
        write_element(child, depth + 1, out)
    out.append(f"{indent}</{tag}>\n")


def serialize(root):
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n']
    write_element(root, 0, out)
    return "".join(out)


def parse(data):
    for p, uri in NS.items():
        ET.register_namespace(p, uri)
    return ET.fromstring(data)


# ---------------------------------------------------------------------------------------------
# Conversions: add-on content rewritten as template set content

# Attributes any node carries whatever its type: identity, language, dates and publication state
BOOKKEEPING = {JCR + "uuid", JCR + "language", JCR + "created", JCR + "createdBy", JCR + "lastModified",
               JCR + "lastModifiedBy", J + "lastPublished", J + "lastPublishedBy", J + "originWS", J + "published"}


def retyped(source, primary_type, renames, added=None):
    """A childless copy of source as a primary_type node. It keeps the bookkeeping attributes of
    source (the uuid included, so both workspaces stay paired) and its properties listed in
    renames (old key -> new key, None drops it). Any other property of source stops the script:
    content is never lost silently."""
    attrs = {JCR + "primaryType": primary_type, **(added or {})}
    for key, value in source.attrib.items():
        if key in BOOKKEEPING:
            attrs[key] = value
        elif key in renames:
            if renames[key]:
                attrs[renames[key]] = value
        elif key != JCR + "primaryType":
            sys.exit(f"Cannot convert {source.tag}: unexpected property {qname(key)}")
    element = ET.Element(source.tag)
    for key in sorted(attrs, key=qname):
        element.set(key, attrs[key])
    return element


def translations(source, renames):
    for child in source:
        if is_translation(child):
            yield retyped(child, "jnt:translation", renames)


def jsfaq_to_accordions(zone):
    """The free zone holding a jsfaq FAQ page becomes one accordion per FAQ section, in its place:
    the section title is the accordion heading, each question an entry and its answer the entry
    body. The FAQ page's own heading is dropped (the sections carry the headings)."""
    content = [c for c in zone if not is_translation(c)]
    if len(content) != 1 or content[0].get(JCR + "primaryType") != "jsfaqnt:faqPage":
        sys.exit("The FAQ free zone does not hold exactly one jsfaq FAQ page")
    accordions = []
    for section in content[0]:
        if is_translation(section):
            continue
        if section.get(JCR + "primaryType") != "jsfaqnt:faqSection":
            sys.exit(f"Unexpected {section.get(JCR + 'primaryType')} in the FAQ page")
        accordion = retyped(section, "ctpl:accordion", {}, {"ctplSurface": zone.get("ctplSurface", "default")})
        accordion.extend(translations(section, {JCR + "title": JCR + "title", "sectionTitle": None}))
        for item in section:
            if is_translation(item):
                continue
            if item.get(JCR + "primaryType") != "jsfaqnt:faqItem":
                sys.exit(f"Unexpected {item.get(JCR + 'primaryType')} in a FAQ section")
            for tr in item:
                if is_translation(tr) and tr.get(JCR + "title") != tr.get("question"):
                    sys.exit(f"FAQ item {item.tag}: its title and its question differ")
            entry = retyped(item, "ctpl:accordionItem", {}, {"openByDefault": "false"})
            entry.extend(translations(item, {JCR + "title": JCR + "title", "question": None, "answer": "body"}))
            accordion.append(entry)
        accordions.append(accordion)
    return accordions


CONVERSIONS = {"jsfaq_to_accordions": jsfaq_to_accordions}


def apply_conversions(root, site, conversions, done):
    site_node = root.find(f"sites/{site}")
    for rel, name in conversions.items():
        parent = site_node.find(rel.rsplit("/", 1)[0])
        zone = site_node.find(rel)
        if zone is None:
            sys.exit(f"Nothing to convert at {rel}")
        replacement = CONVERSIONS[name](zone)
        taken = {c.tag for c in parent if c is not zone}
        clashes = [e.tag for e in replacement if e.tag in taken]
        if clashes:
            sys.exit(f"{rel}: converted nodes would replace {', '.join(clashes)}")
        index = list(parent).index(zone)
        parent.remove(zone)
        for offset, element in enumerate(replacement):
            parent.insert(index + offset, element)
        done.append(f"{rel}: {name} ({len(replacement)} nodes)")


# ---------------------------------------------------------------------------------------------
# Stripping


def is_translation(element):
    return element.get(JCR + "primaryType") == "jnt:translation"


class Stripper:
    def __init__(self, root, site, allowed, only_for_addons):
        self.root = root
        self.site = site
        self.allowed = allowed
        self.only_for_addons = only_for_addons
        self.parents = {c: p for p in root.iter() for c in p}
        self.paths = {}
        self._index(root, "")
        self.removed = {}  # path -> reason
        self.removed_uuids = set()
        self.references_fixed = []
        self.links_reset = []

    def _index(self, element, path):
        self.paths[element] = path
        for child in element:
            self._index(child, f"{path}/{qname(child.tag)}")

    def site_node(self):
        node = self.root.find(f"sites/{self.site}")
        if node is None:
            sys.exit(f"No /sites/{self.site} in the export")
        return node

    def remove(self, element, reason):
        path = self.paths[element]
        if any(path == p or path.startswith(p + "/") for p in self.removed):
            return
        nested = sorted(p for p in self.removed if p.startswith(path + "/"))
        if nested:
            reason += " (held " + "; ".join(f"{p[len(path) + 1:]}: {self.removed.pop(p)}" for p in nested) + ")"
        self.removed[path] = reason
        for e in element.iter():
            if e.get(JCR + "uuid"):
                self.removed_uuids.add(e.get(JCR + "uuid"))
        self.parents[element].remove(element)

    def strip(self):
        site = self.site_node()
        for rel in self.only_for_addons:
            node = site.find(rel)
            if node is not None:
                self.remove(node, "only shows add-ons")
        for element in list(site.iter()):
            if element in self.parents and self.attached(element):
                foreign = [t for t in node_types(element) if prefix(t) not in self.allowed]
                if foreign:
                    self.remove(element, "add-on type " + ", ".join(foreign))
        for element in list(site.iter()):
            if element.get(JCR + "primaryType") == "ctpl:freeZone" and self.attached(element):
                had_removed = any(p.startswith(self.paths[element] + "/") for p in self.removed)
                if had_removed and not [c for c in element if not is_translation(c)]:
                    self.remove(element, "free zone left empty")
        self.fix_references()

    def attached(self, element):
        path = self.paths[element]
        return not any(path == p or path.startswith(p + "/") for p in self.removed)

    def is_removed_path(self, path):
        return any(path == p or path.startswith(p + "/") for p in self.removed)

    def fix_references(self):
        changed = True
        while changed:
            changed = False
            for element in list(self.root.iter()):
                for key, value in list(element.attrib.items()):
                    if "#/" not in value:
                        continue
                    tokens = value.split(" ")
                    kept = [t for t in tokens if not (t.startswith("#/") and self.is_removed_path(t[1:]))]
                    if len(kept) == len(tokens):
                        continue
                    self.references_fixed.append(f"{self.paths[element]} {qname(key)}")
                    if kept:
                        element.set(key, " ".join(kept))
                    else:
                        del element.attrib[key]
                    if qname(key) == "j:linknode":
                        self.reset_link(element if not is_translation(element) else self.parents[element])
                    changed = True

    def reset_link(self, node):
        if node not in self.parents or not self.attached(node):
            return
        if node.get(J + "linknode") or any(t.get(J + "linknode") for t in node if is_translation(t)):
            return
        if node.get(JCR + "primaryType") == "ctpl:link":
            self.remove(node, "link without a target left")
            return
        node.set(J + "linkType", "none")
        mixins = [m for m in (node.get(JCR + "mixinTypes") or "").split() if m != "jmix:internalLink"]
        if mixins:
            node.set(JCR + "mixinTypes", " ".join(mixins))
        elif JCR + "mixinTypes" in node.attrib:
            del node.attrib[JCR + "mixinTypes"]
        self.links_reset.append(self.paths[node])

    def verify(self):
        problems = []
        for element in self.root.iter():
            foreign = [t for t in node_types(element) if prefix(t) not in self.allowed]
            if foreign:
                problems.append(f"{self.paths[element]} still uses {', '.join(foreign)}")
            for key, value in element.attrib.items():
                if key == JCR + "uuid":
                    continue
                for path in self.removed:
                    if re.search(re.escape(path) + r"(?![\w-])", value):
                        problems.append(f"{self.paths[element]} {qname(key)} still names {path}")
                for uuid in self.removed_uuids:
                    if uuid in value:
                        problems.append(f"{self.paths[element]} {qname(key)} still names uuid {uuid}")
        return problems


def apply_text_edits(root, text_edits, applied):
    for element in root.iter():
        for key, value in list(element.attrib.items()):
            new = value
            for label, old, replacement in text_edits:
                if isinstance(old, re.Pattern):
                    new, count = old.subn(replacement, new)
                    if count:
                        applied.add(label)
                elif old in new:
                    new = new.replace(old, replacement)
                    applied.add(label)
            if new != value:
                element.set(key, new)


# ---------------------------------------------------------------------------------------------
# site.properties and export.properties


def read_properties(text):
    props = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith(("#", "!")):
            continue
        key, _, value = line.partition("=")
        props[key.strip()] = value.strip().encode("latin-1", "backslashreplace").decode("unicode_escape")
    return props


def write_properties(props, header):
    def esc(text):
        text = text.replace("\\", "\\\\")
        return "".join(c if 0x20 <= ord(c) < 0x7F else "\\u%04x" % ord(c) for c in text)

    lines = [f"# {header}"] + [f"{esc(k)}={esc(v)}" for k, v in sorted(props.items())]
    return "\n".join(lines) + "\n"


def site_properties(text, site, installed):
    props = {k: v for k, v in read_properties(text).items() if not k.startswith("installedModules.")}
    if props.get("sitekey") != site:
        sys.exit(f"site.properties describes {props.get('sitekey')}, not {site}")
    for i, module in enumerate(installed, start=1):
        props[f"installedModules.{i}"] = module
    props["siteservername"] = "localhost"
    props["siteservernamealiases"] = ""
    # Imported next to other sites, the demo must not take over the instance's default site
    props["defaultSite"] = "false"
    return write_properties(props, f"{site} demo site, written by scripts/export-prepackaged.py")


def export_descriptor(text, repository_xml):
    source = read_properties(text)
    dates = re.findall(r'(?:jcr:lastModified|j:lastPublished)="(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)', repository_xml)
    props = {
        "JahiaRelease": source.get("JahiaRelease", "8.2"),
        "Patch": source.get("Patch", "0"),
        "BuildNumber": source.get("BuildNumber", ""),
        # The date of the latest change in the content, so that an unchanged site exports the same
        "ExportDate": max(dates) if dates else "",
    }
    return "".join(f"{k} = {v}\n" for k, v in props.items())


# ---------------------------------------------------------------------------------------------


def build(files, descriptor, site, profile, out_site, out_descriptor):
    allowed = allowed_prefixes(profile["sources"])
    report = {"allowed": sorted(allowed), "conversions": []}
    texts = {}
    removed_paths = set()
    applied = set()
    for name in ("repository.xml", "live-repository.xml"):
        if name not in files:
            sys.exit(f"The site export has no {name}")
        root = parse(files[name])
        converted = []
        apply_conversions(root, site, profile["conversions"], converted)
        report["conversions"] += [f"{name}: {c}" for c in converted]
        stripper = Stripper(root, site, allowed, profile["only_for_addons"])
        stripper.strip()
        apply_text_edits(root, profile["text_edits"], applied)
        problems = stripper.verify()
        problems += [f"user {qname(e.tag)}: remove them from the site's groups, a pre-packaged site never"
                     " carries users" for e in root.iter() if e.get(JCR + "primaryType") == USER_TYPE]
        problems += [f"a value still names the converted {rel}" for rel in profile["conversions"]
                     if any(f"/sites/{site}/{rel}" in v for e in root.iter() for v in e.attrib.values())]
        if problems:
            sys.exit(f"{name}: cannot be packaged:\n  " + "\n  ".join(problems[:40]))
        text = serialize(root)
        reparsed = parse(text.encode("utf-8"))
        if serialize(reparsed) != text:
            sys.exit(f"{name}: the written XML does not read back the same")
        texts[name] = text
        removed_paths |= set(stripper.removed)
        report[name] = stripper
    report["text_edits"] = applied
    missing = [label for label, _, _ in profile["text_edits"] if label not in applied]

    if out_site.exists():
        shutil.rmtree(out_site)
    out_site.mkdir(parents=True)
    (out_site / "repository.xml").write_text(texts["repository.xml"], encoding="utf-8")
    (out_site / "live-repository.xml").write_text(texts["live-repository.xml"], encoding="utf-8")
    (out_site / "site.properties").write_text(site_properties(files["site.properties"].decode("latin-1"), site, profile["installed"]),
                                              encoding="latin-1")
    skipped_binaries = 0
    for name in sorted(files):
        top = name.split("/", 1)[0]
        if top not in ("content", "live-content"):
            continue
        node_path = "/" + name.split("/", 1)[1].rsplit("/", 1)[0]
        if any(node_path == p or node_path.startswith(p + "/") for p in removed_paths):
            skipped_binaries += 1
            continue
        target = out_site / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(files[name])
    out_descriptor.parent.mkdir(parents=True, exist_ok=True)
    out_descriptor.write_text(export_descriptor(descriptor, texts["repository.xml"]), encoding="utf-8")
    report["skipped_binaries"] = skipped_binaries
    report["missing_text_edits"] = missing
    return report


def print_report(report, site):
    print(f"Allowed namespaces: {', '.join(report['allowed'])}")
    for line in report["conversions"]:
        print(f"Converted in {line}")
    for name in ("repository.xml", "live-repository.xml"):
        s = report[name]
        prefix_len = len(f"/sites/{site}/")
        print(f"\n{name}: {len(s.removed)} subtrees removed ({len(s.removed_uuids)} nodes with a uuid)")
        for path, reason in sorted(s.removed.items()):
            print(f"  - {path[prefix_len:] if path.startswith(f'/sites/{site}/') else path}: {reason}")
        print(f"  references removed: {len(s.references_fixed)}")
        for ref in s.references_fixed:
            print(f"    {ref}")
        if s.links_reset:
            print(f"  links reset to none: {', '.join(s.links_reset)}")
    print(f"\nText edits applied: {', '.join(sorted(report['text_edits'])) or 'none'}")
    if report["missing_text_edits"]:
        print(f"Text edits not found (check the texts by hand): {', '.join(report['missing_text_edits'])}")
    print(f"Binaries left out: {report['skipped_binaries']}")


def same_tree(a, b):
    cmp = filecmp.dircmp(a, b)
    if cmp.left_only or cmp.right_only or cmp.diff_files or cmp.funny_files:
        return False
    _, mismatch, errors = filecmp.cmpfiles(a, b, cmp.common_files, shallow=False)
    if mismatch or errors:
        return False
    return all(same_tree(os.path.join(a, d), os.path.join(b, d)) for d in cmp.common_dirs)


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--site", default="classic-dev", choices=sorted(PROFILES),
                        help="site key to export (default: classic-dev)")
    parser.add_argument("--from-zip", type=Path, help="use this downloaded export instead of calling Jahia")
    parser.add_argument("--save-zip", type=Path, help="also save the downloaded export to this file")
    parser.add_argument("--check", action="store_true",
                        help="export to a temporary folder and fail when it differs from the committed files")
    args = parser.parse_args()

    if args.from_zip:
        outer = args.from_zip.read_bytes()
    else:
        outer = download_export(args.site)
        if args.save_zip:
            args.save_zip.write_bytes(outer)
    files, descriptor = read_export(outer, args.site)

    profile = PROFILES[args.site]
    package = PACKAGES / profile["package"]
    out_site = package / "src" / "main" / args.site
    out_descriptor = package / "src" / "main" / "prepackagedSites" / "export.properties"
    if args.check:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_site = Path(tmp) / "site"
            tmp_descriptor = Path(tmp) / "export.properties"
            report = build(files, descriptor, args.site, profile, tmp_site, tmp_descriptor)
            print_report(report, args.site)
            same = same_tree(tmp_site, out_site) and filecmp.cmp(tmp_descriptor, out_descriptor, shallow=False)
            print("\nUp to date." if same else "\nThe committed pre-packaged site differs from the export.")
            sys.exit(0 if same else 1)
    report = build(files, descriptor, args.site, profile, out_site, out_descriptor)
    print_report(report, args.site)
    print(f"\nWritten to {out_site.relative_to(REPO)} and {out_descriptor.relative_to(REPO)}")


if __name__ == "__main__":
    main()

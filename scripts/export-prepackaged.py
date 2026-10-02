#!/usr/bin/env python3
"""Exports the classic-dev demo site into the pre-packaged project of packages/prepackaged-site.

    python3 scripts/export-prepackaged.py [--site classic-dev] [--from-zip export.zip] [--check]

The pre-packaged project must install on an instance that has only the classic-templates template
set (plus the platform modules default, siteSettings and site-settings-seo), so the script keeps
the content of the template set only:

  1. Logs in once (one HTTP session for every call) and exports the site with its live content and
     without users: GET /cms/export/default/<site>_export.zip?exportformat=site&live=true&users=false.
     Only the inner <site>.zip is kept (never roles.zip or mounts.zip). --from-zip reads a
     previously downloaded export instead.
  2. Removes, in repository.xml and live-repository.xml alike:
     - every node whose primary type or one of its mixins belongs to a namespace that neither the
       platform nor classic-templates declares (the allow-list is read from the template set's CND
       files: add-on modules such as Formidable, jsfaq, js-media-gallery, js-store-locator or
       classic-travel are left out whatever their prefixes);
     - the pages and folders that exist only to show add-ons (SITE_ONLY_FOR_ADDONS below);
     - every free zone that held nothing but removed nodes;
     - every reference to a removed node (path tokens of reference properties). A link item left
       without a target is removed; another node with an internal link and no target left gets
       the link type "none".
     It fails when a remaining value still names a removed path or uuid.
  3. Adjusts the few demo texts that describe add-on content (TEXT_EDITS below).
  4. Rewrites site.properties: the template set and the three platform modules as the only
     installed modules, server name localhost, not the default site of the instance.
  5. Writes the result unzipped to packages/prepackaged-site/src/main/<site>/ (site.properties,
     repository.xml, live-repository.xml, content/, live-content/), in Jahia's own XML layout, and
     the export descriptor to packages/prepackaged-site/src/main/prepackagedSites/export.properties.
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
TEMPLATE_SET = REPO / "packages" / "template-set"
PACKAGE = REPO / "packages" / "prepackaged-site"

NS = {"j": "http://www.jahia.org/jahia/1.0", "jcr": "http://www.jcp.org/jcr/1.0"}
J = "{%s}" % NS["j"]
JCR = "{%s}" % NS["jcr"]

# JCR built-in prefixes, declared by the repository itself rather than by a CND file
BUILT_IN_PREFIXES = {"nt", "mix", "jcr", "rep"}

# Modules a site of the pre-packaged project runs with: the template set and the platform
# modules it needs, nothing else
INSTALLED_MODULES = ["classic-templates", "default", "siteSettings", "site-settings-seo"]

# Site-relative paths of nodes that exist only to show add-on modules
SITE_ONLY_FOR_ADDONS = ["home/practical", "contents/forms", "contents/places"]

# Exact text replacements in property values (rich text bodies, page descriptions) that described
# add-on content. A replacement whose text is not found is reported, never guessed.
TEXT_EDITS = [
    (
        "accessibility statement (en)",
        "<li>The contact form comes from the Formidable module, which this audit did not review in"
        " depth; automated tests report no error on it.</li>",
        "",
    ),
    (
        "accessibility statement (fr)",
        "<li>Le formulaire de contact provient du module Formidable, que cet audit n'a pas examiné en"
        " détail ; les tests automatiques n'y relèvent aucune erreur.</li>",
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
]

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


def allowed_prefixes():
    """Prefixes declared by the template set's CND files, plus the JCR built-ins."""
    prefixes = set(BUILT_IN_PREFIXES)
    cnds = list((TEMPLATE_SET / "settings").glob("*.cnd")) + list((TEMPLATE_SET / "src").rglob("*.cnd"))
    if not cnds:
        sys.exit(f"No CND file found under {TEMPLATE_SET}")
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
# Stripping


def is_translation(element):
    return element.get(JCR + "primaryType") == "jnt:translation"


class Stripper:
    def __init__(self, root, site, allowed):
        self.root = root
        self.site = site
        self.allowed = allowed
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
        for rel in SITE_ONLY_FOR_ADDONS:
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


def apply_text_edits(root, applied):
    for element in root.iter():
        for key, value in list(element.attrib.items()):
            new = value
            for label, old, replacement in TEXT_EDITS:
                if old in new:
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


def site_properties(text, site):
    props = {k: v for k, v in read_properties(text).items() if not k.startswith("installedModules.")}
    if props.get("sitekey") != site:
        sys.exit(f"site.properties describes {props.get('sitekey')}, not {site}")
    for i, module in enumerate(INSTALLED_MODULES, start=1):
        props[f"installedModules.{i}"] = module
    props["siteservername"] = "localhost"
    props["siteservernamealiases"] = ""
    # Imported next to other sites, the demo must not take over the instance's default site
    props["defaultSite"] = "false"
    return write_properties(props, "classic-dev demo site, written by scripts/export-prepackaged.py")


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


def build(files, descriptor, site, out_site, out_descriptor):
    allowed = allowed_prefixes()
    report = {"allowed": sorted(allowed)}
    texts = {}
    removed_paths = set()
    applied = set()
    for name in ("repository.xml", "live-repository.xml"):
        if name not in files:
            sys.exit(f"The site export has no {name}")
        root = parse(files[name])
        stripper = Stripper(root, site, allowed)
        stripper.strip()
        apply_text_edits(root, applied)
        problems = stripper.verify()
        if problems:
            sys.exit(f"{name}: references left to removed content:\n  " + "\n  ".join(problems[:40]))
        text = serialize(root)
        reparsed = parse(text.encode("utf-8"))
        if serialize(reparsed) != text:
            sys.exit(f"{name}: the written XML does not read back the same")
        texts[name] = text
        removed_paths |= set(stripper.removed)
        report[name] = stripper
    report["text_edits"] = applied
    missing = [label for label, _, _ in TEXT_EDITS if label not in applied]

    if out_site.exists():
        shutil.rmtree(out_site)
    out_site.mkdir(parents=True)
    (out_site / "repository.xml").write_text(texts["repository.xml"], encoding="utf-8")
    (out_site / "live-repository.xml").write_text(texts["live-repository.xml"], encoding="utf-8")
    (out_site / "site.properties").write_text(site_properties(files["site.properties"].decode("latin-1"), site),
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
    parser.add_argument("--site", default="classic-dev", help="site key to export (default: classic-dev)")
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

    out_site = PACKAGE / "src" / "main" / args.site
    out_descriptor = PACKAGE / "src" / "main" / "prepackagedSites" / "export.properties"
    if args.check:
        with tempfile.TemporaryDirectory() as tmp:
            tmp_site = Path(tmp) / "site"
            tmp_descriptor = Path(tmp) / "export.properties"
            report = build(files, descriptor, args.site, tmp_site, tmp_descriptor)
            print_report(report, args.site)
            same = same_tree(tmp_site, out_site) and filecmp.cmp(tmp_descriptor, out_descriptor, shallow=False)
            print("\nUp to date." if same else "\nThe committed pre-packaged site differs from the export.")
            sys.exit(0 if same else 1)
    report = build(files, descriptor, args.site, out_site, out_descriptor)
    print_report(report, args.site)
    print(f"\nWritten to {out_site.relative_to(REPO)} and {out_descriptor.relative_to(REPO)}")


if __name__ == "__main__":
    main()

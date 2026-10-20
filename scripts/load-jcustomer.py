#!/usr/bin/env python3
"""Loads jCustomer items shipped as JSON files ({"endpoint": "/cxs/...", "items": [...]}, one file
per endpoint, applied in file-name order) into a jCustomer, and the Kibana saved objects shipped as
.ndjson into a Kibana. Used for the personalisation of a pre-packaged site (property types, rules,
scoring plans, segments, goals, personas, dashboards), after the site import.

  python3 scripts/load-jcustomer.py packages/prepackaged-orvane-signal/personalisation

A value written `jahia-uuid:<path>` (a goal's form) is replaced with the identifier of that node on
the target Jahia, read over GraphQL: a site import gives every node a new identifier. Run it after
the import, and again after any re-import.

JCUSTOMER_URL (default http://localhost:8181), JCUSTOMER_AUTH (default karaf:karaf, the local
development account), JAHIA_URL (default http://localhost:8080), JAHIA_USER (default
root:root1234, the local development account), KIBANA_URL (default http://localhost:5601).
Posting an item that exists replaces it (fixed ids), so the script can run again.
"""
import base64
import json
import os
import sys
import urllib.request
import uuid
from pathlib import Path

CXS = os.environ.get("JCUSTOMER_URL", "http://localhost:8181").rstrip("/")
AUTH = "Basic " + base64.b64encode(os.environ.get("JCUSTOMER_AUTH", "karaf:karaf").encode()).decode()
KIBANA = os.environ.get("KIBANA_URL", "http://localhost:5601").rstrip("/")
JAHIA = os.environ.get("JAHIA_URL", "http://localhost:8080").rstrip("/")
JAHIA_AUTH = "Basic " + base64.b64encode(os.environ.get("JAHIA_USER", "root:root1234").encode()).decode()
REF = "jahia-uuid:"


def uuid_of(path):
    query = json.dumps({"query": "query($p:String!){jcr{nodeByPath(path:$p){uuid}}}", "variables": {"p": path}}).encode()
    req = urllib.request.Request(f"{JAHIA}/modules/graphql", data=query, method="POST",
                                 headers={"Authorization": JAHIA_AUTH, "Content-Type": "application/json", "Origin": JAHIA})
    with urllib.request.urlopen(req) as r:
        node = (json.load(r).get("data") or {}).get("jcr", {}).get("nodeByPath")
    if not node:
        sys.exit(f"{path} is not on {JAHIA}: import the site first")
    return node["uuid"]


def resolve(value):
    """Replaces every `jahia-uuid:<path>` string in an item with that node's identifier."""
    if isinstance(value, dict):
        return {k: resolve(v) for k, v in value.items()}
    if isinstance(value, list):
        return [resolve(v) for v in value]
    if isinstance(value, str) and value.startswith(REF):
        return uuid_of(value[len(REF):])
    return value


def post(url, data, headers):
    with urllib.request.urlopen(urllib.request.Request(url, data=data, method="POST", headers=headers)) as r:
        return r.status


def main(folder):
    root = Path(folder)
    for file in sorted((root / "jcustomer").glob("*.json")):
        spec = json.loads(file.read_text(encoding="utf-8"))
        for item in spec["items"]:
            post(CXS + spec["endpoint"], json.dumps(resolve(item)).encode(), {"Authorization": AUTH, "Content-Type": "application/json"})
        print(f"{file.name}: {len(spec['items'])} item(s) -> {spec['endpoint']}")
    for file in sorted((root / "kibana").glob("*.ndjson")):
        boundary = uuid.uuid4().hex
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{file.name}\"\r\n"
                "Content-Type: application/ndjson\r\n\r\n").encode() + file.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
        post(f"{KIBANA}/api/saved_objects/_import?overwrite=true", body,
             {"kbn-xsrf": "true", "Content-Type": f"multipart/form-data; boundary={boundary}"})
        print(f"{file.name}: imported into Kibana")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__))

#!/usr/bin/env python3
"""Seeds a small test site for classic-media on the classic-templates template set (EN + FR).

    python3 scripts/seed-media-test-site.py [--site ctmd-test]

The script:
  - creates the site on the classic-templates template set when it does not exist, with EN and FR,
    and publishes it whole (createSite leaves the home page unpublished);
  - enables classic-media on it;
  - creates two categories under the system site (Test media > Streaming, Production);
  - uploads three generated images and a short generated audio file (a WAV tone) to files/media;
  - adds a "people" folder with three people (one with a profile link), a "stories" folder with six
    stories (news, feature, opinion, video without a video picked, a podcast with the audio file and
    a transcript, a members-only report), filed in the categories, and an "event" folder carrying
    the event time zone (Europe/Lisbon) with four sessions over two days and their speakers;
  - adds the pages "Stories" (a story feed, lead layout, format buttons, and a compact list of the
    Production topic), "Streaming" (a feed of this page's topics; the page is filed under
    Streaming) and "Programme" (key dates with two key dates and a call to action, the agenda with
    filters, the speaker gallery with its A-Z index);
  - publishes everything in both languages.
Nodes that already exist are left alone, so the script can be run again. Link targets are set in
every language (they are i18n). The GraphQL helpers are those of scripts/seed-demo.py (one HTTP
session for every call).

Environment: JAHIA_URL (default http://localhost:8080), JAHIA_USER (default root:root1234).
"""
import argparse
import importlib.util
import io
import math
import struct
import sys
import time
import wave
from pathlib import Path

_spec = importlib.util.spec_from_file_location("seed_demo", Path(__file__).with_name("seed-demo.py"))
demo = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(demo)
gql, exists, i18n, uuid_at, provisioning = demo.gql, demo.exists, demo.i18n, demo.uuid_at, demo.provisioning
add_content, add_page = demo.add_content, demo.add_page
LANGS = demo.LANGS


def create_site(key):
    site = f"/sites/{key}"
    if exists(site):
        return site
    provisioning(f'- createSite: ""\n  siteKey: {key}\n  title: "Media test"\n  defaultLanguage: en\n'
                 f"  serverName: localhost\n  templateSet: classic-templates\n", "application/yaml")
    for _ in range(90):
        if exists(f"{site}/home/siteHeader/header"):
            break
        time.sleep(1)
    else:
        sys.exit(f"site {key} was not created from the template set (no seeded header)")
    gql("mutation($s:String!){jcr{mutateNode(pathOrId:$s){setPropertiesBatch(properties:["
        '{name:"j:languages",values:["en","fr"]},{name:"j:mandatoryLanguages",values:[]},'
        '{name:"j:inactiveLanguages",values:[]},{name:"j:inactiveLiveLanguages",values:[]},'
        '{name:"j:defaultLanguage",value:"en"}]){path}}}}', {"s": site})
    publish(site)
    print(f"created site {key}")
    return site


def publish(path, subtree=True):
    gql('mutation($s:String!,$t:Boolean){jcr{mutateNode(pathOrId:$s){publish(languages:["en","fr"],'
        "publishSubNodes:$t,includeSubTree:$t)}}}", {"s": path, "t": subtree})


def add_category(parent, name, title):
    path = f"{parent}/{name}"
    if not exists(path):
        gql("mutation($p:String!,$n:String!,$props:[InputJCRProperty]){jcr{mutateNode(pathOrId:$p){"
            'addChild(name:$n,primaryNodeType:"jnt:category",properties:$props){uuid}}}}',
            {"p": parent, "n": name, "props": i18n("jcr:title", title)})
    return uuid_at(path)


def upload_audio(folder, name, title):
    """A one-second 440 Hz tone, as a WAV file of the media library."""
    path = f"{folder}/{name}"
    if exists(path):
        return uuid_at(path)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(8000)
        out.writeframes(b"".join(struct.pack("<h", int(8000 * math.sin(2 * math.pi * 440 * i / 8000))) for i in range(8000)))
    data = buf.getvalue()
    query = (
        "mutation($parent:String!,$name:String!,$title:String!,$handle:String!){jcr{"
        ' addNode(parentPathOrId:$parent,name:$name,primaryNodeType:"jnt:file"){uuid'
        '  title: mutateProperty(name:"jcr:title"){setValue(value:$title)}'
        '  content: addChild(name:"jcr:content",primaryNodeType:"jnt:resource"){'
        '   data: mutateProperty(name:"jcr:data"){setValue(type:BINARY,value:$handle)}'
        '   mime: mutateProperty(name:"jcr:mimeType"){setValue(value:"audio/wav")}}}}}'
    )
    import json
    operations = json.dumps({"query": query, "variables": {"parent": folder, "name": name, "title": title, "handle": "audio"}})
    boundary = "----ctmdaudio"
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n{operations}\r\n'
        f'--{boundary}\r\nContent-Disposition: form-data; name="audio"; filename="{name}"\r\n'
        f"Content-Type: audio/wav\r\n\r\n"
    ).encode() + data + f"\r\n--{boundary}--\r\n".encode()
    out = json.loads(demo._request("/modules/graphql", body, {
        "Content-Type": f"multipart/form-data; boundary={boundary}", "Origin": demo.URL}))
    if out.get("errors"):
        raise RuntimeError(json.dumps(out["errors"])[:800])
    return out["data"]["jcr"]["addNode"]["uuid"]


def link_to(target, label):
    props = i18n("ctaLabel", label) + [{"name": "j:linkType", "value": "internal"}]
    props += [{"name": "j:linknode", "type": "WEAKREFERENCE", "value": target, "language": lang} for lang in LANGS]
    return props, ["ctplmix:cta", "jmix:internalLink"]


def ref(name, uuid):
    return {"name": name, "type": "WEAKREFERENCE", "value": uuid}


def refs(name, uuids):
    return {"name": name, "type": "WEAKREFERENCE", "values": uuids}


def seed(site_key):
    site = create_site(site_key)
    provisioning(f'- enable: "classic-media"\n  site: "{site_key}"\n', "application/yaml")
    home, contents = f"{site}/home", f"{site}/contents"

    root = add_category("/sites/systemsite/categories", site_key, {"en": "Test media", "fr": "Médias test"})
    cats = {
        "streaming": add_category(f"/sites/systemsite/categories/{site_key}", "streaming", {"en": "Streaming", "fr": "Streaming"}),
        "production": add_category(f"/sites/systemsite/categories/{site_key}", "production", {"en": "Production", "fr": "Production"}),
    }
    del root

    files = add_content(f"{site}/files", "media", "jnt:folder", [])
    images = [
        demo.upload_image(files, f"picture-{i}.jpg", title, (1200, 675), palette)
        for i, (title, palette) in enumerate([
            ("Control room at night", [(20, 30, 60), (60, 40, 110), (230, 120, 70)]),
            ("Camera on a crane", [(240, 220, 200), (200, 120, 90), (40, 60, 90)]),
            ("Portrait, soft light", [(220, 225, 235), (150, 160, 190), (90, 70, 120)]),
        ])
    ]
    audio = upload_audio(files, "episode-1.wav", "Episode 1, a short tone")

    people = add_content(contents, "people", "jnt:contentFolder", [])
    persons = {}
    for name, full, role, org, teaser in (
        ("mara", "Mara Lindqvist", {"en": "Senior editor", "fr": "Rédactrice en chef adjointe"}, "", {"en": "Covers streaming and distribution.", "fr": "Couvre le streaming et la distribution."}),
        ("ade", "Ade Okafor", {"en": "Head of production", "fr": "Directeur de production"}, "Northlight Studios", {"en": "Builds remote production workflows.", "fr": "Conçoit des chaînes de production à distance."}),
        ("lucia", "Lucía Álvarez", {"en": "Audio engineer", "fr": "Ingénieure du son"}, "Tidewave Audio", {"en": "Mixes live sport for broadcasters.", "fr": "Mixe le sport en direct pour les diffuseurs."}),
    ):
        path = add_content(people, name, "ctmd:person", i18n("jcr:title", {"en": full, "fr": full}) + i18n("role", role) + i18n("teaser", teaser)
                           + i18n("bio", {"en": f"<p>{full} is a fictional person of the classic-media test site.</p>", "fr": f"<p>{full} est une personne fictive du site de test de classic-media.</p>"})
                           + ([{"name": "organisation", "value": org}] if org else [])
                           + [ref("image", images[2])])
        persons[name] = uuid_at(path)
    demo.add_link(f"{people}/mara", "site", {"en": "Personal site", "fr": "Site personnel"}, url="https://example.com/mara")

    stories = add_content(contents, "stories", "jnt:contentFolder", [])
    for i, (name, fmt, title, authors, cat, extra) in enumerate((
        ("ad-tier", "news", {"en": "Free channels pass a new milestone", "fr": "Les chaînes gratuites franchissent un cap"}, ["mara"], "streaming", {}),
        ("remote", "feature", {"en": "Inside a remote production truck", "fr": "Dans un car de production à distance"}, ["ade", "mara"], "production", {}),
        ("opinion", "opinion", {"en": "Measure audiences, not devices", "fr": "Mesurer les publics, pas les écrans"}, ["mara"], "streaming", {}),
        ("video", "video", {"en": "Five minutes in a virtual studio", "fr": "Cinq minutes dans un studio virtuel"}, ["ade"], "production", {}),
        ("podcast", "podcast", {"en": "Episode 1: mixing a stadium", "fr": "Épisode 1 : mixer un stade"}, ["lucia"], "production", {"audio": audio}),
        ("report", "report", {"en": "The 2027 streaming report", "fr": "Le rapport streaming 2027"}, ["mara", "lucia"], "streaming", {"members": True}),
    )):
        props = i18n("jcr:title", title) + i18n("teaser", {"en": f"Test story {i + 1}, {fmt}.", "fr": f"Article de test {i + 1}, {fmt}."})
        props += i18n("body", {"en": "<p>" + "Body text of the test story. " * 60 + "</p>", "fr": "<p>" + "Texte de l'article de test. " * 60 + "</p>"})
        props += [{"name": "format", "value": fmt}, {"name": "publicationDate", "value": f"2026-10-{10 - i:02d}T09:00:00.000Z"},
                  refs("authors", [persons[a] for a in authors]), ref("image", images[i % 2]), refs("j:defaultCategory", [cats[cat]])]
        mixins = ["jmix:categorized"]
        if "audio" in extra:
            props += [ref("audio", extra["audio"])] + i18n("transcript", {"en": "<p>Transcript of the episode.</p>", "fr": "<p>Transcription de l'épisode.</p>"})
        if extra.get("members"):
            props += [{"name": "ctplMembersOnly", "value": "true"}]
            mixins.append("ctplmix:membersOnly")
        add_content(stories, name, "ctmd:story", props, mixins)

    event = add_content(contents, "event", "jnt:contentFolder", [{"name": "ctmdTimeZone", "value": "Europe/Lisbon"}], ["ctmdmix:eventFolder"])
    for name, start, end, room, stream, kind, title, speakers in (
        ("opening", "2027-06-08T08:30:00.000Z", "2027-06-08T09:15:00.000Z", "Main stage", "Conference", "keynote", {"en": "Opening keynote", "fr": "Conférence d'ouverture"}, [("mara", "keynote")]),
        ("coffee", "2027-06-08T09:15:00.000Z", "2027-06-08T09:45:00.000Z", "Foyer", "Conference", "break", {"en": "Coffee break", "fr": "Pause café"}, []),
        ("panel", "2027-06-08T10:00:00.000Z", "2027-06-08T11:00:00.000Z", "Room B2", "Technical papers", "panel", {"en": "Remote production at scale", "fr": "La production à distance à grande échelle"}, [("mara", "moderator"), ("ade", "panellist"), ("lucia", "panellist")]),
        ("workshop", "2027-06-09T13:00:00.000Z", "2027-06-09T14:30:00.000Z", "Lab", "Conference", "workshop", {"en": "Mixing for immersive audio", "fr": "Mixer pour l'audio immersif"}, [("lucia", "host")]),
    ):
        path = add_content(event, name, "ctmd:session", i18n("jcr:title", title) + i18n("room", {"en": room, "fr": room}) + i18n("stream", {"en": stream, "fr": stream})
                           + i18n("teaser", {"en": "Summary of the session.", "fr": "Résumé de la session."})
                           + [{"name": "start", "value": start}, {"name": "end", "value": end}, {"name": "sessionType", "value": kind}])
        for j, (person, role) in enumerate(speakers):
            add_content(path, f"speaker-{j + 1}", "ctmd:sessionSpeaker", [ref("person", persons[person]), {"name": "speakerRole", "value": role}])

    # Pages
    add_page(home, "stories", {"en": "Stories", "fr": "Articles"}, description={"en": "The latest test stories of every format, and the stories of the Production topic.", "fr": "Les derniers articles de test de tous les formats, et les articles du thème Production."})
    page = f"{home}/stories"
    demo.ensure_area(page, "main", "ctpl:pageArea")
    add_content(f"{page}/main", "latest", "ctmd:storyFeed", i18n("jcr:title", {"en": "Latest stories", "fr": "Derniers articles"})
                + [ref("startNode", uuid_at(stories)), {"name": "layout", "value": "lead"}, {"name": "showFilter", "value": "true"}])
    add_content(f"{page}/main", "production", "ctmd:storyFeed", i18n("jcr:title", {"en": "Production", "fr": "Production"})
                + [refs("filterCategories", [cats["production"]]), {"name": "layout", "value": "list"}, {"name": "maxItems", "value": "3"}])

    add_page(home, "streaming", {"en": "Streaming", "fr": "Streaming"}, description={"en": "Test stories filed under the Streaming topic, found from the page's own category.", "fr": "Les articles de test classés dans le thème Streaming, trouvés par la catégorie de la page."})
    topic = f"{home}/streaming"
    gql('mutation($p:String!,$c:[String]){jcr{mutateNode(pathOrId:$p){addMixins(mixins:["jmix:categorized"]) '
        'mutateProperty(name:"j:defaultCategory"){setValues(type:WEAKREFERENCE,values:$c)}}}}', {"p": topic, "c": [cats["streaming"]]})
    demo.ensure_area(topic, "main", "ctpl:pageArea")
    add_content(f"{topic}/main", "feed", "ctmd:storyFeed", i18n("jcr:title", {"en": "Latest in streaming", "fr": "Le streaming en ce moment"})
                + [{"name": "pageCategories", "value": "true"}])

    add_page(home, "programme", {"en": "Programme", "fr": "Programme"}, description={"en": "Key dates, agenda and speakers of the test event, held over two days in Lisbon.", "fr": "Dates clés, agenda et intervenants de l'événement de test, sur deux jours à Lisbonne."})
    prog = f"{home}/programme"
    demo.ensure_area(prog, "main", "ctpl:pageArea")
    cta_props, cta_mixins = link_to(uuid_at(page), {"en": "Read the stories", "fr": "Lire les articles"})
    dates = add_content(f"{prog}/main", "dates", "ctmd:keyDates", i18n("jcr:title", {"en": "Test event 2027", "fr": "Événement test 2027"})
                        + i18n("venue", {"en": "Harbour Hall, Lisbon", "fr": "Halle du port, Lisbonne"})
                        + [{"name": "eventStart", "value": "2027-06-08T00:00:00.000Z"}, {"name": "eventEnd", "value": "2027-06-09T00:00:00.000Z"}] + cta_props, cta_mixins)
    add_content(dates, "registration", "ctmd:keyDate", i18n("jcr:title", {"en": "Registration opens", "fr": "Ouverture des inscriptions"}) + [{"name": "date", "value": "2027-01-15T00:00:00.000Z"}])
    add_content(dates, "early", "ctmd:keyDate", i18n("jcr:title", {"en": "Early-bird rate ends", "fr": "Fin du tarif préférentiel"}) + i18n("detail", {"en": "Save 30% on the full pass.", "fr": "30 % de réduction sur le pass complet."}) + [{"name": "date", "value": "2027-03-31T00:00:00.000Z"}])
    add_content(f"{prog}/main", "agenda", "ctmd:agenda", i18n("jcr:title", {"en": "Programme", "fr": "Programme"}) + [ref("startNode", uuid_at(event))])
    add_content(f"{prog}/main", "speakers", "ctmd:speakerGallery", i18n("jcr:title", {"en": "Speakers", "fr": "Intervenants"}) + [ref("startNode", uuid_at(people)), {"name": "showIndex", "value": "true"}])

    publish(f"/sites/systemsite/categories/{site_key}")
    publish(site)
    print(f"seeded and published {site}")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--site", default="ctmd-test")
    seed(ap.parse_args().site)


if __name__ == "__main__":
    main()

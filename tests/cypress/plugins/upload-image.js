const fs = require('node:fs')
const path = require('node:path')

/**
 * Uploads an image fixture to the JCR as jnt:file + jmix:image (with j:width / j:height), from the
 * Node side of Cypress. Not @jahia/cypress uploadFile: its GraphQL-multipart "map" indirection can
 * store the literal name of a Java object instead of the bytes. Here jcr:data is set from a
 * multipart part whose NAME is passed as the value, then the stored value is read back.
 */
const uploadImage = async ({ baseUrl, password, parent, name, fixture, width, height, title }) => {
    const auth = 'Basic ' + Buffer.from(`root:${password}`).toString('base64')
    const headers = { Authorization: auth, Origin: new URL(baseUrl).origin }
    const query =
        'mutation($parent:String!,$name:String!,$title:String!,$w:String!,$h:String!){jcr{' +
        ' addNode(parentPathOrId:$parent,name:$name,primaryNodeType:"jnt:file",mixins:["jmix:image"]){uuid' +
        '  t: mutateProperty(name:"jcr:title"){setValue(value:$title)}' +
        '  w: mutateProperty(name:"j:width"){setValue(value:$w)}' +
        '  h: mutateProperty(name:"j:height"){setValue(value:$h)}' +
        '  c: addChild(name:"jcr:content",primaryNodeType:"jnt:resource"){' +
        '   d: mutateProperty(name:"jcr:data"){setValue(type:BINARY,value:"image")}' +
        '   m: mutateProperty(name:"jcr:mimeType"){setValue(value:"image/jpeg")}}}}}'
    const form = new FormData()
    form.append(
        'operations',
        JSON.stringify({ query, variables: { parent, name, title, w: String(width), h: String(height) } }),
    )
    const bytes = fs.readFileSync(path.join(__dirname, '..', 'fixtures', fixture))
    form.append('image', new Blob([bytes], { type: 'image/jpeg' }), name)
    const res = await fetch(`${baseUrl}/modules/graphql`, { method: 'POST', headers, body: form })
    const out = await res.json()
    if (out.errors) throw new Error(JSON.stringify(out.errors))

    const check = await fetch(`${baseUrl}/modules/graphql`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: 'query($path:String!){jcr{nodeByPath(path:$path){c:descendant(relPath:"jcr:content"){p:property(name:"jcr:data"){value}}}}}',
            variables: { path: `${parent}/${name}` },
        }),
    }).then((r) => r.json())
    const stored = check?.data?.jcr?.nodeByPath?.c?.p?.value || ''
    // A real upload reads back as a binary reference; nothing at all, or a Java object's name, is a failed one.
    if (!stored || stored.startsWith('org.apache.')) throw new Error(`upload of ${name} stored no image bytes`)
    return out.data.jcr.addNode.uuid
}

module.exports = { uploadImage }

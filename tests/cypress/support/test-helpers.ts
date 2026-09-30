import { addNode, createSite, deleteSite, getNodeByPath, publishAndWaitJobEnding } from '@jahia/cypress'
import { LANGUAGES, TEMPLATE_SET } from './constants'

/** Creates a site on the classic-templates template set, with EN and FR, and publishes it. */
export const createTestSite = (siteKey: string): void => {
    deleteSite(siteKey)
    createSite(siteKey, {
        templateSet: TEMPLATE_SET,
        locale: 'en',
        languages: LANGUAGES.join(','),
        serverName: 'localhost',
    })
    publishAndWaitJobEnding(`/sites/${siteKey}`, LANGUAGES)
}

export interface PageSpec {
    name: string
    template: string
    title: { en: string; fr: string }
    description?: { en: string; fr: string }
    /** Sets the "Hide from navigation" page option. */
    hiddenFromNav?: boolean
}

/** Adds a page under `parentPath` with EN and FR titles (and descriptions) and the given template. */
export const addPage = (parentPath: string, page: PageSpec) =>
    addNode({
        parentPathOrId: parentPath,
        name: page.name,
        primaryNodeType: 'jnt:page',
        properties: [
            { name: 'jcr:title', value: page.title.en, language: 'en' },
            { name: 'jcr:title', value: page.title.fr, language: 'fr' },
            ...(page.description
                ? [
                      { name: 'jcr:description', value: page.description.en, language: 'en' },
                      { name: 'jcr:description', value: page.description.fr, language: 'fr' },
                  ]
                : []),
            { name: 'j:templateName', type: 'STRING', value: page.template },
            ...(page.hiddenFromNav ? [{ name: 'ctplHideFromNav', value: 'true' }] : []),
        ],
        mixins: page.hiddenFromNav ? ['ctplmix:pageOptions'] : [],
    })

/** The uuid returned by addNode / addPage. */
export const uuidOf = (result: { data: { jcr: { addNode: { uuid: string } } } }) => result.data.jcr.addNode.uuid

export interface LinkSpec {
    name: string
    title?: { en?: string; fr?: string }
    /** Internal link: target uuid, set in each of `languages` (link targets are i18n). */
    target?: string
    /** External link URL, set in each of `languages`. */
    url?: string
    languages?: string[]
    newTab?: boolean
}

/** Adds a ctpl:link to a ctpl:linkList. */
export const addLink = (listPath: string, link: LinkSpec) => {
    const languages = link.languages ?? ['en', 'fr']
    const titles = Object.entries(link.title ?? {}).map(([language, value]) => ({ name: 'jcr:title', value, language }))
    const target = link.target
        ? languages.map((language) => ({ name: 'j:linknode', type: 'WEAKREFERENCE', value: link.target, language }))
        : languages.map((language) => ({ name: 'j:url', value: link.url, language }))
    return addNode({
        parentPathOrId: listPath,
        name: link.name,
        primaryNodeType: 'ctpl:link',
        mixins: [link.target ? 'jmix:internalLink' : 'jmix:externalLink'],
        properties: [
            ...titles,
            ...target,
            { name: 'j:linkType', value: link.target ? 'internal' : 'external' },
            { name: 'openInNewTab', value: String(Boolean(link.newTab)) },
        ],
    })
}

/** Paths of the seeded chrome (import.xml) of a site. */
export const chromeOf = (siteKey: string) => {
    const home = `/sites/${siteKey}/home`
    return {
        home,
        header: `${home}/siteHeader/header`,
        utility: `${home}/siteHeader/header/utilityLinks`,
        navigation: `${home}/siteHeader/header/navigation`,
        footer: `${home}/siteFooter/footer`,
        columns: `${home}/siteFooter/footer/columns`,
        legal: `${home}/siteFooter/footer/legal`,
        social: `${home}/siteFooter/footer/social`,
    }
}

/** The page's `<h1>` elements (the template must render exactly one). */
export const pageHeadings = () => cy.get('h1')

/** Uploads tests/cypress/fixtures/images/landscape.jpg into the site's files as an image. Yields its uuid. */
export const uploadTestImage = (siteKey: string, name = 'landscape.jpg', title = 'Test landscape') =>
    cy.task<string>('uploadImage', {
        parent: `/sites/${siteKey}/files`,
        name,
        fixture: 'images/landscape.jpg',
        width: 1200,
        height: 675,
        title,
    })

/** Adds a content node with EN/FR i18n values given as { prop: { en, fr } } plus plain properties. */
export const addContent = (
    parentPath: string,
    name: string,
    primaryNodeType: string,
    i18nProps: Record<string, { en: string; fr: string }>,
    props: { name: string; value: string; type?: string; language?: string }[] = [],
    mixins: string[] = [],
) =>
    addNode({
        parentPathOrId: parentPath,
        name,
        primaryNodeType,
        mixins,
        properties: [
            ...Object.entries(i18nProps).flatMap(([prop, v]) => [
                { name: prop, value: v.en, language: 'en' },
                { name: prop, value: v.fr, language: 'fr' },
            ]),
            ...props,
        ],
    })

/** Properties of an internal call to action (ctplmix:cta) to `target`, set in both languages. */
export const ctaTo = (target: string) => ({
    props: [
        { name: 'j:linkType', value: 'internal' },
        { name: 'j:linknode', type: 'WEAKREFERENCE', value: target, language: 'en' },
        { name: 'j:linknode', type: 'WEAKREFERENCE', value: target, language: 'fr' },
    ],
    mixins: ['jmix:internalLink'],
})

export interface EditorialSpec {
    name: string
    title: { en: string; fr?: string }
    teaser?: { en: string; fr?: string }
    /** YYYY-MM-DD */
    date: string
    author?: string
    tags?: string[]
    /** Category identifiers (j:defaultCategory). */
    categories?: string[]
}

/** Adds a jnt:category (EN and FR title) under `parent`; resolves to its uuid. */
export const addCategory = (parent: string, name: string, title: string) =>
    addNode({
        parentPathOrId: parent,
        name,
        primaryNodeType: 'jnt:category',
        properties: [
            { name: 'jcr:title', value: title, language: 'en' },
            { name: 'jcr:title', value: title, language: 'fr' },
        ],
    }).then((res: { data: { jcr: { addNode: { uuid: string } } } }) => res.data.jcr.addNode.uuid)

/** Adds a ctpl:news or ctpl:article to a content folder; French is set only when given. */
export const addEditorial = (folder: string, type: 'ctpl:news' | 'ctpl:article', item: EditorialSpec) => {
    const i18nValue = (name: string, v?: { en: string; fr?: string }) =>
        v ? [{ name, value: v.en, language: 'en' }, ...(v.fr ? [{ name, value: v.fr, language: 'fr' }] : [])] : []
    return addNode({
        parentPathOrId: folder,
        name: item.name,
        primaryNodeType: type,
        mixins: [...(item.tags ? ['jmix:tagged'] : []), ...(item.categories ? ['jmix:categorized'] : [])],
        properties: [
            ...i18nValue('jcr:title', item.title),
            ...i18nValue('teaser', item.teaser),
            { name: 'publicationDate', type: 'DATE', value: `${item.date}T09:00:00.000+02:00` },
            ...(item.author ? [{ name: 'author', value: item.author }] : []),
            ...(item.tags ? [{ name: 'j:tagList', values: item.tags }] : []),
            ...(item.categories ? [{ name: 'j:defaultCategory', type: 'WEAKREFERENCE', values: item.categories }] : []),
        ],
    })
}

/** Adds a ctpl:jcrQuery listing `type` under `startUuid`. */
export const addList = (
    parent: string,
    name: string,
    options: {
        type: string
        startUuid: string
        title?: { en: string; fr: string }
        layout?: 'grid' | 'list'
        max?: number
        direction?: 'asc' | 'desc'
        exclude?: string[]
        /** Category identifiers: the list keeps items filed under any of them or their subcategories. */
        categories?: string[]
        noResult?: { en: string; fr: string }
    },
) =>
    addContent(
        parent,
        name,
        'ctpl:jcrQuery',
        {
            ...(options.title ? { 'jcr:title': options.title } : {}),
            ...(options.noResult ? { noResultText: options.noResult } : {}),
        },
        [
            { name: 'type', value: options.type },
            { name: 'startNode', type: 'WEAKREFERENCE', value: options.startUuid },
            { name: 'layout', value: options.layout ?? 'grid' },
            { name: 'maxItems', value: String(options.max ?? 6) },
            { name: 'sortDirection', value: options.direction ?? 'desc' },
            ...(options.exclude ? [{ name: 'excludeNodes', type: 'WEAKREFERENCE', values: options.exclude }] : []),
            ...(options.categories
                ? [{ name: 'filterCategories', type: 'WEAKREFERENCE', values: options.categories }]
                : []),
        ] as { name: string; value: string; type?: string }[],
    )

/** The uuid of the node at `path`. */
export const uuidAt = (path: string) =>
    getNodeByPath(path).then((res: { data: { jcr: { nodeByPath: { uuid: string } } } }) => res.data.jcr.nodeByPath.uuid)

import { addNode, createSite, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
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

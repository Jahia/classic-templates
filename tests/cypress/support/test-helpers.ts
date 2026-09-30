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
        ],
    })

/** The page's `<h1>` elements (the template must render exactly one). */
export const pageHeadings = () => cy.get('h1')

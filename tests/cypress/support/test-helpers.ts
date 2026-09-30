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

/** Adds a page under `parentPath` with an EN title and the given template. */
export const addPage = (parentPath: string, name: string, title: string, template: string) =>
    addNode({
        parentPathOrId: parentPath,
        name,
        primaryNodeType: 'jnt:page',
        properties: [
            { name: 'jcr:title', value: title, language: 'en' },
            { name: 'j:templateName', type: 'STRING', value: template },
        ],
    })

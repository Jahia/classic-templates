import { addNode, createSite, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor, TEMPLATE_SET } from '../../support/constants'

/**
 * In live, when the request host is the server name of a site, Jahia makes that site the request's
 * site (renderContext.getSite(), org.jahia.bin.Render.resolveSite), whatever site the page belongs
 * to; localhost and unknown hosts keep the page's site. Several sites served under one host (Jahia
 * Cloud) then get one site's languages: the switcher must read the languages of the page's own site.
 */
const other = { key: siteKeyFor('switcher-b'), serverName: 'ctpl-switcher-b.example.org' }
const sites = [
    {
        key: siteKeyFor('switcher-a'),
        serverName: 'localhost',
        languages: ['en', 'fr'],
        titles: { en: 'Alpha', fr: 'Alpha FR' },
    },
    { key: other.key, serverName: other.serverName, languages: ['en', 'de'], titles: { en: 'Beta', de: 'Beta DE' } },
]
const hreflangs = (html: string) =>
    Cypress.$(html)
        .find('[data-testid="ctpl-language-switcher"] a')
        .toArray()
        .map((a) => a.getAttribute('hreflang'))

describe('Language switcher - several sites under one host', () => {
    before(() => {
        cy.login()
        sites.forEach(({ key, serverName, languages, titles }) => {
            deleteSite(key)
            createSite(key, { templateSet: TEMPLATE_SET, locale: 'en', languages: languages.join(','), serverName })
            addNode({
                parentPathOrId: `/sites/${key}/home`,
                name: 'page',
                primaryNodeType: 'jnt:page',
                properties: [
                    ...Object.entries(titles).map(([language, value]) => ({ name: 'jcr:title', value, language })),
                    { name: 'j:templateName', type: 'STRING', value: 'content' },
                ],
            })
            publishAndWaitJobEnding(`/sites/${key}`, languages)
        })
        cy.logout()
    })

    after(() => {
        cy.login()
        sites.forEach(({ key }) => deleteSite(key))
        cy.logout()
    })

    it('lists the languages of the page own site in live, on the host of another site', () => {
        sites.forEach(({ key, languages }) => {
            cy.request({ url: `/cms/render/live/en/sites/${key}/home/page.html`, headers: { Host: other.serverName } })
                .its('body')
                .then((body: string) => expect(hreflangs(body), key).to.have.members(languages))
        })
    })

    it('lists the languages of the page own site in preview', () => {
        cy.login()
        sites.forEach(({ key, languages }) => {
            cy.request(`/cms/render/default/en/sites/${key}/home/page.html`)
                .its('body')
                .then((body: string) => expect(hreflangs(body), key).to.have.members(languages))
        })
        cy.logout()
    })
})

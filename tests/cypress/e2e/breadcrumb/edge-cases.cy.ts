import { addMixins, addNode, deleteSite, publishAndWaitJobEnding, removeMixins, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addEditorial, addPage, createTestSite, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('breadcrumb-edge')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const listed = `${site}/contents/listed/item.html`
const unlisted = `${site}/contents/news/item.html`
const crumbs = '[data-testid="ctpl-breadcrumb"] li'
const hint = '[data-testid="ctpl-breadcrumb-hint"]'

describe('Breadcrumb of items - edit-mode hint, cache refresh, site switch', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'stories', template: 'content', title: { en: 'Stories', fr: 'Récits' } }).then(
            (stories) =>
                addNode({
                    parentPathOrId: `${site}/contents`,
                    name: 'listed',
                    primaryNodeType: 'jnt:contentFolder',
                    mixins: ['ctplmix:listingPage'],
                    properties: [{ name: 'ctplListingPage', type: 'WEAKREFERENCE', value: uuidOf(stories) }],
                }).then(() =>
                    addEditorial(`${site}/contents/listed`, 'ctpl:article', {
                        name: 'item',
                        title: { en: 'Listed story', fr: 'Récit listé' },
                        date: '2026-09-12',
                    }),
                ),
        )
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'item',
            title: { en: 'Unlisted news', fr: 'Actualité non listée' },
            date: '2026-09-14',
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('tells the editor, in edit mode only, where to set the listing page of an unlisted item', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${unlisted}`)
            .its('body')
            .should('contain', 'data-testid="ctpl-breadcrumb-hint"')
            .and('contain', 'Listing page settings')
        cy.request(`/cms/editframe/default/fr${unlisted}`).its('body').should('contain', 'Page de liste')
        cy.request(`/cms/editframe/default/en${listed}`)
            .its('body')
            .should('not.contain', 'data-testid="ctpl-breadcrumb-hint"')
        cy.logout()
        cy.visit(unlisted)
        cy.get(crumbs).should('have.length', 2)
        cy.get(hint).should('not.exist')
    })

    it('goes back to Home > item once the folder no longer names a listing page', () => {
        cy.visit(listed)
        cy.get(crumbs).should('have.length', 3).eq(1).should('have.text', 'Stories')
        cy.login()
        removeMixins(`${site}/contents/listed`, ['ctplmix:listingPage'])
        publishAndWaitJobEnding(`${site}/contents/listed`, ['en', 'fr'])
        cy.logout()
        // The cached item page depends on its folder: the change shows without touching the item.
        cy.visit(listed)
        cy.get(crumbs).should('have.length', 2).first().should('have.text', 'Home')
    })

    it('shows no trail and no BreadcrumbList on items when the site turns breadcrumbs off', () => {
        cy.login()
        addMixins(site, ['ctplmix:siteSettings'])
        setNodeProperty(site, 'ctplShowBreadcrumb', 'false', 'en')
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
        cy.visit(unlisted)
        cy.get('[data-testid="ctpl-breadcrumb"]').should('not.exist')
        cy.get('script[type="application/ld+json"]')
            .invoke('text')
            .then((text) => {
                const graph = JSON.parse(text)['@graph'] as { '@type': string }[]
                expect(graph.map((node) => node['@type'])).not.to.include('BreadcrumbList')
            })
        cy.login()
        setNodeProperty(site, 'ctplShowBreadcrumb', 'true', 'en')
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })
})

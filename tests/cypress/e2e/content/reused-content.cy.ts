import { addNode, createSite, deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { TEMPLATE_SET, siteKeyFor } from '../../support/constants'
import { uuidAt } from '../../support/test-helpers'

// Ctpl:reusedContent: content kept on one site (a brand site) shown in the page areas of another
// (a market site). The platform's jnt:contentReference is refused by those areas.
const brand = siteKeyFor('reuse-brand')
const market = siteKeyFor('reuse-market')

const site = (key: string) =>
    createSite(key, { templateSet: TEMPLATE_SET, locale: 'en', languages: 'en,fr', serverName: 'localhost' })

describe('Reused content - an item of one site shown on another', () => {
    before(() => {
        cy.login()
        deleteSite(market)
        deleteSite(brand)
        site(brand)
        site(market)
        addNode({ parentPathOrId: `/sites/${brand}/contents`, name: 'campaigns', primaryNodeType: 'jnt:contentFolder' })
        addNode({
            parentPathOrId: `/sites/${brand}/contents/campaigns`,
            name: 'glow-week',
            primaryNodeType: 'ctpl:heroBanner',
            properties: [
                { name: 'jcr:title', value: 'Glow week', language: 'en' },
                { name: 'jcr:title', value: 'Semaine éclat', language: 'fr' },
                { name: 'variant', value: 'plain' },
            ],
        })
        addNode({ parentPathOrId: `/sites/${market}/home`, name: 'hero', primaryNodeType: 'ctpl:heroArea' })
        uuidAt(`/sites/${brand}/contents/campaigns/glow-week`).then((banner) =>
            addNode({
                parentPathOrId: `/sites/${market}/home/hero`,
                name: 'campaign',
                primaryNodeType: 'ctpl:reusedContent',
                properties: [{ name: 'j:node', type: 'WEAKREFERENCE', value: banner }],
            }),
        )
        publishAndWaitJobEnding(`/sites/${brand}`, ['en', 'fr'])
        publishAndWaitJobEnding(`/sites/${market}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(market)
        deleteSite(brand)
        cy.logout()
    })

    it('shows the other site’s banner in the hero area, in each language', () => {
        cy.visit(`/sites/${market}/home.html`)
        cy.get('[data-testid="ctpl-hero-banner"]').should('have.length', 1).and('contain.text', 'Glow week')
        cy.visit(`/fr/sites/${market}/home.html`)
        cy.get('[data-testid="ctpl-hero-banner"]').should('contain.text', 'Semaine éclat')
    })

    it('follows an edit of the original once it is published', () => {
        cy.login()
        setNodeProperty(`/sites/${brand}/contents/campaigns/glow-week`, 'jcr:title', 'Glow week, extended', 'en')
        publishAndWaitJobEnding(`/sites/${brand}/contents/campaigns/glow-week`, ['en'])
        cy.logout()
        cy.visit(`/sites/${market}/home.html`)
        cy.get('[data-testid="ctpl-hero-banner"]').should('contain.text', 'Glow week, extended')
    })
})

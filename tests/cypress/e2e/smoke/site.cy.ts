import { deleteSite, getNodeByPath } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('smoke')

describe('Smoke - a site on the template set renders', () => {
    before('Create test site', () => {
        cy.login()
        createTestSite(siteKey)
        cy.logout()
    })

    after('Delete test site', () => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('serves the live home page to anonymous visitors', () => {
        cy.request(`/sites/${siteKey}/home.html`).its('status').should('eq', 200)
        cy.visit(`/sites/${siteKey}/home.html`)
        cy.get('html').should('have.attr', 'lang', 'en')
    })

    it('serves the live home page in French', () => {
        cy.visit(`/fr/sites/${siteKey}/home.html`)
        cy.get('html').should('have.attr', 'lang', 'fr')
    })

    it('seeds a fresh site with its header, footer and hidden home title (import.xml)', () => {
        cy.visit(`/sites/${siteKey}/home.html`)
        cy.get('[data-testid="ctpl-site-header"]').should('exist')
        cy.get('[data-testid="ctpl-site-footer"] [data-testid="ctpl-copyright"]').should(
            'contain.text',
            String(new Date().getFullYear()),
        )
        cy.get('h1').should('have.length', 1).and('not.be.visible')
    })

    it('seeds the news and articles folders, each restricted to its type', () => {
        cy.login()
        for (const [folder, type] of [
            ['news', 'ctpl:news'],
            ['articles', 'ctpl:article'],
        ]) {
            getNodeByPath(`/sites/${siteKey}/contents/${folder}`, ['j:contributeTypes']).then(
                (res: { data: { jcr: { nodeByPath: { properties: { values: string[] }[] } } } }) => {
                    expect(res.data.jcr.nodeByPath.properties[0].values).to.deep.equal([type])
                },
            )
        }

        cy.logout()
    })

    it('renders the home page in preview for an editor', () => {
        cy.login()
        cy.visit(`/cms/render/default/en/sites/${siteKey}/home.html`)
        cy.get('html').should('have.attr', 'lang', 'en')
        cy.logout()
    })
})

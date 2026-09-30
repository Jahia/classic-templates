import { deleteSite } from '@jahia/cypress'
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

    it('renders the home page in preview for an editor', () => {
        cy.login()
        cy.visit(`/cms/render/default/en/sites/${siteKey}/home.html`)
        cy.get('html').should('have.attr', 'lang', 'en')
        cy.logout()
    })
})

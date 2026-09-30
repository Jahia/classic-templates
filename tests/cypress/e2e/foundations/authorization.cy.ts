import { deleteSite } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('foundations-auth')

describe('Foundations - access', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('serves live pages to anonymous visitors', () => {
        cy.request(`/sites/${siteKey}/home.html`).its('status').should('eq', 200)
    })

    it('does not serve the edit workspace to anonymous visitors', () => {
        cy.request({ url: `/cms/render/default/en/sites/${siteKey}/home.html`, failOnStatusCode: false })
            .its('status')
            .should('be.oneOf', [401, 403, 404])
    })

    it('serves the edit workspace to an editor', () => {
        cy.login()
        cy.request(`/cms/render/default/en/sites/${siteKey}/home.html`).its('status').should('eq', 200)
        cy.logout()
    })
})

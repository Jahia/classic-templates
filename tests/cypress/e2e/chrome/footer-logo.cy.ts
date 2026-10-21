import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, chromeOf, createTestSite, uploadTestImage } from '../../support/test-helpers'

const siteKey = siteKeyFor('footer-logo')
const chrome = chromeOf(siteKey)

describe('Chrome - footer logo and multi-line tagline', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        uploadTestImage(siteKey).then((logo) => {
            cy.apollo({
                mutationFile: 'graphql/mutation/setFooterLogo.graphql',
                variables: { footerPath: chrome.footer, logo },
            })
        })
        setNodeProperty(chrome.footer, 'tagline', 'Head office\n1 Main Street\nSpringfield', 'en')
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows the logo instead of the site name, named after the site', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-footer-logo"]').should('be.visible').and('have.attr', 'alt', siteKey)
        cy.get('[data-testid="ctpl-site-footer"]').contains('p', siteKey).should('not.exist')
    })

    it('keeps the line breaks of the tagline, so an address reads as an address', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-site-footer"]')
            .contains('p', 'Head office')
            .should('have.css', 'white-space', 'pre-line')
            .invoke('prop', 'innerText')
            .should('eq', 'Head office\n1 Main Street\nSpringfield')
    })
})

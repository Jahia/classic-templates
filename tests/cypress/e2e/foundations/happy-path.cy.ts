import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, createTestSite, pageHeadings } from '../../support/test-helpers'

const siteKey = siteKeyFor('foundations')
const about = {
    name: 'about',
    template: 'content',
    title: { en: 'About us', fr: 'À propos' },
    description: { en: 'Who we are.', fr: 'Qui nous sommes.' },
}
const landing = { name: 'landing', template: 'fullWidth', title: { en: 'Landing', fr: 'Atterrissage' } }

describe('Foundations - document baseline of every template', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`/sites/${siteKey}/home`, about)
        addPage(`/sites/${siteKey}/home`, landing)
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders a content page with title, description, skip link and one visible h1', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('html').should('have.attr', 'lang', 'en')
        cy.title().should('eq', `About us | ${siteKey}`)
        cy.get('meta[name="description"]').should('have.attr', 'content', 'Who we are.')
        cy.get('a.ctpl-skip-link').should('have.attr', 'href', '#main-content')
        cy.get('main#main-content').should('have.length', 1)
        pageHeadings().should('have.length', 1).and('have.text', 'About us').and('be.visible')
    })

    it('renders the French version with French title and description', () => {
        cy.visit(`/fr/sites/${siteKey}/home/about.html`)
        cy.get('html').should('have.attr', 'lang', 'fr')
        cy.title().should('eq', `À propos | ${siteKey}`)
        cy.get('meta[name="description"]').should('have.attr', 'content', 'Qui nous sommes.')
        pageHeadings().should('have.length', 1).and('have.text', 'À propos')
    })

    it('keeps the seeded home page title for assistive technology only', () => {
        cy.visit(`/sites/${siteKey}/home.html`)
        pageHeadings().should('have.length', 1).and('have.text', 'Home').and('not.be.visible')
        cy.get('.ctpl-visually-hidden h1').should('exist')
    })

    it('renders the full-width template with its visible h1', () => {
        cy.visit(`/sites/${siteKey}/home/landing.html`)
        pageHeadings().should('have.length', 1).and('have.text', 'Landing').and('be.visible')
    })

    it('moves keyboard focus to the main content through the skip link', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('a.ctpl-skip-link').focus()
        cy.focused().should('have.class', 'ctpl-skip-link').and('be.visible')
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, createTestSite, jsonLd, pageHeadings } from '../../support/test-helpers'

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

    it('describes the page in schema.org JSON-LD, with absolute URLs', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        jsonLd().then((node) => {
            const page = node('WebPage')
            expect(page).to.include({ name: 'About us', description: 'Who we are.', inLanguage: 'en' })
            expect(page?.url).to.match(new RegExp(`^https?://[^/]+/sites/${siteKey}/home/about\\.html$`))
            expect(node('WebSite')?.['@id']).to.match(/^https?:\/\/.+#website$/)
            expect(node('Organization')?.name).to.eq(siteKey)
        })
        cy.visit(`/fr/sites/${siteKey}/home/about.html`)
        jsonLd().then((node) => expect(node('WebPage')).to.include({ name: 'À propos', inLanguage: 'fr' }))
    })

    it('writes Open Graph and Twitter card tags from the page title and description', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('meta[property="og:title"]').should('have.attr', 'content', `About us | ${siteKey}`)
        cy.get('meta[property="og:description"]').should('have.attr', 'content', 'Who we are.')
        cy.get('meta[property="og:type"]').should('have.attr', 'content', 'website')
        cy.get('meta[property="og:url"]')
            .should('have.attr', 'content')
            .and('match', /^https?:\/\/[^/]+\/sites\/.+\/home\/about\.html$/)
        cy.get('meta[property="og:locale"]').should('have.attr', 'content', 'en')
        // This test site has no image anywhere (no SEO image, hero, default share image or logo)
        cy.get('meta[property="og:image"]').should('not.exist')
        cy.get('meta[name="twitter:card"]').should('have.attr', 'content', 'summary')
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

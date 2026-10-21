import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addLink, addPage, chromeOf, createTestSite, uploadTestImage } from '../../support/test-helpers'

const siteKey = siteKeyFor('footer-logo')
const chrome = chromeOf(siteKey)

describe('Chrome - footer logo, multi-line tagline and social icons', () => {
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
        addLink(chrome.social, {
            name: 'linkedin',
            title: { en: 'Our LinkedIn page', fr: 'Notre page LinkedIn' },
            url: 'https://www.linkedin.com/company/example',
            newTab: true,
        })
        addLink(chrome.social, { name: 'blog', title: { en: 'Blog', fr: 'Blog' }, url: 'https://blog.example.com/' })
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

    it('draws a social network link as its icon, named by its title, and another link as text', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-link-list-social"] a[data-social="linkedin"]')
            .should('have.attr', 'href', 'https://www.linkedin.com/company/example')
            .and('contain.text', 'Our LinkedIn page')
            .find('svg[aria-hidden="true"]')
            .should('be.visible')
        cy.get('[data-testid="ctpl-link-list-social"] a')
            .contains('Blog')
            .should('be.visible')
            .parent('a')
            .should('not.have.attr', 'data-social')
    })
})

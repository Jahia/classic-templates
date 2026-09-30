import { addNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addLink, addPage, chromeOf, createTestSite, jsonLd, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('chrome')
const chrome = chromeOf(siteKey)
const page = (path: string) => `/sites/${siteKey}/home/${path}.html`

describe('Chrome - header, main navigation, language switcher, footer', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'services', template: 'content', title: { en: 'Services', fr: 'Services' } }).then(
            (services) => {
                addPage(`${chrome.home}/services`, {
                    name: 'consulting',
                    template: 'content',
                    title: { en: 'Consulting', fr: 'Conseil' },
                })
                addPage(`${chrome.home}/services/consulting`, {
                    name: 'strategy',
                    template: 'content',
                    title: { en: 'Strategy', fr: 'Stratégie' },
                })
                addLink(chrome.utility, { name: 'services', target: uuidOf(services) })
                addLink(chrome.utility, {
                    name: 'academy',
                    title: { en: 'Academy', fr: 'Académie' },
                    url: 'https://academy.jahia.com',
                    newTab: true,
                })
                addNode({
                    parentPathOrId: chrome.columns,
                    name: 'company',
                    primaryNodeType: 'ctpl:linkList',
                    properties: [
                        { name: 'jcr:title', value: 'Company', language: 'en' },
                        { name: 'jcr:title', value: 'Société', language: 'fr' },
                    ],
                }).then(() => addLink(`${chrome.columns}/company`, { name: 'services', target: uuidOf(services) }))
            },
        )
        addPage(chrome.home, { name: 'contact', template: 'content', title: { en: 'Contact', fr: 'Contact' } })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders the utility links above the main bar, with new-tab links announced', () => {
        cy.visit(page('services/consulting'))
        cy.get('[data-testid="ctpl-site-header"] [data-list-name="utilityLinks"] a').should('have.length', 2)
        cy.get('[data-list-name="utilityLinks"] a').first().should('have.text', 'Services')
        cy.get('[data-list-name="utilityLinks"] a[target="_blank"]')
            .should('have.attr', 'rel', 'noopener noreferrer')
            .and('contain.text', 'opens in a new tab')
    })

    it('links the brand to the home page, named after the site', () => {
        cy.visit(page('contact'))
        cy.get('[data-testid="ctpl-brand"]')
            .should('have.attr', 'href', `/sites/${siteKey}/home.html`)
            .and('contain.text', siteKey)
    })

    it('builds the main menu three levels deep from the page tree', () => {
        cy.visit(page('contact'))
        cy.get('[data-testid="ctpl-main-navigation"]').within(() => {
            cy.contains('a', 'Services').should('have.attr', 'href', `/sites/${siteKey}/home/services.html`)
            cy.contains('a', 'Consulting').should('exist')
            cy.contains('a', 'Strategy').should(
                'have.attr',
                'href',
                `/sites/${siteKey}/home/services/consulting/strategy.html`,
            )
            cy.contains('a', 'Contact').should('exist')
        })
    })

    it('marks the current page and its menu ancestors', () => {
        cy.visit(page('services/consulting/strategy'))
        cy.get('[data-testid="ctpl-main-navigation"] a[aria-current="page"]')
            .should('have.length', 1)
            .and('have.text', 'Strategy')
        cy.get('[data-testid="ctpl-main-navigation"] [data-active] > a').first().should('have.text', 'Services')
    })

    it('opens a submenu with its button and closes it with Escape, returning focus', () => {
        cy.visit(page('contact'))
        cy.get('[data-ctpl-subnav-toggle]').first().as('toggle').click()
        cy.get('@toggle').should('have.attr', 'aria-expanded', 'true')
        cy.get('@toggle')
            .invoke('attr', 'aria-controls')
            .then((id) => cy.get(`#${id}`).should('be.visible'))
        cy.get('@toggle').type('{esc}')
        cy.get('@toggle').should('have.attr', 'aria-expanded', 'false')
        cy.focused().should('have.attr', 'data-ctpl-subnav-toggle')
    })

    it('collapses the menu behind a button on small screens', () => {
        cy.viewport(375, 812)
        cy.visit(page('contact'))
        cy.get('[data-ctpl-nav-list]').should('not.be.visible')
        cy.get('[data-ctpl-nav-toggle]').should('be.visible').click()
        cy.get('[data-ctpl-nav-toggle]').should('have.attr', 'aria-expanded', 'true')
        cy.get('[data-ctpl-nav-list]').should('be.visible')
    })

    it('switches language to the same page and renders French labels', () => {
        cy.visit(page('services/consulting'))
        cy.get('[data-testid="ctpl-language-switcher"] a[hreflang="fr"]').should(
            'have.attr',
            'href',
            `/fr/sites/${siteKey}/home/services/consulting.html`,
        )
        cy.visit(`/fr${page('services/consulting')}`)
        cy.get('[data-testid="ctpl-language-switcher"] a[aria-current="true"]').should('have.attr', 'hreflang', 'fr')
        cy.get('[data-testid="ctpl-main-navigation"]')
            .should('have.attr', 'aria-label', 'Navigation principale')
            .contains('a', 'Conseil')
        cy.get('[data-list-name="utilityLinks"]')
            .should('have.attr', 'aria-label', 'Liens rapides')
            .contains('a', 'Académie')
    })

    it('renders the footer columns and a copyright with the current year', () => {
        cy.visit(page('contact'))
        cy.get('[data-testid="ctpl-site-footer"]').within(() => {
            cy.contains('h2', 'Company')
            cy.contains('a', 'Services')
            cy.get('[data-testid="ctpl-copyright"]').should('contain.text', String(new Date().getFullYear()))
        })
    })

    it('shows the breadcrumb trail from home to the current page, before the main content', () => {
        cy.visit(page('services/consulting/strategy'))
        cy.get('[data-testid="ctpl-breadcrumb"]').within(() => {
            cy.get('li').should('have.length', 4)
            cy.get('li a').then(($a) => {
                expect([...$a].map((a) => a.textContent)).to.deep.equal(['Home', 'Services', 'Consulting'])
            })
            cy.contains('li a', 'Consulting').should('have.attr', 'href', page('services/consulting'))
            cy.get('[aria-current="page"]').should('have.text', 'Strategy')
        })
        cy.get('[data-testid="ctpl-breadcrumb"] + main#main-content').should('exist')
        // The same trail for search engines, as a schema.org BreadcrumbList.
        jsonLd().then((node) => {
            const items = node('BreadcrumbList')?.itemListElement as { name: string; position: number }[]
            expect(items.map((item) => item.name)).to.deep.equal(['Home', 'Services', 'Consulting', 'Strategy'])
            expect(items[3].position).to.eq(4)
        })
    })

    it('renders no breadcrumb on the home page, and French labels on French pages', () => {
        cy.visit(`/sites/${siteKey}/home.html`)
        cy.get('[data-testid="ctpl-breadcrumb"]').should('not.exist')
        cy.visit(`/fr${page('services/consulting')}`)
        cy.get('[data-testid="ctpl-breadcrumb"]')
            .should('have.attr', 'aria-label', "Fil d'Ariane")
            .and('contain.text', 'Accueil')
            .find('[aria-current="page"]')
            .should('have.text', 'Conseil')
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, chromeOf, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('chrome-auth')
const chrome = chromeOf(siteKey)
const editFrame = (path: string) => `/cms/editframe/default/en/sites/${siteKey}/${path}.html`

describe('Chrome - who can edit the shared header and footer', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows the header and footer to anonymous visitors on every page', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-site-header"]').should('exist')
        cy.get('[data-testid="ctpl-site-footer"]').should('exist')
    })

    it('lets an editor edit them on the home page', () => {
        cy.login()
        cy.request(editFrame('home')).then(({ body }) => {
            // Page Builder markers: <div jahiatype="module" ... type="absoluteArea" ... path="...">
            const area = (name: string) =>
                new RegExp(`jahiatype="module"[^>]*type="absoluteArea"[^>]*path="/sites/${siteKey}/home/${name}"`)
            expect(body).to.match(area('siteHeader'))
            expect(body).to.match(area('siteFooter'))
            expect(body).to.contain(`path="/sites/${siteKey}/home/siteHeader/header"`)
        })
        cy.logout()
    })

    it('locks them, children included, on every other page', () => {
        cy.login()
        cy.request(editFrame('home/about')).then(({ body }) => {
            expect(body).to.contain('data-testid="ctpl-site-header"')
            expect(body).not.to.contain(`path="/sites/${siteKey}/home/siteHeader`)
            expect(body).not.to.contain(`path="/sites/${siteKey}/home/siteFooter`)
        })
        cy.logout()
    })
})

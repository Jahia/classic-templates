import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('tables')
const home = `/sites/${siteKey}/home`
const page = `${home}/fares`
const live = `/sites/${siteKey}/home/fares.html`

const cells = (tag: string, prefix: string) =>
    Array.from({ length: 8 }, (_, i) => `<${tag}>${prefix} ${i + 1} with a long label</${tag}>`).join('')

/** A wide data table with a caption: eight columns of long labels, wider than a phone. */
const wideTable = (caption: string) =>
    `<table><caption>${caption}</caption><thead><tr>${cells('th', 'Column')}</tr></thead>` +
    `<tbody><tr>${cells('td', 'Value')}</tr></tbody></table>`

describe('Rich text tables - scroll region named after the caption', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'fares', template: 'content', title: { en: 'Fares', fr: 'Tarifs' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'grid', 'ctpl:richText', {
                'jcr:title': { en: 'Fare grid', fr: 'Grille tarifaire' },
                body: {
                    en: `<p>Before the table.</p>${wideTable('Fares by season')}`,
                    fr: `<p>Avant le tableau.</p>${wideTable('Tarifs par saison')}`,
                },
            }),
        )
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('wraps the table in a focusable region named after its caption', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-rich-text"] .ctpl-table-scroll')
            .should('have.length', 1)
            .and('have.attr', 'role', 'region')
            .and('have.attr', 'tabindex', '0')
            .invoke('attr', 'aria-labelledby')
            .then((id) => {
                cy.get(`[id="${id}"]`).should('match', 'caption').and('have.text', 'Fares by season')
            })
        cy.get('.ctpl-table-scroll > table > caption').should('exist')
    })

    it('scrolls the table inside its region at 320 px, never the page', () => {
        cy.viewport(320, 640)
        cy.visit(live)
        cy.get('.ctpl-table-scroll').then(($region) => {
            const region = $region[0]
            expect(region.scrollWidth).to.be.greaterThan(region.clientWidth)
            region.focus()
            expect(region.ownerDocument.activeElement).to.eq(region)
        })
        cy.document().then((doc) => {
            expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth)
        })
    })

    it('names the region in French after the French caption', () => {
        cy.visit(`/fr${live}`)
        cy.get('.ctpl-table-scroll')
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`[id="${id}"]`).should('have.text', 'Tarifs par saison'))
    })
})

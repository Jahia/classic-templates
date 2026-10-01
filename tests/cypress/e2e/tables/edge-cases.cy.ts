import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('tables-edge')
const home = `/sites/${siteKey}/home`
const page = `${home}/plain`
const live = `/sites/${siteKey}/home/plain.html`
const editFrame = `/cms/editframe/default/en/sites/${siteKey}/home/plain.html`
const table = '<table><tr><th scope="col">A</th></tr><tr><td>1</td></tr></table>'

describe('Rich text tables - no caption, several tables, other components', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'plain', template: 'content', title: { en: 'Plain', fr: 'Simple' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            addContent(`${page}/main`, 'one', 'ctpl:richText', {
                'jcr:title': { en: 'One table', fr: 'Un tableau' },
                body: { en: table, fr: table },
            })
            addContent(`${page}/main`, 'two', 'ctpl:richText', {
                'jcr:title': { en: 'Two tables', fr: 'Deux tableaux' },
                body: { en: `${table}<p>and</p>${table}`, fr: `${table}<p>et</p>${table}` },
            })
            // Every component's rich text goes through the same sanitizer: image and text too.
            addContent(`${page}/main`, 'beside', 'ctpl:imageText', {
                'jcr:title': { en: 'Beside', fr: 'À côté' },
                body: { en: table, fr: table },
            })
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('names a table without caption "Table", and numbers several tables of one text', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-rich-text"]', 'One table')
            .find('.ctpl-table-scroll')
            .should('have.attr', 'aria-label', 'Table')
        cy.contains('[data-testid="ctpl-rich-text"]', 'Two tables')
            .find('.ctpl-table-scroll')
            .then(($regions) => {
                expect([...$regions].map((r) => r.getAttribute('aria-label'))).to.deep.eq(['Table 1', 'Table 2'])
            })
        cy.get('[data-testid="ctpl-image-text"] .ctpl-table-scroll').should('have.attr', 'role', 'region')
    })

    it('translates the table label', () => {
        cy.visit(`/fr${live}`)
        cy.contains('[data-testid="ctpl-rich-text"]', 'Un tableau')
            .find('.ctpl-table-scroll')
            .should('have.attr', 'aria-label', 'Tableau')
        cy.contains('[data-testid="ctpl-rich-text"]', 'Deux tableaux')
            .find('.ctpl-table-scroll')
            .last()
            .should('have.attr', 'aria-label', 'Tableau 2')
    })

    it('asks editors for a caption in edit mode only', () => {
        cy.visit(live)
        cy.contains('A table in this text has no caption').should('not.exist')
        cy.login()
        cy.request(editFrame).its('body').should('contain', 'A table in this text has no caption')
        cy.logout()
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('content-auth')
const home = `/sites/${siteKey}/home`
const page = `${home}/grid`

describe('Content components - who sees and who edits', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'grid', template: 'content', title: { en: 'Grid', fr: 'Grille' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'row', 'ctpl:columns', {}, [{ name: 'layout', value: 'halves' }]),
        )
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('serves the published sections to anonymous visitors', () => {
        cy.visit(`/sites/${siteKey}/home/grid.html`)
        cy.get('[data-testid="ctpl-columns"]').should('exist')
    })

    it('offers each column to editors as a list that only accepts page sections', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en/sites/${siteKey}/home/grid.html`).then(({ body }) => {
            for (const col of ['col1', 'col2']) {
                expect(body).to.match(
                    new RegExp(
                        `jahiatype="module"[^>]*path="${page}/main/row/${col}"[^>]*nodetypes="ctplmix:pageComponent`,
                    ),
                )
            }
        })
        cy.logout()
    })
})

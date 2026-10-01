import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('tabs-auth')
const site = `/sites/${siteKey}`
const page = `${site}/home/stages`
const live = `${site}/home/stages.html`

const addNodeRequest = (parent: string, type: string) =>
    cy.request({
        method: 'POST',
        url: '/modules/graphql',
        headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
        body: {
            query: 'mutation($p:String!,$t:String!){jcr{addNode(parentPathOrId:$p,name:"intruder",primaryNodeType:$t){uuid}}}',
            variables: { p: parent, t: type },
        },
    })

describe('Tabs - who sees and who edits', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'stages', template: 'content', title: { en: 'Stages', fr: 'Étapes' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'stages', 'ctpl:tabs', {}).then(() =>
                addContent(`${page}/main/stages`, 'published', 'ctpl:tab', {
                    'jcr:title': { en: 'Published tab', fr: 'Onglet publié' },
                }),
            ),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        addContent(`${page}/main/stages`, 'draft', 'ctpl:tab', { 'jcr:title': { en: 'Draft tab', fr: 'Brouillon' } })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published tabs only', () => {
        cy.visit(live)
        cy.contains('[role="tab"]', 'Published tab')
        cy.contains('Draft tab').should('not.exist')
    })

    it('shows editors every tab as a headed block, with no script and an add button for tabs', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`)
            .its('body')
            .should('contain', 'Draft tab')
            .and('contain', 'Published tab')
            .and('contain', 'nodetypes="ctpl:tab"')
            .and('not.contain', 'tabs.js')
        cy.logout()
    })

    it('only accepts tabs in a tabs section, and page sections in a tab', () => {
        cy.login()
        addNodeRequest(`${page}/main/stages`, 'ctpl:richText').its('body.errors').should('have.length.greaterThan', 0)
        addNodeRequest(`${page}/main/stages/published`, 'ctpl:tab')
            .its('body.errors')
            .should('have.length.greaterThan', 0)
        addNodeRequest(`${page}/main/stages/published`, 'ctpl:richText').its('body.errors').should('not.exist')
        cy.logout()
    })
})

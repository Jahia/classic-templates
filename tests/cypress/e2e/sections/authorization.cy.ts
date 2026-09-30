import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('sections-auth')
const site = `/sites/${siteKey}`
const page = `${site}/home/cards`
const live = `${site}/home/cards.html`

describe('Sections - who sees and who edits', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'cards', template: 'content', title: { en: 'Cards', fr: 'Cartes' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'grid', 'ctpl:cardGrid', {}).then(() =>
                addContent(`${page}/main/grid`, 'published', 'ctpl:card', {
                    'jcr:title': { en: 'Published card', fr: 'Carte publiée' },
                }),
            ),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // Added after the publication: editors see it, visitors do not.
        addContent(`${page}/main/grid`, 'draft', 'ctpl:card', { 'jcr:title': { en: 'Draft card', fr: 'Brouillon' } })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published cards only', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-card"]', 'Published card')
        cy.contains('Draft card').should('not.exist')
    })

    it('shows editors the unpublished card in the edit frame', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).its('body').should('contain', 'Draft card')
        cy.logout()
    })

    it('only accepts cards and content teasers in a card grid', () => {
        cy.login()
        cy.request({
            method: 'POST',
            url: '/modules/graphql',
            headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
            body: {
                query: 'mutation($p:String!){jcr{addNode(parentPathOrId:$p,name:"intruder",primaryNodeType:"ctpl:richText"){uuid}}}',
                variables: { p: `${page}/main/grid` },
            },
        })
            .its('body.errors')
            .should('have.length.greaterThan', 0)
        cy.logout()
    })
})

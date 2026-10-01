import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('accordion-auth')
const site = `/sites/${siteKey}`
const page = `${site}/home/faq`
const live = `${site}/home/faq.html`

describe('Accordion - who sees and who edits', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'faq', template: 'content', title: { en: 'FAQ', fr: 'FAQ' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'questions', 'ctpl:accordion', {}).then(() =>
                addContent(`${page}/main/questions`, 'published', 'ctpl:accordionItem', {
                    'jcr:title': { en: 'Published entry', fr: 'Entrée publiée' },
                }),
            ),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        addContent(`${page}/main/questions`, 'draft', 'ctpl:accordionItem', {
            'jcr:title': { en: 'Draft entry', fr: 'Brouillon' },
        })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published entries only', () => {
        cy.visit(live)
        cy.contains('summary', 'Published entry')
        cy.contains('Draft entry').should('not.exist')
    })

    it('shows editors every entry open and flat, with a button to add entries', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`)
            .its('body')
            .should('contain', 'Draft entry')
            .and('contain', 'nodetypes="ctpl:accordionItem"')
            .and('not.contain', '<details')
        cy.logout()
    })

    it('only accepts accordion entries in an accordion', () => {
        cy.login()
        cy.request({
            method: 'POST',
            url: '/modules/graphql',
            headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
            body: {
                query: 'mutation($p:String!){jcr{addNode(parentPathOrId:$p,name:"intruder",primaryNodeType:"ctpl:richText"){uuid}}}',
                variables: { p: `${page}/main/questions` },
            },
        })
            .its('body.errors')
            .should('have.length.greaterThan', 0)
        cy.logout()
    })
})

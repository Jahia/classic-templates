import { addNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('tabs-edge')
const site = `/sites/${siteKey}`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`

describe('Tabs - untitled section, untranslated tab, empty tabs, before any script', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            addContent(`${page}/main`, 'bare', 'ctpl:tabs', {}).then(() => {
                addContent(`${page}/main/bare`, 'one', 'ctpl:tab', { 'jcr:title': { en: 'One', fr: 'Un' } }).then(() =>
                    addContent(`${page}/main/bare/one`, 'text', 'ctpl:richText', {
                        'jcr:title': { en: 'Inside one', fr: 'Dans un' },
                    }),
                )
                addNode({
                    parentPathOrId: `${page}/main/bare`,
                    name: 'english-only',
                    primaryNodeType: 'ctpl:tab',
                    properties: [{ name: 'jcr:title', value: 'English only', language: 'en' }],
                })
            })
            addContent(`${page}/main`, 'empty', 'ctpl:tabs', { 'jcr:title': { en: 'No tabs', fr: "Pas d'onglets" } })
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('puts tab labels at h2 and their sections at h3 under an untitled tabs section', () => {
        cy.visit(live)
        cy.get('#tab-one h2').should('have.text', 'One')
        cy.get('#tab-one h3').should('have.text', 'Inside one')
        cy.get('[role="tablist"]').should('not.have.attr', 'aria-labelledby')
    })

    it('leaves out a tab with no label in the language', () => {
        cy.visit(`/fr${live}`)
        cy.get('[role="tab"]').should('have.length', 1).and('have.text', 'Un')
        cy.contains('English only').should('not.exist')
    })

    it('renders nothing on the live site for tabs without any tab', () => {
        cy.visit(live)
        cy.contains('h2', 'No tabs').should('not.exist')
    })

    it('serves every tab as a headed block before any script runs', () => {
        cy.request(live)
            .its('body')
            .should('contain', 'data-ctpl-tab-label')
            .and('contain', 'id="tab-english-only"')
            .and('not.contain', 'role="tablist"')
    })
})

import { addNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('accordion-edge')
const site = `/sites/${siteKey}`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`

describe('Accordion - untitled section, untranslated entries, empty accordion, no script', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            // No section title: entry headings stay at h2.
            addContent(`${page}/main`, 'bare', 'ctpl:accordion', {}).then(() => {
                addContent(`${page}/main/bare`, 'both', 'ctpl:accordionItem', {
                    'jcr:title': { en: 'In both languages', fr: 'Dans les deux langues' },
                })
                // English only: left out of the French page.
                addNode({
                    parentPathOrId: `${page}/main/bare`,
                    name: 'english-only',
                    primaryNodeType: 'ctpl:accordionItem',
                    properties: [{ name: 'jcr:title', value: 'English only', language: 'en' }],
                })
            })
            addContent(`${page}/main`, 'empty', 'ctpl:accordion', { 'jcr:title': { en: 'Nothing', fr: 'Rien' } })
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('keeps entry headings at h2 under an untitled accordion', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-accordion"] summary h2').should('have.length', 2)
    })

    it('leaves out an entry with no heading in the language, and says so in edit mode', () => {
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-accordion-item"]').should('have.length', 1)
        cy.contains('English only').should('not.exist')
        cy.login()
        cy.request(`/cms/editframe/default/fr${live}`).its('body').should('contain', 'pas de titre dans cette langue')
        cy.logout()
    })

    it('renders nothing on the live site for an accordion without entries', () => {
        cy.visit(live)
        cy.contains('h2', 'Nothing').should('not.exist')
    })

    it('serves native details and summary, usable before any script runs', () => {
        cy.request(live)
            .its('body')
            .should('contain', '<details')
            .and('contain', '<summary')
            .and('contain', 'data-ctpl-accordion-all')
            .and('not.contain', 'data-ctpl-ready')
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('accordion')
const page = `/sites/${siteKey}/home/faq`
const live = `/sites/${siteKey}/home/faq.html`
const table = (caption: string) =>
    `<table><caption>${caption}</caption><tr><th scope="col">Day</th><th scope="col">Hours</th></tr>` +
    '<tr><td>Monday</td><td>9 to 18</td></tr></table>'

describe('Accordion - native disclosure, expand all, deep links', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`/sites/${siteKey}/home`, { name: 'faq', template: 'content', title: { en: 'FAQ', fr: 'FAQ' } })
        addContent(`${page}`, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'questions', 'ctpl:accordion', {
                'jcr:title': { en: 'Frequent questions', fr: 'Questions fréquentes' },
                introText: { en: 'Short answers', fr: 'Des réponses courtes' },
            }).then(() => {
                addContent(
                    `${page}/main/questions`,
                    'first-question',
                    'ctpl:accordionItem',
                    {
                        'jcr:title': { en: 'First question', fr: 'Première question' },
                        body: { en: '<p>First answer</p><h2>Detail</h2>', fr: '<p>Première réponse</p>' },
                    },
                    [{ name: 'openByDefault', value: 'true' }],
                )
                addContent(`${page}/main/questions`, 'opening-hours', 'ctpl:accordionItem', {
                    'jcr:title': { en: 'Opening hours', fr: "Heures d'ouverture" },
                    body: { en: table('Hours by day'), fr: table('Heures par jour') },
                })
                addContent(`${page}/main/questions`, 'third', 'ctpl:accordionItem', {
                    'jcr:title': { en: 'Third question', fr: 'Troisième question' },
                    body: { en: '<p>Third answer</p>', fr: '<p>Troisième réponse</p>' },
                })
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

    const entries = () => cy.get('[data-testid="ctpl-accordion"] details[data-ctpl-accordion-item]')
    const openStates = () => entries().then(($d) => [...$d].map((d) => (d as HTMLDetailsElement).open))

    it('renders entries as details with the heading inside the summary, one level below the title', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-accordion"]').within(() => {
            cy.get('h2').first().should('have.text', 'Frequent questions')
            cy.contains('p', 'Short answers')
            cy.get('details summary h3').should('have.length', 3).first().should('have.text', 'First question')
            // The answer's own heading sits one level below the entry's heading.
            cy.contains('h4', 'Detail')
        })
        cy.get('h1').should('have.length', 1)
        openStates().should('deep.equal', [true, false, false])
    })

    it('gives each entry an id built from its name, which opens it from a link', () => {
        cy.visit(`${live}#acc-third`)
        cy.get('#acc-third').should('have.prop', 'open', true)
        cy.window().then((win) => {
            win.location.hash = 'acc-opening-hours'
        })
        cy.get('#acc-opening-hours').should('have.prop', 'open', true)
    })

    it('expands and collapses every entry with one button whose label follows', () => {
        cy.visit(live)
        cy.get('[data-ctpl-accordion-all]').should('be.visible').and('have.text', 'Expand all').click()
        openStates().should('deep.equal', [true, true, true])
        cy.get('[data-ctpl-accordion-all]').should('have.text', 'Collapse all').click()
        openStates().should('deep.equal', [false, false, false])
        cy.get('[data-ctpl-accordion-all]').should('have.text', 'Expand all')
    })

    it('wraps a table of an answer in its scroll region', () => {
        cy.visit(live)
        cy.get('#acc-opening-hours .ctpl-table-scroll').should('have.attr', 'role', 'region')
    })

    it('renders in French with French labels', () => {
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-accordion"] h3').first().should('have.text', 'Première question')
        cy.get('[data-ctpl-accordion-all]').should('have.text', 'Tout déplier').click()
        cy.get('[data-ctpl-accordion-all]').should('have.text', 'Tout replier')
    })
})

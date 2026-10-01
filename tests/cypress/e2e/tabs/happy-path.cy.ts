import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('tabs')
const page = `/sites/${siteKey}/home/stages`
const live = `/sites/${siteKey}/home/stages.html`

describe('Tabs - ARIA tabs pattern over headed blocks', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`/sites/${siteKey}/home`, {
            name: 'stages',
            template: 'content',
            title: { en: 'Stages', fr: 'Étapes' },
        })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'stages', 'ctpl:tabs', {
                'jcr:title': { en: 'Three stages', fr: 'Trois étapes' },
            }).then(() => {
                addContent(`${page}/main/stages`, 'before', 'ctpl:tab', {
                    'jcr:title': { en: 'Before', fr: 'Avant' },
                }).then(() =>
                    addContent(`${page}/main/stages/before`, 'text', 'ctpl:richText', {
                        'jcr:title': { en: 'Prepare', fr: 'Préparer' },
                        body: { en: '<p>Before text</p>', fr: '<p>Texte avant</p>' },
                    }),
                )
                addContent(`${page}/main/stages`, 'during', 'ctpl:tab', {
                    'jcr:title': { en: 'During', fr: 'Pendant' },
                }).then(() =>
                    addContent(`${page}/main/stages/during`, 'faq', 'ctpl:accordion', {}).then(() =>
                        addContent(`${page}/main/stages/during/faq`, 'deep-entry', 'ctpl:accordionItem', {
                            'jcr:title': { en: 'Deep entry', fr: 'Entrée profonde' },
                            body: { en: '<p>Deep answer</p>', fr: '<p>Réponse profonde</p>' },
                        }),
                    ),
                )
                addContent(`${page}/main/stages`, 'after', 'ctpl:tab', {
                    'jcr:title': { en: 'After', fr: 'Après' },
                }).then(() =>
                    addContent(`${page}/main/stages/after`, 'text', 'ctpl:richText', {
                        body: { en: '<p>After text</p>', fr: '<p>Texte après</p>' },
                    }),
                )
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

    const tabs = () => cy.get('[data-testid="ctpl-tabs"] [role="tab"]')
    const selected = () => tabs().filter('[aria-selected="true"]')

    it('builds a tablist labelled by the section title, the first tab selected', () => {
        cy.visit(live)
        cy.get('[role="tablist"]')
            .should('have.length', 1)
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`[id="${id}"]`).should('have.text', 'Three stages'))
        tabs().should('have.length', 3)
        tabs().then(($t) => expect([...$t].map((t) => t.textContent)).to.deep.eq(['Before', 'During', 'After']))
        selected().should('have.text', 'Before').and('have.attr', 'tabindex', '0')
        tabs().eq(1).should('have.attr', 'tabindex', '-1').and('have.attr', 'aria-selected', 'false')
        cy.get('[role="tabpanel"]').then(($p) => {
            expect([...$p].map((p) => (p as HTMLElement).hidden)).to.deep.eq([false, true, true])
        })
        cy.get('[role="tabpanel"]').first().should('have.attr', 'aria-labelledby', 'tab-before-tab')
        cy.get('#tab-before-tab').should('have.attr', 'aria-controls', 'tab-before')
    })

    it('keeps the tab labels as headings inside the panels, and the sections one level below', () => {
        cy.visit(live)
        cy.get('#tab-before h3').first().should('have.text', 'Before')
        cy.get('#tab-before h4').should('have.text', 'Prepare')
        cy.get('#tab-during summary h4').should('have.text', 'Deep entry')
        cy.get('h1').should('have.length', 1)
    })

    it('moves with the arrow keys, wraps, and goes to the first and last tab with Home and End', () => {
        cy.visit(live)
        tabs().first().focus().trigger('keydown', { key: 'ArrowRight' })
        selected().should('have.text', 'During')
        cy.focused().should('have.text', 'During')
        cy.focused().trigger('keydown', { key: 'End' })
        selected().should('have.text', 'After')
        cy.focused().trigger('keydown', { key: 'ArrowRight' })
        selected().should('have.text', 'Before')
        cy.focused().trigger('keydown', { key: 'ArrowLeft' })
        selected().should('have.text', 'After')
        cy.focused().trigger('keydown', { key: 'Home' })
        selected().should('have.text', 'Before')
        cy.get('#tab-before').should('be.visible')
        cy.get('#tab-after').should('not.be.visible')
    })

    it('selects a tab with a click', () => {
        cy.visit(live)
        tabs().eq(2).click()
        selected().should('have.text', 'After')
        cy.contains('After text').should('be.visible')
    })

    it('selects the tab the address points at, or the tab holding the target', () => {
        cy.visit(`${live}#tab-after`)
        selected().should('have.text', 'After')
        cy.window().then((win) => {
            win.location.hash = 'acc-deep-entry'
        })
        selected().should('have.text', 'During')
        cy.get('#acc-deep-entry').should('have.prop', 'open', true)
    })

    it('renders in French', () => {
        cy.visit(`/fr${live}`)
        tabs().then(($t) => expect([...$t].map((t) => t.textContent)).to.deep.eq(['Avant', 'Pendant', 'Après']))
    })
})

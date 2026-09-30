import { deleteNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('sections-edge')
const site = `/sites/${siteKey}`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`
const editFrame = `/cms/editframe/default/en${live}`

describe('Sections - empty sections, missing translations, dangling teasers', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'gone',
            title: { en: 'Soon deleted', fr: 'Bientôt supprimé' },
            date: '2026-09-20',
        })
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            // A titled grid with no card, and a grid with no heading whose card must stay an h2.
            addContent(`${page}/main`, 'empty', 'ctpl:cardGrid', {
                'jcr:title': { en: 'Empty grid', fr: 'Grille vide' },
            })
            addContent(`${page}/main`, 'bare', 'ctpl:cardGrid', {}).then(() => {
                addContent(`${page}/main/bare`, 'card', 'ctpl:card', {
                    'jcr:title': { en: 'Lonely card', fr: 'Carte seule' },
                })
                // A card with nothing to show, and a teaser whose item is deleted below.
                addContent(`${page}/main/bare`, 'blank', 'ctpl:card', {})
                uuidAt(`${site}/contents/news/gone`).then((news) =>
                    addContent(`${page}/main/bare`, 'dangling', 'ctpl:contentTeaser', {}, [
                        { name: 'j:node', type: 'WEAKREFERENCE', value: news },
                    ]),
                )
            })
            addContent(`${page}/main`, 'figures', 'ctpl:keyFigures', {}).then(() => {
                addContent(`${page}/main/figures`, 'both', 'ctpl:keyFigure', {
                    value: { en: '10', fr: '10' },
                    label: { en: 'both languages', fr: 'deux langues' },
                })
                // English only: left out of the French page.
                addContent(`${page}/main/figures`, 'enOnly', 'ctpl:keyFigure', {}, [
                    { name: 'value', value: '99', language: 'en' },
                    { name: 'label', value: 'english only', language: 'en' },
                ])
            })
            addContent(`${page}/main`, 'quote', 'ctpl:quote', {}, [
                { name: 'quote', value: 'Only in English.', language: 'en' },
                { name: 'author', value: 'Ada' },
            ])
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        deleteNode(`${site}/contents/news/gone`)
        publishAndWaitJobEnding(`${site}/contents/news`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders nothing on the live site for a grid without cards', () => {
        cy.visit(live)
        cy.contains('Empty grid').should('not.exist')
        cy.get('[data-testid="ctpl-card-grid"]').should('have.length', 1)
    })

    it('keeps card titles at h2 in a grid without a heading, and skips a card with nothing to show', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-card-grid"]').within(() => {
            cy.contains('h2', 'Lonely card')
            cy.get('[data-testid="ctpl-card"]').should('have.length', 1)
            cy.get('[data-testid="ctpl-content-teaser"]').should('not.exist')
        })
    })

    it('tells editors about an untitled card and a teaser whose item is gone', () => {
        cy.login()
        cy.request(editFrame).then(({ body }) => {
            expect(body).to.contain('This card has no title in this language')
            expect(body).to.contain('Pick a news item or article to show in this card.')
        })
        cy.logout()
    })

    it('leaves figures and quotes that are not translated out of the other language', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-key-figure"]').should('have.length', 2)
        cy.get('[data-testid="ctpl-quote"]').should('contain.text', 'Only in English.')
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-key-figure"]').should('have.length', 1).and('contain.text', 'deux langues')
        cy.get('[data-testid="ctpl-quote"]').should('not.exist')
    })
})

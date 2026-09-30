import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addList, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('editorial-edge')
const site = `/sites/${siteKey}`
const news = `${site}/contents/news`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`

describe('Content lists - sorting, exclusions, languages, limits, empty results', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        for (const [name, day] of [
            ['a', '2026-09-01'],
            ['b', '2026-09-02'],
            ['c', '2026-09-03'],
            ['d', '2026-09-04'],
        ]) {
            addEditorial(news, 'ctpl:news', { name, title: { en: `Item ${name}`, fr: `Élément ${name}` }, date: day })
        }

        // English only: must never appear in a French list.
        addEditorial(news, 'ctpl:news', { name: 'en-only', title: { en: 'English only' }, date: '2026-09-05' })
        addEditorial(`${site}/contents`, 'ctpl:news', {
            name: 'elsewhere',
            title: { en: 'Elsewhere', fr: 'Ailleurs' },
            date: '2026-09-06',
        })
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'main', 'ctpl:pageArea', {})
        uuidAt(news).then((newsUuid) => {
            addList(`${page}/main`, 'asc', { type: 'ctpl:news', startUuid: newsUuid, direction: 'asc', max: 2 })
            uuidAt(`${news}/b`).then((b) =>
                uuidAt(`${news}/c`).then((c) =>
                    addList(`${page}/main`, 'excluded', { type: 'ctpl:news', startUuid: newsUuid, exclude: [b, c] }),
                ),
            )
            addList(`${page}/main`, 'all', { type: 'ctpl:news', startUuid: newsUuid, max: 50 })
        })
        uuidAt(`${site}/contents/articles`).then((articles) => {
            addList(`${page}/main`, 'empty', {
                type: 'ctpl:article',
                startUuid: articles,
                noResult: { en: 'Nothing here', fr: 'Rien ici' },
            })
            addList(`${page}/main`, 'silent', { type: 'ctpl:article', startUuid: articles })
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    const cardTitles = (index: number) =>
        cy.get('[data-testid="ctpl-jcr-query"]').eq(index).find('[data-testid="ctpl-news-card"] h2 a')

    it('sorts oldest first and stops at the maximum', () => {
        cy.visit(live)
        cardTitles(0).should('have.length', 2)
        cardTitles(0).first().should('have.text', 'Item a')
    })

    it('excludes every excluded item, not just one (two exclusions)', () => {
        cy.visit(live)
        cardTitles(1).should('not.contain.text', 'Item b').and('not.contain.text', 'Item c')
        cardTitles(1).should('contain.text', 'Item a').and('contain.text', 'Item d')
    })

    it('only lists items under the start folder', () => {
        cy.visit(live)
        cardTitles(2).should('not.contain.text', 'Elsewhere')
    })

    it('leaves items that are not translated out of the French list', () => {
        cy.visit(live)
        cardTitles(2).should('contain.text', 'English only')
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-jcr-query"]').eq(2).find('[data-testid="ctpl-news-card"]').should('have.length', 4)
        cy.get('[data-testid="ctpl-jcr-query"]').eq(2).should('not.contain.text', 'English only')
    })

    it('shows the "no result" text when there is one, and nothing at all otherwise', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-jcr-query"]', 'Nothing here').should('exist')
        cy.get('[data-testid="ctpl-jcr-query"]').should('have.length', 4)
    })

    it('tells editors what an empty list shows', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).then(({ body }) => {
            expect(body.match(/data-testid="ctpl-jcr-query-summary"/g)).to.have.length(5)
            expect(body).to.contain('Lists Article under contents/articles')
        })
        cy.logout()
    })
})

import { addNode, deleteNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import {
    addCategory,
    addContent,
    addEditorial,
    addList,
    addPage,
    createTestSite,
    uuidAt,
} from '../../support/test-helpers'

const siteKey = siteKeyFor('editorial-edge')
const site = `/sites/${siteKey}`
const news = `${site}/contents/news`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`
const topics = `${site}/contents/topics`
const categoryRoot = `/sites/systemsite/categories/${siteKey}`

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

        // Categories: a list filtered on "Products" keeps items filed under Products and under its
        // subcategory Laptops, and leaves Events out.
        addCategory('/sites/systemsite/categories', siteKey, 'Test root').then(() => {
            addCategory(categoryRoot, 'products', 'Products').then((products) =>
                addCategory(`${categoryRoot}/products`, 'laptops', 'Laptops').then((laptops) =>
                    addCategory(categoryRoot, 'events', 'Events').then((events) => {
                        addNode({
                            parentPathOrId: `${site}/contents`,
                            name: 'topics',
                            primaryNodeType: 'jnt:contentFolder',
                        })
                        for (const [name, category] of [
                            ['product-launch', products],
                            ['laptop-review', laptops],
                            ['trade-fair', events],
                        ]) {
                            addEditorial(topics, 'ctpl:news', {
                                name,
                                title: { en: `Topic ${name}`, fr: `Sujet ${name}` },
                                date: '2026-09-10',
                                categories: [category],
                            })
                        }

                        uuidAt(topics).then((topicsUuid) =>
                            addList(`${page}/main`, 'products', {
                                type: 'ctpl:news',
                                startUuid: topicsUuid,
                                categories: [products],
                            }),
                        )
                    }),
                ),
            )
        })

        // A start folder deleted after the list was set up.
        addNode({ parentPathOrId: `${site}/contents`, name: 'gone', primaryNodeType: 'jnt:contentFolder' })
        uuidAt(`${site}/contents/gone`).then((gone) => {
            addList(`${page}/main`, 'orphan', { type: 'ctpl:news', startUuid: gone })
            deleteNode(`${site}/contents/gone`)
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteNode(categoryRoot)
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
        // Lists asc, excluded, all, empty and products; silent (no result, no text) and orphan render nothing.
        cy.get('[data-testid="ctpl-jcr-query"]').should('have.length', 5)
    })

    it('keeps the items of the selected category and of its subcategories only', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-jcr-query"]')
            .eq(4)
            .find('[data-testid="ctpl-news-card"] h2 a')
            .should('have.length', 2)
            .and('contain.text', 'Topic product-launch')
            .and('contain.text', 'Topic laptop-review')
            .and('not.contain.text', 'Topic trade-fair')
    })

    it('renders nothing on the live site when the start folder is gone, and says why in edit mode', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-jcr-query-start-missing"]').should('not.exist')
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`)
            .its('body')
            .should('contain', 'data-testid="ctpl-jcr-query-start-missing"')
        cy.logout()
    })

    it('tells editors what every list queries, finds and leaves out', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).then(({ body }) => {
            const doc = new DOMParser().parseFromString(body, 'text/html')
            const panels = [...doc.querySelectorAll('[data-testid="ctpl-jcr-query-summary"]')]
            expect(panels).to.have.length(7)
            const text = (i: number) => panels[i].textContent ?? ''
            expect(text(3)).to.contain('Lists Article under contents/articles')
            // The excluded list: 5 English items under news, 2 of them excluded
            expect(text(1)).to.contain('3 shown of 3 matching').and.contain('2 excluded, 0 not translated into en')
            expect(text(1)).to.contain('Item b').and.contain('Item c')
            // The products list: the selected category, counted with its subcategory, and the query itself
            expect(text(5)).to.contain('Products (2 categories with subcategories)')
            expect(text(5)).to.contain('2 shown of 2 matching')
            expect(panels[5].querySelector('details code')?.textContent)
                .to.match(/^SELECT \* FROM \[ctpl:news\] AS item WHERE ISDESCENDANTNODE/)
                .and.contain('j:defaultCategory')
        })
        cy.logout()
    })
})

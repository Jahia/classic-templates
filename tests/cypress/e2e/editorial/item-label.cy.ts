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

const siteKey = siteKeyFor('item-label')
const site = `/sites/${siteKey}`
const news = `${site}/contents/news`
const page = `${site}/home/labels`
const live = `${site}/home/labels.html`
const categoryRoot = `/sites/systemsite/categories/${siteKey}`

/** Adds a category titled differently in English and French; yields its uuid. */
const addTranslatedCategory = (name: string, en: string, fr: string) =>
    addNode({
        parentPathOrId: categoryRoot,
        name,
        primaryNodeType: 'jnt:category',
        properties: [
            { name: 'jcr:title', value: en, language: 'en' },
            { name: 'jcr:title', value: fr, language: 'fr' },
        ],
    }).then((res: { data: { jcr: { addNode: { uuid: string } } } }) => res.data.jcr.addNode.uuid)

/** The labels of the items of content list `index` (cards or compact rows), in order. */
const listLabels = (index: number) =>
    cy
        .get('[data-testid="ctpl-jcr-query"]')
        .eq(index)
        .find('[data-testid="ctpl-news-card"], [data-testid="ctpl-news-compact"]')
        .then(($items) => Array.from($items, (item) => item.querySelector('p span')?.textContent ?? ''))

describe('Item labels - content type or first category, on content lists and notice bars', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addCategory('/sites/systemsite/categories', siteKey, 'Test root').then(() =>
            addTranslatedCategory('advisory', 'Travel advisory', 'Avis aux voyageurs').then((advisory) =>
                addTranslatedCategory('press', 'Press release', 'Communiqué de presse').then((press) => {
                    addEditorial(news, 'ctpl:news', {
                        name: 'advisory',
                        title: { en: 'Storm warning', fr: 'Alerte tempête' },
                        date: '2026-09-22',
                        categories: [advisory, press],
                    })
                    addEditorial(news, 'ctpl:news', {
                        name: 'press',
                        title: { en: 'New route', fr: 'Nouvelle ligne' },
                        date: '2026-09-21',
                        categories: [press],
                    })
                    addEditorial(news, 'ctpl:news', {
                        name: 'plain',
                        title: { en: 'Plain news', fr: 'Actualité simple' },
                        date: '2026-09-20',
                    })
                }),
            ),
        )
        addPage(`${site}/home`, { name: 'labels', template: 'content', title: { en: 'Labels', fr: 'Libellés' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            uuidAt(news).then((folder) => {
                const start = { name: 'startNode', type: 'WEAKREFERENCE', value: folder }
                addList(`${page}/main`, 'byType', { type: 'ctpl:news', startUuid: folder })
                addList(`${page}/main`, 'byCategory', {
                    type: 'ctpl:news',
                    startUuid: folder,
                    layout: 'list',
                    itemLabel: 'category',
                })
                addContent(`${page}/main`, 'bar', 'ctpl:noticeBar', {}, [
                    start,
                    { name: 'itemLabel', value: 'category' },
                ])
                addContent(`${page}/main`, 'plainBar', 'ctpl:noticeBar', {}, [start])
            }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteNode(categoryRoot)
        deleteSite(siteKey)
        cy.logout()
    })

    it('labels list items with their type by default, as before', () => {
        cy.visit(live)
        listLabels(0).should('deep.equal', ['News', 'News', 'News'])
    })

    it('labels list items with their first category in the page language, or their type without one', () => {
        cy.visit(live)
        listLabels(1).should('deep.equal', ['Travel advisory', 'Press release', 'News'])
        cy.visit(`/fr${live}`)
        listLabels(1).should('deep.equal', ['Avis aux voyageurs', 'Communiqué de presse', 'Actualité'])
    })

    it('labels notice bar items the same way, and shows no label by default', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-notice-bar"]')
            .eq(0)
            .find('[data-testid="ctpl-notice-label"]')
            .then(($labels) => Array.from($labels, (label) => label.textContent))
            .should('deep.equal', ['Travel advisory', 'Press release', 'News'])
        cy.get('[data-testid="ctpl-notice-bar"]').eq(1).find('[data-testid="ctpl-notice-label"]').should('not.exist')
    })

    it('says which label a list uses in its edit-mode panel', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).then(({ body }) => {
            const doc = new DOMParser().parseFromString(body, 'text/html')
            const panels = Array.from(doc.querySelectorAll('[data-testid="ctpl-jcr-query-summary"]'))
            expect(panels[0].textContent).to.contain('Item label').and.contain('content type')
            expect(panels[1].textContent).to.contain('first category, else content type')
        })
        cy.logout()
    })
})

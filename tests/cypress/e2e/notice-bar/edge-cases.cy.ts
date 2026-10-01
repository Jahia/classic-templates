import { deleteNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import {
    addCategory,
    addContent,
    addEditorial,
    addPage,
    addLink,
    createTestSite,
    uuidAt,
} from '../../support/test-helpers'

const siteKey = siteKeyFor('notice-edge')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const news = `${site}/contents/news`
const page = `${home}/edge`
const live = `${home}/edge.html`
const editFrame = `/cms/editframe/default/en${live}`
const categoryRoot = `/sites/systemsite/categories/${siteKey}`

/** The category filter of a bar (a multiple weakreference, which addContent's typing omits). */
const inCategory = (category: string) =>
    [{ name: 'filterCategories', type: 'WEAKREFERENCE', values: [category] }] as unknown as {
        name: string
        value: string
        type?: string
    }[]

const dismissibleBar = () => cy.get('[data-testid="ctpl-notice-bar"][data-ctpl-notice]')

describe('Notice bar - closing it, no JavaScript, edit mode, categories, languages, small screens', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addCategory('/sites/systemsite/categories', siteKey, 'Test root').then(() =>
            addCategory(categoryRoot, 'alerts', 'Alerts').then((alerts) =>
                addCategory(categoryRoot, 'unused', 'Unused').then((unused) => {
                    addEditorial(news, 'ctpl:news', {
                        name: 'alert',
                        title: { en: 'Filed alert', fr: 'Alerte classée' },
                        date: '2026-09-21',
                        categories: [alerts],
                    })
                    addEditorial(news, 'ctpl:news', {
                        name: 'plain',
                        title: { en: 'Plain news', fr: 'Actualité simple' },
                        date: '2026-09-22',
                    })
                    // English only: left out of the French bar.
                    addEditorial(news, 'ctpl:news', {
                        name: 'english',
                        title: { en: 'English only' },
                        date: '2026-09-23',
                    })
                    addPage(home, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
                    uuidAt(news).then((folder) => {
                        const start = { name: 'startNode', type: 'WEAKREFERENCE', value: folder }
                        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
                            addContent(
                                `${page}/main`,
                                'closable',
                                'ctpl:noticeBar',
                                { label: { en: 'Closable', fr: 'Masquable' } },
                                [start, { name: 'dismissible', value: 'true' }],
                            )
                            // A link after the bar, where focus goes once the bar is closed.
                            addContent(`${page}/main`, 'after', 'ctpl:linkList', {
                                'jcr:title': { en: 'After', fr: 'Après' },
                            }).then(() =>
                                addLink(`${page}/main/after`, {
                                    name: 'next',
                                    title: { en: 'Next thing', fr: 'Suite' },
                                    url: 'https://example.org/',
                                }),
                            )
                            addContent(
                                `${page}/main`,
                                'filed',
                                'ctpl:noticeBar',
                                { label: { en: 'Filed', fr: 'Classées' } },
                                inCategory(alerts),
                            )
                            addContent(
                                `${page}/main`,
                                'nothing',
                                'ctpl:noticeBar',
                                { label: { en: 'Nothing', fr: 'Rien' } },
                                inCategory(unused),
                            )
                        })
                    })
                }),
            ),
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

    it('adds a close button with JavaScript, which hides the bar for the session and moves focus on', () => {
        cy.visit(live)
        dismissibleBar().within(() => {
            cy.get('[data-testid="ctpl-notice-dismiss"]').should('be.visible').and('contain.text', 'Hide these updates')
        })
        cy.get('[data-testid="ctpl-notice-dismiss"]').focus()
        cy.get('[data-testid="ctpl-notice-dismiss"]').click()
        dismissibleBar().should('not.be.visible')
        cy.focused().should('have.text', 'Next thing')
        cy.reload()
        dismissibleBar().should('not.be.visible')
        cy.window().then((win) => win.sessionStorage.clear())
        cy.reload()
        dismissibleBar().should('be.visible')
    })

    it('shows a closed bar again once its items change', () => {
        cy.visit(live)
        dismissibleBar()
            .invoke('attr', 'data-ctpl-notice')
            .then((key) => {
                // A dismissal recorded for another set of items.
                cy.visit(live, {
                    onBeforeLoad(win) {
                        win.sessionStorage.setItem(`ctpl-notice:${key}`, 'older-items')
                    },
                })
                dismissibleBar().should('be.visible')
            })
    })

    it('still closes when the browser blocks storage, for this page view', () => {
        cy.visit(live, {
            onBeforeLoad(win) {
                Object.defineProperty(win, 'sessionStorage', {
                    get() {
                        throw new Error('storage blocked')
                    },
                })
            },
        })
        dismissibleBar().should('be.visible')
        cy.get('[data-testid="ctpl-notice-dismiss"]').click()
        dismissibleBar().should('not.be.visible')
    })

    it('serves no working button without JavaScript: the button only exists inside a template', () => {
        cy.request(live).then(({ body }) => {
            const doc = new DOMParser().parseFromString(body, 'text/html')
            const bar = doc.querySelector('[data-testid="ctpl-notice-bar"][data-ctpl-notice]')
            expect(bar, 'dismissible bar').not.to.equal(null)
            expect(bar?.querySelectorAll('button')).to.have.length(0)
            const template = bar?.querySelector('template[data-ctpl-notice-dismiss]') as HTMLTemplateElement
            expect(template.content.querySelector('button')?.textContent).to.contain('Hide these updates')
        })
    })

    it('is never hidden nor closable in edit mode, and says what it lists', () => {
        cy.login()
        cy.request(editFrame).then(({ body }) => {
            const doc = new DOMParser().parseFromString(body, 'text/html')
            const bars = Array.from(doc.querySelectorAll('[data-testid="ctpl-notice-bar"]'))
            expect(bars).to.have.length(3)
            expect(doc.querySelector('[data-ctpl-notice]')).to.equal(null)
            expect(doc.querySelector('template[data-ctpl-notice-dismiss]')).to.equal(null)
            expect(body).not.to.contain('notice-bar.js')
            expect(bars[0].querySelector('[data-testid="ctpl-notice-summary"]')?.textContent).to.contain(
                'Lists News item under contents/news, newest first, up to 3',
            )
        })
        cy.logout()
    })

    it('keeps only the items of the chosen categories, and renders nothing live when none matches', () => {
        cy.visit(live)
        // A bar is found by its label: the first bar also lists an item titled "Filed alert".
        cy.contains('[data-testid="ctpl-notice-bar"] p', /^Filed$/)
            .closest('[data-testid="ctpl-notice-bar"]')
            .find('[data-testid="ctpl-notice"] a')
            .should('have.length', 1)
            .and('have.text', 'Filed alert')
        cy.contains('[data-testid="ctpl-notice-bar"] p', /^Nothing$/).should('not.exist')
        cy.get('[data-testid="ctpl-notice-bar"]').should('have.length', 2)
    })

    it('leaves out items not translated into the page language', () => {
        cy.visit(live)
        dismissibleBar().should('contain.text', 'English only')
        cy.visit(`/fr${live}`)
        dismissibleBar().should('not.contain.text', 'English only').and('contain.text', 'Actualité simple')
    })

    it('wraps without horizontal scrolling at 320 px, with 44 px tall links', () => {
        cy.viewport(320, 640)
        cy.visit(live)
        cy.document().then((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(320))
        dismissibleBar()
            .find('[data-testid="ctpl-notice"] a')
            .each(($a) => expect($a[0].getBoundingClientRect().height).to.be.at.least(44))
        cy.get('[data-testid="ctpl-notice-dismiss"]').then(($b) => {
            const rect = $b[0].getBoundingClientRect()
            expect(rect.width).to.be.at.least(44)
            expect(rect.height).to.be.at.least(44)
        })
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addPage, createTestSite, ctaTo, uuidAt, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('notice')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const news = `${site}/contents/news`
const live = `${home}/page.html`

/** The bar in the shared header area (first in the page), and the one dropped on the page. */
const sharedBar = () => cy.get('[data-testid="ctpl-notice-bar"]').first()
const pageBar = () => cy.get('main [data-testid="ctpl-notice-bar"]')

describe('Notice bar - latest items as dated links, in the shared header and on a page', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        for (const [name, day] of [
            ['oldest', '2026-09-01'],
            ['first', '2026-09-10'],
            ['second', '2026-09-20'],
            ['third', '2026-09-25'],
        ]) {
            addEditorial(news, 'ctpl:news', {
                name,
                title: { en: `Notice ${name}`, fr: `Information ${name}` },
                date: day,
            })
        }

        addPage(home, { name: 'all', template: 'content', title: { en: 'All notices', fr: 'Toutes les infos' } }).then(
            (all) => {
                const cta = ctaTo(uuidOf(all))
                uuidAt(news).then((newsFolder) => {
                    const start = { name: 'startNode', type: 'WEAKREFERENCE', value: newsFolder }
                    // In the home page's header area: on every page, after the site header.
                    addContent(
                        `${home}/siteHeader`,
                        'notices',
                        'ctpl:noticeBar',
                        {
                            label: { en: 'Service updates', fr: 'Infos service' },
                            ctaLabel: { en: 'View all', fr: 'Tout voir' },
                        },
                        [start, ...cta.props],
                        cta.mixins,
                    )
                    addPage(home, { name: 'page', template: 'content', title: { en: 'A page', fr: 'Une page' } })
                    addContent(`${home}/page`, 'main', 'ctpl:pageArea', {}).then(() =>
                        addContent(`${home}/page/main`, 'bar', 'ctpl:noticeBar', {}, [
                            start,
                            { name: 'maxItems', value: '2' },
                        ]),
                    )
                })
            },
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('lists the three latest items, newest first, each a link with its date', () => {
        cy.visit(live)
        sharedBar().within(() => {
            cy.get('[data-testid="ctpl-notice"]').should('have.length', 3)
            cy.get('[data-testid="ctpl-notice"] a').then(($links) => {
                expect(Array.from($links, (a) => a.textContent)).to.deep.equal([
                    'Notice third',
                    'Notice second',
                    'Notice first',
                ])
            })
            cy.get('[data-testid="ctpl-notice"]')
                .first()
                .within(() => {
                    cy.get('a').should('have.attr', 'href').and('contain', '/contents/news/third')
                    cy.get('time').should('have.attr', 'datetime', '2026-09-25').and('have.text', 'September 25, 2026')
                })
        })
    })

    it('sits beside the site header, not inside it: one banner landmark, the bar a named region', () => {
        cy.visit(live)
        cy.get('header').should('have.length', 1)
        cy.get('header [data-testid="ctpl-notice-bar"]').should('not.exist')
        sharedBar()
            .should('match', 'section')
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`#${id}`).should('have.text', 'Service updates').and('be.visible'))
    })

    it('ends with its "view all" link', () => {
        cy.visit(live)
        sharedBar()
            .find('[data-testid="ctpl-cta"]')
            .should('have.text', 'View all')
            .and('have.attr', 'href', `${site}/home/all.html`)
    })

    it('keeps label, items and "view all" on one row on a wide screen, and never scrolls sideways on a phone', () => {
        const middle = (el: HTMLElement) => {
            const rect = el.getBoundingClientRect()
            return { top: rect.top, bottom: rect.bottom, mid: (rect.top + rect.bottom) / 2 }
        }

        cy.viewport(1366, 768)
        cy.visit(live)
        sharedBar().within(() => {
            cy.get('[data-testid="ctpl-notice"]')
                .first()
                .then(($item) => {
                    const items = $item[0].closest('ul') as HTMLElement
                    const row = middle(items)
                    cy.get('[data-testid="ctpl-cta"]').should(($cta) => {
                        const cta = middle($cta[0])
                        expect(cta.mid).to.be.within(row.top, row.bottom)
                    })
                    cy.get('p')
                        .first()
                        .should(($label) => {
                            expect(middle($label[0]).mid).to.be.within(row.top, row.bottom)
                        })
                })
        })
        cy.viewport(320, 640)
        cy.visit(live)
        cy.document().then((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(320))
    })

    it('shows on every page from the shared header, home included', () => {
        cy.visit(`${home}.html`)
        sharedBar().find('[data-testid="ctpl-notice"]').should('have.length', 3)
    })

    it('honours the number of items, and names an unlabelled bar for screen readers only', () => {
        cy.visit(live)
        pageBar().within(() => {
            cy.get('[data-testid="ctpl-notice"]').should('have.length', 2)
        })
        pageBar()
            .invoke('attr', 'aria-labelledby')
            .then((id) =>
                cy.get(`#${id}`).should('have.text', 'Latest updates').and('have.class', 'ctpl-visually-hidden'),
            )
    })

    it('renders no close button and loads no script unless the editor allows visitors to hide it', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-notice-dismiss"]').should('not.exist')
        cy.get('[data-testid="ctpl-notice-bar"] template').should('not.exist')
        cy.get('[data-testid="ctpl-notice-bar"][data-ctpl-notice]').should('not.exist')
    })

    it('renders in French: label, dates, link and default name', () => {
        cy.visit(`/fr${live}`)
        sharedBar().within(() => {
            cy.contains('p', 'Infos service')
            cy.get('[data-testid="ctpl-notice"] a').first().should('have.text', 'Information third')
            cy.get('time').first().should('have.text', '25 septembre 2026')
            cy.get('[data-testid="ctpl-cta"]').should('have.text', 'Tout voir')
        })
        pageBar()
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`#${id}`).should('have.text', 'Dernières informations'))
    })
})

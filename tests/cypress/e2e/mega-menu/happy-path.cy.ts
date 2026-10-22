import { addNode, deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, chromeOf, createTestSite, ctaTo, uploadTestImage, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('mega-menu')
const chrome = chromeOf(siteKey)
const page = (path: string) => `/sites/${siteKey}/home/${path}.html`
const promo = '[data-testid="ctpl-menu-promo"]'

/** Opens the panel of the top-level entry named `title` with its submenu button; yields the panel. */
const openPanel = (title: string) =>
    cy
        .contains('[data-ctpl-nav-list] > [data-ctpl-nav-item] > a', title)
        .parent()
        .find('[data-ctpl-subnav-toggle]')
        .click()
        .invoke('attr', 'aria-controls')
        .then((id) => cy.get(`#${id}`).should('be.visible'))

const i18n = (name: string, en: string, fr: string) => [
    { name, value: en, language: 'en' },
    { name, value: fr, language: 'fr' },
]

describe('Main navigation - mega menu style and menu promotion', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } }).then(
            (about) => {
                addPage(`${chrome.home}/about`, {
                    name: 'careers',
                    template: 'content',
                    title: { en: 'Careers', fr: 'Carrières' },
                })
                uploadTestImage(siteKey).then((image) => {
                    const cta = ctaTo(uuidOf(about))
                    // A top-level page with its "Menu promotion" (ctplmix:navPromo).
                    addNode({
                        parentPathOrId: chrome.home,
                        name: 'products',
                        primaryNodeType: 'jnt:page',
                        mixins: ['ctplmix:navPromo', ...cta.mixins],
                        properties: [
                            { name: 'j:templateName', value: 'content' },
                            ...i18n('jcr:title', 'Products', 'Produits'),
                            ...i18n('promoTitle', 'Featured connectors', 'Connecteurs à la une'),
                            ...i18n(
                                'promoText',
                                'Small, secure and easy to mate.',
                                'Petits, sûrs et faciles à connecter.',
                            ),
                            ...i18n('ctaLabel', 'See the range', 'Voir la gamme'),
                            { name: 'image', type: 'WEAKREFERENCE', value: image },
                            ...cta.props,
                        ],
                    }).then(() => {
                        addPage(`${chrome.home}/products`, {
                            name: 'connectors',
                            template: 'content',
                            title: { en: 'Connectors', fr: 'Connecteurs' },
                        })
                        addPage(`${chrome.home}/products/connectors`, {
                            name: 'wire-to-board',
                            template: 'content',
                            title: { en: 'Wire-to-Board', fr: 'Fil-carte' },
                        })
                    })
                })
            },
        )
        setNodeProperty(chrome.navigation, 'navStyle', 'mega', 'en')
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('opens a full-width panel with the subpages in columns and the page promotion beside them', () => {
        cy.visit(page('about'))
        openPanel('Products').then(($panel) => {
            cy.window().then((win) => expect(Math.round($panel[0].getBoundingClientRect().width)).to.eq(win.innerWidth))
            cy.wrap($panel)
                .contains('a', 'Connectors')
                .should('have.attr', 'href')
                .and('include', '/products/connectors')
            cy.wrap($panel).contains('a', 'Wire-to-Board').should('be.visible')
            cy.wrap($panel)
                .find(promo)
                .should('be.visible')
                .within(() => {
                    cy.get('img').should('have.attr', 'alt')
                    cy.contains('p', 'Featured connectors').should('be.visible')
                    cy.contains('p', 'Small, secure and easy to mate.').should('be.visible')
                    cy.get('a[data-testid="ctpl-cta"]')
                        .should('have.text', 'See the range')
                        .and('have.attr', 'href')
                        .and('include', '/about')
                })
        })
    })

    it('shows no promotion for a top-level page without one, and closes with Escape', () => {
        cy.visit(page('about'))
        openPanel('About').then(($panel) => {
            cy.wrap($panel).find(promo).should('not.exist')
            // Without a promotion the subpage columns take the whole width of the panel.
            const panel = $panel[0].getBoundingClientRect()
            const style = getComputedStyle($panel[0])
            const inner = panel.width - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
            cy.wrap($panel)
                .find('ul')
                .first()
                .then(($list) => expect($list[0].getBoundingClientRect().width).to.be.closeTo(inner, 2))
        })
        cy.focused().type('{esc}')
        cy.get('[data-ctpl-subnav-toggle][aria-expanded="true"]').should('not.exist')
    })

    it('lists the promotion under the subpages on small screens', () => {
        cy.viewport(375, 812)
        cy.visit(page('about'))
        cy.get('[data-ctpl-nav-toggle]').click()
        openPanel('Products').then(($panel) => {
            cy.wrap($panel).find(promo).should('be.visible')
            cy.document().then((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(375))
        })
    })

    it('renders the promotion in French on French pages', () => {
        cy.visit(`/fr${page('about')}`)
        openPanel('Produits').then(($panel) => {
            cy.wrap($panel).find(promo).contains('p', 'Connecteurs à la une').should('be.visible')
            cy.wrap($panel).find('a[data-testid="ctpl-cta"]').should('have.text', 'Voir la gamme')
        })
    })

    it('shows no promotion with the dropdown style', () => {
        cy.login()
        setNodeProperty(chrome.navigation, 'navStyle', 'dropdown', 'en')
        publishAndWaitJobEnding(chrome.navigation, ['en'])
        cy.logout()
        cy.visit(page('about'))
        openPanel('Products').then(($panel) => {
            cy.wrap($panel).find(promo).should('not.exist')
            cy.window().then((win) => expect($panel[0].getBoundingClientRect().width).to.be.lessThan(win.innerWidth))
        })
    })
})

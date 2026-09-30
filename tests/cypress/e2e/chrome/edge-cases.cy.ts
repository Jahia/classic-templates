import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addLink, addPage, chromeOf, createTestSite, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('chrome-edge')
const chrome = chromeOf(siteKey)
const url = (path: string) => `/sites/${siteKey}/home/${path}.html`

describe('Chrome - empty lists, hidden pages, unsafe and untranslated links', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        addPage(`${chrome.home}/about`, { name: 'team', template: 'content', title: { en: 'Team', fr: 'Équipe' } })
        addPage(chrome.home, {
            name: 'legal',
            template: 'content',
            title: { en: 'Legal notice', fr: 'Mentions légales' },
            hiddenFromNav: true,
        }).then((legal) => {
            // Target set in English only: French must show the label without a link.
            addLink(chrome.legal, {
                name: 'legal',
                title: { en: 'Legal notice', fr: 'Mentions légales' },
                target: uuidOf(legal),
                languages: ['en'],
            })
        })
        // eslint-disable-next-line no-script-url -- the test seeds an unsafe URL on purpose
        addLink(chrome.social, { name: 'evil', title: { en: 'Evil', fr: 'Méchant' }, url: 'javascript:alert(1)' })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders no empty utility navigation and keeps the footer landmark filled', () => {
        cy.visit(url('about'))
        cy.get('nav[aria-label="Quick links"]').should('not.exist')
        cy.get('[data-testid="ctpl-copyright"]').should('not.be.empty')
    })

    it('leaves pages hidden from navigation out of the menu, but still serves them', () => {
        cy.visit(url('about'))
        cy.get('nav[aria-label="Main navigation"]').should('not.contain.text', 'Legal notice')
        cy.request(url('legal')).its('status').should('eq', 200)
    })

    it('never renders a javascript: URL as a link', () => {
        cy.visit(url('about'))
        cy.get('a[href^="javascript:"]').should('not.exist')
        cy.get('nav[aria-label="Follow us"]').should('contain.text', 'Evil')
    })

    it('shows an untranslated link target as plain text, not as a broken link', () => {
        cy.visit(url('about'))
        cy.get('nav[aria-label="Legal information"]').contains('a', 'Legal notice')
        cy.visit(`/fr${url('about')}`)
        cy.get('nav[aria-label="Informations légales"]').should('contain.text', 'Mentions légales')
        cy.get('nav[aria-label="Informations légales"] a').should('not.exist')
    })

    it('limits the menu to one level when the depth is set to 1', () => {
        cy.login()
        setNodeProperty(chrome.navigation, 'navDepth', '1', 'en')
        publishAndWaitJobEnding(chrome.navigation, ['en'])
        cy.logout()
        cy.visit(url('about'))
        cy.get('nav[aria-label="Main navigation"]').contains('a', 'About')
        cy.get('nav[aria-label="Main navigation"]').should('not.contain.text', 'Team')
        cy.get('[data-ctpl-subnav-toggle]').should('not.exist')
    })
})

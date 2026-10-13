import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addLink, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteA = siteKeyFor('network')
const siteB = siteKeyFor('network-b')
const homeOf = (key: string) => `/sites/${key}/home`

/** A network bar in the home header area of `key`, linking the home pages of both sites. */
const seedBar = (key: string) =>
    addContent(`${homeOf(key)}/siteHeader`, 'network', 'ctpl:networkBar', {
        label: { en: 'Test network', fr: 'Réseau test' },
    }).then(() =>
        uuidAt(homeOf(siteA)).then((homeA) =>
            uuidAt(homeOf(siteB)).then((homeB) => {
                addLink(`${homeOf(key)}/siteHeader/network`, {
                    name: 'a',
                    title: { en: 'Site A', fr: 'Site A' },
                    target: homeA,
                })
                addLink(`${homeOf(key)}/siteHeader/network`, {
                    name: 'b',
                    title: { en: 'Site B', fr: 'Site B' },
                    target: homeB,
                })
            }),
        ),
    )

const bar = () => cy.get('[data-testid="ctpl-network-bar"]')
const sites = () => cy.get('[data-testid="ctpl-network-site"] a')

describe('Network bar - the group of sites, with the current one marked, on every page', () => {
    before(() => {
        cy.login()
        createTestSite(siteA)
        createTestSite(siteB)
        addPage(homeOf(siteA), { name: 'page', template: 'content', title: { en: 'A page', fr: 'Une page' } })
        seedBar(siteA)
        seedBar(siteB)
        publishAndWaitJobEnding(`/sites/${siteA}`, ['en', 'fr'])
        publishAndWaitJobEnding(`/sites/${siteB}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteA)
        deleteSite(siteB)
        cy.logout()
    })

    it('is a navigation named by its label, beside the site header and not inside it', () => {
        cy.visit(`${homeOf(siteA)}/page.html`)
        cy.get('header').should('have.length', 1)
        cy.get('header [data-testid="ctpl-network-bar"]').should('not.exist')
        bar()
            .should('match', 'nav')
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`#${id}`).should('have.text', 'Test network').and('be.visible'))
    })

    it('links every site in order, the other one on its own site, and marks the current site', () => {
        cy.visit(`${homeOf(siteA)}/page.html`)
        sites().then(($links) => expect(Array.from($links, (a) => a.textContent)).to.deep.equal(['Site A', 'Site B']))
        sites()
            .eq(0)
            .should('have.attr', 'aria-current', 'true')
            .and('have.attr', 'href', `${homeOf(siteA)}.html`)
        sites()
            .eq(1)
            .should('have.attr', 'href', `${homeOf(siteB)}.html`)
        sites().eq(1).should('not.have.attr', 'aria-current')
    })

    it('marks the other site as current on that site', () => {
        cy.visit(`${homeOf(siteB)}.html`)
        sites().eq(0).should('not.have.attr', 'aria-current')
        sites().eq(1).should('have.attr', 'aria-current', 'true')
    })

    it('speaks French on French pages, links included', () => {
        cy.visit(`/fr${homeOf(siteA)}/page.html`)
        bar().should('contain.text', 'Réseau test')
        sites()
            .eq(1)
            .should('have.attr', 'href', `/fr${homeOf(siteB)}.html`)
    })
})

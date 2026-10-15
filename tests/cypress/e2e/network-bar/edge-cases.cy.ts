import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addLink, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('network-edge')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const page = `${home}/edge`
const live = `${page}.html`

describe('Network bar - empty, unnamed, external and untranslated links, small screens', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        // In the header area: no label, an external link and an internal link set in English only.
        addContent(`${home}/siteHeader`, 'network', 'ctpl:networkBar', {}).then(() => {
            addLink(`${home}/siteHeader/network`, {
                name: 'external',
                title: { en: 'Partner site', fr: 'Site partenaire' },
                url: 'https://example.com/',
            })
            uuidAt(home).then((target) =>
                addLink(`${home}/siteHeader/network`, {
                    name: 'english',
                    title: { en: 'This site', fr: 'Ce site' },
                    target,
                    languages: ['en'],
                }),
            )
        })
        // A second bar in the header area, with no link at all.
        addContent(`${home}/siteHeader`, 'empty', 'ctpl:networkBar', { label: { en: 'Empty', fr: 'Vide' } })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders nothing on the live site without a link, and says what to add in edit mode', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-network-bar"]').should('have.length', 1)
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).then(({ body }) =>
            expect(body).to.contain('Add a link to the home page of each site of the group.'),
        )
        cy.logout()
    })

    it('without a label, is still named for screen readers', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-network-bar"]')
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`#${id}`).should('have.text', 'Our sites').and('have.class', 'ctpl-visually-hidden'))
    })

    it('never marks an external link as current, and marks the internal link to this site', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-network-site"] a', 'Partner site').should(
            'have.attr',
            'href',
            'https://example.com/',
        )
        cy.contains('[data-testid="ctpl-network-site"] a', 'Partner site').should('not.have.attr', 'aria-current')
        cy.contains('[data-testid="ctpl-network-site"] a', 'This site').should('have.attr', 'aria-current', 'true')
    })

    it('in French, shows the link with no French target as text, never as a broken link', () => {
        cy.visit(`/fr${live}`)
        cy.contains('[data-testid="ctpl-network-site"]', 'Ce site').find('a').should('not.exist')
        cy.get('[data-testid="ctpl-network-bar"]').should('contain.text', 'Nos sites')
    })

    it('never scrolls sideways on a phone', () => {
        cy.viewport(320, 640)
        cy.visit(live)
        cy.window().then((win) => expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth))
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addLink, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('network-auth')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const network = `${home}/siteHeader/network`
const editFrame = (path: string) => `/cms/editframe/default/en${site}/${path}.html`

describe('Network bar - who sees which sites, and who edits the shared bar', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        addContent(`${home}/siteHeader`, 'network', 'ctpl:networkBar', { label: { en: 'Group', fr: 'Groupe' } }).then(
            () =>
                uuidAt(home).then((target) =>
                    addLink(network, { name: 'published', title: { en: 'Published site' }, target }),
                ),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // Added after the publication: editors see it, visitors do not.
        uuidAt(home).then((target) => addLink(network, { name: 'draft', title: { en: 'Draft site' }, target }))
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published links only', () => {
        cy.visit(`${home}/about.html`)
        cy.get('[data-testid="ctpl-network-bar"]').should('contain.text', 'Published site')
        cy.contains('Draft site').should('not.exist')
    })

    it('shows editors the unpublished link, and the shared bar is editable on the home page', () => {
        cy.login()
        cy.request(editFrame('home')).then(({ body }) => {
            expect(body).to.contain('Draft site')
            expect(body).to.contain(`path="${network}"`)
        })
        cy.logout()
    })

    it('locks the shared bar on every other page', () => {
        cy.login()
        cy.request(editFrame('home/about')).then(({ body }) => {
            expect(body).to.contain('data-testid="ctpl-network-bar"')
            expect(body).not.to.contain(`path="${network}"`)
        })
        cy.logout()
    })
})

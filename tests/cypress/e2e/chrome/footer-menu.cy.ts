import { addNode, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addLink, addPage, chromeOf, createTestSite, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('footer-menu')
const chrome = chromeOf(siteKey)

// A navigation component of another module (marked jmix:navMenuComponent) goes in the footer columns,
// next to the link lists: dropped in the footer area, it rendered after the whole footer. Jahia's own
// jnt:navMenu stands in for Menu Manager's Menu, which the test instance does not install.
describe('Chrome - a menu of another module in the footer columns', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } }).then(
            (about) => {
                addNode({
                    parentPathOrId: chrome.columns,
                    name: 'company',
                    primaryNodeType: 'ctpl:linkList',
                    properties: [{ name: 'jcr:title', value: 'Company', language: 'en' }],
                }).then(() => addLink(`${chrome.columns}/company`, { name: 'about', target: uuidOf(about) }))
            },
        )
        addNode({
            parentPathOrId: chrome.columns,
            name: 'menu',
            primaryNodeType: 'jnt:navMenu',
            properties: [{ name: 'jcr:title', value: 'Footer menu', language: 'en' }],
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders the menu inside the footer, on a row of the columns of its own', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-site-footer"] [data-testid="ctpl-footer-columns"]').within(() => {
            cy.get('[data-testid="ctpl-footer-menu"]')
                .should('have.length', 1)
                .and('have.css', 'grid-column-start', '1')
                .and('have.css', 'grid-column-end', '-1')
            cy.contains('h2', 'Company')
            cy.contains('a', 'About')
        })
    })

    it('keeps the link lists and the menu in the order of the columns', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('[data-testid="ctpl-footer-columns"]')
            .children()
            .then(($columns) => {
                expect($columns.eq(0).attr('data-list-name')).to.eq('company')
                expect($columns.eq(1).attr('data-testid')).to.eq('ctpl-footer-menu')
            })
    })
})

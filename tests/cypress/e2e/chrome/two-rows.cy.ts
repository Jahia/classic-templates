import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, chromeOf, createTestSite, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('two-rows')
const chrome = chromeOf(siteKey)
const livePath = (path: string) => `/sites/${siteKey}/home/${path}.html`

describe('Chrome - two-row header layout and the Register entry', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        addPage(chrome.home, {
            name: 'register',
            template: 'content',
            title: { en: 'Create an account', fr: 'Créer un compte' },
        }).then((register) => {
            cy.apollo({
                mutationFile: 'graphql/mutation/setHeaderRegisterPage.graphql',
                variables: { headerPath: chrome.header, register: uuidOf(register) },
            })
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('puts the brand and the tools on top, and the menu on its own row below', () => {
        cy.visit(livePath('about'))
        cy.get('[data-testid="ctpl-brand"]').then(($brand) => {
            cy.get('[data-testid="ctpl-main-navigation"]').then(($nav) => {
                expect($nav[0].getBoundingClientRect().top).to.be.gte($brand[0].getBoundingClientRect().bottom)
            })
        })
        cy.get('[data-testid="ctpl-account"]').then(($account) => {
            cy.get('[data-testid="ctpl-main-navigation"]').then(($nav) => {
                expect($nav[0].getBoundingClientRect().top).to.be.gte($account[0].getBoundingClientRect().bottom)
            })
        })
    })

    it('offers "Register" beside "Sign in" to a guest, leading to the registration page', () => {
        cy.visit(livePath('about'))
        cy.get('[data-testid="ctpl-account-register"]')
            .should('have.text', 'Register')
            .and('have.attr', 'href')
            .and('include', '/register.html')
        cy.get('[data-testid="ctpl-account-sign-in"]').should('have.text', 'Sign in')
        cy.visit(`/fr${livePath('about')}`)
        cy.get('[data-testid="ctpl-account-register"]').should('have.text', 'Créer un compte')
    })

    it('shows the name and "Sign out", without "Register", to a signed-in visitor', () => {
        cy.login()
        cy.visit(livePath('about'))
        cy.get('[data-testid="ctpl-account-sign-out"]').should('be.visible')
        cy.get('[data-testid="ctpl-account-register"]').should('not.exist')
        cy.logout()
    })
})

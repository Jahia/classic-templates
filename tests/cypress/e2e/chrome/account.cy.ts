import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, chromeOf, createTestSite, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('account')
const chrome = chromeOf(siteKey)
const livePath = (path: string) => `/sites/${siteKey}/home/${path}.html`
const encoded = (path: string) => encodeURIComponent(path)
let membersUuid = ''

describe('Chrome - the sign-in / sign-out entry of the header', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(chrome.home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        addPage(chrome.home, { name: 'members', template: 'content', title: { en: 'Members', fr: 'Membres' } }).then(
            (members) => {
                membersUuid = uuidOf(members)
            },
        )
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows no account entry until the option is switched on', () => {
        cy.visit(livePath('about'))
        cy.get('[data-testid="ctpl-site-header"]').should('exist')
        cy.get('[data-testid="ctpl-account"]').should('not.exist')
    })

    describe('with the option on', () => {
        before(() => {
            cy.login()
            setNodeProperty(chrome.header, 'showAccount', 'true', 'en')
            publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
            cy.logout()
        })

        it('offers "Sign in" to a guest, through the platform login route and back to the page', () => {
            cy.visit(livePath('about'))
            cy.get('[data-testid="ctpl-account-sign-in"]')
                .should('have.text', 'Sign in')
                .and('have.attr', 'href', `/cms/login?redirect=${encoded(livePath('about'))}`)
            cy.get('[data-testid="ctpl-account-user"]').should('not.exist')
        })

        it('gives every page its own way back, while the header stays shared', () => {
            cy.visit(livePath('members'))
            cy.get('[data-testid="ctpl-account-sign-in"]').should(
                'have.attr',
                'href',
                `/cms/login?redirect=${encoded(livePath('members'))}`,
            )
        })

        it('labels it in French, with the French page to come back to', () => {
            cy.visit(`/fr${livePath('about')}`)
            cy.get('[data-testid="ctpl-account-sign-in"]')
                .should('have.text', 'Se connecter')
                .and('have.attr', 'href', `/cms/login?redirect=${encoded(`/fr${livePath('about')}`)}`)
        })

        it('only ever passes a site-relative path as the redirect', () => {
            cy.visit(livePath('about'))
            cy.get('[data-testid="ctpl-account-sign-in"]')
                .invoke('attr', 'href')
                .then((href) => {
                    const redirect = new URL(href as string, 'http://localhost').searchParams.get('redirect') as string
                    expect(redirect).to.match(/^\/[^/\\]/)
                    expect(redirect).not.to.match(/^[a-z]+:/i)
                })
        })

        it('shows the visitor name and "Sign out" to a signed-in user, from the same cached header', () => {
            cy.login()
            cy.visit(livePath('about'))
            cy.get('[data-testid="ctpl-account-user"]').should('exist')
            cy.get('[data-testid="ctpl-account-name"]').invoke('text').should('match', /\S/)
            cy.get('[data-testid="ctpl-account-sign-out"]')
                .should('have.text', 'Sign out')
                .and('have.attr', 'href', `/cms/logout?redirect=${encoded(livePath('about'))}`)
            cy.get('[data-testid="ctpl-account-sign-in"]').should('not.exist')
            cy.logout()
        })

        it('is a guest again once signed out', () => {
            cy.visit(livePath('about'))
            cy.get('[data-testid="ctpl-account-sign-in"]').should('exist')
            cy.get('[data-testid="ctpl-account-user"]').should('not.exist')
        })

        it('comes back to the page picked in the header, restricted or not', () => {
            cy.login()
            cy.apollo({
                mutationFile: 'graphql/mutation/setHeaderAccount.graphql',
                variables: { headerPath: chrome.header, show: 'true', landing: membersUuid },
            })
            publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
            cy.logout()
            cy.visit(livePath('about'))
            cy.get('[data-testid="ctpl-account-sign-in"]').should(
                'have.attr',
                'href',
                `/cms/login?redirect=${encoded(livePath('members'))}`,
            )
        })
    })
})

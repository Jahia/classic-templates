import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import {
    addContent,
    addEditorial,
    addList,
    addPage,
    chromeOf,
    createTestSite,
    uuidAt,
    uuidOf,
} from '../../support/test-helpers'

const siteKey = siteKeyFor('members')
const site = `/sites/${siteKey}`
const chrome = chromeOf(siteKey)
const news = `${site}/contents/news`
const live = (path: string) => `/sites/${siteKey}/home/${path}.html`
const item = (name: string) => `/sites/${siteKey}/contents/news/${name}.html`

describe('Members-only items, pages and sign-in', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)

        // Two news items: one public, one reserved.
        addEditorial(news, 'ctpl:news', {
            name: 'open',
            title: { en: 'Open news', fr: 'Actualité ouverte' },
            teaser: { en: 'Open teaser.', fr: 'Chapeau ouvert.' },
            body: { en: '<p>Open body text</p>', fr: '<p>Texte ouvert</p>' },
            date: '2026-09-20',
        })
        addEditorial(news, 'ctpl:news', {
            name: 'reserved',
            title: { en: 'Reserved news', fr: 'Actualité réservée' },
            teaser: { en: 'Reserved teaser.', fr: 'Chapeau réservé.' },
            body: { en: '<p>Reserved body text</p>', fr: '<p>Texte réservé</p>' },
            date: '2026-09-21',
            membersOnly: true,
        })

        // A members-only page with a sub-page, and a sign-in page.
        addPage(chrome.home, {
            name: 'members',
            template: 'content',
            title: { en: 'Members area', fr: 'Espace membre' },
            membersOnly: true,
        })
        addContent(`${site}/home/members`, 'main', 'ctpl:pageArea', {})
        addContent(`${site}/home/members/main`, 'secret', 'ctpl:richText', {
            'jcr:title': { en: 'Secret heading', fr: 'Titre secret' },
            body: { en: '<p>Secret section text</p>', fr: '<p>Texte de section secret</p>' },
        })
        addPage(`${site}/home/members`, { name: 'deep', template: 'content', title: { en: 'Deep', fr: 'Profond' } })
        addContent(`${site}/home/members/deep`, 'main', 'ctpl:pageArea', {})
        addContent(`${site}/home/members/deep/main`, 'secret', 'ctpl:richText', {
            'jcr:title': { en: 'Deep heading', fr: 'Titre profond' },
            body: { en: '<p>Deep secret text</p>', fr: '<p>Texte profond secret</p>' },
        })
        addPage(chrome.home, {
            name: 'signin',
            template: 'content',
            title: { en: 'Sign in', fr: 'Se connecter' },
        }).then((signin) => {
            addContent(`${site}/home/signin`, 'main', 'ctpl:pageArea', {})
            addContent(`${site}/home/signin/main`, 'form', 'ctpl:signIn', {
                'jcr:title': { en: 'Access your area', fr: 'Accédez à votre espace' },
                introText: { en: 'Use your member account.', fr: 'Utilisez votre compte membre.' },
            })
            cy.apollo({
                mutationFile: 'graphql/mutation/setHeaderSignInPage.graphql',
                variables: { headerPath: chrome.header, signIn: uuidOf(signin) },
            })
        })

        // A page that lists the news.
        addPage(chrome.home, { name: 'lists', template: 'content', title: { en: 'Lists', fr: 'Listes' } })
        addContent(`${site}/home/lists`, 'main', 'ctpl:pageArea', {})
        uuidAt(news).then((newsUuid) =>
            addList(`${site}/home/lists/main`, 'latest', { type: 'ctpl:news', startUuid: newsUuid }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    describe('a guest', () => {
        it('reads a public item in full, without a badge', () => {
            cy.visit(item('open'))
            cy.get('[data-testid="ctpl-news-full"]').should('exist').and('contain.text', 'Open body text')
            cy.get('[data-testid="ctpl-members-badge"]').should('not.exist')
        })

        it('gets the teaser page of a reserved item: badge, notice and form, never the body', () => {
            cy.visit(item('reserved'))
            cy.get('[data-testid="ctpl-news-restricted"]').should('exist')
            cy.get('h1').should('have.length', 1).and('have.text', 'Reserved news')
            cy.contains('Reserved teaser.').should('exist')
            cy.get('[data-testid="ctpl-members-badge"]').should('have.text', 'Members only')
            cy.get('[data-testid="ctpl-members-notice"]').should('exist')
            cy.get('[data-testid="ctpl-sign-in-form"]').should('exist')
            cy.request(item('reserved')).its('body').should('not.contain', 'Reserved body text')
        })

        it('never gets the body of a reserved item from another view of it', () => {
            for (const view of ['.fullPage.html.ajax', '.html.ajax', '.default.html']) {
                cy.request({
                    url: `/sites/${siteKey}/contents/news/reserved${view}`,
                    failOnStatusCode: false,
                }).then((response) => {
                    expect(response.body).not.to.contain('Reserved body text')
                })
            }
        })

        it('sees one badge on the reserved item of a list, none on the public one', () => {
            cy.visit(live('lists'))
            cy.get('[data-testid="ctpl-members-badge"]').should('have.length', 1)
        })

        it('gets the title, a notice and the form on a members-only page, and not its sections', () => {
            cy.visit(live('members'))
            cy.get('h1').should('have.length', 1).and('have.text', 'Members area')
            cy.get('[data-testid="ctpl-members-notice"]').should('exist')
            cy.get('[data-testid="ctpl-sign-in-form"]').should('exist')
            cy.request(live('members')).its('body').should('not.contain', 'Secret section text')
        })

        it('gets the same gate on a sub-page of a members-only page', () => {
            cy.visit(live('members/deep'))
            cy.get('[data-testid="ctpl-members-notice"]').should('exist')
            cy.request(live('members/deep')).its('body').should('not.contain', 'Deep secret text')
        })

        it('has a header entry that opens the site sign-in page, back to the page being viewed', () => {
            cy.visit(live('lists'))
            cy.get('[data-testid="ctpl-account-sign-in"]')
                .should('have.attr', 'href', `${live('signin')}?redirect=${encodeURIComponent(live('lists'))}`)
                .and('not.have.attr', 'href', /cms\/login/)
        })
    })

    describe('signing in', () => {
        const signInAsRoot = () => {
            cy.get('[data-testid="ctpl-sign-in-form"]').within(() => {
                cy.get('input[name="username"]').type('root')
                cy.get('input[name="password"]').type(Cypress.env('SUPER_USER_PASSWORD'), { log: false })
                cy.get('[data-testid="ctpl-sign-in-submit"]').click()
            })
        }

        it('refuses a wrong password with a message and stays on the page', () => {
            cy.visit(item('reserved'))
            cy.get('[data-testid="ctpl-sign-in-form"]').within(() => {
                cy.get('input[name="username"]').type('root')
                cy.get('input[name="password"]').type('not-the-password', { log: false })
                cy.get('[data-testid="ctpl-sign-in-submit"]').click()
            })
            cy.get('[data-testid="ctpl-sign-in-error"]').should('have.attr', 'role', 'alert')
            cy.location('pathname').should('eq', item('reserved'))
        })

        it('opens a reserved item on the page itself once signed in', () => {
            cy.visit(item('reserved'))
            signInAsRoot()
            cy.get('[data-testid="ctpl-news-full"]').should('contain.text', 'Reserved body text')
            cy.location('pathname').should('eq', item('reserved'))
            cy.get('[data-testid="ctpl-members-badge"]').should('exist')
            cy.logout()
        })

        it('goes back to the page the header asked for', () => {
            cy.visit(`${live('signin')}?redirect=${encodeURIComponent(live('members'))}`)
            signInAsRoot()
            cy.location('pathname').should('eq', live('members'))
            cy.get('[data-testid="ctpl-members-notice"]').should('not.exist')
            cy.contains('Secret section text').should('exist')
            cy.logout()
        })

        it('never follows a redirect to another site', () => {
            cy.visit(`${live('signin')}?redirect=${encodeURIComponent('https://evil.example.com/x')}`)
            cy.location('origin').then((origin) => {
                signInAsRoot()
                cy.location('pathname').should('eq', `/sites/${siteKey}/home.html`)
                cy.location('origin').should('eq', origin)
            })
            cy.logout()
        })
    })

    describe('what each visitor gets from the same address (cache)', () => {
        it('serves the guest, the member and the guest again on one URL, whoever came first', () => {
            cy.visit(item('reserved'))
            cy.get('[data-testid="ctpl-news-restricted"]').should('exist')
            cy.login()
            cy.visit(item('reserved'))
            cy.get('[data-testid="ctpl-news-full"]').should('contain.text', 'Reserved body text')
            cy.logout()
            cy.visit(item('reserved'))
            cy.get('[data-testid="ctpl-news-restricted"]').should('exist')
            cy.contains('Reserved body text').should('not.exist')
        })

        it('does the same on a members-only page', () => {
            cy.visit(live('members'))
            cy.get('[data-testid="ctpl-members-notice"]').should('exist')
            cy.login()
            cy.visit(live('members'))
            cy.get('[data-testid="ctpl-members-notice"]').should('not.exist')
            cy.contains('Secret section text').should('exist')
            cy.logout()
            cy.visit(live('members'))
            cy.get('[data-testid="ctpl-members-notice"]').should('exist')
            cy.contains('Secret section text').should('not.exist')
        })
    })
})

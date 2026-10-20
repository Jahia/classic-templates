import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite, ctaTo, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('cta-audience')
const home = `/sites/${siteKey}/home`
const page = `${home}/welcome`
const url = `/sites/${siteKey}/home/welcome.html`

// A call to action shown only to visitors who are not signed in (a "Sign in" button) or only to
// signed-in visitors (ctplmix:cta ctaAudience), rendered through the per-user "ctaForAudience"
// view while the section around it stays shared.
describe('Calls to action for an audience', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'target', template: 'content', title: { en: 'Target', fr: 'Cible' } }).then((target) => {
            const cta = ctaTo(uuidOf(target))
            addPage(home, { name: 'welcome', template: 'content', title: { en: 'Welcome', fr: 'Bienvenue' } })
            addContent(page, 'hero', 'ctpl:heroArea', {}).then(() =>
                addContent(
                    `${page}/hero`,
                    'banner',
                    'ctpl:heroBanner',
                    {
                        'jcr:title': { en: 'For our members', fr: 'Pour nos membres' },
                        ctaLabel: { en: 'Sign in now', fr: 'Se connecter maintenant' },
                    },
                    [...cta.props, { name: 'ctaAudience', value: 'guests' }],
                    cta.mixins,
                ),
            )
            addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
                addContent(
                    `${page}/main`,
                    'area',
                    'ctpl:richText',
                    {
                        'jcr:title': { en: 'Your area', fr: 'Votre espace' },
                        body: { en: '<p>Everything in one place.</p>', fr: '<p>Tout au même endroit.</p>' },
                        ctaLabel: { en: 'Open your area', fr: 'Ouvrir votre espace' },
                    },
                    [...cta.props, { name: 'ctaAudience', value: 'members' }],
                    ['ctplmix:cta', ...cta.mixins],
                )
                addContent(
                    `${page}/main`,
                    'all',
                    'ctpl:richText',
                    {
                        'jcr:title': { en: 'For all', fr: 'Pour tous' },
                        body: { en: '<p>Open to all.</p>', fr: '<p>Ouvert à tous.</p>' },
                        ctaLabel: { en: 'Read more', fr: 'En savoir plus' },
                    },
                    cta.props,
                    ['ctplmix:cta', ...cta.mixins],
                )
            })
            publishAndWaitJobEnding(home, ['en', 'fr'])
        })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows a guest the guests-only button and the button for everyone, not the members-only one', () => {
        cy.visit(url)
        cy.get('[data-testid="ctpl-hero-banner"]').should('contain.text', 'For our members')
        cy.contains('a', 'Sign in now').should('exist')
        cy.contains('a', 'Read more').should('exist')
        cy.contains('a', 'Open your area').should('not.exist')
    })

    it('shows a signed-in visitor the members-only button and not the Sign in one, whoever came first', () => {
        cy.visit(url)
        cy.contains('a', 'Sign in now').should('exist')
        cy.login()
        cy.visit(url)
        cy.get('[data-testid="ctpl-hero-banner"]').should('contain.text', 'For our members')
        cy.contains('a', 'Sign in now').should('not.exist')
        cy.contains('a', 'Open your area').should('exist')
        cy.contains('a', 'Read more').should('exist')
        cy.logout()
        cy.visit(url)
        cy.contains('a', 'Sign in now').should('exist')
        cy.contains('a', 'Open your area').should('not.exist')
    })

    it('does the same in French', () => {
        cy.visit(`/fr${url}`)
        cy.contains('a', 'Se connecter maintenant').should('exist')
        cy.contains('a', 'Ouvrir votre espace').should('not.exist')
    })
})

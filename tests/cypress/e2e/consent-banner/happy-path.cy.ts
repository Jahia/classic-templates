import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite, ctaTo, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('consent')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const live = `${home}/page.html`

const consentLabels = {
    'jcr:title': { en: 'Your privacy', fr: 'Votre vie privée' },
    text: {
        en: 'We record the pages you read once you accept.',
        fr: 'Nous enregistrons les pages lues après votre accord.',
    },
    acceptLabel: { en: 'Accept', fr: 'Accepter' },
    refuseLabel: { en: 'Refuse', fr: 'Refuser' },
    settingsLabel: { en: 'Privacy settings', fr: 'Paramètres de confidentialité' },
    ctaLabel: { en: 'Privacy policy', fr: 'Politique de confidentialité' },
}

const banner = () => cy.get('[data-testid="ctpl-consent-banner"]')

describe('Consent banner - asks once, remembers the choice, opens again from the settings button', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'privacy', template: 'content', title: { en: 'Privacy', fr: 'Confidentialité' } }).then(
            (privacy) => {
                const cta = ctaTo(uuidOf(privacy))
                addContent(`${home}/siteFooter`, 'consent', 'ctpl:consentBanner', consentLabels, cta.props, cta.mixins)
            },
        )
        addPage(home, { name: 'page', template: 'content', title: { en: 'A page', fr: 'Une page' } })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    beforeEach(() => cy.clearCookie('ctpl-consent'))

    it('shows the banner on a first visit, with its text, the privacy link and two choices', () => {
        cy.visit(live)
        banner()
            .should('be.visible')
            .within(() => {
                cy.get('h2').should('have.text', 'Your privacy')
                cy.contains('We record the pages you read once you accept.')
                cy.get('[data-testid="ctpl-cta"]').should('have.attr', 'href').and('contain', '/home/privacy')
                cy.get('[data-testid="ctpl-consent-accept"]').should('have.text', 'Accept')
                cy.get('[data-testid="ctpl-consent-refuse"]').should('have.text', 'Refuse')
            })
        banner().should('have.attr', 'aria-labelledby')
    })

    it('stores an acceptance, announces it and hides the banner, focus on the settings button', () => {
        cy.visit(live, {
            onBeforeLoad(win) {
                win.document.addEventListener('ctpl:consent', (event) => {
                    ;(win as unknown as { consentEvents: string[] }).consentEvents ??= []
                    ;(win as unknown as { consentEvents: string[] }).consentEvents.push(
                        (event as CustomEvent<{ status: string }>).detail.status,
                    )
                })
            },
        })
        cy.get('[data-testid="ctpl-consent-accept"]').click()
        banner().should('not.be.visible')
        cy.getCookie('ctpl-consent').its('value').should('eq', 'granted')
        cy.get('html').should('have.attr', 'data-ctpl-consent', 'granted')
        cy.window().its('consentEvents').should('deep.equal', ['granted'])
        cy.focused().should('have.attr', 'data-testid', 'ctpl-consent-settings')
    })

    it("keeps jExperience's switch on the page in step with the choice, for scripts that read it at once", () => {
        // jExperience stands in as a stub: the banner calls it and the page's copy of the switch
        // (digitalData.wemInitConfig.activateWem, written at page load) must follow the choice
        // on this page, or Formidable's bridge sends no answers until the next page.
        type Tracked = { wem: { calls: string[] }; digitalData: { wemInitConfig: { activateWem: boolean } } }
        cy.visit(live, {
            onBeforeLoad(win) {
                const w = win as unknown as Tracked & { wem: Record<string, unknown> }
                w.digitalData = { wemInitConfig: { activateWem: false } }
                const calls: string[] = []
                w.wem = { calls, enableWem: () => calls.push('enable'), disableWem: () => calls.push('disable') }
            },
        })
        cy.get('[data-testid="ctpl-consent-accept"]').click()
        cy.window().its('wem.calls').should('deep.equal', ['enable'])
        cy.window().its('digitalData.wemInitConfig.activateWem').should('equal', true)
        cy.get('[data-testid="ctpl-consent-settings"]').click()
        cy.get('[data-testid="ctpl-consent-refuse"]').click()
        cy.window().its('wem.calls').should('deep.equal', ['enable', 'disable'])
        cy.window().its('digitalData.wemInitConfig.activateWem').should('equal', false)
    })

    it('does not ask again, and the settings button opens the banner to change the choice', () => {
        cy.setCookie('ctpl-consent', 'granted')
        cy.visit(live)
        banner().should('not.be.visible')
        cy.get('[data-testid="ctpl-consent-settings"]').should('have.text', 'Privacy settings').click()
        banner().should('be.visible')
        cy.focused().should('have.attr', 'data-testid', 'ctpl-consent-accept')
        cy.get('[data-testid="ctpl-consent-refuse"]').click()
        cy.getCookie('ctpl-consent').its('value').should('eq', 'denied')
        banner().should('not.be.visible')
    })

    it('speaks French on French pages', () => {
        cy.visit(`/fr${live}`)
        banner().within(() => {
            cy.get('h2').should('have.text', 'Votre vie privée')
            cy.get('[data-testid="ctpl-consent-refuse"]').should('have.text', 'Refuser')
        })
    })
})

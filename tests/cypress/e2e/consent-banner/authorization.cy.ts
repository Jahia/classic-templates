import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('consent-auth')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const editFrame = (path: string) => `/cms/editframe/default/en${site}/${path}.html`
/** The banner's <section> with the hidden attribute, whatever the attribute order. */
const hiddenBanner = /<section(?=[^>]*data-testid="ctpl-consent-banner")(?=[^>]*\shidden[\s=>])[^>]*>/
const labels = {
    acceptLabel: { en: 'Accept', fr: 'Accepter' },
    refuseLabel: { en: 'Refuse', fr: 'Refuser' },
    settingsLabel: { en: 'Privacy settings', fr: 'Paramètres de confidentialité' },
}

describe('Consent banner - what visitors and editors get, and where it goes', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addContent(`${home}/siteFooter`, 'consent', 'ctpl:consentBanner', labels)
        addPage(home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        addContent(`${home}/about`, 'main', 'ctpl:pageArea', {})
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('sends visitors the banner hidden, its script, and the settings button inside a template', () => {
        cy.request(`${home}/about.html`).then(({ body }) => {
            expect(body).to.match(hiddenBanner)
            expect(body).to.contain('static/js/consent-banner.js')
            expect(body).to.match(/<template data-ctpl-consent-settings[^>]*>[\s\S]*ctpl-consent-settings/)
        })
    })

    it('shows editors the banner in place, with no script, editable on the home page only', () => {
        cy.login()
        cy.request(editFrame('home')).then(({ body }) => {
            expect(body).to.contain('data-testid="ctpl-consent-hint"')
            expect(body).not.to.contain('static/js/consent-banner.js')
            expect(body).not.to.match(hiddenBanner)
            expect(body).to.contain(`path="${home}/siteFooter/consent"`)
        })
        cy.request(editFrame('home/about')).then(({ body }) => {
            expect(body).to.contain('data-testid="ctpl-consent-banner"')
            expect(body).not.to.contain(`path="${home}/siteFooter/consent"`)
        })
        cy.logout()
    })

    it('goes in the footer area only', () => {
        cy.login()
        const add = (parent: string, name: string) =>
            cy.request({
                method: 'POST',
                url: '/modules/graphql',
                headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
                body: {
                    query: 'mutation($p:String!,$n:String!){jcr{addNode(parentPathOrId:$p,name:$n,primaryNodeType:"ctpl:consentBanner"){uuid}}}',
                    variables: { p: parent, n: name },
                },
            })
        add(`${home}/about/main`, 'inMain').its('body.errors').should('have.length.greaterThan', 0)
        add(`${home}/siteHeader`, 'inHeader').its('body.errors').should('have.length.greaterThan', 0)
        cy.logout()
    })
})

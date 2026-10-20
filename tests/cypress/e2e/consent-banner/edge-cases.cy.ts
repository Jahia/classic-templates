import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('consent-edge')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const live = `${home}/page.html`

describe('Consent banner - incomplete banners, default title, how long a choice is kept', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'page', template: 'content', title: { en: 'A page', fr: 'Une page' } })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    beforeEach(() => cy.clearCookie('ctpl-consent'))

    it('shows nothing to visitors without a refuse label, and tells editors why', () => {
        cy.login()
        addContent(`${home}/siteFooter`, 'consent', 'ctpl:consentBanner', {
            acceptLabel: { en: 'Accept', fr: 'Accepter' },
            settingsLabel: { en: 'Privacy settings', fr: 'Paramètres' },
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.request(`/cms/editframe/default/en${live}`).then(({ body }) => {
            expect(body).to.contain('give it an accept label, a refuse label and a settings label')
        })
        cy.logout()
        cy.visit(live)
        cy.get('[data-testid="ctpl-consent"]').should('not.exist')
    })

    it('names the banner for screen readers without a title, and keeps a choice for the days set', () => {
        cy.login()
        cy.request({
            method: 'POST',
            url: '/modules/graphql',
            headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
            body: {
                query: `mutation($p:String!){jcr{mutateNode(pathOrId:$p){
                    en: mutateProperty(name:"refuseLabel"){setValue(value:"Refuse",language:"en")}
                    days: mutateProperty(name:"rememberDays"){setValue(value:"30")}}}}`,
                variables: { p: `${home}/siteFooter/consent` },
            },
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
        cy.visit(live)
        cy.get('[data-testid="ctpl-consent-banner"] h2')
            .should('have.class', 'ctpl-visually-hidden')
            .and('have.text', 'Privacy choices')
        cy.get('[data-testid="ctpl-consent-accept"]').click()
        cy.getCookie('ctpl-consent').then((cookie) => {
            const days = ((cookie?.expiry ?? 0) - Date.now() / 1000) / 86400
            expect(days).to.be.within(29.9, 30.1)
        })
    })
})

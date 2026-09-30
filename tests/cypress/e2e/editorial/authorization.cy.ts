import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addList, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('editorial-auth')
const site = `/sites/${siteKey}`
const news = `${site}/contents/news`

describe('News - published and unpublished items', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(news, 'ctpl:news', { name: 'public', title: { en: 'Public', fr: 'Public' }, date: '2026-09-01' })
        addPage(`${site}/home`, { name: 'feed', template: 'content', title: { en: 'Feed', fr: 'Fil' } })
        addContent(`${site}/home/feed`, 'main', 'ctpl:pageArea', {})
        uuidAt(news).then((newsUuid) =>
            addList(`${site}/home/feed/main`, 'list', { type: 'ctpl:news', startUuid: newsUuid }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // Created after the publication: exists in the edit workspace only.
        addEditorial(news, 'ctpl:news', { name: 'draft', title: { en: 'Draft', fr: 'Brouillon' }, date: '2026-09-02' })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors published items only, and serves their pages', () => {
        cy.visit(`${site}/home/feed.html`)
        cy.get('[data-testid="ctpl-news-card"]').should('have.length', 1).and('contain.text', 'Public')
        cy.request(`${site}/contents/news/public.html`).its('status').should('eq', 200)
        cy.request({ url: `${site}/contents/news/draft.html`, failOnStatusCode: false })
            .its('status')
            .should('eq', 404)
    })

    it('shows editors the unpublished item in preview', () => {
        cy.login()
        cy.visit(`/cms/render/default/en${site}/home/feed.html`)
        cy.get('[data-testid="ctpl-news-card"]').should('have.length', 2).and('contain.text', 'Draft')
        cy.logout()
    })
})

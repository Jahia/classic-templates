import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addPage, createTestSite, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('notice-auth')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const news = `${site}/contents/news`
const editFrame = (path: string) => `/cms/editframe/default/en${site}/${path}.html`

describe('Notice bar - who sees which items, and who edits the shared bar', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(news, 'ctpl:news', { name: 'published', title: { en: 'Published notice' }, date: '2026-09-20' })
        addPage(home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } })
        uuidAt(news).then((folder) =>
            addContent(`${home}/siteHeader`, 'notices', 'ctpl:noticeBar', {}, [
                { name: 'startNode', type: 'WEAKREFERENCE', value: folder },
            ]),
        )
        addContent(`${home}/about`, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${home}/about/main`, 'grid', 'ctpl:cardGrid', {}),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // Added after the publication: editors see it, visitors do not.
        addEditorial(news, 'ctpl:news', { name: 'draft', title: { en: 'Draft notice' }, date: '2026-09-25' })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published items only', () => {
        cy.visit(`${home}/about.html`)
        cy.get('[data-testid="ctpl-notice-bar"]').should('contain.text', 'Published notice')
        cy.contains('Draft notice').should('not.exist')
    })

    it('shows editors the unpublished item, and the shared bar is editable on the home page', () => {
        cy.login()
        cy.request(editFrame('home')).then(({ body }) => {
            expect(body).to.contain('Draft notice')
            expect(body).to.contain(`path="${home}/siteHeader/notices"`)
        })
        cy.logout()
    })

    it('locks the shared bar on every other page', () => {
        cy.login()
        cy.request(editFrame('home/about')).then(({ body }) => {
            expect(body).to.contain('data-testid="ctpl-notice-bar"')
            expect(body).not.to.contain(`path="${home}/siteHeader/notices"`)
        })
        cy.logout()
    })

    it('goes in the header, hero and main areas, never inside another section', () => {
        cy.login()
        const add = (parent: string, name: string) =>
            cy.request({
                method: 'POST',
                url: '/modules/graphql',
                headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
                body: {
                    query: 'mutation($p:String!,$n:String!){jcr{addNode(parentPathOrId:$p,name:$n,primaryNodeType:"ctpl:noticeBar"){uuid}}}',
                    variables: { p: parent, n: name },
                },
            })
        add(`${home}/about/main`, 'inMain').its('body.errors').should('be.undefined')
        addContent(`${home}/about`, 'hero', 'ctpl:heroArea', {}).then(() =>
            add(`${home}/about/hero`, 'inHero').its('body.errors').should('be.undefined'),
        )
        add(`${home}/about/main/grid`, 'intruder').its('body.errors').should('have.length.greaterThan', 0)
        cy.logout()
    })
})

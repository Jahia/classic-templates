import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('carousel-auth')
const site = `/sites/${siteKey}`
const page = `${site}/home/slides`
const live = `${site}/home/slides.html`

const slide = (name: string, title: string) =>
    addContent(`${page}/main/carousel`, name, 'ctpl:heroBanner', { 'jcr:title': { en: title, fr: title } }, [
        { name: 'variant', value: 'plain' },
    ])

describe('Hero carousel - who sees which slides, and what a slide can be', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'slides', template: 'content', title: { en: 'Slides', fr: 'Diapos' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() =>
            addContent(`${page}/main`, 'carousel', 'ctpl:heroCarousel', {}).then(() => {
                slide('one', 'Published one')
                slide('two', 'Published two')
            }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // Added after the publication: editors see it, visitors do not.
        slide('draft', 'Draft slide')
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows anonymous visitors the published slides only, with one button per slide', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-carousel-slide"]').should('have.length', 2)
        cy.get('[data-testid="ctpl-carousel-picker"]').should('have.length', 2)
        cy.contains('Draft slide').should('not.exist')
    })

    it('shows editors the unpublished slide in the edit frame', () => {
        cy.login()
        cy.request(`/cms/editframe/default/en${live}`).its('body').should('contain', 'Draft slide')
        cy.logout()
    })

    it('only accepts hero banners as slides', () => {
        cy.login()
        cy.request({
            method: 'POST',
            url: '/modules/graphql',
            headers: { Origin: new URL(Cypress.config('baseUrl') ?? '').origin },
            body: {
                query: 'mutation($p:String!){jcr{addNode(parentPathOrId:$p,name:"intruder",primaryNodeType:"ctpl:richText"){uuid}}}',
                variables: { p: `${page}/main/carousel` },
            },
        })
            .its('body.errors')
            .should('have.length.greaterThan', 0)
        cy.logout()
    })
})

import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('content-edge')
const home = `/sites/${siteKey}/home`
const page = `${home}/edge`
const live = `/sites/${siteKey}/home/edge.html`
const editFrame = `/cms/editframe/default/en/sites/${siteKey}/home/edge.html`

describe('Content components - missing images, missing links, layout changes', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(home, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'hero', 'ctpl:heroArea', {}).then(() =>
            // Variant "image" but no image, and a button label without a link.
            addContent(`${page}/hero`, 'banner', 'ctpl:heroBanner', {
                'jcr:title': { en: 'No photo', fr: 'Pas de photo' },
                ctaLabel: { en: 'Nowhere', fr: 'Nulle part' },
            }),
        )
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            addContent(`${page}/main`, 'lonely', 'ctpl:imageText', {
                'jcr:title': { en: 'Text only', fr: 'Texte seul' },
                body: { en: '<p>No image here</p>', fr: '<p>Pas d’image ici</p>' },
            })
            addContent(`${page}/main`, 'row', 'ctpl:columns', { 'jcr:title': { en: 'Row', fr: 'Rangée' } }, [
                { name: 'layout', value: 'quarters' },
            ]).then(() =>
                addContent(`${page}/main/row/col4`, 'kept', 'ctpl:richText', {
                    'jcr:title': { en: 'Fourth column', fr: 'Quatrième colonne' },
                    body: { en: '<p>kept</p>', fr: '<p>gardé</p>' },
                }),
            )
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('falls back to the plain banner when the photo is missing', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-hero-banner"]').should('have.attr', 'data-variant', 'plain')
        cy.get('[data-testid="ctpl-hero-banner"] img').should('not.exist')
    })

    it('renders no button for a label without a link, and says why in edit mode', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-cta"]').should('not.exist')
        cy.get('[data-testid="ctpl-cta-hint"]').should('not.exist')
        cy.login()
        cy.request(editFrame).its('body').should('contain', 'data-testid="ctpl-cta-hint"')
        cy.logout()
    })

    it('shows the missing image placeholder in edit mode only', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-image-text"]').should('not.contain.text', 'No image selected')
        cy.login()
        cy.request(editFrame).its('body').should('contain', 'No image selected')
        cy.logout()
    })

    it('keeps the content of a column hidden by a narrower layout', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-column"]').should('have.length', 4)
        cy.contains('h3', 'Fourth column')
        cy.login()
        setNodeProperty(`${page}/main/row`, 'layout', 'halves', 'en')
        publishAndWaitJobEnding(`${page}/main/row`, ['en'])
        cy.logout()
        cy.visit(live)
        cy.get('[data-testid="ctpl-column"]').should('have.length', 2)
        cy.contains('h3', 'Fourth column').should('not.exist')
        cy.login()
        setNodeProperty(`${page}/main/row`, 'layout', 'quarters', 'en')
        publishAndWaitJobEnding(`${page}/main/row`, ['en'])
        cy.logout()
        cy.visit(live)
        cy.contains('h3', 'Fourth column')
    })
})

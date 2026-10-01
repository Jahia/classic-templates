import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addPage, createTestSite, uploadTestImage, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('card-displays-edge')
const site = `/sites/${siteKey}`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`
const editFrame = `/cms/editframe/default/en${live}`

describe('Card grid displays - what a logo strip leaves out, decorative logos, default display', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'item',
            title: { en: 'An item', fr: 'Un élément' },
            date: '2026-09-21',
        })
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        uploadTestImage(siteKey).then((image) =>
            addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
                // A logo strip holding only what it cannot show: nothing on the live site.
                addContent(`${page}/main`, 'empty', 'ctpl:cardGrid', { 'jcr:title': { en: 'Hollow', fr: 'Creux' } }, [
                    { name: 'display', value: 'logos' },
                ]).then(() => {
                    addContent(`${page}/main/empty`, 'noimage', 'ctpl:card', {
                        'jcr:title': { en: 'No image', fr: 'Sans image' },
                    })
                    uuidAt(`${site}/contents/news/item`).then((news) =>
                        addContent(`${page}/main/empty`, 'teaser', 'ctpl:contentTeaser', {}, [
                            { name: 'j:node', type: 'WEAKREFERENCE', value: news },
                        ]),
                    )
                })
                // An unlinked decorative logo is skipped by screen readers.
                addContent(`${page}/main`, 'deco', 'ctpl:cardGrid', { 'jcr:title': { en: 'Decor', fr: 'Décor' } }, [
                    { name: 'display', value: 'logos' },
                ]).then(() =>
                    addContent(`${page}/main/deco`, 'logo', 'ctpl:card', { 'jcr:title': { en: 'Deco', fr: 'Déco' } }, [
                        { name: 'image', type: 'WEAKREFERENCE', value: image },
                        { name: 'imageDecorative', value: 'true' },
                    ]),
                )
                // No display chosen: the autocreated default draws cards.
                addContent(`${page}/main`, 'odd', 'ctpl:cardGrid', { 'jcr:title': { en: 'Odd', fr: 'Bizarre' } }).then(
                    () =>
                        addContent(`${page}/main/odd`, 'card', 'ctpl:card', {
                            'jcr:title': { en: 'Plain card', fr: 'Carte simple' },
                        }),
                )
            }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        publishAndWaitJobEnding(`${site}/files`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows nothing for a logo strip without any image, and says why in edit mode', () => {
        cy.visit(live)
        cy.contains('h2', 'Hollow').should('not.exist')
        cy.login()
        cy.request(editFrame)
            .its('body')
            .should('contain', 'This logo has no image: it is not shown.')
            .and('contain', 'Cards of existing items are not shown in a logo strip.')
        cy.logout()
    })

    it('gives an unlinked decorative logo an empty text alternative', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-card-grid"]', 'Decor')
            .find('[data-testid="ctpl-logo"] img')
            .should('have.attr', 'alt', '')
    })

    it('draws cards when the display is the default', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-card-grid"]', 'Odd').within(() => {
            cy.get('ul').should('have.attr', 'data-display', 'cards')
            cy.contains('[data-testid="ctpl-card"]', 'Plain card')
        })
    })
})

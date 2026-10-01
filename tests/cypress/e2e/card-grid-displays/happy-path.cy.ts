import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import {
    addContent,
    addEditorial,
    addPage,
    createTestSite,
    ctaTo,
    uploadTestImage,
    uuidAt,
    uuidOf,
} from '../../support/test-helpers'

const siteKey = siteKeyFor('card-displays')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const page = `${home}/displays`
const live = `${site}/home/displays.html`

describe('Card grid displays - icon tiles and logo strip', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'update',
            title: { en: 'Service update', fr: 'Mise à jour du service' },
            teaser: { en: 'What changed', fr: 'Ce qui a changé' },
            date: '2026-09-20',
        })
        uploadTestImage(siteKey, 'icon.jpg', 'Icon picture').then((image) =>
            addPage(home, { name: 'target', template: 'content', title: { en: 'Target', fr: 'Cible' } }).then(
                (target) => {
                    const link = ctaTo(uuidOf(target))
                    addPage(home, {
                        name: 'displays',
                        template: 'content',
                        title: { en: 'Displays', fr: 'Affichages' },
                    })
                    addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
                        addContent(
                            `${page}/main`,
                            'tiles',
                            'ctpl:cardGrid',
                            { 'jcr:title': { en: 'Ways to get help', fr: "Obtenir de l'aide" } },
                            [{ name: 'display', value: 'iconTiles' }],
                        ).then(() => {
                            addContent(
                                `${page}/main/tiles`,
                                'linked',
                                'ctpl:card',
                                {
                                    'jcr:title': { en: 'Write to us', fr: 'Nous écrire' },
                                    text: { en: 'Two working days', fr: 'Deux jours ouvrés' },
                                    linkLabel: { en: 'Not shown', fr: 'Non affiché' },
                                },
                                [{ name: 'image', type: 'WEAKREFERENCE', value: image }, ...link.props],
                                link.mixins,
                            )
                            addContent(`${page}/main/tiles`, 'plain', 'ctpl:card', {
                                'jcr:title': { en: 'No link', fr: 'Sans lien' },
                            })
                            uuidAt(`${site}/contents/news/update`).then((news) =>
                                addContent(`${page}/main/tiles`, 'teaser', 'ctpl:contentTeaser', {}, [
                                    { name: 'j:node', type: 'WEAKREFERENCE', value: news },
                                ]),
                            )
                        })
                        addContent(
                            `${page}/main`,
                            'partners',
                            'ctpl:cardGrid',
                            { 'jcr:title': { en: 'Partners', fr: 'Partenaires' } },
                            [{ name: 'display', value: 'logos' }],
                        ).then(() => {
                            // Linked: named after the card title.
                            addContent(
                                `${page}/main/partners`,
                                'northwind',
                                'ctpl:card',
                                { 'jcr:title': { en: 'Northwind', fr: 'Northwind' } },
                                [{ name: 'image', type: 'WEAKREFERENCE', value: image }, ...link.props],
                                link.mixins,
                            )
                            // The text alternative of this use wins over the card title.
                            addContent(
                                `${page}/main/partners`,
                                'bluepeak',
                                'ctpl:card',
                                {
                                    'jcr:title': { en: 'BP', fr: 'BP' },
                                    imageAlt: { en: 'Bluepeak', fr: 'Bluepeak (FR)' },
                                },
                                [{ name: 'image', type: 'WEAKREFERENCE', value: image }],
                            )
                        })
                    })
                },
            ),
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

    it('renders icon tiles: a decorative icon, the title as the one link of the tile, the text', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-card-grid"][data-surface]')
            .first()
            .within(() => {
                cy.get('ul').should('have.attr', 'data-display', 'iconTiles')
                cy.contains('[data-testid="ctpl-icon-tile"]', 'Write to us').within(() => {
                    cy.get('img').should('have.attr', 'alt', '')
                    cy.get('a').should('have.length', 1).and('have.text', 'Write to us')
                    cy.get('h3 a').should('have.attr', 'href', `${site}/home/target.html`)
                    cy.contains('Two working days')
                    cy.contains('Not shown').should('not.exist')
                })
                cy.contains('[data-testid="ctpl-icon-tile"]', 'No link').find('a').should('not.exist')
            })
    })

    it('renders a news teaser as a tile with its own title and teaser', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-content-teaser"] [data-testid="ctpl-news-tile"]').within(() => {
            cy.get('h3 a')
                .should('have.text', 'Service update')
                .and('have.attr', 'href')
                .and('contain', '/contents/news/update')
            cy.contains('What changed')
        })
    })

    it('renders the logo strip with images named after the card or its text alternative', () => {
        cy.visit(live)
        cy.get('ul[data-display="logos"]').within(() => {
            cy.get('[data-testid="ctpl-logo"]').should('have.length', 2)
            cy.get('[data-testid="ctpl-logo"] a img').should('have.attr', 'alt', 'Northwind')
            cy.get('[data-testid="ctpl-logo"]').eq(1).find('a').should('not.exist')
            cy.get('[data-testid="ctpl-logo"]').eq(1).find('img').should('have.attr', 'alt', 'Bluepeak')
            cy.get('h3, h2').should('not.exist')
        })
    })

    it('keeps the tiles and logos within a 320 px screen, in French too', () => {
        cy.viewport(320, 640)
        cy.visit(`/fr${live}`)
        cy.contains('[data-testid="ctpl-icon-tile"]', 'Nous écrire')
        cy.get('[data-testid="ctpl-logo"]').eq(1).find('img').should('have.attr', 'alt', 'Bluepeak (FR)')
        cy.document().then((doc) => {
            expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth)
        })
    })
})

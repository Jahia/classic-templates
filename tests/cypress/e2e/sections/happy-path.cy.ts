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

const siteKey = siteKeyFor('sections')
const site = `/sites/${siteKey}`
const home = `${site}/home`
const page = `${home}/showcase`
const live = `${site}/home/showcase.html`

describe('Sections - card grid, key figures, quote', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'launch',
            title: { en: 'We launched', fr: 'Nous avons lancé' },
            teaser: { en: 'The launch teaser', fr: 'Le résumé du lancement' },
            date: '2026-09-20',
        })
        uploadTestImage(siteKey).then((image) =>
            addPage(home, { name: 'target', template: 'content', title: { en: 'Target page', fr: 'Page cible' } }).then(
                (target) => {
                    const link = ctaTo(uuidOf(target))
                    addPage(home, {
                        name: 'showcase',
                        template: 'content',
                        title: { en: 'Showcase', fr: 'Vitrine' },
                    })
                    addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
                        addContent(
                            `${page}/main`,
                            'grid',
                            'ctpl:cardGrid',
                            {
                                'jcr:title': { en: 'Highlights', fr: 'À la une' },
                                introText: { en: 'A lead text', fr: 'Un chapeau' },
                                ctaLabel: { en: 'All highlights', fr: 'Tout voir' },
                            },
                            [{ name: 'columns', value: '4' }, ...link.props],
                            ['ctplmix:cta', ...link.mixins],
                        ).then(() => {
                            addContent(
                                `${page}/main/grid`,
                                'written',
                                'ctpl:card',
                                {
                                    'jcr:title': { en: 'Written card', fr: 'Carte rédigée' },
                                    text: { en: 'Card text', fr: 'Texte de carte' },
                                    linkLabel: { en: 'Read on', fr: 'Lire la suite' },
                                },
                                [{ name: 'image', type: 'WEAKREFERENCE', value: image }, ...link.props],
                                link.mixins,
                            )
                            // No title: an internal link lends the target page's title.
                            addContent(`${page}/main/grid`, 'untitled', 'ctpl:card', {}, link.props, link.mixins)
                            uuidAt(`${site}/contents/news/launch`).then((news) =>
                                addContent(`${page}/main/grid`, 'teaser', 'ctpl:contentTeaser', {}, [
                                    { name: 'j:node', type: 'WEAKREFERENCE', value: news },
                                ]),
                            )
                        })
                        addContent(`${page}/main`, 'figures', 'ctpl:keyFigures', {
                            'jcr:title': { en: 'In numbers', fr: 'En chiffres' },
                        }).then(() => {
                            addContent(`${page}/main/figures`, 'one', 'ctpl:keyFigure', {
                                value: { en: '98%', fr: '98 %' },
                                label: { en: 'satisfied', fr: 'satisfaits' },
                                detail: { en: 'Survey detail', fr: "Détail de l'enquête" },
                            })
                            addContent(`${page}/main/figures`, 'two', 'ctpl:keyFigure', {
                                value: { en: '24/7', fr: '24 h/24' },
                                label: { en: 'support', fr: 'assistance' },
                            })
                        })
                        addContent(
                            `${page}/main`,
                            'quote',
                            'ctpl:quote',
                            {
                                quote: {
                                    en: 'Good structure makes good pages.',
                                    fr: 'Une bonne structure fait de bonnes pages.',
                                },
                                authorRole: { en: 'Head of digital', fr: 'Responsable du numérique' },
                            },
                            [
                                { name: 'author', value: 'Claire Dubois' },
                                { name: 'variant', value: 'large' },
                                { name: 'image', type: 'WEAKREFERENCE', value: image },
                            ],
                        )
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

    it('renders the card grid with its heading, lead, cards one level below and its call to action', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-card-grid"]').within(() => {
            cy.get('h2').should('have.text', 'Highlights')
            cy.contains('p', 'A lead text')
            cy.get('ul > li').should('have.length', 3)
            cy.get('[data-testid="ctpl-cta"]').should('have.text', 'All highlights')
        })
    })

    it('renders a written card as one link, titled by its heading, with a decorative image', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-card"]', 'Written card').within(() => {
            // The link is named after the title and the visible cue, which is repeated hidden inside it.
            cy.get('h3 a')
                .should('have.text', 'Written card: Read on')
                .and('have.attr', 'href', `${site}/home/target.html`)
            cy.get('h3 a .ctpl-visually-hidden').should('have.text', ': Read on')
            cy.get('img').should('have.attr', 'alt', '')
            cy.contains('Card text')
            cy.get('[aria-hidden="true"]').should('have.text', 'Read on')
        })
    })

    it('titles an untitled card with an internal link after the target page', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-card"] h3 a').eq(1).should('have.text', 'Target page')
    })

    it('renders a content teaser with the news card, as an h3', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-content-teaser"]').within(() => {
            cy.get('[data-testid="ctpl-news-card"] h3 a')
                .should('have.text', 'We launched')
                .and('have.attr', 'href')
                .and('contain', '/contents/news/launch')
            cy.contains('The launch teaser')
        })
    })

    it('renders key figures with value and label in one phrase', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-key-figures"]').within(() => {
            cy.get('h2').should('have.text', 'In numbers')
            cy.get('[data-testid="ctpl-key-figure"]').should('have.length', 2)
            cy.get('[data-testid="ctpl-key-figure"]').first().find('p').first().should('have.text', '98% satisfied')
            cy.contains('Survey detail')
        })
    })

    it('renders the quote as a figure with its blockquote and caption', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-quote"] figure').within(() => {
            cy.get('blockquote p').should('have.text', 'Good structure makes good pages.')
            cy.get('figcaption').should('contain.text', 'Claire Dubois').and('contain.text', 'Head of digital')
            cy.get('figcaption img').should('have.attr', 'alt', '')
        })
        cy.get('h1').should('have.length', 1)
    })

    it('renders every section in French, with French quotation marks', () => {
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-card-grid"] h2').should('have.text', 'À la une')
        cy.get('[data-testid="ctpl-content-teaser"] h3').should('have.text', 'Nous avons lancé')
        cy.get('[data-testid="ctpl-key-figure"]').first().find('p').first().should('have.text', '98 % satisfaits')
        cy.get('[data-testid="ctpl-quote"] blockquote p')
            .should('have.text', 'Une bonne structure fait de bonnes pages.')
            .then(($p) => {
                const style = $p[0].ownerDocument.defaultView?.getComputedStyle($p[0])
                expect(style?.getPropertyValue('quotes')).to.contain('«')
            })
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite, ctaTo, uploadTestImage, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('content')
const home = `/sites/${siteKey}/home`
const page = `${home}/showcase`

describe('Content components - hero banner, image and text, rich text, columns', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        uploadTestImage(siteKey).then((image) => {
            addPage(home, { name: 'showcase', template: 'content', title: { en: 'Showcase', fr: 'Vitrine' } }).then(
                (showcase) => {
                    const cta = ctaTo(uuidOf(showcase))
                    addContent(`${page}`, 'hero', 'ctpl:heroArea', {}).then(() =>
                        addContent(
                            `${page}/hero`,
                            'banner',
                            'ctpl:heroBanner',
                            {
                                'jcr:title': { en: 'Big welcome', fr: 'Grand bienvenue' },
                                eyebrow: { en: 'Eyebrow', fr: 'Surtitre' },
                                subtitle: { en: 'A subtitle', fr: 'Un sous-titre' },
                                ctaLabel: { en: 'Go', fr: 'Aller' },
                            },
                            [{ name: 'image', type: 'WEAKREFERENCE', value: image }, ...cta.props],
                            cta.mixins,
                        ),
                    )
                    addContent(`${page}`, 'main', 'ctpl:pageArea', {}).then(() => {
                        addContent(
                            `${page}/main`,
                            'story',
                            'ctpl:imageText',
                            {
                                'jcr:title': { en: 'Our story', fr: 'Notre histoire' },
                                body: {
                                    en: '<p>Once <strong>upon</strong> a time</p>',
                                    fr: '<p>Il était <strong>une</strong> fois</p>',
                                },
                            },
                            [
                                { name: 'image', type: 'WEAKREFERENCE', value: image },
                                { name: 'imagePosition', value: 'right' },
                                { name: 'ctplSurface', value: 'sunken' },
                            ],
                        )
                        addContent(
                            `${page}/main`,
                            'row',
                            'ctpl:columns',
                            { 'jcr:title': { en: 'Three things', fr: 'Trois choses' } },
                            [{ name: 'layout', value: 'thirds' }],
                        ).then(() => {
                            ;['one', 'two', 'three'].forEach((n, i) =>
                                addContent(`${page}/main/row/col${i + 1}`, 'text', 'ctpl:richText', {
                                    'jcr:title': { en: `Title ${n}`, fr: `Titre ${n}` },
                                    body: { en: `<p>Body ${n}</p>`, fr: `<p>Corps ${n}</p>` },
                                }),
                            )
                        })
                        addContent(`${page}/main`, 'text', 'ctpl:richText', {
                            'jcr:title': { en: 'Plain text', fr: 'Texte simple' },
                            body: { en: '<p>Some <em>rich</em> text</p>', fr: '<p>Du texte <em>riche</em></p>' },
                        })
                    })
                },
            )
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, ['en', 'fr'])
        publishAndWaitJobEnding(`/sites/${siteKey}/files`, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('renders the hero banner with its photo, overlay, h2 heading and call to action', () => {
        cy.visit(`/sites/${siteKey}/home/showcase.html`)
        cy.get('[data-testid="ctpl-hero-banner"]')
            .should('have.attr', 'data-variant', 'image')
            .within(() => {
                cy.get('h2').should('have.text', 'Big welcome')
                cy.contains('Eyebrow')
                cy.contains('A subtitle')
                cy.get('img')
                    .should('have.attr', 'alt', 'Test landscape')
                    .and('have.attr', 'loading', 'eager')
                    .and('have.attr', 'width', '1200')
                cy.get('[data-testid="ctpl-cta"]')
                    .should('have.text', 'Go')
                    .and('have.attr', 'href', `/sites/${siteKey}/home/showcase.html`)
            })
        cy.get('h1').should('have.length', 1)
    })

    it('renders image and text with the rich text, the image on the right and a sunken band', () => {
        cy.visit(`/sites/${siteKey}/home/showcase.html`)
        cy.get('[data-testid="ctpl-image-text"]')
            .should('have.attr', 'data-surface', 'sunken')
            .within(() => {
                cy.get('h2').should('have.text', 'Our story')
                cy.get('strong').should('have.text', 'upon')
                cy.get('img').should('have.attr', 'loading', 'lazy').and('have.attr', 'height', '675')
            })
    })

    it('renders a three-column row whose sections step down to h3', () => {
        cy.visit(`/sites/${siteKey}/home/showcase.html`)
        cy.get('[data-testid="ctpl-columns"]').within(() => {
            cy.get('h2').should('have.text', 'Three things')
            cy.get('[data-testid="ctpl-column"]').should('have.length', 3)
            cy.get('h3').should('have.length', 3).first().should('have.text', 'Title one')
        })
    })

    it('renders rich text', () => {
        cy.visit(`/sites/${siteKey}/home/showcase.html`)
        cy.get('[data-testid="ctpl-rich-text"]').last().find('em').should('have.text', 'rich')
    })

    it('renders every component in French', () => {
        cy.visit(`/fr/sites/${siteKey}/home/showcase.html`)
        cy.get('[data-testid="ctpl-hero-banner"] h2').should('have.text', 'Grand bienvenue')
        cy.get('[data-testid="ctpl-cta"]').should('have.text', 'Aller')
        cy.get('[data-testid="ctpl-image-text"] strong').should('have.text', 'une')
        cy.get('[data-testid="ctpl-columns"] h3').first().should('have.text', 'Titre one')
    })
})

import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('carousel')
const site = `/sites/${siteKey}`
const page = `${site}/home/show`
const live = `${site}/home/show.html`

const slides = () => cy.get('[data-testid="ctpl-carousel-slide"]')
const activeSlide = () => cy.get('[data-testid="ctpl-carousel-slide"][data-active]')
const status = () => cy.get('[data-ctpl-carousel-status]')

describe('Hero carousel - one slide at a time, previous / next, slide buttons', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'show', template: 'content', title: { en: 'Show', fr: 'Vitrine' } })
        addContent(page, 'hero', 'ctpl:heroArea', {}).then(() =>
            addContent(`${page}/hero`, 'carousel', 'ctpl:heroCarousel', {
                'jcr:title': { en: 'Highlights', fr: 'À la une' },
            }).then(() => {
                for (const [name, en, fr, height] of [
                    ['one', 'One', 'Un', 'compact'],
                    ['two', 'Two', 'Deux', 'tall'],
                    ['three', 'Three', 'Trois', 'medium'],
                ]) {
                    addContent(
                        `${page}/hero/carousel`,
                        name,
                        'ctpl:heroBanner',
                        {
                            'jcr:title': { en: `Slide ${en}`, fr: `Diapo ${fr}` },
                            subtitle: { en: `About ${en}`, fr: `À propos de ${fr}` },
                        },
                        [
                            { name: 'variant', value: 'plain' },
                            { name: 'height', value: height },
                        ],
                    )
                }
            }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows one slide at a time; the others are hidden, inert and out of the accessibility tree', () => {
        cy.visit(live)
        slides().should('have.length', 3)
        slides().eq(0).should('be.visible').and('not.have.attr', 'aria-hidden')
        slides()
            .eq(1)
            .should('not.be.visible')
            .and('have.attr', 'aria-hidden', 'true')
            .then(($slide) => expect(($slide[0] as HTMLElement & { inert: boolean }).inert).to.equal(true))
        slides().eq(2).should('not.be.visible')
    })

    it('is a region named by its heading, with slide headings one level below and a single h1', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-hero-carousel"]')
            .should('have.attr', 'aria-roledescription', 'carousel')
            .invoke('attr', 'aria-labelledby')
            .then((id) => cy.get(`h2#${id}`).should('have.text', 'Highlights'))
        slides()
            .eq(0)
            .should('match', 'li')
            .and('have.attr', 'aria-roledescription', 'slide')
            .and('have.attr', 'aria-label', 'Slide 1 of 3')
        slides().eq(0).find('h3').should('have.text', 'Slide One')
        cy.get('h1').should('have.length', 1)
    })

    it('moves with previous and next, wrapping around, and announces the change', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-carousel-next"]').should('contain.text', 'Next slide').click()
        activeSlide().should('have.attr', 'aria-label', 'Slide 2 of 3').and('be.visible')
        cy.get('[data-testid="ctpl-carousel-picker"]').eq(1).should('have.attr', 'aria-current', 'true')
        status().should('have.attr', 'aria-live', 'polite').and('have.text', 'Slide 2 of 3: Slide Two')
        cy.get('[data-testid="ctpl-carousel-prev"]').click()
        cy.get('[data-testid="ctpl-carousel-prev"]').click()
        activeSlide().should('have.attr', 'aria-label', 'Slide 3 of 3')
    })

    it('picks a slide with its button, and moves between slide buttons with the arrow keys, Home and End', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-carousel-picker"]').eq(2).click()
        activeSlide().should('have.attr', 'aria-label', 'Slide 3 of 3')
        cy.get('[data-testid="ctpl-carousel-picker"]').eq(2).type('{rightarrow}')
        cy.focused().should('have.attr', 'data-ctpl-carousel-goto', '0')
        activeSlide().should('have.attr', 'aria-label', 'Slide 1 of 3')
        cy.focused().type('{end}')
        activeSlide().should('have.attr', 'aria-label', 'Slide 3 of 3')
        cy.focused().type('{home}')
        activeSlide().should('have.attr', 'aria-label', 'Slide 1 of 3')
    })

    it('does not play automatically by default: no pause button, nothing moves', () => {
        cy.clock()
        cy.visit(live)
        cy.get('[data-testid="ctpl-carousel-toggle"]').should('not.exist')
        cy.tick(60000)
        activeSlide().should('have.attr', 'aria-label', 'Slide 1 of 3')
        status().should('have.attr', 'aria-live', 'polite').and('be.empty')
    })

    it('keeps the height of its tallest slide whichever slide shows, so the page does not shift', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-hero-carousel"]').then(($carousel) => {
            const before = $carousel[0].getBoundingClientRect().height
            cy.get('[data-testid="ctpl-carousel-next"]').click()
            cy.get('[data-testid="ctpl-carousel-next"]').click()
            cy.get('[data-testid="ctpl-hero-carousel"]').should(($after) =>
                expect($after[0].getBoundingClientRect().height).to.equal(before),
            )
        })
    })

    it('puts previous / slide / next after the slides in the focus order, as on screen, with 44 px targets', () => {
        cy.visit(live)
        // The query returns elements in document order: the slides come first, then the controls.
        cy.get('[data-testid="ctpl-hero-carousel"]')
            .find('[data-ctpl-carousel-controls], [data-testid="ctpl-carousel-slide"]')
            .should('have.length', 4)
            .last()
            .should('have.attr', 'data-ctpl-carousel-controls')
        cy.get('[data-testid="ctpl-carousel-slide"]')
            .last()
            .then(($slide) => {
                cy.get('[data-testid="ctpl-carousel-prev"]').should(($prev) => {
                    // Source order (DOCUMENT_POSITION_FOLLOWING) and visual order agree.
                    expect($slide[0].compareDocumentPosition($prev[0]) & 4).to.equal(4)
                    expect($prev[0].getBoundingClientRect().top).to.be.at.least(
                        $slide[0].getBoundingClientRect().bottom,
                    )
                })
            })
        cy.get('[data-ctpl-carousel-controls] button').each(($button) => {
            const rect = $button[0].getBoundingClientRect()
            expect(rect.width).to.be.at.least(44)
            expect(rect.height).to.be.at.least(44)
        })
    })

    it('renders in French', () => {
        cy.visit(`/fr${live}`)
        cy.get('[data-testid="ctpl-hero-carousel"]').should('have.attr', 'aria-roledescription', 'carrousel')
        cy.get('h2').contains('À la une')
        slides()
            .eq(0)
            .should('have.attr', 'aria-label', 'Diapositive 1 sur 3')
            .find('h3')
            .should('have.text', 'Diapo Un')
        cy.get('[data-testid="ctpl-carousel-next"]').should('contain.text', 'Diapositive suivante')
    })
})

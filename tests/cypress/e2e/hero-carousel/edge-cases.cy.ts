import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('carousel-edge')
const site = `/sites/${siteKey}`
const page = `${site}/home/edge`
const live = `${site}/home/edge.html`
const editFrame = `/cms/editframe/default/en${live}`

/** The carousel with autoplay (first), the untitled one and the single-slide one, in page order. */
const carousel = (index: number) => cy.get('[data-testid="ctpl-hero-carousel"]').eq(index)
const activeLabel = () =>
    carousel(0).find('[data-testid="ctpl-carousel-slide"][data-active]').invoke('attr', 'aria-label')
const toggle = () => cy.get('[data-testid="ctpl-carousel-toggle"]')

const addSlides = (parent: string, names: string[]) =>
    names.forEach((name) =>
        addContent(parent, name, 'ctpl:heroBanner', { 'jcr:title': { en: `Slide ${name}`, fr: `Diapo ${name}` } }, [
            { name: 'variant', value: 'plain' },
        ]),
    )

/** A visit whose browser reports prefers-reduced-motion: reduce (matchMedia, read by the script). */
const visitWithReducedMotion = (url: string) =>
    cy.visit(url, {
        onBeforeLoad(win) {
            const real = win.matchMedia.bind(win)
            win.matchMedia = (query: string) =>
                query.includes('prefers-reduced-motion')
                    ? ({ ...real(query), matches: query.includes('reduce'), media: query } as MediaQueryList)
                    : real(query)
        },
    })

describe('Hero carousel - autoplay, reduced motion, no JavaScript, edit mode, single slide', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, { name: 'edge', template: 'content', title: { en: 'Edge', fr: 'Limite' } })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            addContent(`${page}/main`, 'auto', 'ctpl:heroCarousel', { 'jcr:title': { en: 'Auto', fr: 'Auto' } }, [
                { name: 'autoplay', value: 'true' },
                { name: 'interval', value: '5' },
                { name: 'hideTitle', value: 'true' },
            ]).then(() => addSlides(`${page}/main/auto`, ['a', 'b', 'c']))
            addContent(`${page}/main`, 'untitled', 'ctpl:heroCarousel', {}).then(() =>
                addSlides(`${page}/main/untitled`, ['d', 'e']),
            )
            addContent(`${page}/main`, 'single', 'ctpl:heroCarousel', {}).then(() =>
                addSlides(`${page}/main/single`, ['f']),
            )
            addContent(`${page}/main`, 'empty', 'ctpl:heroCarousel', {})
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('plays once through the slides, without announcing, with the pause button first, then stops', () => {
        cy.clock()
        cy.visit(live)
        carousel(0).should('have.attr', 'data-interval', '5')
        carousel(0)
            .find('button')
            .first()
            .should('have.attr', 'data-testid', 'ctpl-carousel-toggle')
            .and('have.text', 'Pause')
        // The Pause button shows above the slides, previous / next under them, as in the source.
        carousel(0).within(() => {
            cy.get('[data-testid="ctpl-carousel-slide"]')
                .first()
                .then(($slide) => {
                    const slide = $slide[0].getBoundingClientRect()
                    cy.get('[data-testid="ctpl-carousel-toggle"]').should(($toggle) =>
                        expect($toggle[0].getBoundingClientRect().bottom).to.be.at.most(slide.top),
                    )
                    cy.get('[data-testid="ctpl-carousel-next"]').should(($next) =>
                        expect($next[0].getBoundingClientRect().top).to.be.at.least(slide.bottom),
                    )
                })
        })
        carousel(0).find('[data-ctpl-carousel-status]').should('have.attr', 'aria-live', 'off')
        activeLabel().should('eq', 'Slide 1 of 3')
        cy.tick(5000)
        activeLabel().should('eq', 'Slide 2 of 3')
        cy.tick(5000)
        activeLabel().should('eq', 'Slide 3 of 3')
        cy.tick(5000)
        activeLabel().should('eq', 'Slide 1 of 3')
        toggle().should('have.text', 'Play').and('have.attr', 'data-playing', 'false')
        cy.tick(30000)
        activeLabel().should('eq', 'Slide 1 of 3')
        carousel(0).find('[data-ctpl-carousel-status]').should('be.empty')
    })

    it('pauses and plays again with its button', () => {
        cy.clock()
        cy.visit(live)
        toggle().click()
        toggle().should('have.text', 'Play')
        cy.tick(20000)
        activeLabel().should('eq', 'Slide 1 of 3')
        toggle().click()
        carousel(0).trigger('mouseleave')
        toggle().should('have.text', 'Pause')
        cy.tick(5000)
        activeLabel().should('eq', 'Slide 2 of 3')
    })

    it('stops for good when the visitor uses a slide button', () => {
        cy.clock()
        cy.visit(live)
        carousel(0).find('[data-testid="ctpl-carousel-next"]').click()
        carousel(0).trigger('mouseleave')
        activeLabel().should('eq', 'Slide 2 of 3')
        toggle().should('have.text', 'Play')
        carousel(0).find('[data-ctpl-carousel-status]').should('have.attr', 'aria-live', 'polite')
        cy.tick(30000)
        activeLabel().should('eq', 'Slide 2 of 3')
    })

    it('waits while the mouse is over it or keyboard focus is inside it', () => {
        cy.clock()
        cy.visit(live)
        carousel(0).trigger('mouseenter')
        cy.tick(10000)
        activeLabel().should('eq', 'Slide 1 of 3')
        carousel(0).trigger('mouseleave')
        carousel(0).find('[data-testid="ctpl-carousel-picker"]').first().focus()
        cy.tick(10000)
        activeLabel().should('eq', 'Slide 1 of 3')
        cy.focused().blur()
        cy.tick(5000)
        activeLabel().should('eq', 'Slide 2 of 3')
    })

    it('never plays for visitors who ask for reduced motion', () => {
        cy.clock()
        visitWithReducedMotion(live)
        toggle().should('have.text', 'Play')
        cy.tick(30000)
        activeLabel().should('eq', 'Slide 1 of 3')
    })

    it('names an untitled carousel with a translated label, its slides keeping h2 headings', () => {
        cy.visit(live)
        carousel(1).should('have.attr', 'aria-label', 'Featured')
        carousel(1).find('[data-testid="ctpl-carousel-slide"] h2').should('have.length', 2)
        carousel(0).find('.ctpl-visually-hidden h2').should('have.text', 'Auto')
        carousel(0).find('[data-testid="ctpl-carousel-slide"] h3').should('have.length', 3)
    })

    it('shows a single slide as a plain banner, and nothing for an empty carousel', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-hero-carousel"]').should('have.length', 3)
        carousel(2).should('not.have.attr', 'data-ctpl-carousel')
        carousel(2).find('button').should('not.exist')
        carousel(2).find('[data-testid="ctpl-carousel-slide"]').should('be.visible')
    })

    it('serves every slide, and hidden controls, without JavaScript', () => {
        cy.request(live).then(({ body }) => {
            const doc = new DOMParser().parseFromString(body, 'text/html')
            const auto = doc.querySelector('[data-testid="ctpl-hero-carousel"]')
            expect(auto?.querySelectorAll('[data-testid="ctpl-carousel-slide"]')).to.have.length(3)
            expect(auto?.querySelector('[data-ctpl-carousel-controls]')?.hasAttribute('hidden')).to.equal(true)
            expect(auto?.querySelectorAll('[data-testid="ctpl-carousel-slide"] h3')).to.have.length(3)
        })
    })

    it('stacks every slide, editable, in edit mode, and never plays there', () => {
        cy.login()
        cy.request(editFrame).then(({ body }) => {
            expect(body).not.to.contain('data-ctpl-carousel=')
            expect(body).not.to.contain('carousel.js')
            expect(body).to.contain('Visitors see one slide at a time')
            expect(body).to.contain('No slide yet')
            for (const name of ['a', 'b', 'c']) {
                expect(body).to.contain(`path="${page}/main/auto/${name}"`)
            }
        })
        cy.logout()
    })

    it('fits 320 px without horizontal scrolling', () => {
        cy.viewport(320, 640)
        cy.visit(live)
        cy.document().then((doc) => expect(doc.documentElement.scrollWidth).to.be.at.most(320))
        carousel(0).find('[data-ctpl-carousel-controls]').should('be.visible')
    })
})

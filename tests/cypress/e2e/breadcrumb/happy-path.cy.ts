import { addNode, deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addEditorial, addPage, createTestSite, jsonLd, uuidOf } from '../../support/test-helpers'

const siteKey = siteKeyFor('breadcrumb')
const site = `/sites/${siteKey}`
const home = `${site}/home`

/** Adds a content folder; with `listingPage` (a page uuid), the folder names the page that lists it. */
const addFolder = (parent: string, name: string, listingPage?: string) =>
    addNode({
        parentPathOrId: parent,
        name,
        primaryNodeType: 'jnt:contentFolder',
        mixins: listingPage ? ['ctplmix:listingPage'] : [],
        properties: listingPage ? [{ name: 'ctplListingPage', type: 'WEAKREFERENCE', value: listingPage }] : [],
    })

/** The visible trail: [text, href] per crumb, the current page with no href. */
const visibleTrail = () =>
    cy
        .get('[data-testid="ctpl-breadcrumb"] li')
        .then(($li) => [...$li].map((li) => [li.textContent, li.querySelector('a')?.getAttribute('href') ?? null]))

/** The JSON-LD BreadcrumbList must say exactly what the visible trail says. */
const expectJsonLdToMatchTrail = () =>
    visibleTrail().then((trail) =>
        jsonLd().then((node) => {
            const items = node('BreadcrumbList')?.itemListElement as { name: string; item: string; position: number }[]
            const pageUrl = (node('WebPage') as { url: string }).url
            expect(items.map((item) => item.name)).to.deep.equal(trail.map(([text]) => text))
            expect(items.map((item) => item.position)).to.deep.equal(trail.map((_, index) => index + 1))
            expect(items.map((item) => new URL(item.item).pathname)).to.deep.equal(
                trail.map(([, href]) => href ?? new URL(pageUrl).pathname),
            )
        }),
    )

describe('Breadcrumb of items stored in content folders', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        // A search-engine title on the home page: the trail still says Home / Accueil.
        setNodeProperty(home, 'jcr:title', 'Flights from Hong Kong across Asia', 'en')
        setNodeProperty(home, 'jcr:title', "Vols au départ de Hong Kong vers l'Asie", 'fr')
        addPage(home, {
            name: 'destinations',
            template: 'content',
            title: { en: 'Destinations', fr: 'Destinations' },
        }).then((destinations) =>
            addFolder(`${site}/contents`, 'places', uuidOf(destinations)).then(() =>
                addEditorial(`${site}/contents/places`, 'ctpl:article', {
                    name: 'tokyo',
                    title: { en: 'Tokyo', fr: 'Tokyo' },
                    date: '2026-09-15',
                }),
            ),
        )
        addPage(home, { name: 'about', template: 'content', title: { en: 'About', fr: 'À propos' } }).then(() =>
            addPage(`${home}/about`, {
                name: 'media',
                template: 'content',
                title: { en: 'Media room', fr: 'Salle de presse' },
            }).then((media) =>
                addFolder(`${site}/contents`, 'press', uuidOf(media)).then(() =>
                    // A sub-folder without its own listing page inherits its parent's.
                    addFolder(`${site}/contents/press`, 'y2026').then(() =>
                        addEditorial(`${site}/contents/press/y2026`, 'ctpl:news', {
                            name: 'launch',
                            title: { en: 'Launch of the new fleet', fr: 'Lancement de la nouvelle flotte' },
                            date: '2026-09-20',
                        }),
                    ),
                ),
            ),
        )
        // The seeded news folder names no listing page.
        addEditorial(`${site}/contents/news`, 'ctpl:news', {
            name: 'plain',
            title: { en: 'Plain news', fr: 'Actualité simple' },
            date: '2026-09-25',
        })
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('goes through the page that lists the folder: Home > Destinations > Tokyo', () => {
        cy.visit(`${site}/contents/places/tokyo.html`)
        visibleTrail().should('deep.equal', [
            ['Home', `${home}.html`],
            ['Destinations', `${home}/destinations.html`],
            ['Tokyo', null],
        ])
        cy.get('[data-testid="ctpl-breadcrumb"] [aria-current="page"]').should('have.text', 'Tokyo')
        cy.get('[data-testid="ctpl-breadcrumb-hint"]').should('not.exist')
        expectJsonLdToMatchTrail()
    })

    it('reaches a nested listing page through the page tree, and sub-folders inherit it', () => {
        cy.visit(`${site}/contents/press/y2026/launch.html`)
        visibleTrail().should('deep.equal', [
            ['Home', `${home}.html`],
            ['About', `${home}/about.html`],
            ['Media room', `${home}/about/media.html`],
            ['Launch of the new fleet', null],
        ])
        expectJsonLdToMatchTrail()
    })

    it('keeps Home > item when no folder names a listing page', () => {
        cy.visit(`${site}/contents/news/plain.html`)
        visibleTrail().should('deep.equal', [
            ['Home', `${home}.html`],
            ['Plain news', null],
        ])
        expectJsonLdToMatchTrail()
    })

    it('names the first crumb Home, not after the home page title, in the trail and the JSON-LD', () => {
        cy.visit(`${home}/destinations.html`)
        cy.title().should('eq', `Destinations | ${siteKey}`)
        visibleTrail().should('deep.equal', [
            ['Home', `${home}.html`],
            ['Destinations', null],
        ])
        expectJsonLdToMatchTrail()
        cy.visit(`${home}.html`)
        cy.title().should('contain', 'Flights from Hong Kong across Asia')
    })

    it('uses the titles and URLs of each language', () => {
        cy.visit(`/fr${site}/contents/press/y2026/launch.html`)
        visibleTrail().should('deep.equal', [
            ['Accueil', `/fr${home}.html`],
            ['À propos', `/fr${home}/about.html`],
            ['Salle de presse', `/fr${home}/about/media.html`],
            ['Lancement de la nouvelle flotte', null],
        ])
        expectJsonLdToMatchTrail()
    })
})

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
            // A row with no heading: the sections in its columns keep their h2.
            addContent(`${page}/main`, 'bare', 'ctpl:columns', {}, [{ name: 'layout', value: 'halves' }]).then(() =>
                addContent(`${page}/main/bare/col1`, 'text', 'ctpl:richText', {
                    'jcr:title': { en: 'Under a bare row', fr: 'Sous une rangée nue' },
                    body: { en: '<p>x</p>', fr: '<p>x</p>' },
                }),
            )
            // Rich text as a hostile editor (or a copy-paste from elsewhere) could save it.
            const hostile =
                '<h1 class="big" onclick="alert(1)">Pasted title</h1>' +
                '<p>kept <strong>safe</strong></p>' +
                '<script>window.__ctplXss = 1</script>' +
                '<style>:root { --ctpl-color-text: red }</style>' +
                '<img src="x" onerror="window.__ctplXss = 2" alt="broken">' +
                '<a href="javascript:window.__ctplXss = 3">bad link</a>' +
                '<a href="//evil.example/">off-site</a>' +
                '<a href="https://example.org/" target="_blank">good link</a>' +
                '<iframe src="https://evil.example/"></iframe>'
            addContent(`${page}/main`, 'hostile', 'ctpl:richText', {
                'jcr:title': { en: 'Pasted', fr: 'Collé' },
                body: { en: hostile, fr: hostile },
            })
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

    it('keeps h2 for sections in the columns of a row that has no heading', () => {
        cy.visit(live)
        cy.contains('h2', 'Under a bare row')
    })

    it('renders editor rich text without scripts, handlers, styles, frames or unsafe links', () => {
        cy.visit(live)
        cy.contains('[data-testid="ctpl-rich-text"]', 'Pasted')
            .find('.ctpl-prose')
            .within(() => {
                cy.contains('p', 'kept').find('strong').should('have.text', 'safe')
                cy.get('script, style, iframe, h1, [onerror], [onclick], [class]').should('not.exist')
                cy.contains('h2', 'Pasted title')
                cy.contains('a', 'bad link').should('not.have.attr', 'href')
                cy.contains('a', 'off-site').should('not.have.attr', 'href')
                cy.contains('a', 'good link')
                    .should('have.attr', 'href', 'https://example.org/')
                    .and('have.attr', 'rel', 'noopener noreferrer')
            })
        cy.window().its('__ctplXss').should('be.undefined')
        cy.get('h1').should('have.length', 1)
    })

    it('keeps the content of a column hidden by a narrower layout', () => {
        cy.visit(live)
        cy.get('[data-testid="ctpl-columns"]').first().find('[data-testid="ctpl-column"]').should('have.length', 4)
        cy.contains('h3', 'Fourth column')
        cy.login()
        setNodeProperty(`${page}/main/row`, 'layout', 'halves', 'en')
        publishAndWaitJobEnding(`${page}/main/row`, ['en'])
        cy.logout()
        cy.visit(live)
        cy.get('[data-testid="ctpl-columns"]').first().find('[data-testid="ctpl-column"]').should('have.length', 2)
        cy.contains('h3', 'Fourth column').should('not.exist')
        cy.login()
        setNodeProperty(`${page}/main/row`, 'layout', 'quarters', 'en')
        publishAndWaitJobEnding(`${page}/main/row`, ['en'])
        cy.logout()
        cy.visit(live)
        cy.contains('h3', 'Fourth column')
    })
})

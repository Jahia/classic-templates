// Page sections and the items holding their text are editorial content (jmix:editorialContent): Augmented
// Search indexes their text with their page with its default settings, jContent lists them in a page's
// content and offers Translate on them. The header, the footer and the consent banner are not, so their
// labels are not indexed with every page.

const SECTIONS = [
    'ctpl:accordion',
    'ctpl:cardGrid',
    'ctpl:columns',
    'ctpl:freeZone',
    'ctpl:heroBanner',
    'ctpl:heroCarousel',
    'ctpl:imageText',
    'ctpl:jcrQuery',
    'ctpl:keyFigures',
    'ctpl:linkList',
    'ctpl:noticeBar',
    'ctpl:quote',
    'ctpl:richText',
    'ctpl:signIn',
    'ctpl:siteMap',
    'ctpl:tabs',
]
const TEXT_ITEMS = ['ctpl:accordionItem', 'ctpl:card', 'ctpl:keyFigure', 'ctpl:tab', 'ctmd:keyDate']
const CHROME = ['ctpl:siteHeader', 'ctpl:siteFooter', 'ctpl:consentBanner', 'ctpl:networkBar']

type EditorialTypes = { data: { jcr: { nodeTypes: { nodes: { name: string; isNodeType: boolean }[] } } } }

const editorial = (types: string[]) =>
    cy
        .apollo({ queryFile: 'graphql/query/editorialTypes.graphql', variables: { types } })
        .then((result: EditorialTypes) =>
            Object.fromEntries(result.data.jcr.nodeTypes.nodes.map((n) => [n.name, n.isNodeType])),
        )

describe('Content types - editorial content, searchable with their page', () => {
    before(() => cy.login())
    after(() => cy.logout())

    it('makes every page section editorial content', () => {
        editorial(SECTIONS).should('deep.equal', Object.fromEntries(SECTIONS.map((t) => [t, true])))
    })

    it('makes the items holding a section text editorial content', () => {
        editorial(TEXT_ITEMS).should('deep.equal', Object.fromEntries(TEXT_ITEMS.map((t) => [t, true])))
    })

    it('keeps the header, the footer and the consent banner out', () => {
        editorial(CHROME).should('deep.equal', Object.fromEntries(CHROME.map((t) => [t, false])))
    })
})

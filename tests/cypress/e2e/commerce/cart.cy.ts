import { addNode, createSite, deleteSite, enableModule, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { TEMPLATE_SET, siteKeyFor } from '../../support/constants'

// The bag of classic-commerce (ctcm:cartButton in the header's utility links) on products of the
// shopify-edp type. CI has no Shopify store: the products are nodes of the connector's type carrying
// what the connector provides (variant ids and names, the store's address).
const siteKey = siteKeyFor('cart')
const languages = ['en', 'ar']
const home = `/sites/${siteKey}/home`
const folder = `/sites/${siteKey}/contents/products`
const store = 'https://cart-test.myshopify.com'

const product = (
    name: string,
    title: string,
    extra: { name: string; value?: string; values?: string[]; type?: string }[],
) =>
    addNode({
        parentPathOrId: folder,
        name,
        primaryNodeType: 'shopynt:product',
        properties: [
            { name: 'jcr:title', value: title, language: 'en' },
            { name: 'jcr:title', value: title, language: 'ar' },
            { name: 'vendor', value: 'Maison Test' },
            { name: 'currency', value: 'AED' },
            ...extra,
        ],
    })

const page = (lang = 'en') => `/${lang}/sites/${siteKey}/contents/products/rose-oud.html`

describe('classic-commerce - the bag', () => {
    before(() => {
        cy.login()
        deleteSite(siteKey)
        createSite(siteKey, {
            templateSet: TEMPLATE_SET,
            locale: 'en',
            languages: languages.join(','),
            serverName: 'localhost',
        })
        enableModule('shopify-edp', siteKey)
        enableModule('classic-commerce', siteKey)
        addNode({
            parentPathOrId: `/sites/${siteKey}/contents`,
            name: 'products',
            primaryNodeType: 'jnt:contentFolder',
        })
        product('rose-oud', 'Rose Oud', [
            { name: 'prices', type: 'DOUBLE', values: ['420', '295'] },
            { name: 'variantGqlIds', values: ['gid://shopify/ProductVariant/222', 'gid://shopify/ProductVariant/111'] },
            { name: 'variantTitles', values: ['Full size', 'Travel size'] },
            { name: 'storeUrl', value: store },
            { name: 'posterPath', value: 'https://cdn.example.com/rose.jpg' },
        ])
        // The header is parented on the home page: it shows in Arabic once home exists in Arabic.
        setNodeProperty(home, 'jcr:title', 'الرئيسية', 'ar')
        // A product that does not come from a shop (no store address): nothing to add.
        product('local', 'Local Soap', [{ name: 'prices', type: 'DOUBLE', values: ['30'] }])
        publishAndWaitJobEnding(`/sites/${siteKey}`, languages)
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('keeps "Add to bag" hidden while the site has no bag', () => {
        cy.visit(page())
        cy.get('[data-testid="ctcm-add-to-bag"]').should('have.length', 2).and('not.be.visible')
    })

    it('adds a variant, lists it with its subtotal and links to the shop cart', () => {
        cy.login()
        addNode({
            parentPathOrId: `${home}/siteHeader/header/utilityLinks`,
            name: 'bag',
            primaryNodeType: 'ctcm:cartButton',
            properties: [
                { name: 'jcr:title', value: 'Bag', language: 'en' },
                { name: 'jcr:title', value: 'الحقيبة', language: 'ar' },
            ],
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, languages)
        cy.logout()

        cy.visit(page())
        cy.get('[data-testid="ctcm-cart-count"]').should('contain.text', '0')
        // One button per variant, the cheapest first, named with the variant and its price.
        cy.get('[data-testid="ctcm-add-to-bag"]')
            .should('have.length', 2)
            .first()
            .should('be.visible')
            .and('contain.text', 'Travel size')
        cy.get('[data-testid="ctcm-add-to-bag"]').first().click()
        cy.get('[data-testid="ctcm-cart-drawer"]').should('have.attr', 'open')
        cy.get('[data-testid="ctcm-cart-line"]').should('have.length', 1).and('contain.text', 'Rose Oud')
        cy.get('[data-testid="ctcm-cart-subtotal"]').should('contain.text', '295')
        cy.get('[data-testid="ctcm-cart-checkout"]').should('have.attr', 'href', `${store}/cart/111:1`)
    })

    it('adds a second variant, changes quantities and empties the bag', () => {
        // Each test starts with an empty browser storage: add both variants here.
        cy.visit(page())
        cy.get('[data-testid="ctcm-add-to-bag"]').first().click()
        cy.get('[data-testid="ctcm-cart-drawer"]').should('have.attr', 'open')
        cy.get('[data-testid="ctcm-cart-drawer"]').contains('button', 'Close').click()
        cy.get('[data-testid="ctcm-add-to-bag"]').eq(1).click()
        cy.get('[data-testid="ctcm-cart-checkout"]').should('have.attr', 'href', `${store}/cart/111:1,222:1`)
        cy.get('[data-testid="ctcm-cart-line"]').first().find('button[aria-label="One more"]').click()
        cy.get('[data-testid="ctcm-cart-checkout"]').should('have.attr', 'href', `${store}/cart/111:2,222:1`)
        cy.get('[data-testid="ctcm-cart-count"]').should('contain.text', '3')
        cy.get('[data-testid="ctcm-cart-line"]').each(($line) => cy.wrap($line).contains('button', 'Remove').click())
        cy.get('[data-testid="ctcm-cart-drawer"]').should('contain.text', 'Your bag is empty.')
    })

    it('offers nothing to add for a product that does not come from a shop', () => {
        cy.visit(`/en/sites/${siteKey}/contents/products/local.html`)
        cy.get('[data-testid="ctcm-cart-button"]').should('be.visible')
        cy.get('[data-testid="ctcm-add-to-bag"]').should('not.exist')
    })

    it('mirrors the drawer in Arabic, with Arabic labels', () => {
        cy.visit(page('ar'))
        cy.get('[data-testid="ctcm-add-to-bag"]').first().click()
        cy.get('[data-testid="ctcm-cart-drawer"]').should('have.attr', 'open')
        cy.get('[data-testid="ctcm-cart-drawer"]').should('contain.text', 'إتمام الطلب')
        cy.get('[data-testid="ctcm-cart-drawer"]').then(($d) => {
            const rect = $d[0].getBoundingClientRect()
            expect(rect.left, 'the drawer sits on the left in Arabic').to.be.lessThan(5)
        })
    })
})

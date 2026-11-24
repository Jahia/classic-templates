import { addNode, createSite, deleteSite, enableModule, publishAndWaitJobEnding } from '@jahia/cypress'
import { TEMPLATE_SET, siteKeyFor } from '../../support/constants'
import { uuidAt } from '../../support/test-helpers'

// Classic-commerce renders the products of the shopify-edp connector (shopynt:product). CI has no
// Shopify store, so the products are nodes of the connector's type created in a content folder:
// the views read the same properties as on a mounted shop.
const siteKey = siteKeyFor('commerce')
const languages = ['en', 'ar']
const home = `/sites/${siteKey}/home`
const folder = `/sites/${siteKey}/contents/products`

type Product = { name: string; title: string; vendor: string; prices: string[]; tags: string[]; poster: string }
const PRODUCTS: Product[] = [
    {
        name: 'rose-oud',
        title: 'Rose Oud Eau de Parfum',
        vendor: 'Maison Test',
        prices: ['420', '295'],
        tags: ['bestseller'],
        poster: 'https://cdn.example.com/rose.jpg',
    },
    {
        name: 'glow-serum',
        title: 'Glow Serum',
        vendor: 'Atelier Test',
        prices: ['180'],
        tags: ['new'],
        poster: 'http://cdn.example.com/serum.jpg',
    },
    {
        name: 'silk-lipstick',
        title: 'Silk Lipstick',
        vendor: 'Maison Test',
        prices: ['95'],
        tags: ['bestseller', 'new'],
        poster: 'https://cdn.example.com/lip.jpg',
    },
]

const addProduct = (p: Product) =>
    addNode({
        parentPathOrId: folder,
        name: p.name,
        primaryNodeType: 'shopynt:product',
        properties: [
            { name: 'jcr:title', value: p.title, language: 'en' },
            { name: 'jcr:title', value: p.title, language: 'ar' },
            { name: 'vendor', value: p.vendor },
            { name: 'productType', value: 'Beauty' },
            { name: 'currency', value: 'AED' },
            { name: 'posterPath', value: p.poster },
            { name: 'bodyHtml', value: '<h1>About</h1><p>A test product.</p><script>window.hacked = 1</script>' },
            { name: 'prices', type: 'DOUBLE', values: p.prices },
            { name: 'shopyTags', values: p.tags },
        ],
    })

const both = (en: string, ar: string, name: string) => [
    { name, value: en, language: 'en' },
    { name, value: ar, language: 'ar' },
]

describe('classic-commerce - product views and shopping sections', () => {
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
        PRODUCTS.forEach(addProduct)
        addNode({
            parentPathOrId: home,
            name: 'shop',
            primaryNodeType: 'jnt:page',
            properties: [...both('Shop', 'المتجر', 'jcr:title'), { name: 'j:templateName', value: 'content' }],
        })
        addNode({ parentPathOrId: `${home}/shop`, name: 'main', primaryNodeType: 'ctpl:pageArea' })
        uuidAt(`${folder}/silk-lipstick`).then((lip) =>
            uuidAt(`${folder}/rose-oud`).then((rose) => {
                const picked = { name: 'products', type: 'WEAKREFERENCE', values: [lip, rose] }
                addNode({
                    parentPathOrId: `${home}/shop/main`,
                    name: 'bestsellers',
                    primaryNodeType: 'ctcm:productCarousel',
                    properties: [...both('Bestsellers', 'الأكثر مبيعًا', 'jcr:title'), picked],
                })
                uuidAt(folder).then((shop) =>
                    addNode({
                        parentPathOrId: `${home}/shop/main`,
                        name: 'new-in',
                        primaryNodeType: 'ctcm:productCarousel',
                        properties: [
                            ...both('New in', 'وصل حديثًا', 'jcr:title'),
                            { name: 'shop', type: 'WEAKREFERENCE', value: shop },
                            { name: 'shopifyTag', value: 'NEW' },
                        ],
                    }),
                )
                addNode({
                    parentPathOrId: `${home}/shop/main`,
                    name: 'gift',
                    primaryNodeType: 'ctcm:giftOffer',
                    properties: [
                        ...both('A gift from Maison Test', 'هدية من Maison Test', 'jcr:title'),
                        ...both('A travel pouch', 'حقيبة سفر', 'gift'),
                        { name: 'threshold', type: 'DOUBLE', value: '800' },
                        { name: 'currency', value: 'AED' },
                        { name: 'endsOn', type: 'DATE', value: '2099-12-31T00:00:00.000Z' },
                    ],
                })
                addNode({
                    parentPathOrId: `${home}/shop/main`,
                    name: 'gift-ended',
                    primaryNodeType: 'ctcm:giftOffer',
                    properties: [
                        ...both('An ended offer', 'عرض منتهٍ', 'jcr:title'),
                        { name: 'endsOn', type: 'DATE', value: '2020-01-31T00:00:00.000Z' },
                    ],
                })
                addNode({
                    parentPathOrId: `${home}/shop/main`,
                    name: 'look',
                    primaryNodeType: 'ctcm:shopTheLook',
                    properties: [...both('Evening look', 'لوك المساء', 'jcr:title'), picked],
                })
                addNode({
                    parentPathOrId: `${home}/shop/main`,
                    name: 'brand',
                    primaryNodeType: 'ctcm:brandSpotlight',
                    properties: [
                        ...both('Maison Test', 'Maison Test', 'jcr:title'),
                        ...both('Brand of the week', 'علامة الأسبوع', 'eyebrow'),
                        picked,
                    ],
                })
            }),
        )
        publishAndWaitJobEnding(`/sites/${siteKey}`, languages)
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('shows picked products in the editor’s order, with brand and lowest price', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-product-carousel"]')
            .first()
            .within(() => {
                cy.get('h2').should('have.text', 'Bestsellers')
                // Every card is reachable with Tab (its link), so the scrolling row needs no focus.
                cy.get('[data-testid="ctcm-product-card"] a').should('have.length', 2)
                cy.get('[data-testid="ctcm-product-card"] h3').then((titles) =>
                    expect([...titles].map((t) => t.textContent)).to.deep.eq([
                        'Silk Lipstick',
                        'Rose Oud Eau de Parfum',
                    ]),
                )
                cy.get('[data-testid="ctcm-product-card"]')
                    .eq(0)
                    .should('contain.text', 'AED')
                    .and('contain.text', '95')
                    .and('not.contain.text', 'From')
                cy.get('[data-testid="ctcm-product-card"]')
                    .eq(1)
                    .should('contain.text', 'Maison Test')
                    .and('contain.text', 'From')
                    .and('contain.text', '295')
            })
    })

    it('reads a shop folder filtered by a Shopify tag, whatever its case', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-product-carousel"]')
            .eq(1)
            .find('[data-testid="ctcm-product-card"] h3')
            .then((titles) =>
                expect([...titles].map((t) => t.textContent).sort()).to.deep.eq(['Glow Serum', 'Silk Lipstick']),
            )
    })

    it('keeps only https product images', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-product-card"] img').each(($img) => expect($img.attr('src')).to.match(/^https:\/\//))
        cy.get('[data-testid="ctcm-product-card"]').filter(':contains("Glow Serum")').find('img').should('not.exist')
    })

    it('shows a running gift offer with its spend, and hides an ended one', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-gift-offer"]')
            .should('have.length', 1)
            .and('contain.text', 'A travel pouch')
            .and('contain.text', 'AED')
            .and('contain.text', '800')
        cy.contains('An ended offer').should('not.exist')
    })

    it('lists the products of a look in order, and spotlights a brand', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-shop-the-look"] ol > li')
            .should('have.length', 2)
            .first()
            .should('contain.text', 'Silk Lipstick')
        cy.get('[data-testid="ctcm-brand-spotlight"]')
            .should('contain.text', 'Brand of the week')
            .find('[data-testid="ctcm-product-card"]')
            .should('have.length', 2)
    })

    it('gives a product its own page with one h1 and a sanitised description', () => {
        cy.visit(`/sites/${siteKey}/home/shop.html`)
        cy.get('[data-testid="ctcm-product-card"] a').first().click()
        cy.get('[data-testid="ctcm-product-full"]').should('exist')
        cy.get('h1').should('have.length', 1).and('have.text', 'Silk Lipstick')
        cy.get('[data-testid="ctcm-product-full"] script').should('not.exist')
        cy.window().its('hacked').should('be.undefined')
    })

    it('mirrors the shop page in Arabic, with Arabic labels', () => {
        cy.visit(`/ar/sites/${siteKey}/home/shop.html`)
        cy.get('html').should('have.attr', 'dir', 'rtl')
        cy.get('[data-testid="ctcm-gift-offer"]').should('contain.text', 'عند الشراء بقيمة')
        cy.get('[data-testid="ctcm-product-carousel"] h2').first().should('have.text', 'الأكثر مبيعًا')
    })
})

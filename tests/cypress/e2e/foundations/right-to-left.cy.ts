import { addNode, createSite, deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { TEMPLATE_SET, siteKeyFor } from '../../support/constants'

const siteKey = siteKeyFor('rtl')
const languages = ['en', 'ar']

describe('Foundations - right-to-left languages', () => {
    before(() => {
        cy.login()
        deleteSite(siteKey)
        createSite(siteKey, {
            templateSet: TEMPLATE_SET,
            locale: 'en',
            languages: languages.join(','),
            serverName: 'localhost',
        })
        addNode({
            parentPathOrId: `/sites/${siteKey}/home`,
            name: 'about',
            primaryNodeType: 'jnt:page',
            properties: [
                { name: 'jcr:title', value: 'About us', language: 'en' },
                { name: 'jcr:title', value: 'من نحن', language: 'ar' },
                { name: 'j:templateName', type: 'STRING', value: 'content' },
            ],
        })
        publishAndWaitJobEnding(`/sites/${siteKey}`, languages)
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('mirrors an Arabic page: dir="rtl", Arabic labels and an Arabic font', () => {
        cy.visit(`/ar/sites/${siteKey}/home/about.html`)
        cy.get('html').should('have.attr', 'lang', 'ar').and('have.attr', 'dir', 'rtl')
        cy.get('main#main-content').should('have.css', 'direction', 'rtl')
        cy.get('h1').should('have.length', 1).and('have.text', 'من نحن')
        cy.get('a.ctpl-skip-link').should('have.text', 'انتقل إلى المحتوى الرئيسي')
        cy.get('body').should('have.css', 'font-family').and('contain', 'Noto Sans Arabic')
    })

    it('keeps the English page of the same site left to right', () => {
        cy.visit(`/sites/${siteKey}/home/about.html`)
        cy.get('html').should('have.attr', 'lang', 'en').and('have.attr', 'dir', 'ltr')
        cy.get('main#main-content').should('have.css', 'direction', 'ltr')
        cy.get('body').should('have.css', 'font-family').and('not.contain', 'Noto Sans Arabic')
    })
})

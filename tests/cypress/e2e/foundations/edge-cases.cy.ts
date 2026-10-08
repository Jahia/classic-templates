import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('foundations-edge')
const sitePath = `/sites/${siteKey}`
const bare = { name: 'bare', template: 'content', title: { en: 'Bare page', fr: 'Page nue' } }

/** Accent colour as the browser computes it (the skip link is filled with the accent). */
const accent = () =>
    cy.window().then((win) => win.getComputedStyle(win.document.querySelector('a.ctpl-skip-link')).backgroundColor)

const setLook = (theme: string, scheme: string) => {
    cy.apollo({ mutationFile: 'graphql/mutation/setSiteLook.graphql', variables: { sitePath, theme, scheme } })
    publishAndWaitJobEnding(sitePath, ['en', 'fr'])
}

describe('Foundations - fallbacks and site look', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        cy.apollo({
            mutationFile: 'graphql/mutation/setSiteDescription.graphql',
            variables: { sitePath, description: 'Site-wide description' },
        })
        addPage(`${sitePath}/home`, bare)
        publishAndWaitJobEnding(sitePath, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('falls back to the site description when a page has none', () => {
        cy.visit(`${sitePath}/home/bare.html`)
        cy.get('meta[name="description"]').should('have.attr', 'content', 'Site-wide description')
    })

    it('uses the default look while the site settings mixin is absent', () => {
        cy.visit(`${sitePath}/home/bare.html`)
        cy.get('html').should('not.have.attr', 'data-ctpl-theme')
        cy.get('html').should('not.have.attr', 'data-ctpl-scheme')
    })

    it('switches theme and colour scheme on live pages as soon as the site is published', () => {
        cy.visit(`${sitePath}/home/bare.html`)
        accent().then((defaultAccent) => {
            cy.login()
            setLook('ocean', 'dark')
            cy.logout()
            cy.visit(`${sitePath}/home/bare.html`)
            cy.get('html').should('have.attr', 'data-ctpl-theme', 'ocean')
            cy.get('html').should('have.attr', 'data-ctpl-scheme', 'dark')
            accent().should('not.eq', defaultAccent)
            cy.window().then((win) => {
                // Dark scheme: the page surface is the near-black token, not white
                expect(win.getComputedStyle(win.document.body).backgroundColor).not.to.eq('rgb(255, 255, 255)')
            })
        })
    })

    it('applies the horizon theme, light first, with its own emphasis colour', () => {
        cy.login()
        setLook('horizon', 'light')
        cy.logout()
        cy.visit(`${sitePath}/home/bare.html`)
        cy.get('html').should('have.attr', 'data-ctpl-theme', 'horizon')
        cy.window().then((win) => {
            // The emphasis role exists in every theme; horizon gives it its own colour, not the accent.
            const probe = win.document.createElement('span')
            probe.style.color = 'var(--ctpl-color-highlight)'
            win.document.body.append(probe)
            expect(win.getComputedStyle(probe).color).to.eq('rgb(180, 65, 15)')
            probe.remove()
            expect(win.getComputedStyle(win.document.body).backgroundColor).to.eq('rgb(255, 255, 255)')
        })
        accent().should('eq', 'rgb(11, 58, 102)')
    })

    // Each of these themes sets its own emphasis and action colours (coral for sage, green for slate).
    const emphasisThemes = [
        { theme: 'sage', highlight: 'rgb(178, 60, 36)', accent: 'rgb(14, 92, 85)', action: 'rgb(178, 60, 36)' },
        { theme: 'slate', highlight: 'rgb(23, 112, 61)', accent: 'rgb(42, 56, 80)', action: 'rgb(23, 112, 61)' },
    ]
    emphasisThemes.forEach(({ theme, highlight, accent: expectedAccent, action }) => {
        it(`applies the ${theme} theme with its own emphasis colour in light and dark`, () => {
            cy.login()
            setLook(theme, 'light')
            cy.logout()
            cy.visit(`${sitePath}/home/bare.html`)
            cy.get('html').should('have.attr', 'data-ctpl-theme', theme)
            cy.window().then((win) => {
                const probe = win.document.createElement('span')
                probe.style.color = 'var(--ctpl-color-highlight)'
                win.document.body.append(probe)
                expect(win.getComputedStyle(probe).color).to.eq(highlight)
                // The action role colours the buttons; it is its own colour here, not the accent.
                probe.style.color = 'var(--ctpl-color-action)'
                expect(win.getComputedStyle(probe).color).to.eq(action)
                probe.remove()
            })
            accent().should('eq', expectedAccent)

            cy.login()
            setLook(theme, 'dark')
            cy.logout()
            cy.visit(`${sitePath}/home/bare.html`)
            cy.get('html').should('have.attr', 'data-ctpl-scheme', 'dark')
            accent().should('not.eq', expectedAccent)
        })
    })

    it('returns to the default look when the theme is set back to default and auto', () => {
        cy.login()
        setLook('default', 'auto')
        cy.logout()
        cy.visit(`${sitePath}/home/bare.html`)
        cy.get('html').should('not.have.attr', 'data-ctpl-theme')
        cy.get('html').should('not.have.attr', 'data-ctpl-scheme')
    })
})

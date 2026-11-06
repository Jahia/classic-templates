import { addNode, deleteSite } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addPage, createTestSite } from '../../support/test-helpers'

const siteKey = siteKeyFor('sections-visibility')
const site = `/sites/${siteKey}`
const page = `${site}/home/visibility`
const live = `${site}/home/visibility.html`
const editFrame = (lang: string) => `/cms/editframe/default/${lang}${live}`
const note = '[data-testid="ctpl-language-visibility"]'
// DOMParser, not Cypress.$(body): jQuery finds nothing in a whole HTML page.
const notesIn = (body: string) => [...new DOMParser().parseFromString(body, 'text/html').querySelectorAll(note)]

describe('Sections - switched off in some languages', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addPage(`${site}/home`, {
            name: 'visibility',
            template: 'content',
            title: { en: 'Visibility', fr: 'Visibilité' },
        })
        addContent(page, 'main', 'ctpl:pageArea', {}).then(() => {
            // English only (Visibility > Content visibility by language: French ticked off).
            addNode({
                parentPathOrId: `${page}/main`,
                name: 'english-only',
                primaryNodeType: 'ctpl:richText',
                properties: [
                    { name: 'jcr:title', value: 'English only', language: 'en' },
                    { name: 'jcr:title', value: 'Anglais seulement', language: 'fr' },
                    { name: 'j:invalidLanguages', values: ['fr'] },
                ],
            })
            addContent(`${page}/main`, 'everywhere', 'ctpl:richText', {
                'jcr:title': { en: 'Everywhere', fr: 'Partout' },
            })
        })
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('says in Page Builder which languages a section shows in, as a warning where it is hidden', () => {
        cy.login()
        cy.request(editFrame('en')).then(({ body }) => {
            const notes = notesIn(body)
            expect(notes).to.have.length(1)
            expect(notes[0].getAttribute('data-level')).to.eq('info')
            expect(notes[0].textContent).to.contain('Shown in English only: hidden in French')
        })
        cy.request(editFrame('fr')).then(({ body }) => {
            const notes = notesIn(body)
            expect(notes).to.have.length(1)
            expect(notes[0].getAttribute('data-level')).to.eq('hidden')
            expect(notes[0].textContent).to.contain('masqué en français')
        })
        cy.logout()
    })

    it('never shows the note in preview', () => {
        cy.login()
        cy.request(`/cms/render/default/en${live}`).its('body').should('not.contain', 'ctpl-language-visibility')
        cy.logout()
    })
})

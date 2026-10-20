import { deleteSite, publishAndWaitJobEnding, setNodeProperty } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import {
    addContent,
    addEditorial,
    addList,
    addPage,
    chromeOf,
    createTestSite,
    uuidAt,
} from '../../support/test-helpers'

const siteKey = siteKeyFor('moderation')
const site = `/sites/${siteKey}`
const chrome = chromeOf(siteKey)
const news = `${site}/contents/news`
const lists = `/sites/${siteKey}/home/lists.html`
const later = `${news}/later`

interface ModerationState {
    status: { value: string } | null
    date: { value: string } | null
    guestGrant: { path: string } | null
}

/** The status, the publication date and the guest grant of a node, in one workspace. */
const stateOf = (path: string, workspace: 'EDIT' | 'LIVE') =>
    cy
        .apollo({ queryFile: 'graphql/query/moderationState.graphql', variables: { path, workspace } })
        .then((res: { data: { jcr: { nodeByPath: ModerationState } } }) => res.data.jcr.nodeByPath)

/**
 * The list page's body, asked as a guest once `ready` holds for it. classic-moderation publishes in a background job:
 * live follows a status change within seconds, not at once.
 */
const untilList = (ready: (body: string) => boolean) => {
    const ask = () => cy.request(`${lists}?t=${Date.now()}`).its('body')
    cy.waitUntil(() => ask().then((body) => ready(String(body))), { timeout: 30000, interval: 1000 })
    return ask().then(String)
}

// Moderated content (mixin ctplmix:moderated) with classic-moderation installed: lists leave out every moderated
// item that is not accepted; an editor who may publish setting the status to accepted opens the item to every visitor
// (reader granted to guest) and publishes it, dated if it had no date; setting it back closes it again and publishes
// that too. Nobody calls publish in between. Pages are read as a guest.
describe('Moderated content', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(news, 'ctpl:news', { name: 'plain', title: { en: 'Plain news' }, date: '2026-09-20' })
        addEditorial(news, 'ctpl:news', {
            name: 'waiting',
            title: { en: 'Waiting news' },
            date: '2026-09-21',
            moderationStatus: 'submitted',
        })
        addEditorial(news, 'ctpl:news', { name: 'later', title: { en: 'Later news' }, moderationStatus: 'submitted' })
        addPage(chrome.home, { name: 'lists', template: 'content', title: { en: 'Lists', fr: 'Listes' } })
        addContent(`${site}/home/lists`, 'main', 'ctpl:pageArea', {})
        uuidAt(news).then((newsUuid) =>
            addList(`${site}/home/lists/main`, 'latest', { type: 'ctpl:news', startUuid: newsUuid }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        // The pages are then asked as a guest; GraphQL (cy.apollo) keeps its own root credentials
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('lists an item that is not moderated, never one waiting for moderation', () => {
        untilList((body) => body.includes('Plain news')).then((body) => {
            expect(body).to.contain('Plain news')
            expect(body).not.to.contain('Waiting news')
            expect(body).not.to.contain('Later news')
        })
    })

    it('opens, dates and publishes an item the moment an editor accepts it', () => {
        stateOf(later, 'EDIT').then((state) => {
            expect(state.status?.value).to.eq('submitted')
            expect(state.date).to.eq(null)
            expect(state.guestGrant).to.eq(null)
        })
        setNodeProperty(later, 'moderationStatus', 'accepted', 'en')
        untilList((body) => body.includes('Later news')).should('contain', 'Later news')
        stateOf(later, 'EDIT').then((state) => {
            expect(state.guestGrant, 'reader granted to guest').not.to.eq(null)
            expect(state.date?.value, 'dated when accepted').to.be.a('string')
        })
        stateOf(later, 'LIVE').then((state) => expect(state.status?.value).to.eq('accepted'))
        cy.request(`${later}.html`).its('status').should('eq', 200)
    })

    it('closes the item again and takes it out of the lists when it is declined', () => {
        setNodeProperty(later, 'moderationStatus', 'declined', 'en')
        untilList((body) => !body.includes('Later news')).should('not.contain', 'Later news')
        stateOf(later, 'EDIT').then((state) => expect(state.guestGrant, 'guest grant revoked').to.eq(null))
        stateOf(later, 'LIVE').then((state) => expect(state.status?.value).to.eq('declined'))
    })

    it('still keeps the item waiting out of the lists', () => {
        untilList(() => true).should('not.contain', 'Waiting news')
    })
})

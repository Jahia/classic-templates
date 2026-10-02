import { deleteSite, publishAndWaitJobEnding } from '@jahia/cypress'
import { siteKeyFor } from '../../support/constants'
import { addContent, addEditorial, addList, addPage, createTestSite, jsonLd, uuidAt } from '../../support/test-helpers'

const siteKey = siteKeyFor('editorial')
const site = `/sites/${siteKey}`
const news = `${site}/contents/news`
const articles = `${site}/contents/articles`

describe('News, articles and content lists', () => {
    before(() => {
        cy.login()
        createTestSite(siteKey)
        addEditorial(news, 'ctpl:news', {
            name: 'older',
            title: { en: 'Older news', fr: 'Actualité ancienne' },
            teaser: { en: 'An older item.', fr: 'Un élément plus ancien.' },
            date: '2026-09-01',
        })
        addEditorial(news, 'ctpl:news', {
            name: 'newer',
            title: { en: 'Newer news', fr: 'Actualité récente' },
            teaser: { en: 'The latest item.', fr: 'Le dernier élément.' },
            date: '2026-09-28',
            tags: ['release'],
        })
        addEditorial(articles, 'ctpl:article', {
            name: 'essay',
            title: { en: 'An essay', fr: 'Un essai' },
            teaser: { en: 'Long read.', fr: 'Lecture longue.' },
            date: '2026-09-10',
            author: 'Ada Martin',
        })
        addPage(`${site}/home`, { name: 'lists', template: 'content', title: { en: 'Lists', fr: 'Listes' } })
        addContent(`${site}/home/lists`, 'main', 'ctpl:pageArea', {})
        uuidAt(news).then((newsUuid) =>
            addList(`${site}/home/lists/main`, 'latest', {
                type: 'ctpl:news',
                startUuid: newsUuid,
                title: { en: 'Latest news', fr: 'Dernières actualités' },
            }),
        )
        uuidAt(articles).then((articlesUuid) =>
            addList(`${site}/home/lists/main`, 'reading', {
                type: 'ctpl:article',
                startUuid: articlesUuid,
                layout: 'list',
            }),
        )
        publishAndWaitJobEnding(site, ['en', 'fr'])
        cy.logout()
    })

    after(() => {
        cy.login()
        deleteSite(siteKey)
        cy.logout()
    })

    it('lists news as cards, newest first, with linked h3 titles under the list heading', () => {
        cy.visit(`${site}/home/lists.html`)
        cy.get('[data-testid="ctpl-jcr-query"]')
            .first()
            .within(() => {
                cy.get('h2').should('have.text', 'Latest news')
                cy.get('[data-testid="ctpl-news-card"]').should('have.length', 2)
                cy.get('[data-testid="ctpl-news-card"] h3 a')
                    .first()
                    .should('have.text', 'Newer news')
                    .and('have.attr', 'href', `${site}/contents/news/newer.html`)
                cy.get('time').first().should('have.attr', 'dateTime', '2026-09-28')
            })
    })

    it('lists articles as compact rows with byline, h2 titles when the list has no heading', () => {
        cy.visit(`${site}/home/lists.html`)
        cy.get('[data-testid="ctpl-article-compact"]')
            .should('have.length', 1)
            .within(() => {
                cy.get('h2 a').should('have.text', 'An essay')
                cy.contains('By Ada Martin')
                cy.contains('min read')
            })
    })

    it('opens a news item on its own page with the site chrome, one h1 and its tags', () => {
        cy.visit(`${site}/contents/news/newer.html`)
        cy.title().should('eq', `Newer news | ${siteKey}`)
        cy.get('meta[name="description"]').should('have.attr', 'content', 'The latest item.')
        cy.get('meta[property="og:type"]').should('have.attr', 'content', 'article')
        cy.get('meta[property="og:description"]').should('have.attr', 'content', 'The latest item.')
        cy.get('meta[property="article:published_time"]')
            .should('have.attr', 'content')
            .and('match', /^2026-09-28/)
        cy.get('[data-testid="ctpl-site-header"]').should('exist')
        cy.get('h1').should('have.length', 1).and('have.text', 'Newer news')
        cy.get('[data-testid="ctpl-news-full"]')
            .should('contain.text', 'September 28, 2026')
            .and('contain.text', 'release')
        // Outside the page tree: the trail is the home page, then the item.
        cy.get('[data-testid="ctpl-breadcrumb"] li').should('have.length', 2).first().should('have.text', 'Home')
        cy.get('[data-testid="ctpl-breadcrumb"] [aria-current="page"]').should('have.text', 'Newer news')
    })

    it('describes a news item as a NewsArticle and an article as an Article with its author', () => {
        cy.visit(`${site}/contents/news/newer.html`)
        jsonLd().then((node) => {
            const item = node('NewsArticle')
            expect(item).to.include({ headline: 'Newer news', description: 'The latest item.', inLanguage: 'en' })
            expect(item?.datePublished).to.match(/^2026-09-28T/)
            expect(item?.keywords).to.deep.equal(['release'])
            expect(node('WebPage')?.mainEntity).to.deep.equal({ '@id': item?.['@id'] })
        })
        cy.visit(`${site}/contents/articles/essay.html`)
        jsonLd().then((node) => {
            expect(node('Article')?.author).to.deep.equal({ '@type': 'Person', name: 'Ada Martin' })
            expect(node('NewsArticle')).to.equal(undefined)
        })
    })

    it('renders lists and full pages in French, with French dates', () => {
        cy.visit(`/fr${site}/home/lists.html`)
        cy.get('[data-testid="ctpl-news-card"] h3 a').first().should('have.text', 'Actualité récente')
        cy.visit(`/fr${site}/contents/news/newer.html`)
        cy.get('h1').should('have.text', 'Actualité récente')
        cy.get('[data-testid="ctpl-news-full"]').should('contain.text', '28 septembre 2026')
        cy.visit(`/fr${site}/contents/articles/essay.html`)
        cy.get('[data-testid="ctpl-article-full"]')
            .should('contain.text', 'Par Ada Martin')
            .and('contain.text', 'min de lecture')
    })
})

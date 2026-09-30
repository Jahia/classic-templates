/** The module under test: `templateSet` of every site the specs create. */
export const TEMPLATE_SET = 'classic-templates'

/** Every suite creates its own site (and deletes it afterwards), keyed from this prefix. */
export const siteKeyFor = (suite: string): string => `ctpl-${suite}`

export const LANGUAGES = ['en', 'fr']

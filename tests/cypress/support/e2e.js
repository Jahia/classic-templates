import 'cypress-wait-until'
import addContext from 'mochawesome/addContext'

// Apollo (used by every @jahia/cypress GraphQL helper) calls fetch unbound; without this every
// query fails with "Failed to execute 'fetch' on 'Window': Illegal invocation".
if (typeof window !== 'undefined' && window.fetch) {
    // eslint-disable-next-line no-undef
    globalThis.fetch = window.fetch.bind(window)
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('cypress-terminal-report/src/installLogsCollector')()
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@jahia/cypress/dist/support/registerSupport').registerSupport()

if (Cypress.browser.family === 'chromium') {
    Cypress.automation('remote:debugger:protocol', {
        command: 'Network.enable',
        params: {},
    })
    Cypress.automation('remote:debugger:protocol', {
        command: 'Network.setCacheDisabled',
        params: { cacheDisabled: true },
    })
}

Cypress.on('test:after:run', (test, runnable) => {
    const videoName = Cypress.spec.relative.replace('/.cy.*', '').replace('cypress/e2e/', '')
    addContext({ test }, 'videos/' + videoName + '.mp4')
    if (test.state === 'failed') {
        const screenshot = `screenshots/${Cypress.spec.relative.replace('cypress/e2e/', '')}/${runnable.parent.title} -- ${test.title} (failed).png`
        addContext({ test }, screenshot)
    }
})

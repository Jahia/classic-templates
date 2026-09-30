/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    require('./env')(on, config)
    on('task', {
        uploadImage: (args) =>
            require('./upload-image').uploadImage({
                baseUrl: config.baseUrl,
                password: config.env.SUPER_USER_PASSWORD,
                ...args,
            }),
    })
    require('@jahia/cypress/dist/plugins/registerPlugins').registerPlugins(on, config)
    require('cypress-terminal-report/src/installLogsPrinter')(on, {
        printLogsToConsole: 'onFail',
        printLogsToFile: 'always',
        outputRoot: config.projectRoot + '/results/',
        specRoot: 'cypress/e2e',
        outputTarget: {
            'cypress-logs|txt': 'txt',
        },
        defaultTrimLength: 50000,
        commandTrimLength: 5000,
        routeTrimLength: 5000,
    })

    return config
}

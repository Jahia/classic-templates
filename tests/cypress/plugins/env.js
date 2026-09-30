module.exports = (on, config) => {
    config.baseUrl = process.env.JAHIA_URL || config.baseUrl
    config.env.SUPER_USER_PASSWORD = process.env.SUPER_USER_PASSWORD || config.env.SUPER_USER_PASSWORD || 'root1234'

    return config
}

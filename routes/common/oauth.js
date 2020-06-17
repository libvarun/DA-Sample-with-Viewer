const { AuthClientTwoLegged } = require('forge-apis');
const config = require('../../config');

// Tokens are auto-refreshed, keeping clients in simple cache
let cache = {};

// Since we got 3 calls at the first page loading, let's initialize this one now,
// to avoid concurrent requests.
getClient (/*config.scopes.internal*/);

/**
 * Initializes a Forge client for 2-legged authentication.
 * @param {string[]} scopes List of resource access scopes.
 * @returns {AuthClientTwoLegged} 2-legged authentication client.
 */
async function getClient(scopes) {
    scopes = scopes || config.scopes.internal;
    const key = scopes.join('+');
    if ( cache[key] )
        return (cache[key]);

    try {
        const { client_id, client_secret } = config.credentials;
        let client = new AuthClientTwoLegged(client_id, client_secret, scopes || config.scopes.internal, true);
        let credentials = await client.authenticate();
        cache[key] = client;
        console.log (`OAuth2 client created for ${key}`);
        return (client);
    } catch ( ex ) {
        return (null);
    }
}

async function getToken(scopes) {
    const client = await getClient(scopes);
    if ( client === null )
        return (null);
    let credentials = client.getCredentials ();
    return (credentials);
}

/**
 * Retrieves a 2-legged authentication token for preconfigured public scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
async function getPublicToken() {
    return (getToken(config.scopes.public));
}

/**
 * Retrieves a 2-legged authentication token for preconfigured internal scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
async function getInternalToken() {
    return (getToken(config.scopes.internal));
}

module.exports = {
    getClient,
    getPublicToken,
    getInternalToken
};

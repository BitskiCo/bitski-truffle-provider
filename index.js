const OAuth2 = require('simple-oauth2');
const ProviderEngine = require("web3-provider-engine");
const FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
const ProviderSubprovider = require("web3-provider-engine/subproviders/provider.js");
const Subprovider = require("web3-provider-engine/subproviders/subprovider.js");
const inherits = require('util').inherits;
const xhr = process.browser ? require('xhr') : require('request')
const JsonRpcError = require('json-rpc-error');

const tokenConfig = {
    scope: 'eth_sign'
};

function createPayload(data) {
    return
}

inherits(OAuthProvider, Subprovider)

function OAuthProvider(opts) {
    this.rpcUrl = opts.rpcUrl;
    this.oauthClient = OAuth2.create(opts.credentials);
    this.clientId = opts.credentials.client.id;
}

OAuthProvider.prototype.getAccessToken = async function() {
    if (this.accessToken && this.accessToken.expired() === false) {
        return this.accessToken;
    }
    const oauthClient = this.oauthClient;
    const access_token_result = await oauthClient.clientCredentials.getToken(tokenConfig);
    const accessToken = oauthClient.accessToken.create(access_token_result);
    this.accessToken = accessToken;
    return accessToken;
};

OAuthProvider.prototype.handleRequest = function (payload, next, end) {
    const targetUrl = this.rpcUrl;
    const clientId = this.clientId;

    this.getAccessToken().then((accessToken) => {
        const bearer = "Bearer " + accessToken.token.access_token;

        xhr({
            uri: targetUrl,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': bearer,
                'x-client-id': clientId,
            },
            body: JSON.stringify(payload),
            rejectUnauthorized: false,
        }, function (err, res, body) {
            if (err) return end(new JsonRpcError.InternalError(err))

            // check for error code
            switch (res.statusCode) {
                case 405:
                    return end(new JsonRpcError.MethodNotFound())
                case 504: // Gateway timeout
                    let msg = `Gateway timeout. The request took too long to process. `
                    msg += `This can happen when querying logs over too wide a block range.`
                    const err = new Error(msg)
                    return end(new JsonRpcError.InternalError(err))
                default:
                    if (res.statusCode != 200) {
                        return end(new JsonRpcError.InternalError(res.body))
                    }
            }

            // parse response
            let data
            try {
                data = JSON.parse(body)
            } catch (err) {
                console.error(err.stack)
                return end(new JsonRpcError.InternalError(err))
            }

            if (data.error) return end(data.error)

            end(null, data.result)
        })

    }).catch((error) => {
        console.error(error.stack);
        return end(new JsonRpcError.InternalError(error))
    });

}

function getProvider(network, credentials) {
    const engine = new ProviderEngine();

    engine.addProvider(new FiltersSubprovider());
    engine.addProvider(new OAuthProvider({
        rpcUrl: "https://api.bitski.com/v1/web3/" + network,
        credentials: credentials,
    }));
    engine.start();

    return engine;
}

module.exports = getProvider;
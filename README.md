# Bitski Truffle Provider

To use Bitski as your Truffle wallet, run `npm install --save-dev bitski-truffle-provider`.

Then set up your `truffle.js` to look something like this:

```javascript
const BitskiTruffleProvider = require('bitski-truffle-provider');

const bitskiCredentials = {
  client: {
    id: '<YOUR CLIENT ID>',
    secret: '<YOUR CLIENT SECRET>'
  },
  auth: {
    tokenHost: "https://account.bitski.com/",
    tokenPath: "/oauth2/token"
  }
};

module.exports = {
  networks: {
    mainnet: {
      network_id: '1',
      provider: BitskiTruffleProvider("mainnet", bitskiCredentials),
    },
    kovan: {
      network_id: '42',
      provider: BitskiTruffleProvider("kovan", bitskiCredentials),
    },
    rinkeby: {
      network_id: '4',
      provider: BitskiTruffleProvider("rinkeby", bitskiCredentials),
    },
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*"
    }
  }
};
```

Now you can run Truffle!

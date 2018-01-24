# Electra JS

> Javascript API allowing clients to interact with Electra blockchain.

[![npm](https://img.shields.io/npm/v/electra-js.svg?style=flat-square)](https://www.npmjs.com/package/electra-js)
[![Travis](https://img.shields.io/travis/Electra-project/Electra-JS.svg?style=flat-square)](https://travis-ci.org/Electra-project/Electra-JS)
[![David](https://img.shields.io/david/Electra-project/electra-js.svg?style=flat-square)](https://david-dm.org/Electra-project/electra-js)
[![David](https://img.shields.io/david/dev/Electra-project/electra-js.svg?style=flat-square)](https://david-dm.org/InspiredBeings/electra-js)

[![NSP Status](https://nodesecurity.io/orgs/ivan-gabriele/projects/e8f9941a-7742-4aac-8754-931af71f1e3f/badge)](https://nodesecurity.io/orgs/ivan-gabriele/projects/e8f9941a-7742-4aac-8754-931af71f1e3f)

## Integrate

### Install

    npm i electra-js

**Example (Javascript)**

```js
const ElectraJs = require('electra-js')

const electraJs = new ElectraJs()

electraJs.webServices.getCurrentPriceIn('EUR', (priceInEur) => {
  console.log(priceInEur)
})
```

**Example (Typescript)**

```typescript
import ElectraJs from 'electra-js'

const electraJs = new ElectraJs()

// Inside an async function
const priceInEur = await electraJs.webServices.getCurrentPriceIn('EUR')
console.log(priceInEur)
```

### API methods

> **Note**<br>
> `<parameter>` is a mandatory parameter.<br>
> `[parameter]` is an optional parameter.

#### RPC Server

**`rpcServer.check(<oldPassphrase>, <newPassphrase>)`**

> Change the wallet passphrase from <oldPassphrase> to <newPassphrase>.

```
Parameters:

<oldPassphrase> string
<newPassphrase> string
```

_TODO Add the response._

**`rpcServer.check()`**

> Check the wallet integrity.

```
Response:

Promise<{
    'wallet check passed': boolean;
}>
```

**`rpcServer.getAccount(<address>)`**

> Get the account associated with the given address.

```
Parameters:

<address> string

Response:

Promise<string>
```

**`rpcServer.getBalance()`**

> Get the total available balance.

```
Response:

Promise<number>
```

**`rpcServer.getDifficulty()`**

> Get the difficulty as a multiple of the minimum difficulty.

```
Response:

Promise<{
    'proof-of-work': number;
    'proof-of-stake': number;
    'search-interval': number;
}>
```

**`rpcServer.getInfo()`**

> Get the current state info.

```
Response:

Promise<{
    version: string;
    protocolversion: number;
    walletversion: number;
    balance: number;
    newmint: number;
    stake: number;
    blocks: number;
    timeoffset: number;
    moneysupply: number;
    connections: number;
    proxy: string;
    ip: string;
    difficulty: {
        'proof-of-work': number;
        'proof-of-stake': number;
    };
    testnet: boolean;
    keypoololdest: number;
    keypoolsize: number;
    paytxfee: number;
    mininput: number;
    unlocked_until: number;
    errors: string;
}>
```

**`rpcServer.getNewAddress([account])`**

> Generate a new address for receiving payments.

```
Parameters:

[account] string    Address label. Optional.

Response:

Promise<{
    account: string;
} | null>
```

**`rpcServer.listAddressGroupings()`**

> Lists groups of addresses which have had their common ownership made public
> by common use as inputs or as the resulting change in past transactions.

```
Response:

Promise<[
    0: string // Address
    1: string // Ammount
    2: string // Account (address label)
][][]>
```

**`rpcServer.listReceivedByAddress([minConfirmations], [includeEmpty])`**

> List receiving addresses data.

```
Parameters:

[minConfirmations] number     Optional. Default to 1.
[includeEmpty]     boolean    Optional. Default to false.

Response:

Promise<{
    address: string;
    account: string;
    amount: number;
    confirmations: number;
}[]>
```

**`rpcServer.listTransactions([account], [count], [from])`**

> List transactions.

```
Parameters:

[account] string    Optional. Default to '*' (= all address labels).
[count]   number    Optional. Default to 10.
[from]    number    Optional. Default to 0.

Response:

Promise<{
    account: string;
    address: string;
    category: string;
    amount: number;
    confirmations: number;
    blockhash: string;
    blockindex: number;
    blocktime: number;
    txid: string;
    time: number;
    timereceived: number;
}[]>
```

**`rpcServer.listUnspent([minConfirmations], [maxConfirmations], [address, ...])`**

> List unspent transactions between <minConfirmations> and <maxConfirmations>,
> for the given list of <address> if specified.

```
Parameters:

[minConfirmations] number    Optional. Default to 1.
[maxConfirmations] number    Optional. Default to 9999999.
[address]          string    Optional.

Response:

Promise<{
    txid: string;
    vout: number;
    address: string;
    account: string;
    scriptPubKey: string;
    amount: number;
    confirmations: number;
}[]>
```

**`rpcServer.lock()`**

> Removes the wallet encryption key from memory, locking the rpcServer.
> After calling this method, you will need to call walletpassphrase again
> before being able to call any methods which require the wallet to be unlocked.

_TODO Add the response._

**`rpcServer.makeKeyPair([prefix])`**

> Make a public/private key pair.

```
Parameters:

[prefix] string    Optional. Preferred prefix for the public key.

Response:

Promise<{
    PrivateKey: string;
    PublicKey: string;
}>
```

**`rpcServer.storePassphrase(<passphrase>, <timeout>, [stakingOnly])`**

> List receiving addresses data.

```
Parameters:

<passphrase>  string
<timeout>     number     In seconds
[stakingOnly] boolean    Optional. Default to true.
```

_TODO Add the response._

**`rpcServer.validateAddress(<address>)`**

> List receiving addresses data.

```
Parameters:

<address> string

Response:

Promise<{
    isvalid: boolean;
    address?: string | undefined;
    ismine?: boolean | undefined;
    isscript?: boolean | undefined;
    pubkey?: string | undefined;
    iscompressed?: boolean | undefined;
    account?: string | undefined;
}>
```

**`rpcServer.validatePublicKey(<publicKey>)`**

> List receiving addresses data.

```
Parameters:

<publicKey> string

Response:

Promise<{
    isvalid: boolean;
    address?: string | undefined;
    ismine?: boolean | undefined;
    iscompressed?: boolean | undefined;
}>
```

#### Web Services

**`webServices.getCurrentPriceIn([currency])`**

> Get the current price of ECA via CoinMarketCap.

```
Parameters:

[currency] string    One of: 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
                             'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK',
                             'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD',
                             'USD', 'ZAR'
                     Optional. Default to 'USD'.

Response:

number
```

## Contribute

### Getting Started

    git clone https://github.com/Electra-project/Electra-JS.git
    cd Electra-JS
    npm i

### Start developping

Once you're all set up, you can start coding.

    npm start

will automatically start a "live" watch :

- compiling the JS code (in `build` folder),
- checking the lint & typings validation.

### Files Structure

```
├ build                 Development release
├ dist                  Production release (the one distributed via npm)
│ ├ index.d.ts            - Types declarations for clients written in Typescript
│ └ index.js              - Main bundle
├ node_modules          Dependencies local installation directory
├ src                   The main directory
├ tasks                 Specific tasks run via the npm scripts
├ test                  Production release main bundle checkings (import/require tests)
│ ├ browser               - Browser compatibility tests (tested via Selenium WebDriver)
│ │ ├ index.html            - HTML container served by Express
│ │ ├ index.spec.js         - Tests suite run within the browser
│ │ └ index.ts              - CLI browser tests runner (checking for browser errors)
│ ├ index.js              - Javascript checkings
│ └ index.ts              - Typescript checkings
├ .editorconfig         Common IDE and Editors configuration
├ .gitignore            Files and directories ignored by Git
├ .npmignore            Files and directories ignored in the npm published package
├ .npmrc                The npm workspace options
├ .travis.yml           Travis CI automated tests configuration
├ LICENSE               License
├ package-lock.json     Accurately versionned list of the npm dependencies tree
├ package.json          The npm configuration
├ README.md             The current file
├ tsconfig.json         Typescript configuration (tsc options)
├ tslint.json           TSLint configuration
├ webpack.common.js     Common Webpack configuration
├ webpack.dev.js        Webpack development configuration
└ webpack.prod.js       Webpack production configuration
```

### Release a new version

**1/3 Prepare the release**

    npm version [minor|patch]

It will automatically :

1. Run the tests (including the typings & lint validation).
2. Build the production release artifacts: `dist/index.js` & `dist/index.d.ts`.
3. Upgrade the version in `package.json` (npm job).
4. Upgrade the version in `dist/index.js`.
5. Run the artifacts checkings.
6. Add the release files to Git.
7. Commit the files with the message `X.Y.Z` matching the new version (npm job).

**2/3 Push the release**

    git push origin HEAD

You then need to wait for Travis CI tests to pass.

**3/3 Publish the release**

    npm publish

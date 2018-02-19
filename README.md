# Electra JS

> Javascript API allowing clients to interact with Electra blockchain.

[![npm](https://img.shields.io/npm/v/electra-js.svg?style=flat-square)](https://www.npmjs.com/package/electra-js)
[![Travis](https://img.shields.io/travis/Electra-project/Electra-JS.svg?style=flat-square)](https://travis-ci.org/Electra-project/Electra-JS)
[![David](https://img.shields.io/david/Electra-project/electra-js.svg?style=flat-square)](https://david-dm.org/Electra-project/electra-js)
[![David](https://img.shields.io/david/dev/Electra-project/electra-js.svg?style=flat-square)](https://david-dm.org/InspiredBeings/electra-js)

[![NSP Status](https://nodesecurity.io/orgs/ivan-gabriele/projects/e8f9941a-7742-4aac-8754-931af71f1e3f/badge)](https://nodesecurity.io/orgs/ivan-gabriele/projects/e8f9941a-7742-4aac-8754-931af71f1e3f)

## Getting Started

### Install

    npm i electra-js

### Light Wallet VS Hard Wallet

All the wallet methods are contained within the composed method `.wallet` of the instanciated `ElectraJs` class.

**Case A: Light Wallet**

In the case of a light wallet (listening and broadcasting to the blockchain via public web-services), you only need to instanciate ElectraJs without any setting:

```typescript
import ElectraJs from 'electra-js'

const electraJs = new ElectraJs()

// We can then call electraJs.wallet.anyWalletMethod(...) to start using it.
```

**Case B: Hard Wallet**


In the case of a hard wallet, that is utilizing the deamon RPC server, you need to specify the RPC server settings during the ElectraJs instanciation:

```typescript
import ElectraJs from 'electra-js'

const electraJs = new ElectraJs({
  rpcServerAuth: {
    username: 'user',
    password: 'pass'
  },
  rpcServerUri: 'http://127.0.0.1:5788'
})

// We can then call electraJs.wallet.anyWalletMethod(...) to start using it.
```

### States

The wallet can bear 2 states: `EMPTY` or `READY`. It will always start as `EMPTY` once intanciated.

The first wallet method that **MUST** be called in any case is `electraJs.wallet.generate()` (described afterwards).

### API

> **Note**<br>
> `<parameter>` is a mandatory parameter.<br>
> `[parameter]` is an optional parameter.

#### Wallet

_**Getters:**_

**`wallet.addresses`**

> List of the wallet HD addresses.

```txt
Response:

Array<{
  hash: string
  isCiphered: boolean
  isHD: boolean
  label: string
  privateKey: string
}>
```

**`wallet.allAddresses`**

> List of the wallet non-HD (random) and HD addresses.

```txt
Response:

Array<{
  hash: string
  isCiphered: boolean
  isHD: boolean
  label: string
  privateKey: string
}>
```

**`wallet.isHD`**

> Is this a HD wallet ?

```txt
Response:

boolean
```

**`wallet.lockState`**

> Is this wallet locked ?<br>
> In the case of a light wallet, "STAKING" state can't happen.

```txt
Response:

enum {
  LOCKED = 'LOCKED',
  STAKING = 'STAKING',
  UNLOCKED = 'UNLOCKED'
}
```

**`wallet.mnemonic`**

> Wallet HD Mnenonic.<br>
> ONLY available when generating a brand new Wallet, which happens after calling #generate() with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.

```txt
Response:

string
```

**`wallet.randomAddresses`**

> List of the wallet non-HD (random) addresses.

```txt
Response:

Array<{
  hash: string
  isCiphered: boolean
  isHD: boolean
  label: string
  privateKey: string
}>
```

**`wallet.state`**

> Wallet current state.

```txt
Response:

enum {
  EMPTY = 'EMPTY',
  READY = 'READY'
}
```

**`wallet.transactions`**

> List of the wallet transactions.

```txt
Response:

Array<{
  amount: number
  date: number // Unix timestamp in seconds
  fromAddressHash: string
  hash: string
  toAddressHash: string
}>
```

_**Methods:**_

**`wallet.export([unsafe])`**

> Export wallet data with ciphered private keys, or unciphered if <unsafe> is set to TRUE.

_See [EIP-0001](https://github.com/Electra-project/Electra-Improvement-Proposals/issues/2#issuecomment-364407902)._

```txt
Parameters:

<unsafe>    boolean Export the wallet with its private keys deciphered if TRUE. Optional. Default to FALSE.

Response:

[
  VERSION_INTEGER,
  CHAINS_COUNT_INTEGER,
  HIERARCHICAL_DETERMINISTIC_MASTER_NODE_PRIVATE_KEY_STRING,
  RANDOM_ADDRESSES_PRIVATE_KEYS_STRING_ARRAY
]
```

**`wallet.generate([mnemonic], [mnemonicExtension], [chainsCount])`**

> Generate an HD wallet from either the provided mnemonic seed, or a randomly generated one, including ‒ at least ‒ the first derived chain address.<br>
> In case the [mnemonicExtension] is specified, it MUST be encoded in UTF-8 using NFKD.<br>
> The method can only be called when the wallet #state is 'EMPTY' and will set its #state to 'READY' if successful.

```txt
Parameters:

[mnemonic]          string  The 12 words mnemomic. Optional.
                            A new one will be generated and accessible via #mnemonic getter if not provided.
[mnemonicExtension] string  The mnemonic extension. Optional.
[chainsCount]       number  Number of chain addresses already generated. Optional. Default to 1.

Response:

Promise<void>
```

**`wallet.getBalance([addressHash])`**

> Get the global wallet balance, or the <address> balance if specified.

```txt
Parameters:

[addressHash]   string  A wallet chain or random address hash. Optional.

Response:

Promise<number>
```

**`wallet.lock(<passphrase>, [forStakingOnly])`**

> Lock the wallet, that is cipher all its private keys.

```txt
Parameters:

<passphrase>        string  Wallet encryption passphrase.
[forStakingOnly]    boolean Optional. Default to TRUE.

Response:

Promise<void>
```

**`wallet.reset()`**

> Reset the current wallet properties and switch the #state to "EMPTY".

```txt
Parameters:

N/A

Response:

void
```

**`wallet.send(<amount>, <toAddressHash>)`**

> Create and broadcast a new transaction of <amount> <toAddressHash>.

```txt
Parameters:

<amount>        number  Amount, in ECA.
<toAddressHash> string  Recipient address hash.

Response:

Promise<void>
```

**`wallet.unlock(<passphrase>)`**

> Unlock the wallet, that is decipher all its private keys.

```txt
Parameters:

<passphrase>    string  Wallet encryption passphrase.

Response:

Promise<void>
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

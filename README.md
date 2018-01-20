# Electra JS

> Javascript API allowing clients to interact with Electra blockchain.

[![npm](https://img.shields.io/npm/v/electra-js.svg?style=flat-square)](https://www.npmjs.com/package/electra-js)
[![Travis](https://img.shields.io/travis/Electra-project/electra-js.svg?style=flat-square)](https://travis-ci.org/Electra-project/electra-js)
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

electraJs.api.getCurrentPriceIn('EUR', (priceInEur) => {
  console.log(priceInEur)
})
```

**Example (Typescript)**

```typescript
import ElectraJs from 'electra-js'

const electraJs = new ElectraJs()

// Inside an async function
const priceInEur = await electraJs.api.getCurrentPriceIn('EUR')
console.log(priceInEur)
```

### API methods

_Work in progress._

## Contribute

### Getting Started

    git clone https://github.com/Electra-project/Electra-JS.git
    cd Electra-JS
    npm i

### Start developping

Once you're all set up, you can start coding.

    npm start

will automatically start a "live" watch :

- compiling the JS code (in `dist` folder),
- checking the lint & typings validation.

### Files Structure

```
├ build                 Development release
├ dist                  Production release (the one distributed via npm)
│ ├ index.d.ts          - Types declarations for clients written in Typescript
│ └ index.js            - Main bundle
├ node_modules          Dependencies local installation directory
├ src                   The main directory
├ tasks                 Specific tasks run via the npm scripts
├ test                  Production release main bundle checkings (import/require tests)
│ ├ index.js            - Javascript checkings
│ └ index.ts            - Typescript checkings
├ .editorconfig         Common IDE and Editors configuration
├ .gitignore            Files and directories ignored by Git
├ .npmignore            Files and directories ignored in the npm published package
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

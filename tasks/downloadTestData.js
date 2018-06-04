const log = require('@inspired-beings/log')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const download = require('./helpers/download')
const sha256sum = require('./helpers/sha256sum')

const FILES = {
  'Electra-darwin.zip': {
    sha256sum: '4e2773f51eea83138c1d159d49be5269fba45deeae648da7f0250a1010b2a736',
  },
  'Electra-linux.zip': {
    sha256sum: '8c72044f0e6b2428de47ae7c1915b7948f141dce406165c39e54e1922aecd124',
  },
  'Electra-win32.zip': {
    sha256sum: '9cc234818a78f41513a78f6c2d8ac06256b114bd15591fa08e7aea48ff7d0ed8',
  },
}

async function run() {
  const name = `Electra-${process.platform}.zip`
  const binary = FILES[name]
  const filePath = path.resolve(__dirname, '../test/data', name)

  const assetsApiUrl = (await axios.get('https://api.github.com/repos/Electra-project/electra-js-test/releases')).data[0].assets_url
  const asset = (await axios.get(assetsApiUrl)).data.filter(({ name: _name }) => _name === name)[0]

  log(`ElectraJs: Checking current ${name} test data.`)
  if (fs.existsSync(filePath) && await sha256sum(filePath) === binary.sha256sum) return

  log(`ElectraJs: Downloading ${name} test data.`)
  await download(asset.browser_download_url, filePath, asset.size)

  log(`ElectraJs: Checking downloaded ${name} test data.`)
  if (await sha256sum(filePath) !== binary.sha256sum) {
    log.err(`tasks/downloadTestData: BE CAREFUL ! The hash of %s didn't match.`, filePath)
    process.exit(1)
  }
}

run()

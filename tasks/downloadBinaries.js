const log = require('@inspired-beings/log')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const download = require('./helpers/download')
const sha256sum = require('./helpers/sha256sum')

const FILES = {
  'electrad-darwin-x64': {
    sha256sum: 'bfcc2980dbb9d29323927a9e28f9ea71d42d2cf37d58bf518c88ce7a107d9549',
  },
  'electrad-linux-x64': {
    sha256sum: 'fd4a780d842b903ac9e18f34506b87bd957c1d08ec35e386a3cf40e6879a2ed5',
  },
  'electrad-win32-ia32.exe': {
    sha256sum: '2c7f87a9dd99f283a3f63f470effc205be8905f60cd10bfa8c6490aad1e85d53',
  },
  'electrad-win32-x64.exe': {
    sha256sum: '29540d3d4cf9b64beda4520b0858167dfdecbd72ab4323ebb7ffef243262e7d5',
  },
}

async function run() {
  const names = process.platform === 'win32'
    ? [
      `electrad-${process.platform}-ia32.exe`,
      `electrad-${process.platform}-x64.exe`,
    ]
    : [`electrad-${process.platform}-${process.arch}`]

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const binary = FILES[name]
    const filePath = path.resolve(__dirname, '../bin', name)

    const assetsApiUrl = (await axios.get('https://api.github.com/repos/Electra-project/Electra/releases')).data[0].assets_url
    const asset = (await axios.get(assetsApiUrl)).data.filter(({ name: _name }) => _name === name)[0]

    log(`ElectraJs: Checking current ${name} binary.`)
    if (fs.existsSync(filePath) && await sha256sum(filePath) === binary.sha256sum) return

    log(`ElectraJs: Downloading ${name} binary.`)
    await download(asset.browser_download_url, filePath, asset.size)

    log(`ElectraJs: Checking downloaded ${name} binary.`)
    if (await sha256sum(filePath) !== binary.sha256sum) {
      log.err(`tasks/downloadBinaries: BE CAREFUL ! The hash of %s didn't match.`, filePath)
      process.exit(1)
    }
  }
}

run()

const log = require('@inspired-beings/log')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const download = require('./helpers/download')
const sha256sum = require('./helpers/sha256sum')

const FILES = {
  'electrad-darwin-x64': {
    sha256sum: 'f296920be5023d19b43b4737ea5dd4b580cbb789d1eb427e70974221c8f31f9c',
  },
  'electrad-linux-x64': {
    sha256sum: '85bbc02372d295062c97d7ecfd31179e8540b049ec7777f6bacdc0e886ca4bce',
  },
  'electrad-win32-ia32.exe': {
    sha256sum: '2c7f87a9dd99f283a3f63f470effc205be8905f60cd10bfa8c6490aad1e85d53',
  },
  'electrad-win32-x64.exe': {
    sha256sum: '71d5b31bdd465f9ed03c4c69a350e4b9786829a38019b766bef6ba33dfd6ec34',
  },
}

async function run() {
  const axiosInstance = axios.create(process.env.TRAVIS
    ? {
      auth: {
        username: process.env.GH_USERNAME,
        password: process.env.GH_TOKEN,
      },
      headers: {
        'User-Agent': 'Travis/1.0',
      }
    }
    : {}
  )

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

    const assetsApiUrl = (await axiosInstance.get('https://api.github.com/repos/Electra-project/Electra/releases')).data[0].assets_url
    const asset = (await axiosInstance.get(assetsApiUrl)).data.filter(({ name: _name }) => _name === name)[0]

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

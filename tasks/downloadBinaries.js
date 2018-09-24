const log = require('@inspired-beings/log')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const download = require('./helpers/download')
const sha256sum = require('./helpers/sha256sum')

const FILES = {
  'electrad-darwin-x64': {
    sha256sum: '79d8504ae0eb9e14bcfa2fe4245ca5b6846dbc175b9255ddb3d3ffddbf2f0971',
  },
  'electrad-linux-x64': {
    sha256sum: '7fd175fc721871fa1721daf87e3b575dcb2bce57798fbd6cd1c3b3a8086c712f',
  },
  'electrad-win32-ia32.exe': {
    sha256sum: 'b62b61014cb5a51c81b096b182dc88518bda18ed29edba8b7f39f5fae5c51cfe',
  },
  'electrad-win32-x64.exe': {
    sha256sum: '29540d3d4cf9b64beda4520b0858167dfdecbd72ab4323ebb7ffef243262e7d5',
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

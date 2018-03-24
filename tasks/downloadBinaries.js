const blake2 = require('blake2')
const crypto = require('crypto')
const download = require('download')
const fs = require('fs')
const path = require('path')

const BINARIES = [
  {
    name: 'electrad-linux',
    url: 'https://github.com/Electra-project/Electra/releases/download/v1.0.0-beta.1/electrad-linux',
    b2sum: 'b2b00884cd56f68b03978b782cad73b92a13b248c134fde99101ffcda33246a3da73e7ece0a636db6ad3db18257943b03f265ffdbe572f61b8e92c161096bed2',
  },
  {
    name: 'electrad-macos',
    url: 'https://github.com/Electra-project/Electra/releases/download/v1.0.0-beta.1/electrad-macos',
    b2sum: 'd062f087531f6f99c75428dbfbdd4f94d4ceb962e422ff28528256b72b6404a1162ca0a8d0455223f84c88f76d04718b03fe365189f11ae7f9c3e63c17244618',
  },
  {
    name: 'electrad-windows.exe',
    url: 'https://github.com/Electra-project/Electra/releases/download/v1.0.0-beta.1/electrad-windows.exe',
    b2sum: '5a06ad8a47f11b70ee487bf5fcd5469f69752f60d5e6b2233f947009cac434ca7b01feffcf8dce7d27908a398c89f2ea62061ae07cde83fedcae6b28c1ebdf60',
  },
]

function blake2Hash(buffer) {
  return blake2.createHash('blake2b').update(buffer).digest('hex')
}

async function getB2sum(name) {
  return blake2Hash(fs.readFileSync(path.resolve(__dirname, '../bin', name)))
}

async function run() {
  let i = BINARIES.length
  while (--i >= 0) {
    const { name, b2sum, url } = BINARIES[i]

    console.log(`ElectraJs: Checking ${name} binary.`)
    if (fs.existsSync(path.resolve(__dirname, '../bin', name))) {
      if (await getB2sum(name) === b2sum) continue
    }

    console.log(`ElectraJs: Downloading ${name} binary.`)
    await download(url, path.resolve(__dirname, '../bin'))

    console.log(`ElectraJs: Checking downloaded ${name} binary.`)
    if (await getB2sum(name) !== b2sum) {
      throw new Error(`tasks/downloadBinaries: BE CAREFUL ! The hash of bin/${name} didn't match.`)
    }
  }
}

run()

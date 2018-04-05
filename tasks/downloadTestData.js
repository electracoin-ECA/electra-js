const blake2 = require('blake2')
const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const Progress = require('progress')
const request = require('request')
const requestProgress = require('request-progress')

function download(githubPath, name, size) {
  return new Promise((resolve, reject) => {
    const bar = new Progress(chalk.green('[:bar] :rate/bps :percent :etas'), {
      clear: true,
      complete: '█',
      incomplete: '-',
      total: size,
      width: 20,
    })

    let lastTransferredSize = 0
    requestProgress(request(`https://github.com${githubPath}`))
      .on('progress', state => {
        bar.tick(state.size.transferred - lastTransferredSize)
        lastTransferredSize = state.size.transferred
      })
      .on('error', reject)
      .on('end', () => {
        bar.tick(size - lastTransferredSize)
        resolve()
      })
      .pipe(fs.createWriteStream(path.resolve(__dirname, '../test/data', name)))
  })
}

const BINARY = {
  'darwin': {
    name: 'electrad-darwin.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-darwin.zip',
    b2sum: 'e75f1bbed63d3c9548418b26f39255a3c427a782df27a949c72a7cee548171decb363b1467abf068d5981c2d20add22d775319f8a3b4b7b0136461825a08e2ed',
    size: 72837450,
  },
  'linux': {
    name: 'Electra-linux.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-linux.zip',
    b2sum: '4d0cc0b5fde3f23b86a457c55166482435cf5517fbc41236daade5e13249f6390267559a7fab11fa37deed66045587e7af6767d2565a768934aab16fd212ae70',
    size: 68851795,
  },
  'win32': {
    name: 'Electra-win32.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-win32.zip',
    b2sum: 'b624a60caefd72279aa7a7302e4c71c2478cb43d8fffb38c05b75d094009e6784cf901473e9e5bb4bde889967ad4bf47d8f913d4a7e5f772b98407c403a9991a',
    size: 70492076,
  },
}

function blake2Hash(buffer) {
  return blake2.createHash('blake2b').update(buffer).digest('hex')
}

function getB2sum(name) {
  return blake2Hash(fs.readFileSync(path.resolve(__dirname, '../test/data', name)))
}

async function run() {
  const { name, githubPath, b2sum, size } = BINARY[process.platform]

  console.log(`ElectraJs: Checking current ${name} binary.`)
  if (fs.existsSync(path.resolve(__dirname, '../test/data', name)) && getB2sum(name) === b2sum) return

  console.log(`ElectraJs: Downloading ${name} binary.`)
  await download(githubPath, name, size)

  console.log(`ElectraJs: Checking downloaded ${name} binary.`)
  if (getB2sum(name) !== b2sum) {
    console.log(chalk.red(`tasks/downloadBinaries: BE CAREFUL ! The hash of bin/${name} didn't match.`))
    process.exit()
  }
}

run()

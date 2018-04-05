const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const Progress = require('progress')
const request = require('request')
const requestProgress = require('request-progress')
const sha256sum = require('./helpers/sha256sum')

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
    name: 'Electra-darwin.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-darwin.zip',
    sha256sum: '4e2773f51eea83138c1d159d49be5269fba45deeae648da7f0250a1010b2a736',
    size: 72837450,
  },
  'linux': {
    name: 'Electra-linux.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-linux.zip',
    sha256sum: 'd3166fb24e91c16e3b0027d0e1bd0c36fa267a4d33da6ad2686d0f7e045aef57',
    size: 68851795,
  },
  'win32': {
    name: 'Electra-win32.zip',
    githubPath: '/Electra-project/Electra-JS/releases/download/v0.11.1/Electra-win32.zip',
    sha256sum: '10eda43ad2ba224e1c24f5f22b58cece603f6d7eaeef447939893068eeae1404',
    size: 70492076,
  },
}

async function getSha256Sum(name) {
  return await sha256sum(path.resolve(__dirname, '../test/data', name))
}

async function run() {
  const { name, githubPath, sha256sum, size } = BINARY[process.platform]

  console.log(`ElectraJs: Checking current ${name} binary.`)
  if (fs.existsSync(path.resolve(__dirname, '../test/data', name)) && await getSha256Sum(name) === sha256sum) return

  console.log(`ElectraJs: Downloading ${name} binary.`)
  await download(githubPath, name, size)

  console.log(`ElectraJs: Checking downloaded ${name} binary.`)
  if (await getSha256Sum(name) !== sha256sum) {
    console.log(chalk.red(`tasks/downloadBinaries: BE CAREFUL ! The hash of bin/${name} didn't match.`))
    process.exit()
  }
}

run()

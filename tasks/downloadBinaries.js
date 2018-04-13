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
      .pipe(fs.createWriteStream(path.resolve(__dirname, '../bin', name)))
  })
}

const BINARY = {
  'darwin': {
    name: 'electrad-macos',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-macos',
    sha256sum: 'f296920be5023d19b43b4737ea5dd4b580cbb789d1eb427e70974221c8f31f9c',
    size: 18828580,
  },
  'linux': {
    name: 'electrad-linux',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-linux',
    sha256sum: '85bbc02372d295062c97d7ecfd31179e8540b049ec7777f6bacdc0e886ca4bce',
    size: 73570640,
  },
  'win32': {
    name: 'electrad-windows.exe',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-windows.exe',
    sha256sum: '71d5b31bdd465f9ed03c4c69a350e4b9786829a38019b766bef6ba33dfd6ec34',
    size: 7167488,
  },
}

async function getSha256Sum(name) {
  return await sha256sum(path.resolve(__dirname, '../bin', name))
}

async function run() {
  const { name, githubPath, sha256sum, size } = BINARY[process.platform]

  console.log(`ElectraJs: Checking current ${name} binary.`)
  if (fs.existsSync(path.resolve(__dirname, '../bin', name)) && await getSha256Sum(name) === sha256sum) return

  console.log(`ElectraJs: Downloading ${name} binary.`)
  await download(githubPath, name, size)

  console.log(`ElectraJs: Checking downloaded ${name} binary.`)
  if (await getSha256Sum(name) !== sha256sum) {
    console.log(chalk.red(`tasks/downloadBinaries: BE CAREFUL ! The hash of bin/${name} didn't match.`))
    process.exit()
  }
}

run()

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
      .pipe(fs.createWriteStream(path.resolve(__dirname, '../bin', name)))
  })
}

const BINARY = {
  'darwin': {
    name: 'electrad-macos',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-macos',
    b2sum: 'd062f087531f6f99c75428dbfbdd4f94d4ceb962e422ff28528256b72b6404a1162ca0a8d0455223f84c88f76d04718b03fe365189f11ae7f9c3e63c17244618',
    size: 18828580,
  },
  'linux': {
    name: 'electrad-linux',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-linux',
    b2sum: 'b2b00884cd56f68b03978b782cad73b92a13b248c134fde99101ffcda33246a3da73e7ece0a636db6ad3db18257943b03f265ffdbe572f61b8e92c161096bed2',
    size: 73570640,
  },
  'win32': {
    name: 'electrad-windows.exe',
    githubPath: '/Electra-project/Electra/releases/download/v1.2.0-beta.1/electrad-windows.exe',
    b2sum: '5a06ad8a47f11b70ee487bf5fcd5469f69752f60d5e6b2233f947009cac434ca7b01feffcf8dce7d27908a398c89f2ea62061ae07cde83fedcae6b28c1ebdf60',
    size: 121045033,
  },
}

function blake2Hash(buffer) {
  return blake2.createHash('blake2b').update(buffer).digest('hex')
}

function getB2sum(name) {
  return blake2Hash(fs.readFileSync(path.resolve(__dirname, '../bin', name)))
}

async function run() {
  const { name, githubPath, b2sum, size } = BINARY[process.platform]

  console.log(`ElectraJs: Checking current ${name} binary.`)
  if (fs.existsSync(path.resolve(__dirname, '../bin', name)) && getB2sum(name) === b2sum) return

  console.log(`ElectraJs: Downloading ${name} binary.`)
  await download(githubPath, name, size)

  console.log(`ElectraJs: Checking downloaded ${name} binary.`)
  if (getB2sum(name) !== b2sum) {
    console.log(chalk.red(`tasks/downloadBinaries: BE CAREFUL ! The hash of bin/${name} didn't match.`))
    process.exit()
  }
}

run()

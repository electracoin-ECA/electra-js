const childProcess = require('child_process')
const path = require('path')

const binaryPath = path.resolve(
  __dirname,
  '..',
  'bin',
  `electrad-${process.platform}-${process.arch}${process.platform === 'win32' ? '.exe' : ''}`
)

if (['darwin', 'linux'].includes(process.platform)) {
  console.log('Updating MacOS binary rights...')
  const process = childProcess.spawn('chmod', ['755', binaryPath])
}

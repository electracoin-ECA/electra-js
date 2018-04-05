const childProcess = require('child_process')
const path = require('path')

if (process.platform === 'darwin') {
  console.log('Updating MacOS binary rights...')
  const process = childProcess
    .spawn('chmod', [
      '755',
      path.resolve(__dirname, '../bin/electrad-macos'),
    ])
}

if (process.platform === 'linux') {
  console.log('Updating Linux binary rights...')
  const process = childProcess
    .spawn('chmod', [
      '755',
      path.resolve(__dirname, '../bin/electrad-linux'),
    ])
}

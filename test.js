const childProcess = require('child_process')
const os = require('os')
const path = require('path')

console.log(path.resolve(os.homedir(), 'AppData/Roaming/.Electra'))

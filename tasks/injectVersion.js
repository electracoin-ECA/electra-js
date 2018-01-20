const fs = require('fs')

const npmConfig = require('../package.json')

const buildFilePath = './dist/index.js'
const source = fs.readFileSync(buildFilePath, 'UTF-8')
sourceWithVersion = source.replace('__ELECTRA-JS_VERSION__', npmConfig.version)
fs.writeFileSync(buildFilePath, sourceWithVersion, 'UTF-8')

const crypto = require('crypto')
const fs = require('fs')

module.exports = function(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('error', reject)
    stream.on('data', (chunk) => {
      try {
        hash.update(chunk)
      }
      catch (err) {
        stream.close()
        reject(err)
      }
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
  })
}

const axios = require('axios')
const chalk = require('chalk')
const fs = require('fs')
const Progress = require('progress')
const request = require('request')
const requestProgress = require('request-progress')

module.exports = function(from, to, size) {
  return new Promise((resolve, reject) => {
    const bar = new Progress(chalk.green('[:bar] :rate/bps :percent :etas'), {
      clear: true,
      complete: '█',
      incomplete: '-',
      total: size,
      width: 20,
    })

    let lastTransferredSize = 0
    requestProgress(request(from))
      .on('progress', state => {
        bar.tick(state.size.transferred - lastTransferredSize)
        lastTransferredSize = state.size.transferred
      })
      .on('error', reject)
      .on('end', () => {
        bar.tick(size - lastTransferredSize)
        resolve()
      })
      .pipe(fs.createWriteStream(to))
  })
}

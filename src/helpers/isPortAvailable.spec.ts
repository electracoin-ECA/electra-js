// tslint:disable

import * as assert from 'assert'
import * as net from 'net'

import isPortAvailable from './isPortAvailable'

let server

describe('helpers/isPortAvailable()', function () {
  before(function(done) {
    server = net.createServer().listen(9998).once('listening', done)
  })

  it(`SHOULD return FALSE`, async function () {
    assert.strictEqual(await isPortAvailable(9998), false)
  })

  it(`SHOULD return TRUE`, async function () {
    assert.strictEqual(await isPortAvailable(9999), true)
  })

  after(function (done) {
    server.once('close', done).close()
  })
})

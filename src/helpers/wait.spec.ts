// tslint:disable

import * as assert from 'assert'

import wait from './wait'

describe('helpers/wait()', function() {
  it(`SHOULD return the result`, async function() {
    const time = +Date.now()
    await wait(1000)
    assert.strictEqual(+Date.now() >= time + 1000, true)
  })
})

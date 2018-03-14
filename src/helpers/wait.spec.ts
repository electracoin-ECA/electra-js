// tslint:disable

import * as assert from 'assert'

import wait from './wait'

describe('helpers/wait()', function() {
  it(`SHOULD wait for 1s`, async function() {
    const time = +Date.now()
    await wait(1000)
    assert.strictEqual(+Date.now() >= time + 1000, true)
  })
})

// tslint:disable

import * as assert from 'assert'

import getBlockCount from './getBlockCount'

describe('webServices#getBlockCount()', function() {
  it(`SHOULD return a number`, async function() {
    const blockCount = await getBlockCount()
    assert.strictEqual(typeof blockCount === 'number' && !isNaN(blockCount), true)
  })
})

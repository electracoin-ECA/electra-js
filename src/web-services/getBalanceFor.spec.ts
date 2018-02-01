// tslint:disable

import * as assert from 'assert'

import getBalanceFor from './getBalanceFor'

describe('webServices#getBalanceFor()', function() {
  it(`SHOULD return a number`, async function() {
    const balance = await getBalanceFor('ERgSYfQ3xySNcZDwsVeyWW3XpfLAhj3fzS')
    assert.strictEqual(typeof balance === 'number' && !isNaN(balance), true)
  })
})

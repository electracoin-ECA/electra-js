// tslint:disable

import * as assert from 'assert'

import assertCatch from './assertCatch'
import closeElectraDaemons from './closeElectraDaemons'

describe('helpers/closeElectraDaemons()', function() {
  this.timeout(10000)

  it(`SHOULD NOT throw any error`, async function() {
    assert.strictEqual(await assertCatch(() => closeElectraDaemons()), false)
  })
})

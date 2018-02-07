// tslint:disable

import * as assert from 'assert'

import assertCatch from './assertCatch'

function failIfTrue(isTrue) {
  return new Promise((resolve, reject) => isTrue ? reject() : resolve())
}

describe('helpers/assertCatch()', function() {
  it(`SHOULD return TRUE`, async function() {
    assert.strictEqual(await assertCatch(() => failIfTrue(true)), true)
  })

  it(`SHOULD return FALSE`, async function() {
    assert.strictEqual(await assertCatch(() => failIfTrue(false)), false)
  })
})

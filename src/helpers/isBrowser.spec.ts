// tslint:disable

import * as assert from 'assert'

import * as isBrowser from './isBrowser'

describe('helpers/isBrowser()', function() {
  it(`SHOULD return FALSE`, function() {
    assert.strictEqual(isBrowser(), false)
  })
})

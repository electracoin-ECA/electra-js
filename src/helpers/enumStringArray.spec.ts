// tslint:disable

import * as assert from 'assert'

import enumStringArray from './enumStringArray'

describe('helpers/enumStringArray()', function() {
  it(`SHOULD return a function`, function() {
    assert.strictEqual(typeof enumStringArray(['foo', 'bar']), 'function')
  })
  it(`SHOULD have an undefined protoype`, function() {
    assert.strictEqual(enumStringArray(['foo', 'bar'])['prototype'], undefined)
  })
})

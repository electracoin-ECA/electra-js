// tslint:disable

import * as assert from 'assert'

import getMaxItemFromList from './getMaxItemFromList'

describe('helpers/getMaxItemFromList()', function() {
  it(`SHOULD return the expected result`, function() {
    assert.deepStrictEqual(getMaxItemFromList([{ age: 80 }, { age: 30 }, { age: 90 }, { age: 20 }], 'age'), { age: 90 })
  })
})

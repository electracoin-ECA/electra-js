// tslint:disable

import * as assert from 'assert'

import getListMax from './getListMax'

describe.only('helpers/getListMax()', function() {
  it(`SHOULD return the expected result`, function() {
    assert.deepStrictEqual(getListMax([{ age: 80 }, { age: 30 }, { age: 90 }, { age: 20 }], 'age'), { age: 90 })
  })
})

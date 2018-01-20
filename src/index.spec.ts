// tslint:disable:typedef

import * as assert from 'assert'

import ElectraJs from '.'

const electraJs = new ElectraJs()

describe('ElectraJs', function() {
  describe(`#getVersion()`, function() {
    it(`SHOULD return the expected string`, function() {
      assert.strictEqual(electraJs.getVersion(), '__ELECTRA-JS_VERSION__')
    })
  })
})

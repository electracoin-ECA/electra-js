// tslint:disable

import * as assert from 'assert'

import ElectraJs from '.'

describe('ElectraJs', function() {
  const electraJs = new ElectraJs()

  describe(`#getVersion()`, function() {
    it(`SHOULD return the expected string`, function() {
      assert.strictEqual(electraJs.getVersion(), '__ELECTRA-JS_VERSION__')
    })
  })
})

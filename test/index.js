const assert = require('assert')

const ElectraJs = require('..')

function testMethodType(name, method) {
  describe(`ElectraJs#${name}()`, function() {
    it('SHOULD be a method', function() {
      assert.strictEqual(typeof method, 'function')
    })
  })
}

describe('Javascript', function() {
  describe('Basics', function() {
    // There is no need for real settings here since this test is only meant to check the methods existence.
    const electraJs = new ElectraJs({
      rpcServerAuth: { username: '', password: '' },
      rpcServerUri: ''
    })

    testMethodType('getVersion', electraJs.getVersion)

    testMethodType('webServices#getCurrentPriceIn', electraJs.webServices.getCurrentPriceIn)
  })
})

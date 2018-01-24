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

    testMethodType('rpcServer#check', electraJs.rpcServer.check)
    testMethodType('rpcServer#getAccount', electraJs.rpcServer.getAccount)
    testMethodType('rpcServer#getBalance', electraJs.rpcServer.getBalance)
    testMethodType('rpcServer#getDifficulty', electraJs.rpcServer.getDifficulty)
    testMethodType('rpcServer#getNewAddress', electraJs.rpcServer.getNewAddress)
    testMethodType('rpcServer#listAddressGroupings', electraJs.rpcServer.listAddressGroupings)
    testMethodType('rpcServer#listReceivedByAddress', electraJs.rpcServer.listReceivedByAddress)
    testMethodType('rpcServer#makeKeyPair', electraJs.rpcServer.makeKeyPair)
    testMethodType('rpcServer#listTransactions', electraJs.rpcServer.listTransactions)
    testMethodType('rpcServer#listUnspent', electraJs.rpcServer.listUnspent)
    testMethodType('rpcServer#lock', electraJs.rpcServer.lock)
    testMethodType('rpcServer#storePassphrase', electraJs.rpcServer.storePassphrase)
    testMethodType('rpcServer#validateAddress', electraJs.rpcServer.validateAddress)
    testMethodType('rpcServer#validatePublicKey', electraJs.rpcServer.validatePublicKey)

    testMethodType('webServices#getCurrentPriceIn', electraJs.webServices.getCurrentPriceIn)
  })
})

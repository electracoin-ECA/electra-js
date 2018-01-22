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
      rpcAuth: { username: '', password: '' },
      rpcUri: ''
    })

    testMethodType('getVersion', electraJs.getVersion)

    testMethodType('api#getCurrentPriceIn', electraJs.api.getCurrentPriceIn)

    testMethodType('wallet#check', electraJs.wallet.check)
    testMethodType('wallet#getAccount', electraJs.wallet.getAccount)
    testMethodType('wallet#getBalance', electraJs.wallet.getBalance)
    testMethodType('wallet#getDifficulty', electraJs.wallet.getDifficulty)
    testMethodType('wallet#getNewAddress', electraJs.wallet.getNewAddress)
    testMethodType('wallet#listAddressGroupings', electraJs.wallet.listAddressGroupings)
    testMethodType('wallet#listReceivedByAddress', electraJs.wallet.listReceivedByAddress)
    testMethodType('wallet#makeKeyPair', electraJs.wallet.makeKeyPair)
    testMethodType('wallet#listTransactions', electraJs.wallet.listTransactions)
    testMethodType('wallet#listUnspent', electraJs.wallet.listUnspent)
    testMethodType('wallet#lock', electraJs.wallet.lock)
    testMethodType('wallet#storePassphrase', electraJs.wallet.storePassphrase)
    testMethodType('wallet#validateAddress', electraJs.wallet.validateAddress)
    testMethodType('wallet#validatePublicKey', electraJs.wallet.validatePublicKey)
  })
})

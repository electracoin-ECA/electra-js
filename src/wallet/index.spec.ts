// tslint:disable:no-magic-numbers typedef

import * as assert from 'assert'
import * as bip39 from 'bip39'

import Wallet from '.'
import Electra from '../libs/electra/index'

// These test variables reference the same HD wallet sample
export const WALLET_TEST = {
  chains: [
    { hash: 'EZDsBSP3R3RaRBTaCaRDjRhMS5j1NAjXiL', privateKey: 'QxAZpoEHUTPerHx1gC5noTyBz3kRzV61mSGmC6BfhkHuFbqGP7Hk' },
    { hash: 'EJvQUTKdi8K5brkAMuCpK1cZYJxtRH9dY5', privateKey: 'QsFf6FQP7rzUpTBzovmaveu6umekDTs9GB2X4JycE9Jg6fxYroXc' }
  ],
  masterNode: {
    hash: 'EHtiQTEnQnbF4w6qwFV2vZ5rCKdcvSTbK4',
    privateKey: 'QqwHWeqEQx1yxTM4NHmhB16GxZ8HKDQhV5h9KMqHgZjBJD1wxNBq'
  },
  mnemonic: 'bridge cigar wheel tent balcony identify predict rose deer avocado clip bracket',
  mnemonicExtension: 'A MNEMONIC EXTENSION THAT NOBODY SHOULD USE',
  passphrase: 'A PASSPHRASE THAT NOBODY SHOULD USE',
}

describe('Wallet', function() {
  let wallet: Wallet

  // TODO We need a more efficient lock() and unlock() strategy
  this.timeout(30000)

  describe(`WHEN instantiating a new wallet`, () => {
    it(`new Wallet() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet = new Wallet()) })
  })

  describe(`AFTER instantiating this new wallet`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#customAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.customAddresses) })
    it(`#isHD SHOULD throw an error`, () => { assert.throws(() => wallet.isHD) })
    it(`#isLocked SHOULD throw an error`, () => { assert.throws(() => wallet.isLocked) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, () => { assert.throws(() => wallet.lock(WALLET_TEST.passphrase)) })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, () => { assert.throws(() => wallet.unlock(WALLET_TEST.passphrase)) })
  })

  describe(`WHEN generating the same wallet (W1) WITHOUT <mnemonic>, <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD NOT throw any error`, () => {
      assert.doesNotThrow(() => wallet.generate(WALLET_TEST.passphrase))
    })
  })

  describe(`AFTER generating the same wallet (W1)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.addresses.length, 1) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })

    it(`#mnemonic SHOULD be a string`, () => { assert.strictEqual(typeof wallet.mnemonic, 'string') })
    it(`#mnemonic SHOULD be a non-empty string`, () => { assert.strictEqual(wallet.mnemonic.length > 0, true) })
    it(`#mnemonic SHOULD be a 12-words string`, () => { assert.strictEqual(wallet.mnemonic.split(' ').length, 12) })
    it(`#mnemonic SHOULD be a lowercase string`, () => {
      assert.strictEqual(wallet.mnemonic, wallet.mnemonic.toLocaleLowerCase())
    })
    it(`#mnemonic SHOULD be a valid BIP39 mnemonic`, () => {
      assert.strictEqual(bip39.validateMnemonic(wallet.mnemonic), true)
    })

    it(`#generate() SHOULD throw an error`, () => { assert.throws(() => wallet.generate(WALLET_TEST.passphrase)) })
  })

  describe(`WHEN resetting the same wallet (W1)`, () => {
    it(`#reset() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.reset()) })
  })

  describe(`AFTER resetting the same wallet (W1)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#customAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.customAddresses) })
    it(`#isHD SHOULD throw an error`, () => { assert.throws(() => wallet.isHD) })
    it(`#isLocked SHOULD throw an error`, () => { assert.throws(() => wallet.isLocked) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, () => { assert.throws(() => wallet.lock(WALLET_TEST.passphrase)) })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, () => { assert.throws(() => wallet.unlock(WALLET_TEST.passphrase)) })
  })

  describe(`WHEN generating the same wallet (W2) WITH <mnemonic> WITHOUT <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD throw an error WITH an invalid mnemonic`, () => {
      assert.throws(() => wallet.generate(WALLET_TEST.passphrase, WALLET_TEST.mnemonic.substr(1)))
    })
    it(`#generate() SHOULD NOT throw any error WITH a valid mnemonic`, () => {
      assert.doesNotThrow(() => wallet.generate(WALLET_TEST.passphrase, WALLET_TEST.mnemonic))
    })
  })

  describe(`AFTER generating the same wallet (W2)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.addresses.length, 1) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })

    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })

    it(`#isLocked SHOULD be FALSE`, () => { assert.strictEqual(wallet.isLocked, false) })
    it(`#lock() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.lock(WALLET_TEST.passphrase)) })
    it(`#isLocked SHOULD be TRUE`, () => { assert.strictEqual(wallet.isLocked, true) })
    it(`#unlock() SHOULD not throw any error`, () => {
      assert.doesNotThrow(() => wallet.unlock(WALLET_TEST.passphrase))
    })
    it(`#isLocked SHOULD be FALSE`, () => { assert.strictEqual(wallet.isLocked, false) })

    it(`#generate() SHOULD throw an error`, () => { assert.throws(() => wallet.generate(WALLET_TEST.passphrase)) })
  })
})

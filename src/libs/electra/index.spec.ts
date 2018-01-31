// tslint:disable

import * as assert from 'assert'

import Electra from '.'
import * as bip39 from 'bip39'

import { WALLET_TEST } from '../../wallet/index.spec'

describe('libs/Electra', function() {
  const MNEMONIC_TEST = 'bridge cigar wheel tent balcony identify predict rose deer avocado clip bracket'
  let accountPrivateKey, mainAddress, masterNodeAddress

  describe(`#getMasterNodeAddressFromMnemonic()`, function() {
    masterNodeAddress = Electra.getMasterNodeAddressFromMnemonic(MNEMONIC_TEST)

    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(masterNodeAddress.privateKey, WALLET_TEST.masterNode.privateKey)
    })
    it(`AND SHOULD return the expected hash`, function() {
      assert.strictEqual(masterNodeAddress.hash, WALLET_TEST.masterNode.hash)
    })
    it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
      assert.strictEqual(
        Electra.getAddressHashFromPrivateKey(masterNodeAddress.privateKey),
        masterNodeAddress.hash
      )
    })
  })

  describe(`#getDerivedChainFromMasterNodePrivateKey()`, function() {
    describe(`WHEN looking for the first derived chain (walletIndex = 0, chainIndex = 0)`, function() {
      const firstAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 0)

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(firstAddress.privateKey, WALLET_TEST.chains[0].privateKey)
      })
      it(`AND SHOULD return the expected hash`, function() {
        assert.strictEqual(firstAddress.hash, WALLET_TEST.chains[0].hash)
      })
      it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(firstAddress.privateKey),
          firstAddress.hash
        )
      })
    })

    describe(`WHEN looking for the second derived chain (walletIndex = 0, chainIndex = 1)`, function() {
      const secondAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 1)

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(secondAddress.privateKey, WALLET_TEST.chains[1].privateKey)
      })
      it(`AND SHOULD return the expected hash`, function() {
        assert.strictEqual(secondAddress.hash, WALLET_TEST.chains[1].hash)
      })
      it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(secondAddress.privateKey),
          secondAddress.hash
        )
      })
    })
  })

  describe(`#getRandomMnemonic()`, function() {
    const mnemonic = Electra.getRandomMnemonic()

    it(`SHOULD return a non-empty string made of 12 lowercase regular letters`, function() {
      assert.strictEqual(typeof mnemonic, 'string')
      assert.strictEqual(mnemonic.length > 0, true)
      assert.strictEqual(mnemonic.split(' ').length, 12)
      assert.strictEqual(mnemonic, mnemonic.toLocaleLowerCase())
    })

    it(`WHICH SHOULD be a valid BIP39 mnemonic`, function() {
      assert.strictEqual(bip39.validateMnemonic(mnemonic), true)
    })
  })
})

// tslint:disable

import * as assert from 'assert'

import Electra from '.'
import * as bip39 from 'bip39'

const MNEMONIC_TEST = 'bridge cigar wheel tent balcony identify predict rose deer avocado clip bracket'

describe('libs/Electra', function() {
  describe(`#getAddressHashFromPrivateKey()`, function() {
    it(`SHOULD return the expected address`, function() {
      assert.strictEqual(
        Electra.getAddressHashFromPrivateKey('QqDPDtyVoA1wsdB2HkkofMoB567GGxLUEM8RHffvYfQ2UZ2UU6PB'),
        'EdiEBrGqDUn6PDeNFKb1aLmei5uHVfmmd2'
      )
    })
  })

  const MNEMONIC_TEST = 'bridge cigar wheel tent balcony identify predict rose deer avocado clip bracket'
  let accountPrivateKey, mainAddress, masterNodeAddress

  describe(`#getMasterNodeAddressFromMnemonic()`, function() {
    masterNodeAddress = Electra.getMasterNodeAddressFromMnemonic(MNEMONIC_TEST)

    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(masterNodeAddress.privateKey, 'QqwHWeqEQx1yxTM4NHmhB16GxZ8HKDQhV5h9KMqHgZjBJD1wxNBq')
    })
    it(`AND SHOULD return the expected hash`, function() {
      assert.strictEqual(masterNodeAddress.hash, 'EHtiQTEnQnbF4w6qwFV2vZ5rCKdcvSTbK4')
    })
    it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
      assert.strictEqual(
        Electra.getAddressHashFromPrivateKey(masterNodeAddress.privateKey),
        masterNodeAddress.hash
      )
    })
  })

  describe(`#getDerivatedAddressFromMasterNodePrivateKey()`, function() {
    describe(`WHEN looking for the first derivated address (index = 0)`, function() {
      const firstAddress = Electra.getDerivatedAddressFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0)

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(firstAddress.privateKey, 'QsNh8Yb8UkD3iLSAd5gpoLcomTFzR9Quzordt6UbEM5a9h2rAn6p')
      })
      it(`AND SHOULD return the expected hash`, function() {
        assert.strictEqual(firstAddress.hash, 'EegNGXsWa3HFStTMEjgRCan65KVP41BfRN')
      })
      it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(firstAddress.privateKey),
          firstAddress.hash
        )
      })
    })

    describe(`WHEN looking for the second derivated address (index = 1)`, function() {
      const secondAddress = Electra.getDerivatedAddressFromMasterNodePrivateKey(masterNodeAddress.privateKey, 1)

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(secondAddress.privateKey, 'QrmU7yAhrNbTRnSz68Dq3qgHCVPZ6YzkzvnJqC1eD4Np35oCjFVS')
      })
      it(`AND SHOULD return the expected hash`, function() {
        assert.strictEqual(secondAddress.hash, 'EXn2p6Vce65F9G5jcQnKhtr8XQyNgmbJk4')
      })
      it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(secondAddress.privateKey),
          secondAddress.hash
        )
      })
    })

    describe(`WHEN looking for the hundredth derivated address (index = 99)`, function() {
      const hundredthAddress = Electra.getDerivatedAddressFromMasterNodePrivateKey(masterNodeAddress.privateKey, 99)

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(hundredthAddress.privateKey, 'QsucZ6UERsypYk2Wq1CjKwrhza3H6B3KJ5vygzqUb1uUPML1MVGX')
      })
      it(`AND SHOULD return the expected hash`, function() {
        assert.strictEqual(hundredthAddress.hash, 'EUQtCEy1vyHpNgQSiRhjm1c9ddBkqgcwH5')
      })
      it(`WHICH SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(hundredthAddress.privateKey),
          hundredthAddress.hash
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


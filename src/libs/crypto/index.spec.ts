// tslint:disable

import * as assert from 'assert'

import Crypto from '.'

const PASSPHRASE_TEST = 'A PASSPHRASE THAT NOBODY SHOULD USE'
const PRIVATE_KEY_TEST = 'QqDPDtyVoA1wsdB2HkkofMoB567GGxLUEM8RHffvYfQ2UZ2UU6PB'
const PRIVATE_KEY_CIPHER_TEST = '6PYKMytN8CmmD2MsyYdsrZNM116x9uieU6qNxYpNBHc8CmV2vZLyXfUSis'

describe('Crypto', function() {
  this.timeout(10000)

  describe(`#cipherPrivateKey()`, function() {
    it(`SHOULD return the expected cipher`, function() {
      assert.strictEqual(
        Crypto.cipherPrivateKey(PRIVATE_KEY_TEST, PASSPHRASE_TEST),
        PRIVATE_KEY_CIPHER_TEST
      )
    })

    it(`SHOULD throw an error with an invalid private key`, function() {
      assert.throws(() => Crypto.cipherPrivateKey(PRIVATE_KEY_TEST + 'X', PASSPHRASE_TEST))
    })

    it(`SHOULD return a different cipher with a different passphrase`, function() {
      assert.notDeepStrictEqual(
        Crypto.cipherPrivateKey(PRIVATE_KEY_TEST, PASSPHRASE_TEST + 'X'),
        PRIVATE_KEY_CIPHER_TEST
      )
    })
  })

  describe(`#decipherPrivateKey()`, function() {
    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(
        Crypto.decipherPrivateKey(PRIVATE_KEY_CIPHER_TEST, PASSPHRASE_TEST),
        PRIVATE_KEY_TEST
      )
    })

    it(`SHOULD throw an error with an invalid private key`, function() {
      assert.throws(() => Crypto.decipherPrivateKey(PRIVATE_KEY_TEST + 'X', PASSPHRASE_TEST))
    })

    it(`SHOULD throw an error with a wrong passphrase`, function() {
      assert.throws(() => Crypto.decipherPrivateKey(PRIVATE_KEY_CIPHER_TEST, PASSPHRASE_TEST + 'X'))
    })
  })
})

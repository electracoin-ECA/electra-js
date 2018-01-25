// tslint:disable

import * as assert from 'assert'

import electra from '.'

describe.only('libs/electra', function() {
  describe(`#createAddress()`, function() {
    const address = electra.createAddress()

    it(`SHOULD create an object containing a non-empty string address & a non-empty string private key`, function() {
      assert.strictEqual(typeof address.hash, 'string')
      assert.strictEqual(address.hash.length > 0, true)
      assert.strictEqual(typeof address.privateKey, 'string')
      assert.strictEqual(address.privateKey.length > 0, true)
    })

    it(`AND its private key should be resolved into the same address via #getAddressfromWif()`, function() {
      assert.strictEqual(electra.getAddressFromWif(address.privateKey), address.hash)
    })
  })
})

describe('libs/electra', function() {
  describe(`#getAddressfromWif()`, function() {
    it(`SHOULD return the expected address`, function() {
      assert.strictEqual(
        electra.getAddressFromWif('QqDPDtyVoA1wsdB2HkkofMoB567GGxLUEM8RHffvYfQ2UZ2UU6PB'),
        'EdiEBrGqDUn6PDeNFKb1aLmei5uHVfmmd2'
      )
    })
  })
})

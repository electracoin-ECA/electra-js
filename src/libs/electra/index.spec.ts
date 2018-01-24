// tslint:disable

import * as assert from 'assert'

import electra from '.'

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

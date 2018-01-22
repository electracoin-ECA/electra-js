// tslint:disable

import * as assert from 'assert'

import getCurrentPriceIn from './getCurrentPriceIn'

getCurrentPriceIn()

describe('utils/getCurrentPriceIn()', async function() {
  let usdPrice

  describe('WITH no parameter (= USD)', function() {
    it(`SHOULD return a number`, function(done) {
      getCurrentPriceIn().then(price => {
        usdPrice = price
        assert.strictEqual(typeof usdPrice, 'number')
        done()
      })
    })
  })

  describe('WITH "JPY" parameter', function() {
    it(`SHOULD return a different number`, function(done) {
      getCurrentPriceIn('JPY').then(eurPrice => {
        assert.strictEqual(typeof eurPrice, 'number')
        assert.notStrictEqual(eurPrice, usdPrice)
        done()
      })
    })
  })
})

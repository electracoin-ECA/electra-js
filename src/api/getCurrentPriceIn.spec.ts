// tslint:disable

import * as assert from 'assert'

import getCurrentPriceIn from './getCurrentPriceIn'

getCurrentPriceIn()

describe('api/getCurrentPriceIn()', async function() {
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

  describe('WITH "EUR" parameter', function() {
    it(`SHOULD return a different number`, function(done) {
      getCurrentPriceIn('EUR').then(eurPrice => {
        assert.strictEqual(typeof eurPrice, 'number')
        assert.notStrictEqual(eurPrice, usdPrice)
        done()
      })
    })
  })
})

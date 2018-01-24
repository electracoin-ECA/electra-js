// tslint:disable

import * as assert from 'assert'

import getCurrentPriceIn from './getCurrentPriceIn'

getCurrentPriceIn()

describe('utils/getCurrentPriceIn()', async function() {
  let usdPrice

  it(`SHOULD return a number with no parameter (= USD)`, function(done) {
    getCurrentPriceIn().then(price => {
      usdPrice = price
      assert.strictEqual(typeof usdPrice, 'number')
      done()
    })
  })

  it(`SHOULD return a different number with "JPY" parameter`, function(done) {
    getCurrentPriceIn('JPY').then(eurPrice => {
      assert.strictEqual(typeof eurPrice, 'number')
      assert.notStrictEqual(eurPrice, usdPrice)
      done()
    })
  })
})

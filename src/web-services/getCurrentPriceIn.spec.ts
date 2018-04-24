// tslint:disable

import * as assert from 'assert'

import getCurrentPriceIn from './getCurrentPriceIn'

describe('webServices#getCurrentPriceIn()', async function() {
  // let usdPrice
  // let btcPrice

  it(`SHOULD return a number greater than 0 with no parameter (= "usd")`, async function() {
    const res = await getCurrentPriceIn()
    assert.strictEqual(typeof res.price, 'number')
    assert.strictEqual(res.price > 0, true)
    assert.strictEqual(typeof res.priceInBtc, 'number')
    assert.strictEqual(res.priceInBtc > 0, true)
  })

  // it(`SHOULD return the same number with "USD" parameter`, async function () {
  //   assert.strictEqual(await getCurrentPriceIn('USD'), usdPrice)
  // })

  // it(`SHOULD return a different number with "BTC" parameter`, async function () {
  //   btcPrice = await getCurrentPriceIn('BTC')
  //   assert.strictEqual(typeof btcPrice, 'number')
  //   assert.notStrictEqual(btcPrice, usdPrice)
  // })
})

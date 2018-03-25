// tslint:disable

import * as assert from 'assert'

import getCurrentPriceIn from './getCurrentPriceIn'

describe('webServices#getCurrentPriceIn()', async function() {
  let usdPrice
  let btcPrice

  it(`SHOULD return a number with no parameter (= "USD")`, async function() {
    usdPrice = await getCurrentPriceIn()
    assert.strictEqual(typeof usdPrice, 'number')
  })

  it(`SHOULD return the same number with "USD" parameter`, async function () {
    assert.strictEqual(await getCurrentPriceIn('USD'), usdPrice)
  })

  it(`SHOULD return a different number with "BTC" parameter`, async function () {
    btcPrice = await getCurrentPriceIn('BTC')
    assert.strictEqual(typeof btcPrice, 'number')
    assert.notStrictEqual(btcPrice, usdPrice)
  })
})

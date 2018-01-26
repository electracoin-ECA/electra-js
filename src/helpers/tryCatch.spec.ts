// tslint:disable

import * as assert from 'assert'

import tryCatch from './tryCatch'

describe('helpers/tryCatch()', function() {
  const divideOneBy = (divisor: number) => {
    if (divisor === 0) throw new Error(`Can't divide by zero.`)

    return 1 / divisor
  }

  it(`SHOULD return the result`, function() {
    const [err, res] = tryCatch(() => divideOneBy(2))

    assert.strictEqual(err, undefined)
    assert.strictEqual(res, .5)
  })

  it(`SHOULD catch the Error`, function() {
    const [err, res] = tryCatch(() => divideOneBy(0))

    assert.strictEqual(err.message, `Can't divide by zero.`)
    assert.strictEqual(res, undefined)
  })
})

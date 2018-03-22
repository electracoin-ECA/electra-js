// tslint:disable

import * as assert from 'assert'

import ElectraJs from '..'

function testMethodType(name: string, method: Function): void {
  describe(`ElectraJs#${name}()`, function() {
    it('SHOULD be a method', function() {
      assert.strictEqual(typeof method, 'function')
    })
  })
}

describe('Typescript', function() {
  describe('Basics', function() {
    const electraJs = new ElectraJs({ isHard: true })

    testMethodType('getVersion', electraJs.getVersion)

    testMethodType('webServices#getCurrentPriceIn', electraJs.webServices.getCurrentPriceIn)
  })
})

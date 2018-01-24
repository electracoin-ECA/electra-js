const RPC_SERVER_AUTH = {
  username: 'user',
  password: 'pass'
}
const RPC_SERVER_URI = 'http://127.0.0.1:5788'

describe(`ElectraJs`, function() {
  const electraJs = new ElectraJs({
    rpcServerAuth: RPC_SERVER_AUTH,
    rpcServerUri: RPC_SERVER_URI
  })

  describe('#getVersion()', function() {
    it(`SHOULD return the expected string`, function() {
      assert.strictEqual(electraJs.getVersion(), '__ELECTRA-JS_VERSION__')
    })
  })

  describe(`#webServices`, function() {
    describe(`#getCurrentPriceIn()`, function() {
      let usdPrice

      it(`SHOULD return a number with no parameter (= USD)`, function(done) {
        electraJs.webServices.getCurrentPriceIn()
          .then(price => {
            usdPrice = price
            assert.strictEqual(typeof usdPrice, 'number')
            done()
          })
          .catch(done)
      })

      it(`SHOULD return a different number with "JPY" parameter`, function(done) {
        electraJs.webServices.getCurrentPriceIn('JPY')
          .then(eurPrice => {
            assert.strictEqual(typeof eurPrice === 'number' && !isNaN(eurPrice), true)
            assert.notStrictEqual(eurPrice, usdPrice)
            done()
          })
          .catch(done)
      })
    })
  })

  after(function() {
    // Used by Selenium WebDriver to detect the end of Mocha browser tests
    // @see index.ts
    document.title += ' - Done'
  })
})

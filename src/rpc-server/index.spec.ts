// tslint:disable

import * as assert from 'assert'
import * as crypto from 'crypto'

import RpcServer from '.'

const RPC_SERVER_AUTH = {
  username: 'user',
  password: 'pass'
}
const RPC_SERVER_URI = 'http://127.0.0.1:5788'

describe('RpcServer', function() {
  // We skip the wallet tests in Travis CI for now
  // TODO Integrate an Electra core build in Travis CI
  if (process.env.NODE_ENV === 'travis') return

  const testAccount = 'Main'
  let testAddress: string
  let rpcServer: RpcServer

  before(async function() {
    rpcServer = new RpcServer(RPC_SERVER_URI, RPC_SERVER_AUTH)
    testAddress = (await rpcServer.listReceivedByAddress())
      .filter(address => address.account === 'Main')
      [0].address
  })

  describe('#check()', function() {
    it(`SHOULD succesfully check the wallet`, async function() {
      const res = await rpcServer.check()
      assert.strictEqual(res['wallet check passed'], true)
    })
  })

  describe('#getAccount()', function() {
    it(`SHOULD return "${testAccount}" with my "${testAccount}" account address`, async function() {
      const account = await rpcServer.getAccount(testAddress)
      assert.strictEqual(account, testAccount)
    })
  })

  describe('#getBalance()', function() {
    it(`SHOULD return a number`, async function() {
      const balance = await rpcServer.getBalance()
      assert.strictEqual(typeof balance, 'number')
    })
  })

  describe('#getDifficulty()', function() {
    it(`SHOULD return the expected types`, async function() {
      const difficulty = await rpcServer.getDifficulty()
      assert.strictEqual(typeof difficulty['proof-of-work'], 'number')
      assert.strictEqual(typeof difficulty['proof-of-stake'], 'number')
      assert.strictEqual(typeof difficulty['search-interval'], 'number')
    })
  })

  describe('#getInfo()', function() {
    it(`SHOULD return the expected types`, async function() {
      const info = await rpcServer.getInfo()
      assert.strictEqual(typeof info.version, 'string')
      assert.strictEqual(typeof info.protocolversion, 'number')
      assert.strictEqual(typeof info.walletversion, 'number')
      assert.strictEqual(typeof info.balance, 'number')
      assert.strictEqual(typeof info.newmint, 'number')
      assert.strictEqual(typeof info.stake, 'number')
      assert.strictEqual(typeof info.blocks, 'number')
      assert.strictEqual(typeof info.timeoffset, 'number')
      assert.strictEqual(typeof info.moneysupply, 'number')
      assert.strictEqual(typeof info.connections, 'number')
      assert.strictEqual(typeof info.proxy, 'string')
      assert.strictEqual(typeof info.ip, 'string')
      assert.strictEqual(typeof info.difficulty['proof-of-work'], 'number')
      assert.strictEqual(typeof info.difficulty['proof-of-stake'], 'number')
      assert.strictEqual(typeof info.testnet, 'boolean')
      assert.strictEqual(typeof info.keypoololdest, 'number')
      assert.strictEqual(typeof info.keypoolsize, 'number')
      assert.strictEqual(typeof info.paytxfee, 'number')
      assert.strictEqual(typeof info.mininput, 'number')
      assert.strictEqual(typeof info.unlocked_until, 'number')
      assert.strictEqual(typeof info.errors, 'string')
    })
  })

  describe('#getNewAddress()', function() {
    it.skip(`SHOULD return a string`, async function() {
      const newAddress = await rpcServer.getNewAddress()
      assert.strictEqual(typeof newAddress, 'string')
    })

    const account = crypto.randomBytes(20).toString('hex')
    it.skip(`SHOULD create an address labeled "${account}"`, async function() {
      await rpcServer.getNewAddress(account)
      const res = await rpcServer.listReceivedByAddress(1, true)
      assert.notStrictEqual(res.filter(address => address.account === account).length, 0)
    })
  })

  describe('#listAddressGroupings()', function() {
    it(`SHOULD return the expected types`, async function() {
      const res = await rpcServer.listAddressGroupings()
      assert.strictEqual(typeof res[0][0][0], 'string')
      assert.strictEqual(typeof res[0][0][1], 'number')
      assert.strictEqual(typeof res[0][0][2], 'string')
    })
  })

  describe('#listReceivedByAddress()', function() {
    it(`SHOULD return the expected types`, async function() {
      const res = await rpcServer.listReceivedByAddress()
      assert.strictEqual(typeof res[0].address, 'string')
      assert.strictEqual(typeof res[0].account, 'string')
      assert.strictEqual(typeof res[0].amount, 'number')
      assert.strictEqual(typeof res[0].confirmations, 'number')
    })
  })

  describe('#listTransactions()', function() {
    it(`SHOULD return the expected types`, async function() {
      const transactions = await rpcServer.listTransactions()
      assert.strictEqual(typeof transactions[0].account, 'string')
      assert.strictEqual(typeof transactions[0].address, 'string')
      assert.strictEqual(typeof transactions[0].category, 'string')
      assert.strictEqual(typeof transactions[0].confirmations, 'number')
      assert.strictEqual(typeof transactions[0].blockhash, 'string')
      assert.strictEqual(typeof transactions[0].blockindex, 'number')
      assert.strictEqual(typeof transactions[0].blocktime, 'number')
      assert.strictEqual(typeof transactions[0].txid, 'string')
      assert.strictEqual(typeof transactions[0].time, 'number')
      assert.strictEqual(typeof transactions[0].timereceived, 'number')
    })

    it(`SHOULD all be related to "${testAccount}" account`, async function() {
      const transactions = await rpcServer.listTransactions(testAccount)
      assert.strictEqual(
        transactions.length,
        transactions.filter(transaction => transaction.account === testAccount).length
      )
    })
  })

  describe('#listUnspent()', function() {
    it(`SHOULD return the expected types`, async function() {
      const transactions = await rpcServer.listUnspent()
      assert.strictEqual(typeof transactions[0].txid, 'string')
      assert.strictEqual(typeof transactions[0].vout, 'number')
      assert.strictEqual(typeof transactions[0].address, 'string')
      assert.strictEqual(typeof transactions[0].account, 'string')
      assert.strictEqual(typeof transactions[0].scriptPubKey, 'string')
      assert.strictEqual(typeof transactions[0].amount, 'number')
      assert.strictEqual(typeof transactions[0].confirmations, 'number')
    })
  })

  describe('#makeKeyPair()', function() {
    it(`SHOULD return the expected strings and lengths`, async function() {
      const keyPair = await rpcServer.makeKeyPair()
      assert.strictEqual(typeof keyPair.PrivateKey, 'string')
      assert.strictEqual(typeof keyPair.PublicKey, 'string')
      assert.strictEqual(keyPair.PrivateKey.length, 558)
      assert.strictEqual(keyPair.PublicKey.length, 130)
    })
  })

  describe('#validateAddress()', function() {
    it(`SHOULD return the expected result with my "${testAccount}" account address`, async function() {
      const info = await rpcServer.validateAddress(testAddress)
      assert.strictEqual(info.isvalid, true)
      assert.strictEqual(info.address, testAddress)
      assert.strictEqual(info.ismine, true)
      assert.strictEqual(info.isscript, false)
      assert.strictEqual(typeof info.pubkey, 'string')
      assert.strictEqual(info.iscompressed, true)
      assert.strictEqual(info.account, testAccount)
    })

    const fakeAddress = 'ERgSYfQ3xySNcZDwsVeyWW3XpfLAhj3fzT'
    it(`SHOULD return isvalid as FALSE with '${fakeAddress}' address`, async function() {
      const info = await rpcServer.validateAddress(fakeAddress)
      assert.strictEqual(info.isvalid, false)
    })
  })

  describe('#validatePublicKey()', function() {
    it(`SHOULD return the expected result with a valid public key`, async function() {
      const publicKey = [
        '04dbc8fe17d5214b4ed9ec1250db65091c0f1e988b27de0984967812cf2eb6107',
        'b4d95d890956eeb1510bec969e0e8b64bbdb3dd2374ddf81fbb1855d742c6470c'
      ].join('')
      const info = await rpcServer.validatePublicKey(publicKey)
      assert.strictEqual(info.isvalid, true)
      assert.strictEqual(info.address, 'EHQXmjpWxbw7BvCX4CBp6XfSHxaAe6YAFw')
      assert.strictEqual(info.ismine, false)
      assert.strictEqual(info.iscompressed, false)
    })

    it(`SHOULD return isvalid as FALSE with a fake public key`, async function() {
      const info = await rpcServer.validatePublicKey('1234567890abcdef')
      assert.strictEqual(info.isvalid, false)
    })
  })
})

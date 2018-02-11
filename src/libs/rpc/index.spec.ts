// tslint:disable

import * as assert from 'assert'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'

import Rpc from '.'

// Loads ".env" variables into process.env properties
dotenv.config()

const {
  RPC_SERVER_PASSWORD_TEST,
  RPC_SERVER_URI_TEST,
  RPC_SERVER_USERNAME_TEST,
} = process.env

if (([
  RPC_SERVER_PASSWORD_TEST,
  RPC_SERVER_URI_TEST,
  RPC_SERVER_USERNAME_TEST,
] as any).includes(undefined)) {
  console.error('Error: You forgot to fill value(s) in your ".env" test wallet data. Please check ".env.sample".')
  process.exit(1)
}

describe('Rpc', function() {
  let testAccount: string
  let testAddress: string
  let rpc: Rpc

  // We skip the wallet tests in Travis CI for now
  // TODO Integrate an Electra core build in Travis CI
  before(async function() {
    if (process.env.NODE_ENV === 'travis') this.skip()

    rpc = new Rpc(RPC_SERVER_URI_TEST, {
      username: RPC_SERVER_USERNAME_TEST,
      password: RPC_SERVER_PASSWORD_TEST
    })
    const address = (await rpc.listReceivedByAddress())
      .filter(address => address.amount > 0)
      [0]
    testAccount = address.account
    testAddress = address.address
  })
  beforeEach(function() {
    if (process.env.NODE_ENV === 'travis') this.skip()
  })

  describe('#check()', function() {
    it(`SHOULD succesfully check the wallet`, async function() {
      const res = await rpc.check()
      assert.strictEqual(res['wallet check passed'], true)
    })
  })

  describe('#getAccount()', function() {
    it(`SHOULD return "${testAccount}" with my "${testAccount}" account address`, async function() {
      const account = await rpc.getAccount(testAddress)
      assert.strictEqual(account, testAccount)
    })
  })

  describe('#getBalance()', function() {
    it(`SHOULD return a number`, async function() {
      const balance = await rpc.getBalance()
      assert.strictEqual(typeof balance, 'number')
    })
  })

  describe('#getDifficulty()', function() {
    it(`SHOULD return the expected types`, async function() {
      const difficulty = await rpc.getDifficulty()
      assert.strictEqual(typeof difficulty['proof-of-work'], 'number')
      assert.strictEqual(typeof difficulty['proof-of-stake'], 'number')
      assert.strictEqual(typeof difficulty['search-interval'], 'number')
    })
  })

  describe('#getInfo()', function() {
    it(`SHOULD return the expected types`, async function() {
      const info = await rpc.getInfo()
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
      const newAddress = await rpc.getNewAddress()
      assert.strictEqual(typeof newAddress, 'string')
    })

    const account = crypto.randomBytes(20).toString('hex')
    it.skip(`SHOULD create an address labeled "${account}"`, async function() {
      await rpc.getNewAddress(account)
      const res = await rpc.listReceivedByAddress(1, true)
      assert.notStrictEqual(res.filter(address => address.account === account).length, 0)
    })
  })

  describe('#listAddressGroupings()', function() {
    it(`SHOULD return the expected types`, async function() {
      const res = await rpc.listAddressGroupings()
      assert.strictEqual(typeof res[0][0][0], 'string')
      assert.strictEqual(typeof res[0][0][1], 'number')
      assert.strictEqual(typeof res[0][0][2], 'string')
    })
  })

  describe('#listReceivedByAddress()', function() {
    it(`SHOULD return the expected types`, async function() {
      const res = await rpc.listReceivedByAddress()
      assert.strictEqual(typeof res[0].address, 'string')
      assert.strictEqual(typeof res[0].account, 'string')
      assert.strictEqual(typeof res[0].amount, 'number')
      assert.strictEqual(typeof res[0].confirmations, 'number')
    })
  })

  describe('#listTransactions()', function() {
    it(`SHOULD return the expected types`, async function() {
      const transactions = await rpc.listTransactions()
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
      const transactions = await rpc.listTransactions(testAccount)
      assert.strictEqual(
        transactions.length,
        transactions.filter(transaction => transaction.account === testAccount).length
      )
    })
  })

  describe('#listUnspent()', function() {
    it(`SHOULD return the expected types`, async function() {
      const transactions = await rpc.listUnspent()
      assert.strictEqual(typeof transactions[0].txid, 'string')
      assert.strictEqual(typeof transactions[0].vout, 'number')
      assert.strictEqual(typeof transactions[0].address, 'string')
      assert.strictEqual(typeof transactions[0].scriptPubKey, 'string')
      assert.strictEqual(typeof transactions[0].amount, 'number')
      assert.strictEqual(typeof transactions[0].confirmations, 'number')
    })
  })

  describe('#makeKeyPair()', function() {
    it(`SHOULD return the expected strings and lengths`, async function() {
      const keyPair = await rpc.makeKeyPair()
      assert.strictEqual(typeof keyPair.PrivateKey, 'string')
      assert.strictEqual(typeof keyPair.PublicKey, 'string')
      assert.strictEqual(keyPair.PrivateKey.length, 558)
      assert.strictEqual(keyPair.PublicKey.length, 130)
    })
  })

  describe('#validateAddress()', function() {
    it(`SHOULD return the expected result with my "${testAccount}" account address`, async function() {
      const info = await rpc.validateAddress(testAddress)
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
      const info = await rpc.validateAddress(fakeAddress)
      assert.strictEqual(info.isvalid, false)
    })
  })

  describe('#validatePublicKey()', function() {
    it(`SHOULD return the expected result with a valid public key`, async function() {
      const publicKey = [
        '04dbc8fe17d5214b4ed9ec1250db65091c0f1e988b27de0984967812cf2eb6107',
        'b4d95d890956eeb1510bec969e0e8b64bbdb3dd2374ddf81fbb1855d742c6470c'
      ].join('')
      const info = await rpc.validatePublicKey(publicKey)
      assert.strictEqual(info.isvalid, true)
      assert.strictEqual(info.address, 'EHQXmjpWxbw7BvCX4CBp6XfSHxaAe6YAFw')
      assert.strictEqual(info.ismine, false)
      assert.strictEqual(info.iscompressed, false)
    })

    it(`SHOULD return isvalid as FALSE with a fake public key`, async function() {
      const info = await rpc.validatePublicKey('1234567890abcdef')
      assert.strictEqual(info.isvalid, false)
    })
  })
})

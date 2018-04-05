// tslint:disable

import * as assert from 'assert'
import * as bip39 from 'bip39'
import chalk from 'chalk'
import * as childProcess from 'child_process'
import * as dotenv from 'dotenv'
import * as extractZip from 'extract-zip'
import * as fs from 'fs'
import * as path from 'path'
import * as ProgressBar from 'progress'
import * as rimraf from 'rimraf'

import WalletHard from '.'
import { DAEMON_USER_DIR_PATH } from '../../constants'
import assertCatch from '../../helpers/assertCatch'
import assertThen from '../../helpers/assertThen'
import closeElectraDaemons from '../../helpers/closeElectraDaemons'
import wait from '../../helpers/wait'
import Electra from '../../libs/electra/index'

// Loads ".env" variables into process.env properties
dotenv.config()

const {
  HD_CHAIN_1_HASH_TEST,
  HD_CHAIN_1_PRIVATE_KEY_TEST,
  HD_CHAIN_2_HASH_TEST,
  HD_CHAIN_2_PRIVATE_KEY_TEST,
  HD_MASTER_NODE_HASH_TEST,
  HD_MASTER_NODE_PRIVATE_KEY_TEST,
  HD_MNEMONIC_EXTENSION_TEST,
  HD_MNEMONIC_TEST,
  HD_PASSPHRASE_TEST,
  HD_TRANSACTION_TEST,
  RANDOM_ADDRESS_HASH_TEST,
  RANDOM_ADDRESS_PRIVATE_KEY_TEST,
  RPC_SERVER_PASSWORD_TEST,
  RPC_SERVER_URI_TEST,
  RPC_SERVER_USERNAME_TEST,
} = process.env

const TEST_AMOUNT = 0.00001

// This HD wallet i seeded by the same wallet mnemonic than the one above, but without the mnemonic extension.
// As a result, the generated private keys are different and listed here.
export const HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST = {
  chains: [
    { hash: 'EfpfV1KAyq89icrxrXVaDh4E75hVNmFuJT', privateKey: 'Qwny9NruQytsQQe71njNZg4LS7UY2CFjUdCxB32vrbuHdgQatHxY' },
    { hash: 'EdEaaVZtasPnzgDTKZQkAqLWSGQq6W5xW4', privateKey: 'QqcsbxDZ5rnbkNmFcBLPPbwniyk9CrYPa6NHnFpZ8LBwsNE8BJT2' }
  ],
  masterNode: {
    hash: 'ETzng9niv9Wpjak2LGKG1Q39JjYLsxXQxy',
    privateKey: 'Qr7N5u52BAUJSk7W4NVS9G9YLG6XE66HRZhcbPJRv6U9jmcyyXaF'
  },
}

if (([
  HD_CHAIN_1_HASH_TEST,
  HD_CHAIN_1_PRIVATE_KEY_TEST,
  HD_CHAIN_2_HASH_TEST,
  HD_CHAIN_2_PRIVATE_KEY_TEST,
  HD_MASTER_NODE_HASH_TEST,
  HD_MASTER_NODE_PRIVATE_KEY_TEST,
  HD_MNEMONIC_EXTENSION_TEST,
  HD_MNEMONIC_TEST,
  HD_PASSPHRASE_TEST,
  RANDOM_ADDRESS_HASH_TEST,
  RANDOM_ADDRESS_PRIVATE_KEY_TEST,
  RPC_SERVER_PASSWORD_TEST,
  RPC_SERVER_URI_TEST,
  RPC_SERVER_USERNAME_TEST,
] as any).includes(undefined)) {
  console.error('Error: You forgot to fill value(s) in your ".env" test wallet data. Please check ".env.sample".')
  process.exit(1)
}

describe('Wallet (hard)', function() {
  let wallet: WalletHard

  this.timeout(30000)

  before(async function() {
    // Close potential already running daemons
    console.log(chalk.green('    ♦ Closing Electra daemons...'))
    await closeElectraDaemons()

    // Remove the daemon user directory to simulate a brand new installation
    console.log(chalk.green('    ♦ Removing Electra daemon user directory...'))
    rimraf.sync(DAEMON_USER_DIR_PATH)

    await wait(1000)

    console.log(chalk.green('    ♦ Copying stored blockchain data...'))
    await new Promise(resolve => {
      // Copy the blockchain data
      extractZip(
        path.resolve(process.cwd(), `test/data/Electra-${process.platform}.zip`),
        { dir: path.resolve(DAEMON_USER_DIR_PATH, '..') },
        resolve
      )
    })
  })

  describe(`WHEN instantiating a new wallet WITH an RPC Server`, function() {
    it(`new Wallet() SHOULD NOT throw any error`, () => assert.doesNotThrow(() => wallet = new WalletHard()))
  })

  describe(`AFTER instantiating this new wallet`, function() {
    it(`#addresses SHOULD throw an error`, () => assert.throws(() => wallet.addresses))
    it(`#allAddresses SHOULD throw an error`, () => assert.throws(() => wallet.allAddresses))
    it(`#daemonState SHOULD be "STOPPED"`, () => assert.strictEqual(wallet.daemonState, 'STOPPED'))
    it(`#isNew SHOULD be FALSE`, () => assert.strictEqual(wallet.isNew, false))
    it(`#lockState SHOULD throw an error`, () => assert.throws(() => wallet.lockState))
    it(`#mnemonic SHOULD throw an error`, () => assert.throws(() => wallet.mnemonic))
    it(`#randomAddresses SHOULD throw an error`, () => assert.throws(() => wallet.randomAddresses))
    it(`#state SHOULD be "EMPTY"`, () => assert.strictEqual(wallet.state, 'EMPTY'))

    // it(`#import() SHOULD throw an error`, () => assert.throws(() => wallet.import(`[2,2,"",[]]`, HD_PASSPHRASE_TEST)))
    it(`#createAddress() SHOULD throw an error`, async () => await assertCatch(() => wallet.createAddress()))
    it(`#export() SHOULD throw an error`, () => assert.throws(() => wallet.export()))
    it(`#getBalance() SHOULD throw an error`, async () => await assertCatch(() => wallet.getBalance()))
    it(`#getInfo() SHOULD throw an error`, async () => await assertCatch(() => wallet.getInfo()))
    it(`#getTransaction() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransaction(HD_TRANSACTION_TEST)))
    it(`#getTransactions() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransactions()))
    it(`#lock() SHOULD throw an error`, async () => await assertCatch(() => wallet.lock()))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_1_HASH_TEST)))
    it(`#unlock() SHOULD throw an error`, async () => await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)))
  })

  describe(`WHEN starting the same wallet deamon`, function() {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.startDaemon()))
  })

  describe(`AFTER starting the same wallet deamon`, function() {
    it(`#daemonState SHOULD be "STARTED"`, () => assert.strictEqual(wallet.daemonState, 'STARTED'))
    it(`#isNew SHOULD be FALSE`, () => assert.strictEqual(wallet.isNew, false))

    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
  })

  describe(`WHEN generating the same wallet WITH <mnemonic>, <mnemonicExtension>, <chainsCount>`, function() {
    it(`#generate() SHOULD NOT throw any error`, async () =>
      await assertThen(() => wallet.generate(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST, 2)))
  })

  describe(`AFTER generating the same wallet`, function() {
    it(`#state SHOULD be "READY"`, () => assert.strictEqual(wallet.state, 'READY'))

    it(`#addresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.addresses), true))
    it(`#addresses SHOULD contain 2 addresses`, () => assert.strictEqual(wallet.addresses.length, 2))
    // it(`#addresses first address SHOULD be resolvable`, () =>
    //   assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey)))
    // it(`#addresses first address private key SHOULD be the expected one`, () =>
    //   assert.strictEqual(wallet.addresses[0].privateKey, HD_CHAIN_1_PRIVATE_KEY_TEST))
    it(`#addresses first address hash SHOULD be the expected one`, () =>
      assert.strictEqual(wallet.addresses[0].hash, HD_CHAIN_1_HASH_TEST))
    // it(`#addresses second address SHOULD be resolvable`, () =>
    //   assert.strictEqual(wallet.addresses[1].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[1].privateKey)))
    // it(`#addresses second address private key SHOULD be the expected one`, () =>
    //   assert.strictEqual(wallet.addresses[1].privateKey, HD_CHAIN_2_PRIVATE_KEY_TEST))
    it(`#addresses second address hash SHOULD be the expected one`, () =>
      assert.strictEqual(wallet.addresses[1].hash, HD_CHAIN_2_HASH_TEST))
    it(`#allAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.allAddresses), true))
    it(`#allAddresses SHOULD contain at least 2 addresses`, () => assert.strictEqual(wallet.allAddresses.length, 2))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#mnemonic SHOULD throw an error`, () => assert.throws(() => wallet.mnemonic))
    it(`#randomAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.randomAddresses), true))

    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST)))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST)))
    it(`#unlock(<forStakingOnly=FALSE>) SHOULD not throw any error`, async () =>
      await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))

    it.skip(`#send() SHOULD NOT throw any error`, async () => {
      await assertThen(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST))
      await assertThen(() => wallet.send(TEST_AMOUNT, HD_CHAIN_1_HASH_TEST))
    })

    it(`#generate() SHOULD throw an error`, async () => await assertCatch(() => wallet.generate()))
  })

  describe(`WHILE downloading the blockchain`, function() {
    this.timeout(3600000)

    it(`#getInfo() SHOULD NOT throw any error`, async () => {
      let info
      let localBlockchainHeight = 0
      let networkBlockchainHeight = 0

      console.log(chalk.green('      ♦ Waiting for peers connection...'))
      while (networkBlockchainHeight <= 0) {
        await wait(250)
        info = await wallet.getInfo()
        networkBlockchainHeight = info.networkBlockchainHeight
      }

      var bar = new ProgressBar(chalk.green('      ♦ Downloading blockchain [:bar] :rate/bps :percent :etas'), {
        clear: true,
        complete: '█',
        incomplete: '-',
        width: 20,
        total: networkBlockchainHeight - localBlockchainHeight
      })

      while (info.localBlockchainHeight < networkBlockchainHeight) {
        await wait(250)
        info = await wallet.getInfo()
        bar.tick(info.localBlockchainHeight - localBlockchainHeight)
        localBlockchainHeight = info.localBlockchainHeight
      }

      assert.ok(true)
    })
  })

  describe(`AFTER downloading the blockchain`, function() {
    it(`#getTransactions() SHOULD return an array with a length greater than 0`, async () =>
      assert.strictEqual((await wallet.getTransactions()).length > 0, true))
    it(`#getBalance() SHOULD return a confirmed balanced greater than 0`, async () =>
      assert.strictEqual((await wallet.getBalance()).confirmed > 0, true))
  })

  describe(`WHEN creating a new address`, function() {
    it(`#createAddress() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.createAddress()))
  })

  describe(`AFTER creating a new address`, function() {
    it(`#addresses SHOULD contain 3 addresses`, () => assert.strictEqual(wallet.addresses.length, 3))
    it(`#allAddresses SHOULD contain 3 addresses`, () => assert.strictEqual(wallet.allAddresses.length, 3))
  })

  describe(`WHEN stopping the same wallet deamon`, function() {
    it(`#stopDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.stopDaemon()))
  })

  describe(`AFTER stopping the same wallet deamon`, function() {
    it(`#state SHOULD be "STOPPED"`, () => assert.strictEqual(wallet.daemonState, 'STOPPED'))
  })
})

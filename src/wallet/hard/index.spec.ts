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
import { WalletAddressCategory } from '../types'

// Loads ".env" variables into process.env properties
dotenv.config()

const {
  HD_PURSE_1_EXTERNAL_HASH_TEST,
  HD_PURSE_1_EXTERNAL_PK_TEST,
  HD_PURSE_1_CHANGE_HASH_TEST,
  HD_PURSE_1_CHANGE_PK_TEST,
  HD_PURSE_2_EXTERNAL_HASH_TEST,
  HD_PURSE_2_EXTERNAL_PK_TEST,
  HD_PURSE_2_CHANGE_HASH_TEST,
  HD_PURSE_2_CHANGE_PK_TEST,
  HD_CHECKING_1_EXTERNAL_HASH_TEST,
  HD_CHECKING_1_EXTERNAL_PK_TEST,
  HD_CHECKING_1_CHANGE_HASH_TEST,
  HD_CHECKING_1_CHANGE_PK_TEST,
  HD_CHECKING_2_EXTERNAL_HASH_TEST,
  HD_CHECKING_2_EXTERNAL_PK_TEST,
  HD_CHECKING_2_CHANGE_HASH_TEST,
  HD_CHECKING_2_CHANGE_PK_TEST,
  HD_SAVINGS_1_EXTERNAL_HASH_TEST,
  HD_SAVINGS_1_EXTERNAL_PK_TEST,
  HD_SAVINGS_1_CHANGE_HASH_TEST,
  HD_SAVINGS_1_CHANGE_PK_TEST,
  HD_SAVINGS_2_EXTERNAL_HASH_TEST,
  HD_SAVINGS_2_EXTERNAL_PK_TEST,
  HD_SAVINGS_2_CHANGE_HASH_TEST,
  HD_SAVINGS_2_CHANGE_PK_TEST,

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

describe.only('Wallet (hard)', function() {
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
    it(`#createAddress() SHOULD throw an error`, async () => await assertCatch(() => wallet.createAddress(WalletAddressCategory.PURSE)))
    it(`#export() SHOULD throw an error`, () => assert.throws(() => wallet.export()))
    it(`#getBalance() SHOULD throw an error`, async () => await assertCatch(() => wallet.getBalance()))
    it(`#getInfo() SHOULD throw an error`, async () => await assertCatch(() => wallet.getInfo()))
    it(`#getTransaction() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransaction(HD_TRANSACTION_TEST)))
    it(`#getTransactions() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransactions()))
    it(`#lock() SHOULD throw an error`, async () => await assertCatch(() => wallet.lock()))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHECKING_1_EXTERNAL_HASH_TEST)))
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
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
  })

  describe(`WHEN starting (again) the same wallet deamon`, function() {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.startDaemon()))
  })

  describe(`AFTER starting (again) the same wallet deamon`, function() {
    it(`#daemonState SHOULD be "STARTED"`, () => assert.strictEqual(wallet.daemonState, 'STARTED'))
    it(`#isNew SHOULD be FALSE`, () => assert.strictEqual(wallet.isNew, false))

    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
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
      await assertThen(() => wallet.generate(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST, 2, 2, 2)))
  })

  describe(`AFTER generating the same wallet`, function() {
    it(`#state SHOULD be "READY"`, () => assert.strictEqual(wallet.state, 'READY'))

    it(`#addresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.addresses), true))
    it(`#addresses SHOULD contain 6 addresses`, () => assert.strictEqual(wallet.addresses.length, 6))
    it(`#addresses first address hash SHOULD be the expected one`, () =>
      assert.strictEqual(wallet.addresses[0].hash, HD_PURSE_1_EXTERNAL_HASH_TEST))
    it(`#addresses second address hash SHOULD be the expected one`, () =>
      assert.strictEqual(wallet.addresses[1].hash, HD_PURSE_2_EXTERNAL_HASH_TEST))
    it(`#allAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.allAddresses), true))
    it(`#allAddresses SHOULD contain 6 addresses`, () => assert.strictEqual(wallet.allAddresses.length, 6))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#mnemonic SHOULD throw an error`, () => assert.throws(() => wallet.mnemonic))
    it(`#randomAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.randomAddresses), true))

    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHECKING_2_EXTERNAL_HASH_TEST)))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHECKING_1_EXTERNAL_HASH_TEST)))
    it(`#unlock(<forStakingOnly=FALSE>) SHOULD not throw any error`, async () =>
      await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))

    it.skip(`#send() SHOULD NOT throw any error`, async () => {
      await assertThen(() => wallet.send(TEST_AMOUNT, HD_CHECKING_2_EXTERNAL_HASH_TEST))
      await assertThen(() => wallet.send(TEST_AMOUNT, HD_CHECKING_1_EXTERNAL_HASH_TEST))
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

  describe.skip(`AFTER downloading the blockchain`, function() {
    it(`#getTransactions() SHOULD return an array with a length greater than 0`, async () =>
      assert.strictEqual((await wallet.getTransactions()).length > 0, true))
    it(`#getBalance() SHOULD return a confirmed balanced greater than 0`, async () =>
      assert.strictEqual((await wallet.getBalance()).confirmed > 0, true))
  })

  describe(`WHEN creating a new address`, function() {
    it(`#createAddress() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.createAddress(WalletAddressCategory.PURSE)))
  })

  describe(`AFTER creating a new address`, function() {
    it(`#addresses SHOULD contain 7 addresses`, () => assert.strictEqual(wallet.addresses.length, 7))
    it(`#allAddresses SHOULD contain 7 addresses`, () => assert.strictEqual(wallet.allAddresses.length, 7))
  })

  describe(`WHEN starting the same wallet`, function () {
    it(`#start() SHOULD throw an error`, () => assert.throws(() => wallet.start({
      addresses: [],
      masterNodeAddress: {
        category: null,
        hash: HD_MASTER_NODE_HASH_TEST,
        isCiphered: false,
        isHD: true,
        label: '',
        privateKey: HD_MASTER_NODE_PRIVATE_KEY_TEST,
      },
      randomAddresses: []
    })))
  })

  describe(`WHEN resetting the same wallet`, function () {
    it(`#reset() SHOULD NOT throw any error`, () => assert.doesNotThrow(() => wallet.reset()))
  })

  describe(`AFTER resetting the same wallet`, function () {
    it(`#state SHOULD be "EMPTY"`, () => assert.strictEqual(wallet.state, 'EMPTY'))
  })

  describe(`WHEN starting the same wallet`, function () {
    it(`#start() SHOULD NOT throw any error`, () => assert.doesNotThrow(() => wallet.start({
      addresses: [],
      masterNodeAddress: {
        category: null,
        hash: HD_MASTER_NODE_HASH_TEST,
        isCiphered: false,
        isHD: true,
        label: '',
        privateKey: HD_MASTER_NODE_PRIVATE_KEY_TEST,
      },
      randomAddresses: []
    })))
  })

  describe(`WHEN starting (again) the same wallet deamon`, function () {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.startDaemon()))
  })

  describe(`AFTER starting (again) the same wallet deamon`, function () {
    it(`#daemonState SHOULD be "STARTED"`, () => assert.strictEqual(wallet.daemonState, 'STARTED'))
    it(`#isNew SHOULD be FALSE`, () => assert.strictEqual(wallet.isNew, false))

    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
  })

  describe(`WHEN stopping the same wallet deamon`, function() {
    it(`#stopDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.stopDaemon()))
  })

  describe(`AFTER stopping the same wallet deamon`, function() {
    it(`#state SHOULD be "STOPPED"`, () => assert.strictEqual(wallet.daemonState, 'STOPPED'))
  })
})

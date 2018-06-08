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
import { BINARIES_PATH, DAEMON_CONFIG_DEFAULT, DAEMON_USER_DIR_PATH } from '../../constants'
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
  HD_MASTER_NODE_PRIVATE_KEY_X_TEST,
  HD_MNEMONIC_EXTENSION_TEST,
  HD_MNEMONIC_TEST,
  HD_PASSPHRASE_TEST,
  HD_TRANSACTION_TEST,
  RANDOM_ADDRESS_HASH_TEST,
  RANDOM_ADDRESS_PRIVATE_KEY_TEST,
  RANDOM_ADDRESS_PRIVATE_KEY_X_TEST,
  RANDOM_CHANGE_HASH_TEST,
  RANDOM_CHANGE_PRIVATE_KEY_TEST,
  RANDOM_CHANGE_PRIVATE_KEY_X_TEST,
  RPC_SERVER_PASSWORD_TEST,
  RPC_SERVER_URI_TEST,
  RPC_SERVER_USERNAME_TEST,
} = process.env

const TEST_AMOUNT = 0.00003
const TEST_WEF = JSON.stringify([
  2,
  2,
  2,
  2,
  HD_MASTER_NODE_PRIVATE_KEY_X_TEST,
  [
    RANDOM_CHANGE_PRIVATE_KEY_X_TEST,
    RANDOM_ADDRESS_PRIVATE_KEY_X_TEST,
  ]
])

const START_DATA_TEST = {
  addresses: [
    {
      category: WalletAddressCategory.CHECKING,
      change: HD_CHECKING_1_CHANGE_HASH_TEST,
      hash: HD_CHECKING_1_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
    {
      category: WalletAddressCategory.CHECKING,
      change: HD_CHECKING_2_CHANGE_HASH_TEST,
      hash: HD_CHECKING_2_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
    {
      category: WalletAddressCategory.PURSE,
      change: HD_PURSE_1_CHANGE_HASH_TEST,
      hash: HD_PURSE_1_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
    {
      category: WalletAddressCategory.PURSE,
      change: HD_PURSE_2_CHANGE_HASH_TEST,
      hash: HD_PURSE_2_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
    {
      category: WalletAddressCategory.SAVINGS,
      change: HD_SAVINGS_1_CHANGE_HASH_TEST,
      hash: HD_SAVINGS_1_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
    {
      category: WalletAddressCategory.SAVINGS,
      change: HD_SAVINGS_2_CHANGE_HASH_TEST,
      hash: HD_SAVINGS_2_EXTERNAL_HASH_TEST,
      isHD: true,
      label: null,
    },
  ],
  masterNodeAddress: {
    hash: HD_MASTER_NODE_HASH_TEST,
    isCiphered: true,
    isHD: true,
    privateKey: HD_MASTER_NODE_PRIVATE_KEY_X_TEST,
  },
  randomAddresses: []
}

describe.skip('Wallet (hard)', function() {
  let wallet: WalletHard

  this.timeout(30000)

  before(async function() {
    // Close potential already running daemons
    console.log(chalk.green('    ♦ Closing Electra daemons...'))
    await closeElectraDaemons()
  })

  describe(`WHEN instantiating a new wallet WITH an RPC Server`, function() {
    it(`new Wallet() SHOULD NOT throw any error`, () => assert.doesNotThrow(() =>
      wallet = new WalletHard(BINARIES_PATH, DAEMON_CONFIG_DEFAULT)))
  })

  describe(`WHEN starting the same wallet deamon`, function() {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.startDaemon()))
  })

  describe(`WHEN starting the same wallet`, function () {
    it(`#start() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.start(START_DATA_TEST, HD_PASSPHRASE_TEST)))
  })

  describe(`AFTER starting the same wallet`, function() {
    it(`#getSavingsCumulatedRewards() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.getSavingsCumulatedRewards()))
  })

  describe(`WHEN stopping the same wallet deamon`, function() {
    it(`#stopDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.stopDaemon()))
  })
})

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
        path.resolve(process.cwd(), `test/data/electra-js-test-data-${process.platform}-${process.arch}.zip`),
        { dir: path.resolve(DAEMON_USER_DIR_PATH, '..') },
        resolve
      )
    })
  })

  describe(`WHEN instantiating a new wallet WITH an RPC Server`, function() {
    it(`new Wallet() SHOULD NOT throw any error`, () => assert.doesNotThrow(() =>
      wallet = new WalletHard(BINARIES_PATH, DAEMON_CONFIG_DEFAULT)))
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
    it(`#createAddress() SHOULD throw an error`, async () => await assertCatch(() => wallet.createAddress(HD_PASSPHRASE_TEST, WalletAddressCategory.PURSE)))
    it(`#export() SHOULD throw an error`, async () => await assertCatch(() => wallet.export(HD_PASSPHRASE_TEST)))
    it(`#getBalance() SHOULD throw an error`, async () => await assertCatch(() => wallet.getBalance()))
    it(`#getInfo() SHOULD throw an error`, async () => await assertCatch(() => wallet.getInfo()))
    it(`#getTransaction() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransaction(HD_TRANSACTION_TEST)))
    it(`#getTransactions() SHOULD throw an error`, async () => await assertCatch(() => wallet.getTransactions()))
    it(`#lock() SHOULD throw an error`, async () => await assertCatch(() => wallet.lock()))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, WalletAddressCategory.CHECKING, HD_CHECKING_1_EXTERNAL_HASH_TEST)))
    it(`#unlock() SHOULD throw an error`, async () => await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST, true)))
  })

  describe(`WHEN starting the same wallet deamon`, function() {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.startDaemon()))
  })

  describe(`AFTER starting the same wallet deamon`, function() {
    it(`#daemonState SHOULD be "STARTED"`, () => assert.strictEqual(wallet.daemonState, 'STARTED'))
    it(`#isNew SHOULD be FALSE`, () => assert.strictEqual(wallet.isNew, false))

    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, true)))
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
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, true)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
  })

  describe(`WHEN generating the same wallet WITH <mnemonic>, <mnemonicExtension>, <chainsCount>`, function() {
    this.timeout(360000)

    it(`#generate() SHOULD NOT throw any error`, async () =>
      await assertThen(() => wallet.generate(HD_PASSPHRASE_TEST, HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST, 2, 2, 2)))
  })

  describe(`AFTER generating the same wallet`, function() {
    it(`#state SHOULD be "READY"`, () => assert.strictEqual(wallet.state, 'READY'))

    it(`#addresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.addresses), true))
    it(`#addresses SHOULD contain 6 addresses`, () => assert.strictEqual(wallet.addresses.length, 6))
    it(`#allAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.allAddresses), true))
    it(`#allAddresses SHOULD contain at least 7 addresses`, () => assert.strictEqual(wallet.allAddresses.length >= 7, true))

    it(`#checkingAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.checkingAddresses), true))
    it(`#checkingAddresses SHOULD contain 2 addresses`, () => assert.strictEqual(wallet.checkingAddresses.length, 2))
    it(`#checkingAddresses first address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.checkingAddresses[0].hash, HD_CHECKING_1_EXTERNAL_HASH_TEST))
    it(`#checkingAddresses first change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.checkingAddresses[0].hash, HD_CHECKING_1_EXTERNAL_HASH_TEST))
    it(`#checkingAddresses second address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.checkingAddresses[1].change, HD_CHECKING_2_CHANGE_HASH_TEST))
    it(`#checkingAddresses second change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.checkingAddresses[1].change, HD_CHECKING_2_CHANGE_HASH_TEST))
    it(`#savingsAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.savingsAddresses), true))
    it(`#savingsAddresses SHOULD contain 2 addresses`, () => assert.strictEqual(wallet.savingsAddresses.length, 2))
    it(`#savingsAddresses first address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.savingsAddresses[0].hash, HD_SAVINGS_1_EXTERNAL_HASH_TEST))
    it(`#savingsAddresses second address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.savingsAddresses[1].hash, HD_SAVINGS_2_EXTERNAL_HASH_TEST))
    it(`#savingsAddresses first change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.savingsAddresses[0].change, HD_SAVINGS_1_CHANGE_HASH_TEST))
    it(`#savingsAddresses second change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.savingsAddresses[1].change, HD_SAVINGS_2_CHANGE_HASH_TEST))
    it(`#purseAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.purseAddresses), true))
    it(`#purseAddresses SHOULD contain 2 addresses`, () => assert.strictEqual(wallet.purseAddresses.length, 2))
    it(`#purseAddresses first address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.purseAddresses[0].hash, HD_PURSE_1_EXTERNAL_HASH_TEST))
    it(`#purseAddresses second address hash SHOULD be the expected one`, () => assert.strictEqual(wallet.purseAddresses[1].hash, HD_PURSE_2_EXTERNAL_HASH_TEST))
    it(`#purseAddresses first change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.purseAddresses[0].change, HD_PURSE_1_CHANGE_HASH_TEST))
    it(`#purseAddresses second change hash SHOULD be the expected one`, () => assert.strictEqual(wallet.purseAddresses[1].change, HD_PURSE_2_CHANGE_HASH_TEST))
    it(`#randomAddresses SHOULD be an array`, () => assert.strictEqual(Array.isArray(wallet.randomAddresses), true))
    it(`#randomAddresses SHOULD contain at least 1 address`, () => assert.strictEqual(wallet.randomAddresses.length >= 1, true))
    it(`#randomAddresses SHOULD contain ${RANDOM_ADDRESS_HASH_TEST}`, () => assert.strictEqual(wallet.randomAddresses.filter(a => a.hash === RANDOM_ADDRESS_HASH_TEST).length, 1))

    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))
    it(`#mnemonic SHOULD throw an error`, () => assert.throws(() => wallet.mnemonic))

    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, true)))
    it(`#lockState SHOULD be "STAKING"`, () => assert.strictEqual(wallet.lockState, 'STAKING'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, WalletAddressCategory.CHECKING, HD_CHECKING_1_EXTERNAL_HASH_TEST)))
    it(`#lock() SHOULD not throw any error`, async () => await assertThen(() => wallet.lock()))
    it(`#lockState SHOULD be "LOCKED"`, () => assert.strictEqual(wallet.lockState, 'LOCKED'))
    it(`#send() SHOULD throw an error`, async () => await assertCatch(() => wallet.send(TEST_AMOUNT, WalletAddressCategory.CHECKING, HD_CHECKING_1_EXTERNAL_HASH_TEST)))
    it(`#unlock(<forStakingOnly=FALSE>) SHOULD not throw any error`, async () =>
      await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, false)))
    it(`#lockState SHOULD be "UNLOCKED"`, () => assert.strictEqual(wallet.lockState, 'UNLOCKED'))

    it(`#generate() SHOULD throw an error`, async () => await assertCatch(() => wallet.generate(HD_PASSPHRASE_TEST)))
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
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: networkBlockchainHeight - localBlockchainHeight
      })

      while (info.localBlockchainHeight < networkBlockchainHeight) {
        await wait(250)
        info = await wallet.getInfo()
        bar.tick(info.localBlockchainHeight - localBlockchainHeight, '>')
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
    it.skip(`#export() SHOULD return the expected result`, async () =>
      assert.strictEqual(await wallet.export(HD_PASSPHRASE_TEST), TEST_WEF))

    it.skip(`#send() SHOULD NOT throw any error`, async () => {
      await assertThen(() =>wallet.send(TEST_AMOUNT, WalletAddressCategory.CHECKING, HD_SAVINGS_1_EXTERNAL_HASH_TEST))
      // await assertThen(() =>wallet.send(TEST_AMOUNT, WalletAddressCategory.PURSE, HD_CHECKING_1_EXTERNAL_HASH_TEST))
      // await assertThen(() =>wallet.send(TEST_AMOUNT, WalletAddressCategory.RANDOM, HD_SAVINGS_1_EXTERNAL_HASH_TEST))
      // await assertThen(() =>wallet.send(TEST_AMOUNT, WalletAddressCategory.SAVINGS, HD_CHECKING_1_EXTERNAL_HASH_TEST))
    })
  })

  describe.skip(`WHEN creating a new PURSE address`, function() {
    it(`#createAddress() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.createAddress(HD_PASSPHRASE_TEST, WalletAddressCategory.PURSE)))
  })
  describe.skip(`AFTER creating a new PURSE address`, function() {
    it(`#purseAddresses SHOULD contain 3 addresses`, () => assert.strictEqual(wallet.purseAddresses.length, 3))
    it(`#addresses SHOULD contain 7 addresses`, () => assert.strictEqual(wallet.addresses.length, 7))
    it(`#allAddresses SHOULD contain at least 8 addresses`, () => assert.strictEqual(wallet.allAddresses.length >= 8, true))
  })

  describe.skip(`WHEN creating a new CHECKING address`, function() {
    it(`#createAddress() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.createAddress(HD_PASSPHRASE_TEST, WalletAddressCategory.CHECKING)))
  })
  describe.skip(`AFTER creating a new CHECKING address`, function() {
    it(`#checkingAddresses SHOULD contain 3 addresses`, () => assert.strictEqual(wallet.checkingAddresses.length, 3))
    it(`#addresses SHOULD contain 8 addresses`, () => assert.strictEqual(wallet.addresses.length, 8))
    it(`#allAddresses SHOULD contain at least 9 addresses`, () => assert.strictEqual(wallet.allAddresses.length >= 9, true))
  })

  describe.skip(`WHEN creating a new SAVINGS address`, function() {
    it(`#createAddress() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.createAddress(HD_PASSPHRASE_TEST, WalletAddressCategory.SAVINGS)))
  })
  describe.skip(`AFTER creating a new SAVINGS address`, function() {
    it(`#savingsAddresses SHOULD contain 3 addresses`, () => assert.strictEqual(wallet.savingsAddresses.length, 3))
    it(`#addresses SHOULD contain 9 addresses`, () => assert.strictEqual(wallet.addresses.length, 9))
    it(`#allAddresses SHOULD contain at least 10 addresses`, () => assert.strictEqual(wallet.allAddresses.length >= 10, true))
  })

  describe(`WHEN starting the same wallet`, function () {
    it(`#start() SHOULD throw an error`, async () => await assertCatch(() => wallet.start(START_DATA_TEST, HD_PASSPHRASE_TEST)))
  })

  describe(`WHEN resetting the same wallet`, function () {
    it(`#reset() SHOULD NOT throw any error`, () => assert.doesNotThrow(() => wallet.reset()))
  })

  describe(`AFTER resetting the same wallet`, function () {
    it(`#state SHOULD be "EMPTY"`, () => assert.strictEqual(wallet.state, 'EMPTY'))
  })

  describe(`WHEN starting the same wallet`, function () {
    it(`#start() SHOULD NOT throw any error`, async () => await assertThen(() => wallet.start(START_DATA_TEST, HD_PASSPHRASE_TEST)))
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
    it(`#unlock() SHOULD not throw any error`, async () => await assertThen(() => wallet.unlock(HD_PASSPHRASE_TEST, true)))
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

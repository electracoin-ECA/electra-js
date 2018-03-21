// tslint:disable

import * as assert from 'assert'
import * as bip39 from 'bip39'
import * as childProcess from 'child_process'
import * as dotenv from 'dotenv'

import Wallet from '.'
import assertCatch from '../helpers/assertCatch'
import Electra from '../libs/electra/index'

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
    { hash: 'EMLhrYaSf8jn3BbVFHZYTFQGJd3Fps2vum', privateKey: 'QxB8fYQAeMPD1HDzjdno9dJB8Z4reT1UZzNcPRKmGgCwQ1brDpK3' },
    { hash: 'EdrLwe4T2zuyi42YZdFN68ozgbPovJbYdb', privateKey: 'QtMi7u7cjxQoBn4fQdNKWudNtEQUvNW6NL8e1oEUVwg4m1k1THJ3' }
  ],
  masterNode: {
    hash: 'EgLq5EkwdkyNVf9jxXSm6zuwUtnZhsgcMs',
    privateKey: 'QuHd7Pov2yYqz8ixAoXQJaTaEdYaVPFJ6zo4sHhYzFnjyXZGyKvj'
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

describe('Wallet (light)', function() {
  let wallet: Wallet

  // TODO We need a more efficient lock() and unlock() strategy
  this.timeout(30000)

  describe(`WHEN instantiating a new wallet (W1)`, () => {
    it(`new Wallet() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet = new Wallet()) })
  })

  describe(`AFTER instantiating this new wallet (W1)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#getBalance() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.getBalance()), true)
    })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })

  describe(`WHEN generating the same wallet (W1) WITHOUT <mnemonic>, <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD NOT throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate()), false)
    })
  })

  describe(`AFTER generating the same wallet (W1)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.addresses.length, 1) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.allAddresses.length, 1) })

    it(`#mnemonic SHOULD be a string`, () => { assert.strictEqual(typeof wallet.mnemonic, 'string') })
    it(`#mnemonic SHOULD be a non-empty string`, () => { assert.strictEqual(wallet.mnemonic.length > 0, true) })
    it(`#mnemonic SHOULD be a 12-words string`, () => { assert.strictEqual(wallet.mnemonic.split(' ').length, 12) })
    it(`#mnemonic SHOULD be a lowercase string`, () => { assert.strictEqual(wallet.mnemonic, wallet.mnemonic.toLocaleLowerCase()) })
    it(`#mnemonic SHOULD be a valid BIP39 mnemonic`, () => { assert.strictEqual(bip39.validateMnemonic(wallet.mnemonic), true) })

    it(`#getBalance() SHOULD return a number`, async () => { assert.strictEqual(typeof await wallet.getBalance(), 'number') })

    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })
    it.skip(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it.skip(`#unlock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#isLocked SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })

    it(`#generate() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.generate()), true) })
  })

  describe(`WHEN importing a random address to the same wallet (W1) WITH a deciphered private key`, () => {
    it(`#importRandomAddress() SHOULD NOT throw any error`, () => {
      assert.doesNotThrow(() => wallet.importRandomAddress(RANDOM_ADDRESS_PRIVATE_KEY_TEST))
    })
  })

  describe(`AFTER importing a random address to the same wallet (W1) WITH a deciphered private key`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#randomAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.randomAddresses), true) })
    it(`#randomAddresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.randomAddresses.length, 1) })
    it(`#randomAddresses first address hash SHOULD be different from the first HD address`, () => {
      assert.notStrictEqual(wallet.randomAddresses[0].hash, wallet.addresses[0].hash)
    })
    it(`#randomAddresses first address hash SHOULD have the expected properties`, () => {
      assert.strictEqual(wallet.randomAddresses[0].isCiphered, false)
      assert.strictEqual(wallet.randomAddresses[0].isHD, false)
      assert.strictEqual(wallet.randomAddresses[0].label, null)
    })
    it(`#randomAddresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.randomAddresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.randomAddresses[0].privateKey))
    })
    it(`#randomAddresses first address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.randomAddresses[0].hash, RANDOM_ADDRESS_HASH_TEST)
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain 2 addresses`, () => { assert.strictEqual(wallet.allAddresses.length, 2) })
  })

  describe(`WHEN resetting the same wallet (W1)`, () => {
    it(`#reset() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.reset()) })
  })

  describe(`AFTER resetting the same wallet (W1)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })

  describe(`WHEN generating the same wallet (W2) WITH <mnemonic> WITHOUT <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD throw an error WITH an invalid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST.substr(1))), true)
    })
    it(`#generate() SHOULD NOT throw any error WITH a valid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST)), false)
    })
  })

  describe(`AFTER generating the same wallet (W2)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.addresses.length, 1) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })
    it(`#addresses first address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].privateKey, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[0].privateKey)
    })
    it(`#addresses first address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].hash, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[0].hash)
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.allAddresses.length, 1) })

    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })

    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })
    it.skip(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it.skip(`#unlock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#isLocked SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })

    it(`#generate() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.generate()), true) })
  })

  describe(`WHEN resetting the same wallet (W2)`, () => {
    it(`#reset() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.reset()) })
  })

  describe(`AFTER resetting the same wallet (W2)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })

  describe(`WHEN generating the same wallet (W3) WITH <mnemonic>, <mnemonicExtension> WITHOUT <chainsCount>`, () => {
    it(`#generate() SHOULD throw an error WITH an invalid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST.substr(1), HD_MNEMONIC_EXTENSION_TEST)), true)
    })
    it(`#generate() SHOULD NOT throw any error WITH a valid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST)), false)
    })
  })

  describe(`AFTER generating the same wallet (W3)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.addresses.length, 1) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })
    it(`#addresses first address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].privateKey, HD_CHAIN_1_PRIVATE_KEY_TEST)
    })
    it(`#addresses first address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].hash, HD_CHAIN_1_HASH_TEST)
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain 1 address`, () => { assert.strictEqual(wallet.allAddresses.length, 1) })

    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })

    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })
    it.skip(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it.skip(`#unlock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#isLocked SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })

    it(`#generate() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.generate()), true) })
  })

  describe(`WHEN resetting the same wallet (W3)`, () => {
    it(`#reset() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.reset()) })
  })

  describe(`AFTER resetting the same wallet (W3)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })

  describe(`WHEN generating the same wallet (W4) WITH <mnemonic>, <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD throw an error WITH an invalid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST.substr(1), HD_MNEMONIC_EXTENSION_TEST, 2)), true)
    })
    it(`#generate() SHOULD NOT throw any error WITH a valid mnemonic`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST, 2)), false)
    })
  })

  describe(`AFTER generating the same wallet (W4)`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 2 addresses`, () => { assert.strictEqual(wallet.addresses.length, 2) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })
    it(`#addresses first address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].privateKey, HD_CHAIN_1_PRIVATE_KEY_TEST)
    })
    it(`#addresses first address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].hash, HD_CHAIN_1_HASH_TEST)
    })
    it(`#addresses second address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[1].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[1].privateKey))
    })
    it(`#addresses second address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[1].privateKey, HD_CHAIN_2_PRIVATE_KEY_TEST)
    })
    it(`#addresses second address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[1].hash, HD_CHAIN_2_HASH_TEST)
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain 2 addresses`, () => { assert.strictEqual(wallet.allAddresses.length, 2) })

    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })

    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })
    it.skip(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it.skip(`#unlock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), false)
    })
    it.skip(`#isLocked SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })

    it(`#generate() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.generate()), true) })
  })

  describe(`WHEN resetting the same wallet (W4)`, () => {
    it(`#reset() SHOULD NOT throw any error`, () => { assert.doesNotThrow(() => wallet.reset()) })
  })

  describe(`AFTER resetting the same wallet (W4)`, () => {
    it(`#state SHOULD be "EMPTY"`, () => { assert.strictEqual(wallet.state, 'EMPTY') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })
})

describe.skip('Wallet (hard)', function() {
  let wallet: Wallet

  this.timeout(5000)

  before(function() {
    childProcess.execSync('rm -Rf ~/.Electra')
  })

  describe(`WHEN instantiating a new wallet WITH an RPC Server`, () => {
    it(`new Wallet() SHOULD NOT throw any error`, () => {
      assert.doesNotThrow(() => wallet = new Wallet(true))
    })
  })

  describe(`AFTER instantiating this new wallet`, () => {
    it(`#state SHOULD be "STOPPED"`, () => { assert.strictEqual(wallet.state, 'STOPPED') })

    it(`#addresses SHOULD throw an error`, () => { assert.throws(() => wallet.addresses) })
    it(`#allAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.allAddresses) })
    it(`#randomAddresses SHOULD throw an error`, () => { assert.throws(() => wallet.randomAddresses) })
    it(`#lockState SHOULD throw an error`, () => { assert.throws(() => wallet.lockState) })
    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })
    it(`#transactions SHOULD throw an error`, () => { assert.throws(() => wallet.transactions) })

    it(`#export() SHOULD throw an error`, () => { assert.throws(() => wallet.export()) })
    it(`#getBalance() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.getBalance()), true) })
    it(`#getInfo() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.getInfo()), true) })
    it(`#lock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), true)
    })
    it(`#reset() SHOULD throw an error`, () => { assert.throws(() => wallet.reset()) })
    it(`#send() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_1_HASH_TEST)), true)
    })
    it(`#unlock() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), true)
    })
  })

  describe(`WHEN starting the same wallet deamon`, () => {
    it(`#startDeamon() SHOULD NOT throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.startDaemon()), false)
    })
  })

  describe(`WHEN generating the same wallet WITH <mnemonic>, <mnemonicExtension>, <chainsCount>`, () => {
    it(`#generate() SHOULD NOT throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.generate(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST, 2)), false)
    })
  })

  describe(`AFTER generating the same wallet`, () => {
    it(`#state SHOULD be "READY"`, () => { assert.strictEqual(wallet.state, 'READY') })

    it(`#addresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.addresses), true) })
    it(`#addresses SHOULD contain 2 addresses`, () => { assert.strictEqual(wallet.addresses.length, 2) })
    it(`#addresses first address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[0].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[0].privateKey))
    })
    it(`#addresses first address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].privateKey, HD_CHAIN_1_PRIVATE_KEY_TEST)
    })
    it(`#addresses first address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[0].hash, HD_CHAIN_1_HASH_TEST)
    })
    it(`#addresses second address SHOULD be resolvable`, () => {
      assert.strictEqual(wallet.addresses[1].hash, Electra.getAddressHashFromPrivateKey(wallet.addresses[1].privateKey))
    })
    it(`#addresses second address private key SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[1].privateKey, HD_CHAIN_2_PRIVATE_KEY_TEST)
    })
    it(`#addresses second address hash SHOULD be the expected one`, () => {
      assert.strictEqual(wallet.addresses[1].hash, HD_CHAIN_2_HASH_TEST)
    })

    it(`#allAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.allAddresses), true) })
    it(`#allAddresses SHOULD contain at least 2 addresses`, () => { assert.strictEqual(wallet.allAddresses.length >= 2, true) })

    it(`#randomAddresses SHOULD be an array`, () => { assert.strictEqual(Array.isArray(wallet.randomAddresses), true) })

    it(`#mnemonic SHOULD throw an error`, () => { assert.throws(() => wallet.mnemonic) })

    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })
    it(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it(`#unlock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST)), false)
    })
    it(`#lockState SHOULD be "STAKING"`, () => { assert.strictEqual(wallet.lockState, 'STAKING') })
    it(`#send() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST)), true)
    })
    it(`#lock() SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.lock(HD_PASSPHRASE_TEST)), false)
    })
    it(`#lockState SHOULD be "LOCKED"`, () => { assert.strictEqual(wallet.lockState, 'LOCKED') })
    it(`#send() SHOULD throw an error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST)), true)
    })
    it(`#unlock(<forStakingOnly=FALSE>) SHOULD not throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.unlock(HD_PASSPHRASE_TEST, false)), false)
    })
    it(`#lockState SHOULD be "UNLOCKED"`, () => { assert.strictEqual(wallet.lockState, 'UNLOCKED') })

    it.skip(`#send() SHOULD NOT throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_2_HASH_TEST)), false)
      assert.strictEqual(await assertCatch(() => wallet.send(TEST_AMOUNT, HD_CHAIN_1_HASH_TEST)), false)
    })

    it(`#generate() SHOULD throw an error`, async () => { assert.strictEqual(await assertCatch(() => wallet.generate()), true) })
  })

  describe(`WHEN stopping the same wallet deamon`, () => {
    it(`#stopDeamon() SHOULD NOT throw any error`, async () => {
      assert.strictEqual(await assertCatch(() => wallet.stopDaemon()), false)
    })
  })

  describe(`AFTER stopping the same wallet deamon`, () => {
    it(`#state SHOULD be "STOPPED"`, () => { assert.strictEqual(wallet.state, 'STOPPED') })
  })
})

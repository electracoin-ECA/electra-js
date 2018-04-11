// tslint:disable

import * as assert from 'assert'
import * as bip39 from 'bip39'
import * as dotenv from 'dotenv'

import Electra from '.'

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
  RANDOM_ADDRESS_HASH_TEST,
  RANDOM_ADDRESS_PRIVATE_KEY_TEST,
} = process.env

describe('libs/Electra', function() {
  let purseExternalAddress1, purseChangeAddress1,
      purseExternalAddress2, purseChangeAddress2,
      checkingExternalAddress1, checkingChangeAddress1,
      checkingExternalAddress2, checkingChangeAddress2,
      savingsExternalAddress1, savingsChangeAddress1,
      savingsExternalAddress2, savingsChangeAddress2,
      masterNodeAddress, mnemonic

  describe(`#getAddressHashFromPrivateKey()`, function() {
    it(`SHOULD resolve back these 13 addresses`, function() {
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_PURSE_1_EXTERNAL_PK_TEST), HD_PURSE_1_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_PURSE_1_CHANGE_PK_TEST), HD_PURSE_1_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_PURSE_2_EXTERNAL_PK_TEST), HD_PURSE_2_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_PURSE_2_CHANGE_PK_TEST), HD_PURSE_2_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_CHECKING_1_EXTERNAL_PK_TEST), HD_CHECKING_1_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_CHECKING_1_CHANGE_PK_TEST), HD_CHECKING_1_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_CHECKING_2_EXTERNAL_PK_TEST), HD_CHECKING_2_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_CHECKING_2_CHANGE_PK_TEST), HD_CHECKING_2_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_SAVINGS_1_EXTERNAL_PK_TEST), HD_SAVINGS_1_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_SAVINGS_1_CHANGE_PK_TEST), HD_SAVINGS_1_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_SAVINGS_2_EXTERNAL_PK_TEST), HD_SAVINGS_2_EXTERNAL_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(HD_SAVINGS_2_CHANGE_PK_TEST), HD_SAVINGS_2_CHANGE_HASH_TEST)
      assert.strictEqual(Electra.getAddressHashFromPrivateKey(RANDOM_ADDRESS_PRIVATE_KEY_TEST), RANDOM_ADDRESS_HASH_TEST)
    })
  })

  describe(`#getMasterNodeAddressFromMnemonic() WITHOUT <mnemonicExtension>`, function() {
    it(`SHOULD NOT throw any error`, function() {
      assert.doesNotThrow(() => masterNodeAddress = Electra.getMasterNodeAddressFromMnemonic(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST))
    })

    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(masterNodeAddress.privateKey, HD_MASTER_NODE_PRIVATE_KEY_TEST)
    })
    it(`SHOULD return the expected hash`, function() {
      assert.strictEqual(masterNodeAddress.hash, HD_MASTER_NODE_HASH_TEST)
    })
  })

  describe(`#getDerivedChainFromMasterNodePrivateKey()`, function() {
    describe(`WHEN deriving its accounts (0, 1 and 2), chains (0, 1 and 2), and their change`, function() {
      it(`SHOULD NOT throw any error`, function() {
        assert.doesNotThrow(() => purseExternalAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 0, false))
        assert.doesNotThrow(() => purseChangeAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 0, true))
        assert.doesNotThrow(() => purseExternalAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 1, false))
        assert.doesNotThrow(() => purseChangeAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 1, true))
        assert.doesNotThrow(() => checkingExternalAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 1, 0, false))
        assert.doesNotThrow(() => checkingChangeAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 1, 0, true))
        assert.doesNotThrow(() => checkingExternalAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 1, 1, false))
        assert.doesNotThrow(() => checkingChangeAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 1, 1, true))
        assert.doesNotThrow(() => savingsExternalAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 2, 0, false))
        assert.doesNotThrow(() => savingsChangeAddress1 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 2, 0, true))
        assert.doesNotThrow(() => savingsExternalAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 2, 1, false))
        assert.doesNotThrow(() => savingsChangeAddress2 = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 2, 1, true))
      })

      it(`SHOULD return the expected private keys`, function() {
        assert.strictEqual(purseExternalAddress1.privateKey, HD_PURSE_1_EXTERNAL_PK_TEST)
        assert.strictEqual(purseChangeAddress1.privateKey, HD_PURSE_1_CHANGE_PK_TEST)
        assert.strictEqual(purseExternalAddress2.privateKey, HD_PURSE_2_EXTERNAL_PK_TEST)
        assert.strictEqual(purseChangeAddress2.privateKey, HD_PURSE_2_CHANGE_PK_TEST)
        assert.strictEqual(checkingExternalAddress1.privateKey, HD_CHECKING_1_EXTERNAL_PK_TEST)
        assert.strictEqual(checkingChangeAddress1.privateKey, HD_CHECKING_1_CHANGE_PK_TEST)
        assert.strictEqual(checkingExternalAddress2.privateKey, HD_CHECKING_2_EXTERNAL_PK_TEST)
        assert.strictEqual(checkingChangeAddress2.privateKey, HD_CHECKING_2_CHANGE_PK_TEST)
        assert.strictEqual(savingsExternalAddress1.privateKey, HD_SAVINGS_1_EXTERNAL_PK_TEST)
        assert.strictEqual(savingsChangeAddress1.privateKey, HD_SAVINGS_1_CHANGE_PK_TEST)
        assert.strictEqual(savingsExternalAddress2.privateKey, HD_SAVINGS_2_EXTERNAL_PK_TEST)
        assert.strictEqual(savingsChangeAddress2.privateKey, HD_SAVINGS_2_CHANGE_PK_TEST)
      })

      it(`SHOULD return the expected hashes`, function() {
        assert.strictEqual(purseExternalAddress1.hash, HD_PURSE_1_EXTERNAL_HASH_TEST)
        assert.strictEqual(purseChangeAddress1.hash, HD_PURSE_1_CHANGE_HASH_TEST)
        assert.strictEqual(purseExternalAddress2.hash, HD_PURSE_2_EXTERNAL_HASH_TEST)
        assert.strictEqual(purseChangeAddress2.hash, HD_PURSE_2_CHANGE_HASH_TEST)
        assert.strictEqual(checkingExternalAddress1.hash, HD_CHECKING_1_EXTERNAL_HASH_TEST)
        assert.strictEqual(checkingChangeAddress1.hash, HD_CHECKING_1_CHANGE_HASH_TEST)
        assert.strictEqual(checkingExternalAddress2.hash, HD_CHECKING_2_EXTERNAL_HASH_TEST)
        assert.strictEqual(checkingChangeAddress2.hash, HD_CHECKING_2_CHANGE_HASH_TEST)
        assert.strictEqual(savingsExternalAddress1.hash, HD_SAVINGS_1_EXTERNAL_HASH_TEST)
        assert.strictEqual(savingsChangeAddress1.hash, HD_SAVINGS_1_CHANGE_HASH_TEST)
        assert.strictEqual(savingsExternalAddress2.hash, HD_SAVINGS_2_EXTERNAL_HASH_TEST)
        assert.strictEqual(savingsChangeAddress2.hash, HD_SAVINGS_2_CHANGE_HASH_TEST)
      })
    })
  })

  describe(`#getRandomMnemonic()`, function() {
    it(`SHOULD NOT throw any error`, function() {
      assert.doesNotThrow(() => mnemonic = Electra.getRandomMnemonic())
    })

    it(`SHOULD return a non-empty string made of 24 lowercase regular letters`, function() {
      assert.strictEqual(typeof mnemonic, 'string')
      assert.strictEqual(mnemonic.length > 0, true)
      assert.strictEqual(mnemonic.split(' ').length, 24)
      assert.strictEqual(mnemonic, mnemonic.toLocaleLowerCase())
    })

    it(`SHOULD be a valid BIP39 mnemonic`, function() {
      assert.strictEqual(bip39.validateMnemonic(mnemonic), true)
    })
  })
})

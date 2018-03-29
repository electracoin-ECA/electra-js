// tslint:disable

import * as assert from 'assert'
import * as bip39 from 'bip39'
import * as dotenv from 'dotenv'

import Electra from '.'

import { HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST } from '../../wallet/hard/index.spec'

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
} = process.env

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
] as any).includes(undefined)) {
  console.error('Error: You forgot to fill value(s) in your ".env" test wallet data. Please check ".env.sample".')
  process.exit(1)
}

console.log(Electra.getRandomMnemonic())

describe('libs/Electra', function() {
  let firstAddress, masterNodeAddress, mnemonic, secondAddress

  describe(`#getMasterNodeAddressFromMnemonic() WITHOUT <mnemonicExtension>`, function() {
    it(`SHOULD NOT throw any error`, function() {
      assert.doesNotThrow(() => masterNodeAddress = Electra.getMasterNodeAddressFromMnemonic(HD_MNEMONIC_TEST))
    })

    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(masterNodeAddress.privateKey, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.masterNode.privateKey)
    })
    it(`SHOULD return the expected hash`, function() {
      assert.strictEqual(masterNodeAddress.hash, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.masterNode.hash)
    })
    it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
      assert.strictEqual(
        Electra.getAddressHashFromPrivateKey(masterNodeAddress.privateKey),
        masterNodeAddress.hash
      )
    })
  })

  describe(`#getDerivedChainFromMasterNodePrivateKey()`, function() {
    describe(`WHEN looking for the first derived chain (<walletIndex> = 0, <chainIndex> = 0)`, function() {
      it(`SHOULD NOT throw any error`, function() {
        assert.doesNotThrow(() => firstAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 0))
      })

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(firstAddress.privateKey, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[0].privateKey)
      })
      it(`SHOULD return the expected hash`, function() {
        assert.strictEqual(firstAddress.hash, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[0].hash)
      })
      it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(firstAddress.privateKey),
          firstAddress.hash
        )
      })
    })

    describe(`WHEN looking for the second derived chain (<walletIndex> = 0, <chainIndex> = 1)`, function() {
      it(`SHOULD NOT throw any error`, function() {
        assert.doesNotThrow(() => secondAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 1))
      })

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(secondAddress.privateKey, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[1].privateKey)
      })
      it(`SHOULD return the expected hash`, function() {
        assert.strictEqual(secondAddress.hash, HD_WALLET_WITHOUT_MNEMONIC_EXTENSION_TEST.chains[1].hash)
      })
      it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(secondAddress.privateKey),
          secondAddress.hash
        )
      })
    })
  })

  describe(`#getMasterNodeAddressFromMnemonic() WITH <mnemonicExtension>`, function() {
    it(`SHOULD NOT throw any error`, function() {
      assert.doesNotThrow(() => masterNodeAddress = Electra.getMasterNodeAddressFromMnemonic(HD_MNEMONIC_TEST, HD_MNEMONIC_EXTENSION_TEST))
    })

    it(`SHOULD return the expected private key`, function() {
      assert.strictEqual(masterNodeAddress.privateKey, HD_MASTER_NODE_PRIVATE_KEY_TEST)
    })
    it(`SHOULD return the expected hash`, function() {
      assert.strictEqual(masterNodeAddress.hash, HD_MASTER_NODE_HASH_TEST)
    })
    it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
      assert.strictEqual(
        Electra.getAddressHashFromPrivateKey(masterNodeAddress.privateKey),
        masterNodeAddress.hash
      )
    })
  })

  describe(`#getDerivedChainFromMasterNodePrivateKey()`, function() {
    describe(`WHEN looking for the first derived chain (<walletIndex = 0>, <chainIndex> = 0)`, function() {
      it(`SHOULD NOT throw any error`, function() {
        assert.doesNotThrow(() => firstAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 0))
      })

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(firstAddress.privateKey, HD_CHAIN_1_PRIVATE_KEY_TEST)
      })
      it(`SHOULD return the expected hash`, function() {
        assert.strictEqual(firstAddress.hash, HD_CHAIN_1_HASH_TEST)
      })
      it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(firstAddress.privateKey),
          firstAddress.hash
        )
      })
    })

    describe(`WHEN looking for the second derived chain (<walletIndex> = 0, <chainIndex> = 1)`, function() {
      it(`SHOULD NOT throw any error`, function() {
        assert.doesNotThrow(() => secondAddress = Electra.getDerivedChainFromMasterNodePrivateKey(masterNodeAddress.privateKey, 0, 1))
      })

      it(`SHOULD return the expected private key`, function() {
        assert.strictEqual(secondAddress.privateKey, HD_CHAIN_2_PRIVATE_KEY_TEST)
      })
      it(`SHOULD return the expected hash`, function() {
        assert.strictEqual(secondAddress.hash, HD_CHAIN_2_HASH_TEST)
      })
      it(`SHOULD be resolved back via #getAddressHashFromPrivateKey()`, function() {
        assert.strictEqual(
          Electra.getAddressHashFromPrivateKey(secondAddress.privateKey),
          secondAddress.hash
        )
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

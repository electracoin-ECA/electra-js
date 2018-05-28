// tslint:disable:no-unnecessary-class

import * as bip39 from 'bip39'
import * as bitcoinJs from 'bitcoinjs-lib'

import { ECA_NETWORK } from '../../constants'

import { Address } from '../../types'

const CHAIN_CODE_BUFFER_SIZE: number = 32
const ENTROPY_STRENGTH: number = 256
const HD_DERIVATION_COIN_TYPE: number = 0
const HD_DERIVATION_PURPOSE: number = 44

/**
 * Electra blockchain functions.
 */
export default class Electra {
  /**
   * Resolve the address hash from its WIF private key.
   */
  public static getAddressHashFromPrivateKey(privateKey: string): string {
    return bitcoinJs.ECPair
      .fromWIF(privateKey, ECA_NETWORK)
      .getAddress()
  }

  /**
   * Calculate the derived key address (0-indexed) from a Hierarchical Deterministic Wallet Master Node private key.
   * Recall: m / purpose' / coin_type' / account' / change / address_index
   *
   * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
   * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
   * @see https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki
   * @see https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
   */
  public static getDerivedChainFromMasterNodePrivateKey(
    privateKey: string,
    accountIndex: number,
    addressIndex: number,
    isChange: boolean,
  ): Address {
    const masterNode: bitcoinJs.HDNode = this.getMasterNodeFromPrivateKey(privateKey)
    const derivedNode: bitcoinJs.HDNode = masterNode.derivePath(
      `m/${HD_DERIVATION_PURPOSE}'/${HD_DERIVATION_COIN_TYPE}'/${accountIndex}'/${Number(isChange)}/${addressIndex}`
    )

    return {
      hash: derivedNode.getAddress(),
      isCiphered: false,
      isHD: true,
      privateKey: derivedNode.keyPair.toWIF()
    }
  }

  /**
   * Calculate the key pair from a WIF private key.
   */
  public static getKeyPairFromPrivateKey(privateKey: string): bitcoinJs.ECPair {
    return bitcoinJs.ECPair.fromWIF(privateKey, ECA_NETWORK)
  }

  /**
   * Resolve the Highly Deterministic Wallet Master Node address hash and WIF private key
   * from its associated mnemonic, extended by the mnemonic extension if given.
   *
   * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
   * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
   */
  public static getMasterNodeAddressFromMnemonic(mnemonic: string, mnemonicExtension?: string): Address {
    const masterNode: bitcoinJs.HDNode = this.getMasterNodeFromMnemonic(mnemonic, mnemonicExtension)
    const keyPair: bitcoinJs.ECPair = masterNode.keyPair

    return {
      hash: keyPair.getAddress(),
      isCiphered: false,
      isHD: true,
      privateKey: keyPair.toWIF()
    }
  }

  /**
   * Generate a crypto-random address.
   *
   * @note This address can't be associated with a mnemonic and requires its private key to be recovered.
   */
  public static getRandomAddress(): Address {
    const keyPair: bitcoinJs.ECPair = bitcoinJs.ECPair.makeRandom({ network: ECA_NETWORK })

    return {
      hash: keyPair.getAddress(),
      isCiphered: false,
      isHD: false,
      privateKey: keyPair.toWIF()
    }
  }

  /**
   * Generate a crypto-random mnemonic, using a 256-bits entropy.
   *
   * @note A 256-bits entropy generates a 24 words mnemonic.
   * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
   * @see https://github.com/bitcoinjs/bip39
   */
  public static getRandomMnemonic(): string {
    return bip39.generateMnemonic(ENTROPY_STRENGTH)
  }

  /**
   * Validate a mnemonic.
   *
   * @see https://github.com/bitcoinjs/bip39
   */
  public static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic)
  }

  /**
   * Return an instance of Highly Deterministic Wallet Master Node from its mnemonic,
   * extended by the mnemonic extension if given.
   */
  private static getMasterNodeFromMnemonic(mnemonic: string, mnemonicExtension?: string): bitcoinJs.HDNode {
    const seed: Buffer = this.getSeedFromMnemonic(mnemonic, mnemonicExtension)

    return bitcoinJs.HDNode.fromSeedBuffer(seed, ECA_NETWORK)
  }

  /**
   * Return an instance of Highly Deterministic Wallet Master Node from its WIF private key.
   */
  private static getMasterNodeFromPrivateKey(privateKey: string): bitcoinJs.HDNode {
    const masterNodeKeyPair: bitcoinJs.ECPair = bitcoinJs.ECPair.fromWIF(privateKey, ECA_NETWORK)

    // TODO Check the "chainCode" buffer
    return new bitcoinJs.HDNode(masterNodeKeyPair, Buffer.alloc(CHAIN_CODE_BUFFER_SIZE))
  }

  /**
   * Convert the mnemonic into a seed buffer, extended by the mnemonic extension if given.
   *
   * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
   */
  private static getSeedFromMnemonic(mnemonic: string, mnemonicExtension?: string): Buffer {
    return bip39.mnemonicToSeed(mnemonic, mnemonicExtension)
  }
}

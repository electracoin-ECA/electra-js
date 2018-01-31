// tslint:disable:no-unnecessary-class

import * as bip39 from 'bip39'
import * as bitcoinJs from 'bitcoinjs-lib'

import { ECA_NETWORK } from '../../constants'

import { WalletAddress } from '../../wallet/types'

const CHAIN_CODE_BUFFER_SIZE: number = 32
const ENTROPY_STRENGTH: number = 128

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
   * Calculate the derived key n (0-indexed) from a Highly Deterministic Wallet Master Node private key.
   *
   * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#master-key-generation
   */
  public static getDerivedChainFromMasterNodePrivateKey(
    privateKey: string,
    walletIndex: number,
    chainIndex: number
  ): WalletAddress {
    const masterNode: bitcoinJs.HDNode = this.getMasterNodeFromPrivateKey(privateKey)
    const derivedNode: bitcoinJs.HDNode = masterNode.deriveHardened(walletIndex).derive(chainIndex)

    return {
      hash: derivedNode.getAddress(),
      isCiphered: false,
      isHD: true,
      label: null,
      privateKey: derivedNode.keyPair.toWIF()
    }
  }

  /**
   * Resolve the Highly Deterministic Wallet Master Node address hash and WIF private key
   * from its associated mnemonic, extended by the mnemonic extension if given.
   *
   * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
   */
  public static getMasterNodeAddressFromMnemonic(mnemonic: string, mnemonicExtension?: string): WalletAddress {
    const masterNode: bitcoinJs.HDNode = this.getMasterNodeFromMnemonic(mnemonic, mnemonicExtension)
    const keyPair: bitcoinJs.ECPair = masterNode.keyPair

    return {
      hash: keyPair.getAddress(),
      isCiphered: false,
      isHD: true,
      label: null,
      privateKey: keyPair.toWIF()
    }
  }

  /**
   * Generate a crypto-random address.
   *
   * @note This address can't be associated with a mnemonic and requires its private key to be recovered.
   */
  public static getRandomAddress(): WalletAddress {
    const keyPair: bitcoinJs.ECPair = bitcoinJs.ECPair.makeRandom({ network: ECA_NETWORK })

    return {
      hash: keyPair.getAddress(),
      isCiphered: false,
      isHD: false,
      label: null,
      privateKey: keyPair.toWIF()
    }
  }

  /**
   * Generate a crypto-random mnemonic, using a 128-bits entropy.
   *
   * @note A 128-bits entropy generates a 12 words mnemonic.
   * @see https://github.com/bitcoinjs/bip39
   */
  public static getRandomMnemonic(): string {
    return bip39.generateMnemonic(ENTROPY_STRENGTH)
  }

  /**
   * Generate a crypto-random mnemonic, using a 128-bits entropy.
   *
   * @note A 128-bits entropy generates a 12 words mnemonic.
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
    return new bitcoinJs.HDNode(masterNodeKeyPair, new Buffer(CHAIN_CODE_BUFFER_SIZE))
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

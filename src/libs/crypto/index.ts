// tslint:disable:no-unnecessary-class

import * as bip38 from 'bip38'
import * as wif from 'wif'

import { ECA_NETWORK } from '../../constants'

import { Bip38DecryptResult } from './types'

/**
 * Cryptography helpers.
 */
export default class Crypto {
  /**
   * Cipher a WIF private key into a BIP38 cipher.
   *
   * @see https://github.com/bitcoinjs/bip38#api
   */
  public static cipherPrivateKey(
    privateKey: string,
    passphrase: string,
    progressCallback?: (percent: number) => void
  ): string {
    try {
      const decodedPrivateKey: wif.PrivateKey = wif.decode(privateKey, ECA_NETWORK.wif)
      const privateKeyCipher: string = bip38.encrypt(
        decodedPrivateKey.privateKey,
        decodedPrivateKey.compressed,
        passphrase,
        progressCallback !== undefined
          ? (status: bip38.ProgressStatus): void => progressCallback(status.percent)
          : undefined
      )

      return privateKeyCipher
    }
    catch (err) {
      throw err
    }
  }

  /**
   * Decipher a BIP38 ciphered private key into a WIF private key.
   *
   * @see https://github.com/bitcoinjs/bip38#api
   */
  public static decipherPrivateKey(privateKeyCipher: string, passphrase: string): string {
    try {
      const encodedPrivateKey: Bip38DecryptResult = bip38.decrypt(privateKeyCipher, passphrase)
      const privateKey: string = wif.encode(ECA_NETWORK.wif, encodedPrivateKey.privateKey, encodedPrivateKey.compressed)

      return privateKey
    }
    catch (err) {
      throw err
    }
  }
}

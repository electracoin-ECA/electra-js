/**
 * Cryptography helpers.
 */
export default class Crypto {
    /**
     * Cipher a WIF private key into a BIP38 cipher.
     *
     * @see https://github.com/bitcoinjs/bip38#api
     */
    static cipherPrivateKey(privateKey: string, passphrase: string, progressCallback?: (percent: number) => void): string;
    /**
     * Decipher a BIP38 ciphered private key into a WIF private key.
     *
     * @see https://github.com/bitcoinjs/bip38#api
     */
    static decipherPrivateKey(privateKeyCipher: string, passphrase: string): string;
}

import { Address } from '../../types';
/**
 * Electra blockchain functions.
 */
export default class Electra {
    /**
     * Resolve the address hash from its WIF private key.
     */
    static getAddressHashFromPrivateKey(privateKey: string): string;
    /**
     * Calculate the derived key n (0-indexed) from a Highly Deterministic Wallet Master Node private key.
     *
     * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#master-key-generation
     */
    static getDerivedChainFromMasterNodePrivateKey(privateKey: string, walletIndex: number, chainIndex: number): Address;
    /**
     * Resolve the Highly Deterministic Wallet Master Node address hash and WIF private key
     * from its associated mnemonic, extended by the mnemonic extension if given.
     *
     * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
     */
    static getMasterNodeAddressFromMnemonic(mnemonic: string, mnemonicExtension?: string): Address;
    /**
     * Generate a crypto-random address.
     *
     * @note This address can't be associated with a mnemonic and requires its private key to be recovered.
     */
    static getRandomAddress(): Address;
    /**
     * Generate a crypto-random mnemonic, using a 128-bits entropy.
     *
     * @note A 128-bits entropy generates a 12 words mnemonic.
     * @see https://github.com/bitcoinjs/bip39
     */
    static getRandomMnemonic(): string;
    /**
     * Generate a crypto-random mnemonic, using a 128-bits entropy.
     *
     * @note A 128-bits entropy generates a 12 words mnemonic.
     * @see https://github.com/bitcoinjs/bip39
     */
    static validateMnemonic(mnemonic: string): boolean;
    /**
     * Return an instance of Highly Deterministic Wallet Master Node from its mnemonic,
     * extended by the mnemonic extension if given.
     */
    private static getMasterNodeFromMnemonic(mnemonic, mnemonicExtension?);
    /**
     * Return an instance of Highly Deterministic Wallet Master Node from its WIF private key.
     */
    private static getMasterNodeFromPrivateKey(privateKey);
    /**
     * Convert the mnemonic into a seed buffer, extended by the mnemonic extension if given.
     *
     * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
     */
    private static getSeedFromMnemonic(mnemonic, mnemonicExtension?);
}

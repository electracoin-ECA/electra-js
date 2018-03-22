import { WalletAddress, WalletInfo, WalletLockState, WalletState, WalletTransaction } from './types';
/**
 * Wallet management.
 */
export default class Wallet {
    /** List of the wallet HD addresses. */
    private ADDRESSES;
    /** List of the wallet HD addresses. */
    readonly addresses: WalletAddress[];
    /** List of the wallet non-HD (random) and HD addresses. */
    readonly allAddresses: WalletAddress[];
    /** List of the wallet random (non-HD) addresses. */
    private RANDOM_ADDRESSES;
    /** List of the wallet random (non-HD) addresses. */
    readonly randomAddresses: WalletAddress[];
    /**
     * Hard wallet daemon Node child process.
     */
    private daemon;
    /**
     * Is this hard wallet a brand intalled one ?
     */
    /** List of the wallet random (non-HD) addresses. */
    private LOCK_STATE;
    /**
     * Is this wallet locked ?
     * The wallet is considered as locked when all its addresses private keys are currently ciphered.
     */
    readonly lockState: WalletLockState;
    /**
     * Wallet HD Master Node address.
     *
     * @note
     * THIS ADDRESS MUST BE KEPT AN	INACCESSIBLE PRIVATE PROPERTY !
     * While revealing the Master Node address hash would not be a security risk, it still would be privacy risk.
     * Indeed, "guessing" the children addresses from this address hash is really difficult, but NOT impossible.
     *
     * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#security
     */
    private MASTER_NODE_ADDRESS;
    /** Mnenonic. */
    private MNEMONIC;
    /**
     * Mnenonic.
     *
     * @note
     * ONLY available when generating a brand new Wallet, which happens after calling #generate()
     * with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.
     */
    readonly mnemonic: string;
    /** RPC Server instance.  */
    private readonly rpc;
    /** Wallet state. */
    private STATE;
    /**
     * Wallet state.
     * This state can be one of:
     * - EMPTY, when it has just been instanciated or reset ;
     * - READY, when it has been generated, or seeded with random (non-HD) private keys imports.
     */
    readonly state: WalletState;
    /** List of the wallet transactions. */
    private TRANSACTIONS;
    /** List of the wallet transactions. */
    readonly transactions: WalletTransaction[];
    constructor(isHard?: boolean);
    /**
     * Start the hard wallet daemon.
     */
    startDaemon(): Promise<void>;
    /**
     * Stop the hard wallet daemon.
     */
    stopDaemon(): Promise<void>;
    /**
     * Generate an HD wallet from either the provided mnemonic seed, or a randomly generated one,
     * including ‒ at least ‒ the first derived address.
     *
     * @note In case the [mnemonicExtension] is specified, it MUST be encoded in UTF-8 using NFKD.
     *
     * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#wordlist
     *
     * TODO Figure out a way to validate provided mnemonics using different specs (words list & entropy strength).
     */
    generate(mnemonic?: string, mnemonicExtension?: string, chainsCount?: number): Promise<void>;
    /**
     * Lock the wallet, that is cipher all its private keys.
     */
    lock(passphrase: string): Promise<void>;
    /**
     * Unlock the wallet, that is decipher all its private keys.
     */
    unlock(passphrase: string, forStakingOnly?: boolean): Promise<void>;
    /**
     * Import a wallet data containing ciphered private keys.
     *
     * @note
     * The <data> must be a stringified JSON WEF following the EIP-0002 specifications.
     * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
     */
    import(data: string, passphrase: string): Promise<void>;
    /**
     * Export wallet data with ciphered private keys, or unciphered if <unsafe> is set to TRUE.
     *
     * @note
     * The returned string will be a stringified JSON WEF following the EIP-0002 specifications.
     * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
     */
    export(): string;
    /**
     * Import a ramdomly generated (legacy) WIF private key into the wallet.
     * If the [passphrase] is not defined, the <privateKey> MUST be given deciphered.
     * If the [passphrase] is defined, the <privateKey> MUST be given ciphered.
     */
    importRandomAddress(privateKey: string, passphrase?: string): void;
    /**
     * Reset the current wallet properties and switch the #state to "EMPTY".
     */
    reset(): void;
    /**
     * Get the global wallet balance, or the <address> balance if specified.
     */
    getBalance(addressHash?: string): Promise<number>;
    /**
     * Get the current connections count.
     */
    getConnectionsCount(): Promise<number>;
    /**
     * Get the wallet info.
     */
    getInfo(): Promise<WalletInfo>;
    /**
     * Create and broadcast a new transaction of <amount> <toAddressHash> from the first unspent ones.
     */
    send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void>;
    /**
     * List the last wallet transactions.
     */
    getTransactions(count?: number, fromIndex?: number): Promise<WalletTransaction[]>;
}

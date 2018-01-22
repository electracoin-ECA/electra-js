import { RpcMethodResult } from '../libs/rpc/types';
export interface RpcAuth {
    username: string;
    password: string;
}
/**
 * Wallet related methods matching RPC commands.
 */
export default class Wallet {
    /** Basic Authentication info for RPC calls. */
    private readonly auth;
    /** RPC server URI. */
    private readonly uri;
    constructor(uri: string, auth: RpcAuth);
    /**
     * JSON-RCP query helper.
     */
    private query<T>(method, params);
    /**
     * Change the wallet passphrase from <oldPassphrase> to <newPassphrase>.
     */
    changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<RpcMethodResult<'walletpassphrasechange'>>;
    /**
     * Check the wallet integrity.
     */
    check(): Promise<RpcMethodResult<'checkwallet'>>;
    /**
     * Get the account associated with the given address.
     */
    getAccount(address: string): Promise<RpcMethodResult<'getaccount'>>;
    /**
     * Get the total available balance.
     */
    getBalance(): Promise<RpcMethodResult<'getbalance'>>;
    /**
     * Get the difficulty as a multiple of the minimum difficulty.
     */
    getDifficulty(): Promise<RpcMethodResult<'getdifficulty'>>;
    /**
     * Get the current state info.
     */
    getInfo(): Promise<RpcMethodResult<'getinfo'>>;
    /**
     * Generate a new address for receiving payments.
     */
    getNewAddress(account?: string): Promise<RpcMethodResult<'getnewaddress'>>;
    /**
     * Lists groups of addresses which have had their common ownership made public
     * by common use as inputs or as the resulting change in past transactions.
     */
    listAddressGroupings(): Promise<RpcMethodResult<'listaddressgroupings'>>;
    /**
     * List receiving addresses data.
     */
    listReceivedByAddress(minConfirmations?: number, includeEmpty?: boolean): Promise<RpcMethodResult<'listreceivedbyaddress'>>;
    /**
     * List transactions.
     */
    listTransactions(account?: string, count?: number, from?: number): Promise<RpcMethodResult<'listtransactions'>>;
    /**
     * List unspent transactions between <minConfirmations> and <maxConfirmations>,
     * for the given list of <address> if specified.
     */
    listUnspent(minConfirmations?: number, maxConfirmations?: number, ...address: string[]): Promise<RpcMethodResult<'listunspent'>>;
    /**
     * Removes the wallet encryption key from memory, locking the wallet.
     * After calling this method, you will need to call walletpassphrase again
     * before being able to call any methods which require the wallet to be unlocked.
     */
    lock(): Promise<RpcMethodResult<'walletlock'>>;
    /**
     * Make a public/private key pair.
     * <prefix> is the optional preferred prefix for the public key.
     */
    makeKeyPair(prefix?: string): Promise<RpcMethodResult<'makekeypair'>>;
    /**
     * Stores the wallet decryption key in memory for <timeout> second.
     * if <stakingonly> is true sending functions are disabled.
     */
    storePassphrase(passphrase: string, timeout: number, stakingOnly?: boolean): Promise<RpcMethodResult<'walletpassphrase'>>;
    /**
     * Validate <address> and get its info.
     */
    validateAddress(address: string): Promise<RpcMethodResult<'validateaddress'>>;
    /**
     * Validate <publicKey> and get its info.
     */
    validatePublicKey(publicKey: string): Promise<RpcMethodResult<'validatepubkey'>>;
}

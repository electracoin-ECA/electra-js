import { RpcMethodResult } from './types';
export interface RpcAuth {
    username: string;
    password: string;
}
/**
 * RPC server related methods matching RPC commands.
 */
export default class Rpc {
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
     * Encrypt the wallet with <passphrase>.
     */
    encryptWallet(passphrase: string): Promise<RpcMethodResult<'encryptwallet'>>;
    /**
     * Get the account associated with the given address.
     */
    getAccount(address: string): Promise<RpcMethodResult<'getaccount'>>;
    /**
     * Get the total available balance.
     */
    getBalance(): Promise<RpcMethodResult<'getbalance'>>;
    /**
     * Get connection count.
     */
    getConnectionCount(): Promise<RpcMethodResult<'getconnectioncount'>>;
    /**
     * Get the difficulty as a multiple of the minimum difficulty.
     */
    getDifficulty(): Promise<RpcMethodResult<'getdifficulty'>>;
    /**
     * Get the current state info.
     */
    getInfo(): Promise<RpcMethodResult<'getinfo'>>;
    /**
     * Get the local block height.
     */
    getLocalBlockHeight(): Promise<RpcMethodResult<'getblockcount'>>;
    /**
     * Generate a new address for receiving payments.
     */
    getNewAddress(account?: string): Promise<RpcMethodResult<'getnewaddress'>>;
    /**
     * Get the peers info.
     */
    getPeersInfo(): Promise<RpcMethodResult<'getpeerinfo'>>;
    /**
     * Get the private key of <addressHash>.
     */
    getPrivateKey(addressHash: string): Promise<RpcMethodResult<'dumpprivkey'>>;
    /**
     * Get the current staking info.
     */
    getStakingInfo(): Promise<RpcMethodResult<'getstakinginfo'>>;
    /**
     * Get a transaction detailed info.
     */
    getTransaction(transactionHash: string): Promise<RpcMethodResult<'gettransaction'>>;
    /**
     * Import a new address private key.
     */
    importPrivateKey(privateKey: string): Promise<RpcMethodResult<'importprivkey'>>;
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
     * Create a basic transaction and broadcast it.
     *
     * @note
     * THIS METHOD SHOULD NOT BE USED ONCE THE FIRST FINAL VERSION IS RELEASED.
     * This transaction is "basic" because the unspent transaction are automatically selected.
     */
    sendBasicTransaction(toAddressHash: string, amount: number): Promise<RpcMethodResult<'sendtoaddress'>>;
    /**
     * Exit the daemon.
     */
    stop(): Promise<RpcMethodResult<'stop'>>;
    /**
     * Stores the wallet decryption key in memory for <timeout> seconds.
     * If [stakingOnly] is TRUE, sending functions are disabled.
     */
    unlock(passphrase: string, timeout?: number, stakingOnly?: boolean): Promise<RpcMethodResult<'walletpassphrase'>>;
    /**
     * Validate <address> and get its info.
     */
    validateAddress(address: string): Promise<RpcMethodResult<'validateaddress'>>;
    /**
     * Validate <publicKey> and get its info.
     */
    validatePublicKey(publicKey: string): Promise<RpcMethodResult<'validatepubkey'>>;
}

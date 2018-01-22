// tslint:disable:no-null-keyword object-literal-sort-keys

import to from 'await-to-js'

import rpc from '../libs/rpc'

import { RpcMethod, RpcMethodParams, RpcMethodResult } from '../libs/rpc/types'

export interface RpcAuth {
  username: string
  password: string
}

/**
 * Wallet related methods matching RPC commands.
 */
export default class Wallet {
  /** Basic Authentication info for RPC calls. */
  private readonly auth: RpcAuth
  /** RPC server URI. */
  private readonly uri: string

  public constructor(uri: string, auth: RpcAuth) {
    this.auth = auth
    this.uri = uri
  }

  /**
   * JSON-RCP query helper.
   */
  private async query<T extends RpcMethod>(method: T, params: RpcMethodParams): Promise<RpcMethodResult<T>> {
    const [err, res] = await to(rpc(this.uri, method, params, { auth: this.auth }))
    if (err !== null) throw new Error(`rpc: ${err.message}`)

    return res as RpcMethodResult<T>
  }

  /**
   * Changes the wallet passphrase from <oldPassphrase> to <newPassphrase>.
   */
  public async changePassphrase(
    oldPassphrase: string,
    newPassphrase: string
  ): Promise<RpcMethodResult<'walletpassphrasechange'>> {
    return this.query('walletpassphrasechange', Array.prototype.slice.call(arguments))
  }

  /**
   * Check wallet for integrity.
   */
  public async check(): Promise<RpcMethodResult<'checkwallet'>> {
    return this.query('checkwallet', null)
  }

  /**
   * Get the account associated with the given address.
   */
  public async getAccount(address: string): Promise<RpcMethodResult<'getaccount'>> {
    return this.query('getaccount', [address])
  }

  /**
   * Get the total available balance.
   */
  public async getBalance(): Promise<RpcMethodResult<'getbalance'>> {
    return this.query('getbalance', null)
  }

  /**
   * Get the difficulty as a multiple of the minimum difficulty.
   */
  public async getDifficulty(): Promise<RpcMethodResult<'getdifficulty'>> {
    return this.query('getdifficulty', null)
  }

  /**
   * Get the current state info.
   */
  public async getInfo(): Promise<RpcMethodResult<'getinfo'>> {
    return this.query('getinfo', null)
  }

  /**
   * Generate a new address for receiving payments.
   */
  public async getNewAddress(account?: string): Promise<RpcMethodResult<'getnewaddress'>> {
    return this.query('getnewaddress', account !== undefined ? [account] : null)
  }

  /**
   * Lists groups of addresses which have had their common ownership made public
   * by common use as inputs or as the resulting change in past transactions.
   */
  public async listAddressGroupings(): Promise<RpcMethodResult<'listaddressgroupings'>> {
    return this.query('listaddressgroupings', null)
  }

  /**
   * List receiving addresses data.
   */
  public async listReceivedByAddress(
    minConfirmations: number = 1,
    includeEmpty: boolean = false
  ): Promise<RpcMethodResult<'listreceivedbyaddress'>> {
    return this.query('listreceivedbyaddress', Array.prototype.slice.call(arguments))
  }

  /**
   * Make a public/private key pair.
   * <prefix> is the optional preferred prefix for the public key.
   */
  public async makeKeyPair(prefix?: string): Promise<RpcMethodResult<'makekeypair'>> {
    return this.query('makekeypair', prefix !== undefined ? [prefix] : null)
  }

  /**
   * List transactions.
   */
  public async listTransactions(
    account: string = '*',
    count: number = 10,
    from: number = 0
  ): Promise<RpcMethodResult<'listtransactions'>> {
    return this.query('listtransactions', Array.prototype.slice.call(arguments))
  }

  /**
   * List unspent transactions between <minConfirmations> and <maxConfirmations>,
   * for the givens list of <address>.
   */
  public async listUnspent(
    minConfirmations: number = 1,
    maxConfirmations: number = 9999999,
    ...address: string[]
  ): Promise<RpcMethodResult<'listunspent'>> {
    return this.query('listunspent', Array.prototype.slice.call(arguments))
  }

  /**
   * Removes the wallet encryption key from memory, locking the wallet.
   * After calling this method, you will need to call walletpassphrase again
   * before being able to call any methods which require the wallet to be unlocked.
   */
  public async lock(): Promise<RpcMethodResult<'walletlock'>> {
    return this.query('walletlock', null)
  }

  /**
   * Stores the wallet decryption key in memory for <timeout> second.
   * if <stakingonly> is true sending functions are disabled.
   */
  public async storePassphrase(
    passphrase: string,
    timeout: number,
    stakingOnly: boolean = true
  ): Promise<RpcMethodResult<'walletpassphrase'>> {
    return this.query('walletpassphrase', Array.prototype.slice.call(arguments))
  }

  /**
   * Validate <address> and get its info.
   */
  public async validateAddress(address: string): Promise<RpcMethodResult<'validateaddress'>> {
    return this.query('validateaddress', Array.prototype.slice.call(arguments))
  }

  /**
   * Get the <publicKey> info.
   */
  public async validatePublicKey(publicKey: string): Promise<RpcMethodResult<'validatepubkey'>> {
    return this.query('validatepubkey', Array.prototype.slice.call(arguments))
  }
}

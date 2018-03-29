import to from 'await-to-js'
import * as R from 'ramda'

import { ECA_TRANSACTION_FEE } from '../../constants'
import getMaxItemFromList from '../../helpers/getMaxItemFromList'
// import tryCatch from '../../helpers/tryCatch'
// import wait from '../../helpers/wait'
import Crypto from '../../libs/crypto'
import Electra from '../../libs/electra'
import Rpc from '../../libs/rpc'
import webServices from '../../web-services'

import { RpcMethodResult } from '../../libs/rpc/types'
import { Address } from '../../types'
import {
  WalletAddress,
  WalletBalance,
  WalletExchangeFormat,
  WalletInfo,
  WalletLockState,
  WalletStartData,
  WalletState,
  WalletTransaction,
} from '../types'

const LIST_TRANSACTIONS_LENGTH: number = 1000000
const WALLET_INDEX: number = 0

/**
 * Wallet management.
 */
export default class WalletLight {
  /** List of the wallet HD addresses. */
  private ADDRESSES: WalletAddress[] = []
  /** List of the wallet HD addresses. */
  public get addresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #addresses are only available when the #state is "READY".`)
    }

    return this.ADDRESSES
  }

  /** List of the wallet non-HD (random) and HD addresses. */
  public get allAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #allAddresses are only available when the #state is "READY".`)
    }

    return [...this.addresses, ...this.randomAddresses]
  }

  /** Is it a brand new wallet (= no pre-existing ".Electra directory") ? */
  public isNew: boolean

  /** Is this wallet locked ? */
  private LOCK_STATE: WalletLockState | undefined
  /**
   * Is this wallet locked ?
   * The wallet is considered as locked when all its addresses private keys are currently ciphered.
   */
  public get lockState(): WalletLockState {
    return this.LOCK_STATE as WalletLockState
  }

  /**
   * Wallet HD Master Node address.
   *
   * @note
   * NEVER USE THIS ADDRESS AS "NORMAL" ADDRESS !
   * While revealing the Master Node address hash would not be a security risk, it still would be privacy risk.
   * Indeed, "guessing" the children addresses from this address hash is really difficult, but NOT impossible.
   *
   * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#security
   */
  private MASTER_NODE_ADDRESS: WalletAddress | undefined
  /**
   * Wallet HD Master Node address.
   *
   * @note
   * ONLY available when generating a brand new Wallet, which happens after calling #generate()
   * with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.
   */
  public get masterNodeAddress(): WalletAddress {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet:
        #mnemonic is only available after a brand new Wallet has been generated the #state is "READY".
      `)
    }

    return this.MASTER_NODE_ADDRESS as WalletAddress
  }

  /** Mnenonic. */
  private MNEMONIC: string | undefined
  /**
   * Mnenonic.
   *
   * @note
   * ONLY available when generating a brand new Wallet, which happens after calling #generate()
   * with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.
   */
  public get mnemonic(): string {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet:
        #mnemonic is only available after a brand new Wallet has been generated the #state is "READY".
      `)
    }

    if (this.MNEMONIC === undefined) {
      throw new Error(`ElectraJs.Wallet: #mnemonic is only available after a brand new Wallet has been generated.`)
    }

    return this.MNEMONIC
  }

  /** List of the wallet random (non-HD) addresses. */
  private RANDOM_ADDRESSES: WalletAddress[] = []
  /** List of the wallet random (non-HD) addresses. */
  public get randomAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #randomAddresses are only available when the #state is "READY".`)
    }

    return this.RANDOM_ADDRESSES
  }

  /** RPC Server instance.  */
  private readonly rpc: Rpc

  /** Wallet state. */
  private STATE: WalletState
  /**
   * Wallet state.
   * This state can be one of:
   * - EMPTY, when it has just been instanciated or reset ;
   * - READY, when it has been generated, or seeded with random (non-HD) private keys imports.
   */
  public get state(): WalletState {
    return this.STATE
  }

  public constructor() {
    this.STATE = WalletState.EMPTY
    this.LOCK_STATE = WalletLockState.UNLOCKED
  }

  /**
   * Start a wallet with already generated addresses data.
   */
  public start(data: WalletStartData): void {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #start() method can only be called on an empty wallet (#state = "EMPTY").
        Maybe you want to #reset() it first ?
      `)
    }

    this.MASTER_NODE_ADDRESS = data.masterNodeAddress
    this.ADDRESSES = data.addresses
    this.RANDOM_ADDRESSES = data.randomAddresses

    this.STATE = WalletState.READY
  }

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
  public async generate(mnemonic?: string, mnemonicExtension?: string, chainsCount: number = 1): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on an empty wallet (#state = "EMPTY").
        You need to #reset() it first, then #initialize() it again in order to #generate() a new one.
      `)
    }

    /*
      ----------------------------------
      STEP 1: MNEMONIC
    */

    if (mnemonic !== undefined) {
      if (!Electra.validateMnemonic(mnemonic)) {
        throw new Error(`ElectraJs.Wallet: #generate() <mnemonic> parameter MUST be a valid mnemonic.`)
      }
    } else {
      try {
        // tslint:disable-next-line:no-parameter-reassignment
        mnemonic = Electra.getRandomMnemonic()
        this.MNEMONIC = mnemonic
      }
      catch (err) { throw err }
    }

    /*
      ----------------------------------
      STEP 2: MASTER NODE
    */

    try {
      const address: Address = Electra.getMasterNodeAddressFromMnemonic(mnemonic, mnemonicExtension)
      this.MASTER_NODE_ADDRESS = {
        ...address,
        label: null
      }
    }
    catch (err) { throw err }

    /*
      ----------------------------------
      STEP 3: CHAINS
    */

    let chainIndex: number = -1
    try {
      while (++chainIndex < chainsCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          this.MASTER_NODE_ADDRESS.privateKey,
          WALLET_INDEX,
          chainIndex
        )

        this.ADDRESSES.push({
          ...address,
          label: null
        })
      }
    }
    catch (err) { throw err }

    this.STATE = WalletState.READY
  }

  /**
   * Lock the wallet, that is cipher all its private keys.
   */
  public async lock(passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet:
        The #lock() method can only be called on an ready wallet (#state = "READY").
      `)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) return

    try {
      if (this.MASTER_NODE_ADDRESS !== undefined && !this.MASTER_NODE_ADDRESS.isCiphered) {
        this.MASTER_NODE_ADDRESS.privateKey = Crypto.cipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase)
      }

      this.ADDRESSES = this.ADDRESSES.map((address: WalletAddress) => {
        if (!address.isCiphered) {
          address.privateKey = Crypto.cipherPrivateKey(address.privateKey, passphrase)
        }

        return address
      })

      this.RANDOM_ADDRESSES = this.RANDOM_ADDRESSES.map((randomAddress: WalletAddress) => {
        if (!randomAddress.isCiphered) {
          randomAddress.privateKey = Crypto.cipherPrivateKey(randomAddress.privateKey, passphrase)
        }

        return randomAddress
      })
    }
    catch (err) {
      throw err
    }

    // Locking the wallet should delete any stored mnemonic
    if (this.MNEMONIC !== undefined) delete this.MNEMONIC

    this.LOCK_STATE = WalletLockState.LOCKED
  }

  /**
   * Unlock the wallet, that is decipher all its private keys.
   */
  public async unlock(passphrase: string, forStakingOnly: boolean = true): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet:
        The #unlock() method can only be called on an ready wallet (#state = "READY").
      `)
    }

    if (this.LOCK_STATE === WalletLockState.UNLOCKED) return

    try {
      if (this.MASTER_NODE_ADDRESS !== undefined && this.MASTER_NODE_ADDRESS.isCiphered) {
        this.MASTER_NODE_ADDRESS.privateKey = Crypto.decipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase)
      }

      this.ADDRESSES = this.ADDRESSES.map((address: WalletAddress) => {
        if (address.isCiphered) {
          address.privateKey = Crypto.decipherPrivateKey(address.privateKey, passphrase)
        }

        return address
      })

      this.RANDOM_ADDRESSES = this.RANDOM_ADDRESSES.map((randomAddress: WalletAddress) => {
        if (randomAddress.isCiphered) {
          randomAddress.privateKey = Crypto.decipherPrivateKey(randomAddress.privateKey, passphrase)
        }

        return randomAddress
      })
    }
    catch (err) { throw err }

    this.LOCK_STATE = WalletLockState.UNLOCKED
  }

  /**
   * Import a wallet data containing ciphered private keys.
   *
   * @note
   * The <wefData> must be a (JSON) WEF following the EIP-0002 specifications.
   * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
   */
  public async import(wefData: WalletExchangeFormat, passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #import() method can only be called on an empty wallet (#state = "EMPTY").
        Maybe you want to #reset() it first ?
      `)
    }

    const [version, chainsCount, hdPrivateKeyX, randomPrivateKeysX] = wefData

    // tslint:disable-next-line:no-magic-numbers
    if (version !== 2) {
      throw new Error(`ElectraJs.Wallet: The WEF version should be equal to 2.`)
    }

    /*
      ----------------------------------
      STEP 1: MASTER NODE
    */

    try {
      const privateKey: string = Crypto.decipherPrivateKey(hdPrivateKeyX, passphrase)
      const hash: string = Electra.getAddressHashFromPrivateKey(privateKey)
      this.MASTER_NODE_ADDRESS = {
        hash,
        isCiphered: false,
        isHD: true,
        label: null,
        privateKey,
      }
    }
    catch (err) { throw err }

    /*
      ----------------------------------
      STEP 2: CHAINS
    */

    let chainIndex: number = -1
    try {
      while (++chainIndex < chainsCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          this.MASTER_NODE_ADDRESS.privateKey,
          WALLET_INDEX,
          chainIndex
        )

        this.ADDRESSES.push({
          ...address,
          label: null
        })
      }
    }
    catch (err) { throw err }

    /*
      ----------------------------------
      STEP 3: RANDOM ADDRESSES
    */

    let randomAddressIndex: number = randomPrivateKeysX.length
    try {
      while (--randomAddressIndex >= 0) {
        const privateKey: string = Crypto.decipherPrivateKey(randomPrivateKeysX[randomAddressIndex], passphrase)
        const hash: string = Electra.getAddressHashFromPrivateKey(privateKey)
        this.RANDOM_ADDRESSES.push({
          hash,
          isCiphered: false,
          isHD: true,
          label: null,
          privateKey,
        })
      }
    }
    catch (err) { throw err }

    this.STATE = WalletState.READY
  }

  /**
   * Export wallet data with ciphered private keys, or unciphered if <unsafe> is set to TRUE.
   *
   * @note
   * The returned string will be a stringified JSON WEF following the EIP-0002 specifications.
   * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
   */
  public export(): string {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #export() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.LOCK_STATE === WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        The wallet is currently unlocked. Exporting it would thus export the private keys in clear.
        You need to #lock() it first.
      `)
    }

    const wefData: WalletExchangeFormat = [
      // tslint:disable-next-line:no-magic-numbers
      2,
      this.ADDRESSES.length,
      (this.MASTER_NODE_ADDRESS as WalletAddress).privateKey,
      this.RANDOM_ADDRESSES.map((address: WalletAddress) => address.privateKey)
    ]

    return JSON.stringify(wefData)
  }

  /**
   * Import a ramdomly generated (legacy) WIF private key into the wallet.
   * If the [passphrase] is not defined, the <privateKey> MUST be given deciphered.
   * If the [passphrase] is defined, the <privateKey> MUST be given ciphered.
   */
  public importRandomAddress(privateKey: string, passphrase?: string): void {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet:
        The #importRandomAddress() method can only be called on a ready wallet (#state = "READY").
      `)
    }

    const address: Partial<WalletAddress> = {
      isHD: false,
      label: null,
      privateKey
    }

    // Decipher the private key is necessary
    if (passphrase !== undefined) {
      try {
        address.privateKey = Crypto.decipherPrivateKey(privateKey, passphrase)
      }
      catch (err) {
        throw err
      }
    }

    address.isCiphered = false

    // Get the address hash
    try {
      address.hash = Electra.getAddressHashFromPrivateKey(address.privateKey as string)
    }
    catch (err) {
      throw err
    }

    this.RANDOM_ADDRESSES.push(address as WalletAddress)
  }

  /**
   * Reset the current wallet properties and switch the #state to "EMPTY".
   */
  public reset(): void {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: You can't #reset() a wallet that is not ready (#state = "READY").`)
    }

    delete this.MASTER_NODE_ADDRESS
    delete this.MNEMONIC

    this.ADDRESSES = []
    this.RANDOM_ADDRESSES = []
    this.STATE = WalletState.EMPTY
  }

  /**
   * Get the global wallet balance, or the <address> balance if specified.
   */
  public async getBalance(addressHash?: string): Promise<WalletBalance> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: You can only #getBalance() from a ready wallet (#state = "READY").`)
    }

    const addresses: WalletAddress[] = this.allAddresses

    if (addressHash !== undefined) {
      if (addresses.filter((address: WalletAddress) => address.hash === addressHash).length === 0) {
        throw new Error(`ElectraJs.Wallet: You can't #getBalance() with an address not part of the current wallet.`)
      }

      // tslint:disable-next-line:no-shadowed-variable
      const [err, balance] = await to(webServices.getBalanceFor(addressHash))
      if (err !== null) throw err

      return {
        confirmed: balance as number,
        unconfirmed: 0,
      }
    }

    let index: number = addresses.length
    let balanceTotal: number = 0
    while (--index >= 0) {
      const [err, balance] = await to(webServices.getBalanceFor(this.allAddresses[index].hash))
      if (err !== null || balance === undefined) throw err
      balanceTotal += balance
    }

    return {
      confirmed: balanceTotal,
      unconfirmed: 0,
    }
  }

  /**
   * Get the wallet info.
   */
  public async getInfo(): Promise<WalletInfo> {
    if (this.STATE !== WalletState.READY) {
      return Promise.reject(new Error(`ElectraJs.Wallet: #getInfo() is only available when the #state is "READY".`))
    }

    try {
      const [bestBlockHash, localBlockchainHeight, peersInfo, stakingInfo]: [
        RpcMethodResult<'getbestblockhash'>,
        RpcMethodResult<'getblockcount'>,
        RpcMethodResult<'getpeerinfo'>,
        RpcMethodResult<'getstakinginfo'>
      ] = await Promise.all<
        RpcMethodResult<'getbestblockhash'>,
        RpcMethodResult<'getblockcount'>,
        RpcMethodResult<'getpeerinfo'>,
        RpcMethodResult<'getstakinginfo'>
      >([
        this.rpc.getBestBlockHash(),
        this.rpc.getLocalBlockHeight(),
        this.rpc.getPeersInfo(),
        this.rpc.getStakingInfo(),
      ])

      const lastBlockInfo: RpcMethodResult<'getblock'> = await this.rpc.getBlockInfo(bestBlockHash)

      const networkBlockchainHeight: number = peersInfo.length !== 0
        ? getMaxItemFromList(peersInfo, 'startingheight').startingheight
        : 0

      return {
        connectionsCount: peersInfo.length,
        isHD: Boolean(this.MASTER_NODE_ADDRESS),
        isStaking: stakingInfo.staking,
        isSynchonized: localBlockchainHeight >= networkBlockchainHeight,
        lastBlockGeneratedAt: lastBlockInfo.time,
        localBlockchainHeight,
        localStakingWeight: stakingInfo.weight,
        networkBlockchainHeight,
        networkStakingWeight: stakingInfo.netstakeweight,
        nextStakingRewardIn: stakingInfo.expectedtime,
      }
    }
    catch (err) {
      throw err
    }
  }

  /**
   * Create and broadcast a new transaction of <amount> <toAddressHash> from the first unspent ones.
   */
  public async send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: You can only #send() from a ready wallet (#state = "READY").`)
    }

    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        You can only #send() from an unlocked wallet (#lockState = 'UNLOCKED').
        Please #unlock() it first with <forStakingOnly> to TRUE.`)
    }

    if (amount <= 0) {
      throw new Error(`ElectraJs.Wallet: You can only send #send() a strictly positive <amount>.`)
    }

    if (fromAddressHash !== undefined && !R.contains({ hash: fromAddressHash }, this.allAddresses)) {
      throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`)
    }

    if (amount > ((await this.getBalance()).confirmed - ECA_TRANSACTION_FEE)) {
      throw new Error(`ElectraJs.Wallet: You can't #send() more than the current wallet addresses hold.`)
    }

    /*
      STEP 1: UNSPENT TRANSACTIONS
    */
    /*const [err1, unspentTransactions] = await to(this.getUnspentTransactions(true))
    if (err1 !== null || unspentTransactions === undefined) throw err1

    let availableAmount: number = 0
    const requiredUnspentTransactions: string[] = []
    // tslint:disable-next-line:prefer-const
    for (let unspentTransaction of unspentTransactions) {
      availableAmount += unspentTransaction.amount
      requiredUnspentTransactions.push(unspentTransaction.hash)

      if (availableAmount >= amount) break
    }*/

    /*
      STEP 2: BROADCAST
    */

    /*if (this.isHard) {
      // TODO Replace this method with a detailed unspent transactions signed one.
      const [err2] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
      if (err2 !== null) throw err2
    }*/
  }

  /**
   * List the wallet transactions (from the newer to the older one).
   */
  public async getTransactions(count: number = LIST_TRANSACTIONS_LENGTH): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #getTransactions() is only available when the #state is "READY".`)
    }

    return []
  }

  /**
   * Get the transaction info of <transactionHash>.
   */
  public async getTransaction(transactionHash: string): Promise<WalletTransaction | undefined> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #getTransaction() is only available when the #state is "READY".`)
    }

    // if (this.isHard) {
    const [err, transactions] = await to(this.getTransactions())
    if (err !== null || transactions === undefined) throw err

    const found: WalletTransaction[] = transactions.filter(({ hash }: WalletTransaction) => hash === transactionHash)

    return found.length !== 0 ? found[0] : undefined
    // }
  }

  /** List the wallet unspent transactions, ordered by descending amount. */
  /*private async getUnspentTransactions(includeUnconfirmed: boolean = false): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #transactions are only available when the #state is "READY".`)
    }

    if (this.isHard) {
      const [err, res] = await to(this.rpc.listUnspent(includeUnconfirmed ? 0 : 1))
      if (err !== null || res === undefined) throw err

      return R.sort(
        R.descend(R.prop('amount')),
        res.map((unspentTransaction: RpcMethodResult<'listunspent'>[0]) => ({
          amount: unspentTransaction.amount,
          confimationsCount: unspentTransaction.confirmations,
          hash: unspentTransaction.txid,
          toAddressHash: unspentTransaction.address
        }))
      )
    }

    return []
  }*/
}

import to from 'await-to-js'
import { ChildProcess } from 'child_process'
import * as R from 'ramda'

import { DAEMON_CONFIG, DAEMON_URI, ECA_TRANSACTION_FEE } from '../constants'
import getMaxItemFromList from '../helpers/getMaxItemFromList'
import tryCatch from '../helpers/tryCatch'
import wait from '../helpers/wait'
import Crypto from '../libs/crypto'
import Electra from '../libs/electra'
import Rpc from '../libs/rpc'
import webServices from '../web-services'

import { RpcMethodResult } from '../libs/rpc/types'
import { Address } from '../types'
import {
  PlatformBinary,
  WalletAddress,
  WalletExchangeFormat,
  WalletInfo,
  WalletLockState,
  WalletState,
  WalletTransaction
} from './types'

// tslint:disable-next-line:no-magic-numbers
const ONE_YEAR_IN_SECONDS: number = 60 * 60 * 24 * 365
const PLATFORM_BINARY: PlatformBinary = {
  darwin: 'electrad-macos',
  linux: 'electrad-linux',
  win32: 'electrad-win.exe'
}
const WALLET_INDEX: number = 0

/**
 * Wallet management.
 */
export default class Wallet {
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

  /** List of the wallet random (non-HD) addresses. */
  private RANDOM_ADDRESSES: WalletAddress[] = []
  /** List of the wallet random (non-HD) addresses. */
  public get randomAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #randomAddresses are only available when the #state is "READY".`)
    }

    return this.RANDOM_ADDRESSES
  }

  /**
   * Hard wallet daemon Node child process.
   */
  private daemon: ChildProcess

  /**
   * Is this hard wallet a brand intalled one ?
   */
  // private isNew: boolean

  /** List of the wallet random (non-HD) addresses. */
  private LOCK_STATE: WalletLockState = WalletLockState.UNLOCKED
  /**
   * Is this wallet locked ?
   * The wallet is considered as locked when all its addresses private keys are currently ciphered.
   */
  public get lockState(): WalletLockState {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #isLocked is only available when the #state is "READY".`)
    }

    return this.LOCK_STATE
  }

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
  private MASTER_NODE_ADDRESS: WalletAddress | undefined

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

  /** RPC Server instance.  */
  private readonly rpc: Rpc | undefined

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

  /** List of the wallet transactions. */
  private TRANSACTIONS: WalletTransaction[] = []
  /** List of the wallet transactions. */
  public get transactions(): WalletTransaction[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #transactions are only available when the #state is "READY".`)
    }

    return this.TRANSACTIONS
  }

  public constructor(isHard: boolean = false) {
    if (isHard) {
      this.rpc = new Rpc(DAEMON_URI, {
        password: DAEMON_CONFIG.rpcpassword,
        username: DAEMON_CONFIG.rpcuser
      })

      /*switch (process.platform) {
        case 'darwin':
        case 'linux':
          // tslint:disable-next-line:no-require-imports
          this.isNew = !(require('fs').existsSync('~/.Electra') as boolean)
          break

        case 'win32':
          break

        default:
          throw new Error(`ElectraJs.Wallet: This platform is not supported: ${process.platform}.`)
      }*/

      this.STATE = WalletState.STOPPED

      return
    }

    this.STATE = WalletState.EMPTY
  }

  /**
   * Start the hard wallet daemon.
   */
  public startDeamon(): void {
    if (this.rpc === undefined) {
      throw new Error(`ElectraJs.Wallet: The #startDeamon() method can only be called on a hard wallet`)
    }

    if (this.STATE !== WalletState.STOPPED) {
      throw new Error(`ElectraJs.Wallet:
        The #startDeamon() method can only be called on an stopped wallet (#state = "STOPPED").
      `)
    }

    // tslint:disable-next-line:no-require-imports
    this.daemon = require('child_process')
      .spawn(`./bin/${PLATFORM_BINARY[process.platform]}`, [
        `--port=${DAEMON_CONFIG.port}`,
        `--rpcuser=${DAEMON_CONFIG.rpcuser}`,
        `--rpcpassword=${DAEMON_CONFIG.rpcpassword}`,
        `--rpcport=${DAEMON_CONFIG.rpcport}`
      ])

    // TODO Add a debug mode in ElectraJs settings
    this.daemon.stdout.setEncoding('utf8').on('data', process.stdout.write)
    this.daemon.stderr.setEncoding('utf8').on('data', process.stdout.write)

    this.daemon.on('close', (code: number) => {
      this.STATE = WalletState.STOPPED

      // tslint:disable-next-line:no-console
      console.log(`The wallet daemon exited with the code: ${code}.`)
    })

    this.STATE = WalletState.EMPTY
  }

  /**
   * Start the hard wallet daemon.
   */
  public async stopDeamon(): Promise<void> {
    if (this.rpc === undefined) {
      throw new Error(`ElectraJs.Wallet: The #stopDeamon() method can only be called on a hard wallet`)
    }

    if (this.STATE === WalletState.STOPPED) {
      throw new Error(`ElectraJs.Wallet:
        The #stopDeamon() method can only be called on a not already stopped wallet (#state != "STOPPED").
      `)
    }

    this.daemon.kill()

    // Dirty hack since we have mno idea how long the deamon will take to be effectively
    while ((this.STATE as WalletState) !== WalletState.STOPPED) {
      // tslint:disable-next-line:no-magic-numbers
      await wait(250)
    }
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

    /*
      ----------------------------------
      STEP 4: RPC SERVER
    */

    if (this.rpc !== undefined) {
      let i: number

      // We try to import the HD addresses into the RPC deamon
      i = this.ADDRESSES.length
      while (--i >= 0) {
        try { await this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey) }
        catch (err) { /* We ignore this error in case the private key is already registered by the RPC deamon. */ }
      }
    }

    this.STATE = WalletState.READY
  }

  /**
   * Lock the wallet, that is cipher all its private keys.
   */
  public async lock(passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #lock() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) return

    if (this.rpc !== undefined) {
      try {
        await this.rpc.lock()
      }
      catch (err) {
        const currentState: WalletState = this.STATE as WalletState

        // If there is an error, this is surely because the wallet has never been encrypted,
        // so let's try to encrypt it as if it was the first time
        [err] = await to(this.rpc.encryptWallet(passphrase))
        if (err !== null) throw err

        // Dirty hack since we have no idea how long the deamon process will take to exit
        while ((this.STATE as WalletState) !== WalletState.STOPPED) {
          // tslint:disable-next-line:no-magic-numbers
          await wait(250)
        }

        // Encrypting the wallet has stopped the deamon, so we need to start it again
        this.startDeamon()

        this.STATE = currentState
      }

      this.LOCK_STATE = WalletLockState.LOCKED

      return
    }

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
    catch (err) { throw err }

    // Locking the wallet should delete any stored mnemonic
    if (this.MNEMONIC !== undefined) delete this.MNEMONIC

    this.LOCK_STATE = WalletLockState.LOCKED
  }

  /**
   * Unlock the wallet, that is decipher all its private keys.
   */
  public async unlock(passphrase: string, forStakingOnly: boolean = true): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #unlock() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.rpc !== undefined) {
      if (
        !forStakingOnly && this.LOCK_STATE === WalletLockState.STAKING
        || forStakingOnly && this.LOCK_STATE === WalletLockState.UNLOCKED
      ) {
        const [err1] = await to(this.lock(passphrase))
        if (err1 !== null) throw err1
      }

      const [err2] = await to(this.rpc.unlock(passphrase, ONE_YEAR_IN_SECONDS, forStakingOnly))
      if (err2 !== null) throw err2
      this.LOCK_STATE = forStakingOnly ? WalletLockState.STAKING : WalletLockState.UNLOCKED

      return
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
   * The <data> must be a stringified JSON WEF following the EIP-0002 specifications.
   * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
   */
  public async import(data: string, passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #import() method can only be called on an empty wallet (#state = "EMPTY").
      `)
    }

    const [err, wefData] = tryCatch(() => JSON.parse(data) as WalletExchangeFormat)
    if (err !== undefined) throw err

    const [version, chainsCount, hdPrivateKeyX, randomPrivateKeysX] = wefData as WalletExchangeFormat

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

    /*
      ----------------------------------
      STEP 4: RPC SERVER
    */

    if (this.rpc !== undefined) {
      let i: number

      // We try to import the HD and the random (non-HD) addresses into the RPC deamon
      i = this.allAddresses.length
      while (--i >= 0) {
        try { await this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey) }
        catch (err) { /* We ignore this error in case the private key is already registered by the RPC deamon. */ }
      }
    }

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
    this.TRANSACTIONS = []
  }

  /**
   * Get the global wallet balance, or the <address> balance if specified.
   */
  public async getBalance(addressHash?: string): Promise<number> {
    if (this.STATE === WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet: You can't #getBalance() from an empty wallet (#state = "EMPTY").`)
    }

    if (this.rpc !== undefined) {
      const [err, balance] = await to(this.rpc.getBalance())
      if (err !== null) throw err

      return balance as number
    }

    const addresses: WalletAddress[] = this.allAddresses

    if (addressHash !== undefined) {
      if (addresses.filter((address: WalletAddress) => address.hash === addressHash).length === 0) {
        throw new Error(`ElectraJs.Wallet: You can't #getBalance() with an address not part of the current wallet.`)
      }

      // tslint:disable-next-line:no-shadowed-variable
      const [err, balance] = await to(webServices.getBalanceFor(addressHash))
      if (err !== null) throw err

      return balance as number
    }

    let index: number = addresses.length
    let balanceTotal: number = 0
    while (--index >= 0) {
      const [err, balance] = await to(webServices.getBalanceFor(this.allAddresses[index].hash))
      if (err !== null || balance === undefined) throw err
      balanceTotal += balance
    }

    return balanceTotal
  }

  /**
   * Get the current connections count.
   */
  public async getConnectionsCount(): Promise<number> {
    const [err, connectionCount] = await to((this.rpc as Rpc).getConnectionCount())
    if (err !== null || connectionCount === undefined) throw err

    return connectionCount
  }

  /**
   * Get the wallet info.
   */
  public getInfo(): Promise<WalletInfo> {
    if (this.STATE !== WalletState.READY) {
      return Promise.reject(new Error(`ElectraJs.Wallet: #getInfo() is only available when the #state is "READY".`))
    }

    return new Promise((resolve: (info: WalletInfo) => void, reject: () => void): void => {
      Promise.all<
        RpcMethodResult<'getblockcount'>,
        RpcMethodResult<'getpeerinfo'>,
        RpcMethodResult<'getstakinginfo'>
      >([
        (this.rpc as Rpc).getLocalBlockHeight(),
        (this.rpc as Rpc).getPeersInfo(),
        (this.rpc as Rpc).getStakingInfo(),
      ])
        .then(([localBlockchainHeight, peersInfo, stakingInfo]: [
          RpcMethodResult<'getblockcount'>,
          RpcMethodResult<'getpeerinfo'>,
          RpcMethodResult<'getstakinginfo'>
        ]) => resolve({
          connectionsCount: peersInfo.length,
          isHD: Boolean(this.MASTER_NODE_ADDRESS),
          isStaking: stakingInfo.staking,
          localBlockchainHeight,
          localStakingWeight: stakingInfo.weight,
          networkBlockchainHeight: peersInfo.length !== 0
            ? getMaxItemFromList(peersInfo, 'startingheight').startingheight
            : 0,
          networkStakingWeight: stakingInfo.netstakeweight,
          nextStakingRewardIn: stakingInfo.expectedtime,
        }))
        .catch(reject)
    })
  }

  /**
   * Create and broadcast a new transaction of <amount> <toAddressHash> from the first unspent ones.
   */
  public async send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void> {
    if (this.STATE === WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet: You can't #send() from an empty wallet (#state = "EMPTY").`)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) {
      throw new Error(`ElectraJs.Wallet:
        You can't #send() from a locked wallet. Please #unlock() it first with <forStakingOnly> to TRUE.
      `)
    }

    if (this.LOCK_STATE === WalletLockState.STAKING) {
      throw new Error(`ElectraJs.Wallet:
        You can't #send() from a staking-only wallet. Please #unlock() it first with <forStakingOnly> to TRUE.
      `)
    }

    if (amount <= 0) {
      throw new Error(`ElectraJs.Wallet: You can't #send() a positive amount.`)
    }

    if (fromAddressHash !== undefined && !R.contains({ hash: fromAddressHash }, this.allAddresses)) {
      throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`)
    }

    if (amount > (await this.getBalance() - ECA_TRANSACTION_FEE)) {
      throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`)
    }

    if (this.rpc !== undefined) {
      const [err2] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
      if (err2 !== null) throw err2

      return
    }

    /*
      STEP 1: UNSPENT TRANSACTIONS
    */
    const [err1, unspentTransactions] = await to(this.getUnspentTransactions(true))
    if (err1 !== null || unspentTransactions === undefined) throw err1

    let availableAmount: number = 0
    const requiredUnspentTransactions: string[] = []
    // tslint:disable-next-line:prefer-const
    for (let unspentTransaction of unspentTransactions) {
      availableAmount += unspentTransaction.amount
      requiredUnspentTransactions.push(unspentTransaction.hash)

      if (availableAmount >= amount) break
    }

    /*
      STEP 2: BROADCAST
    */

    /*if (this.rpc !== undefined) {
      // TODO Replace this method with a detailed unspent transactions signed one.
      const [err2] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
      if (err2 !== null) throw err2
    }*/
  }

  /** List of the wallet unspent transactions, ordered by descending amount. */
  private async getUnspentTransactions(includeUnconfirmed: boolean = false): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #transactions are only available when the #state is "READY".`)
    }

    if (this.rpc !== undefined) {
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
  }
}

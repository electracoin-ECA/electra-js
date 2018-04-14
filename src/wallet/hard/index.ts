// tslint:disable:max-file-line-count

import to from 'await-to-js'
import { ChildProcess } from 'child_process'
import * as R from 'ramda'

import {
  BINARIES_PATH,
  DAEMON_CONFIG,
  DAEMON_URI,
  DAEMON_USER_DIR_PATH,
  ECA_TRANSACTION_FEE,
} from '../../constants'
import closeElectraDaemons from '../../helpers/closeElectraDaemons'
import getMaxItemFromList from '../../helpers/getMaxItemFromList'
import injectElectraConfig from '../../helpers/injectElectraConfig'
import isPortAvailable from '../../helpers/isPortAvailable'
import tryCatch from '../../helpers/tryCatch'
import wait from '../../helpers/wait'
import Crypto from '../../libs/crypto'
import Electra from '../../libs/electra'
import EJError, { EJErrorCode } from '../../libs/error'
import Rpc from '../../libs/rpc'

import { RpcMethodResult } from '../../libs/rpc/types'
import { Address, Omit } from '../../types'
import {
  PlatformBinary,
  WalletAddress,
  WalletAddressCategory,
  WalletBalance,
  WalletDaemonState,
  WalletExchangeFormat,
  WalletInfo,
  WalletLockState,
  WalletStartDataHard,
  WalletState,
  WalletTransaction,
  WalletTransactionType,
  WalletUnspentTransaction,
} from '../types'

const LIST_TRANSACTIONS_LENGTH: number = 1_000_000
// tslint:disable-next-line:no-magic-numbers
const ONE_YEAR_IN_SECONDS: number = 60 * 60 * 24 * 365
const PLATFORM_BINARY: PlatformBinary = {
  darwin: 'electrad-macos',
  linux: 'electrad-linux',
  win32: 'electrad-windows.exe'
}
const SATOSHI: number = 100_000_000

/**
 * Wallet management.
 */
export default class WalletHard {
  /** List of the wallet HD addresses. */
  private ADDRESSES: WalletAddress[] = []
  /** List of the wallet HD addresses. */
  public get addresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return this.ADDRESSES
  }

  /** List of the wallet non-HD (random) and HD addresses. */
  public get allAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return [...this.ADDRESSES, ...this.RANDOM_ADDRESSES]
  }

  /** Daemon binaries directory path. */
  private readonly binariesPath: string

  /** List of the wallet CA Checking addresses. */
  public get checkingAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return this.ADDRESSES.filter(({ category }: WalletAddress) => category === WalletAddressCategory.CHECKING)
  }

  /** Hard wallet daemon Node child process. */
  private daemon: ChildProcess | undefined

  /** Electra Daemon state. */
  private DAEMON_STATE: WalletDaemonState
  /** Electra Daemon state. */
  public get daemonState(): WalletDaemonState {
    return this.DAEMON_STATE
  }

  /** Is it a brand new wallet (= no pre-existing ".Electra directory") ? */
  public isNew: boolean

  /** Does this wallet instance have been started before ? */
  public isFirstStart: boolean = true

  /** Is this wallet locked ? */
  private LOCK_STATE: WalletLockState | undefined
  /**
   * Is this wallet locked ?
   * The wallet is considered as locked when all its addresses private keys are currently ciphered.
   */
  public get lockState(): WalletLockState {
    if (this.LOCK_STATE === undefined && this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet: You need to #startDaemon in order to know the wallet #lockState.`)
    }

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
  private MASTER_NODE_ADDRESS: Address | undefined
  /**
   * Wallet HD Master Node address.
   *
   * @note
   * ONLY available when generating a brand new Wallet, which happens after calling #generate()
   * with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.
   */
  public get masterNodeAddress(): Address {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    if (this.LOCK_STATE === WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        #masterNodeAddress is only available on a staking or locked wallet (#lockState = "STAKING" | "LOCKED").
      `)
    }

    return this.MASTER_NODE_ADDRESS as Address
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
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    if (this.MNEMONIC === undefined) {
      throw new Error(`ElectraJs.Wallet: #mnemonic is only available after a brand new Wallet has been generated.`)
    }

    return this.MNEMONIC
  }

  /** List of the wallet CA Purse addresses. */
  public get purseAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return this.ADDRESSES.filter(({ category }: WalletAddress) => category === WalletAddressCategory.PURSE)
  }

  /** List of the wallet random (non-HD) addresses. */
  private RANDOM_ADDRESSES: WalletAddress[] = []
  /** List of the wallet random (non-HD) addresses. */
  public get randomAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return this.RANDOM_ADDRESSES
  }

  /** List of the wallet CA Savings addresses. */
  public get savingsAddresses(): WalletAddress[] {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)

    return this.ADDRESSES.filter(({ category }: WalletAddress) => category === WalletAddressCategory.SAVINGS)
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

  public constructor(binariesPath: string = BINARIES_PATH as string) {
    this.binariesPath = binariesPath
    this.DAEMON_STATE = WalletDaemonState.STOPPED
    this.rpc = new Rpc(DAEMON_URI, {
      password: DAEMON_CONFIG.rpcpassword,
      username: DAEMON_CONFIG.rpcuser
    })
    this.STATE = WalletState.EMPTY

    this.isNew = !this.isDaemonUserDirectory()
  }

  /**
   * Start the hard wallet daemon.
   */
  public async startDaemon(): Promise<void> {
    this.DAEMON_STATE = WalletDaemonState.STARTING

    if (!this.isFirstStart && this.daemon !== undefined && !await isPortAvailable(Number(DAEMON_CONFIG.rpcport))) {
      this.DAEMON_STATE = WalletDaemonState.STARTED

      return
    }

    // Stop any existing Electra deamon process first
    if (this.isFirstStart) this.isFirstStart = false
    await closeElectraDaemons()

    // Inject Electra.conf file if it doesn't already exist
    const [err1] = tryCatch(injectElectraConfig)
    if (err1 !== undefined) throw err1

    const binaryPath: string = `${this.binariesPath}/${PLATFORM_BINARY[process.platform]}`

    try {
      // tslint:disable-next-line:no-require-imports
      this.daemon = require('child_process').spawn(
        binaryPath,
        [
          `--deamon=1`,
          `--port=${DAEMON_CONFIG.port}`,
          `--rpcuser=${DAEMON_CONFIG.rpcuser}`,
          `--rpcpassword=${DAEMON_CONFIG.rpcpassword}`,
          `--rpcport=${DAEMON_CONFIG.rpcport}`
        ]
      ) as ChildProcess
    }
    catch (err) {
      throw err
    }

    // TODO Add a debug mode in ElectraJs settings
    this.daemon.stdout.setEncoding('utf8').on('data', console.log.bind(this))
    this.daemon.stderr.setEncoding('utf8').on('data', console.log.bind(this))

    this.daemon.on('close', (code: number) => {
      this.DAEMON_STATE = WalletDaemonState.STOPPED
      console.warn(`The wallet daemon process closed with the code: ${code}.`)
    })
    this.daemon.on('exit', (code: number) => {
      console.warn(`The wallet daemon process exited with the code: ${code}.`)
    })

    while (this.DAEMON_STATE === WalletDaemonState.STARTING) {
      const [err2] = await to(this.rpc.getInfo())
      if (err2 === null) {
        this.LOCK_STATE = await this.getDaemonLockState()
        this.DAEMON_STATE = WalletDaemonState.STARTED
      }
    }
  }

  /**
   * Stop the hard wallet daemon.
   */
  public async stopDaemon(): Promise<void> {
    this.DAEMON_STATE = WalletDaemonState.STOPPING

    await this.rpc.stop()
    while ((this.DAEMON_STATE as WalletDaemonState) !== WalletDaemonState.STOPPED) {
      // tslint:disable-next-line:no-magic-numbers
      await wait(250)
    }
  }

  /**
   * Start a wallet with already generated addresses data.
   */
  public start(data: WalletStartDataHard): void {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #start() method can only be called on an empty wallet (#state = "EMPTY").
        Maybe you want to #reset() it first ?
      `)
    }

    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #start() method can only be called on a started hard wallet (#daemon = "STARTED").
        You need to #startDaemon() first.
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
  public async generate(
    passphrase: string,
    mnemonic?: string,
    mnemonicExtension?: string,
    purseAddressesCount: number = 1,
    checkingAddressesCount: number = 1,
    savingsAddressesCount: number = 1,
  ): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_EMPTY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    /*
      --------------------------------------------------
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
      --------------------------------------------------
      STEP 2: HIERARCHICAL DETERMINISTIC MASTER NODE
    */

    let masterNodePrivateKey: string
    try {
      const masterNodeAddress: Address = Electra.getMasterNodeAddressFromMnemonic(mnemonic, mnemonicExtension)
      masterNodePrivateKey = masterNodeAddress.privateKey
      this.MASTER_NODE_ADDRESS = {
        ...masterNodeAddress,
        isCiphered: true,
        privateKey: Crypto.cipherPrivateKey(masterNodePrivateKey, passphrase),
      }
    }
    catch (err) { throw err }

    /*
      --------------------------------------------------
      STEP 3: COMPREHENSIVE ACCOUNTS ADDRESSES
    */

    let addressIndex: number = -1
    try {
      while (++addressIndex < purseAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.PURSE,
          addressIndex,
          false,
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.PURSE,
          addressIndex,
          true,
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.PURSE,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    addressIndex = -1
    try {
      while (++addressIndex < checkingAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.CHECKING,
          addressIndex,
          false,
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.CHECKING,
          addressIndex,
          true,
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.CHECKING,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    addressIndex = -1
    try {
      while (++addressIndex < savingsAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.SAVINGS,
          addressIndex,
          false,
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.SAVINGS,
          addressIndex,
          true,
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.SAVINGS,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    /*
      --------------------------------------------------
      STEP 4: RANDOM ADDRESSES
    */

    // We generate the common HD change address for the random addresses
    const randomAddressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
      masterNodePrivateKey,
      WalletAddressCategory.RANDOM,
      0,
      true,
    )

    // We export all the used addresses from the RPC daemon
    const daemonAddresses: string[] = []
    const [err, entries] = await to(this.rpc.listAddressGroupings())
    if (err !== null || entries === undefined) throw err
    // tslint:disable-next-line:typedef
    entries.forEach((group) => group.forEach(([addressHash]) => daemonAddresses.push(addressHash)))

    // We filter out all the HD addresses
    const randomAddresses: string[] = daemonAddresses
      .filter((daemonAddressHash: string) =>
        R.find<WalletAddress>(R.propEq<string>('hash', daemonAddressHash))(this.ADDRESSES) === undefined &&
        daemonAddressHash !== randomAddressChange.hash
      )

    await this.injectAddressInDaemon(randomAddressChange.privateKey)

    // We save the random addresses
    this.RANDOM_ADDRESSES = randomAddresses.map((hash: string) => ({
      category: WalletAddressCategory.RANDOM,
      change: randomAddressChange.hash,
      hash,
      isHD: false,
      label: null,
    }))

    this.STATE = WalletState.READY
  }

  /**
   * Create a new Comprehensive Accounts address.
   */
  public async createAddress(passphrase: string, category: WalletAddressCategory): Promise<void> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const masterNodePrivateKey: string =
      Crypto.decipherPrivateKey((this.MASTER_NODE_ADDRESS as Address).privateKey, passphrase)

    const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
      masterNodePrivateKey,
      category,
      // tslint:disable-next-line:variable-name
      this.ADDRESSES.filter(({ category: _category }: WalletAddress) => _category === category).length,
      false
    )
    const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
      masterNodePrivateKey,
      category,
      // tslint:disable-next-line:variable-name
      this.ADDRESSES.filter(({ category: _category }: WalletAddress) => _category === category).length,
      true
    )

    await this.injectAddressInDaemon(address.privateKey)
    await this.injectAddressInDaemon(addressChange.privateKey)

    this.ADDRESSES.push({
      ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
      category,
      change: addressChange.hash,
      label: null
    })
  }

  /**
   * Lock the wallet, that is cipher all its private keys.
   */
  public async lock(passphrase?: string): Promise<void> {
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    if (this.isNew && passphrase === undefined) {
      throw new Error(`ElectraJs.Wallet:
        This is a first time #lock() call. You need to provide a [passphrase] in order to set the passphrase.`)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) return

    if (passphrase !== undefined) {
      // tslint:disable-next-line:no-shadowed-variable
      const [err] = await to(this.rpc.encryptWallet(passphrase))
      if (err !== null) { throw err }

      // Dirty hack since we have no idea how long the deamon process will take to exit
      while ((this.DAEMON_STATE as WalletDaemonState) !== WalletDaemonState.STOPPED) {
        // tslint:disable-next-line:no-magic-numbers
        await wait(250)
      }

      // Encrypting the wallet has stopped the deamon, so we need to start it again
      await this.startDaemon()

      this.isNew = false
      this.LOCK_STATE = WalletLockState.LOCKED

      return
    }

    // TODO Find a better DRY way to optimize that check
    const [err] = await to(this.rpc.lock())
    if (err !== null) throw err

    this.LOCK_STATE = WalletLockState.LOCKED
  }

  /**
   * Unlock the wallet, that is decipher all its private keys.
   */
  public async unlock(passphrase: string, forStakingOnly: boolean): Promise<void> {
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

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
  }

  /**
   * Import a wallet data containing ciphered private keys.
   *
   * @note
   * The <wefData> must be a (JSON) WEF following the EIP-0002 specifications.
   * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
   */
  public async import(wefData: WalletExchangeFormat, passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_EMPTY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const [
      version,
      purseAddressesCount,
      checkingAddressesCount,
      savingsAddressesCount,
      hdPrivateKeyX,
      randomPrivateKeysX
    ] = wefData

    // tslint:disable-next-line:no-magic-numbers
    if (version !== 2) {
      throw new Error(`ElectraJs.Wallet: The WEF version should be equal to 2.`)
    }

    /*
      --------------------------------------------------
      STEP 1: HIERARCHICAL DETERMINISTIC MASTER NODE
    */

    let masterNodePrivateKey: string
    try {
      masterNodePrivateKey = Crypto.decipherPrivateKey(hdPrivateKeyX, passphrase)
      const hash: string = Electra.getAddressHashFromPrivateKey(masterNodePrivateKey)
      this.MASTER_NODE_ADDRESS = {
        hash,
        isCiphered: true,
        isHD: true,
        privateKey: hdPrivateKeyX,
      }
    }
    catch (err) { throw err }

    /*
      --------------------------------------------------
      STEP 2: COMPREHENSIVE ACCOUNTS ADDRESSES
    */

    let addressIndex: number = -1
    try {
      while (++addressIndex < purseAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.PURSE,
          addressIndex,
          false
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.PURSE,
          addressIndex,
          false
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.PURSE,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    addressIndex = -1
    try {
      while (++addressIndex < checkingAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.CHECKING,
          addressIndex,
          false
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.CHECKING,
          addressIndex,
          false
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.CHECKING,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    addressIndex = -1
    try {
      while (++addressIndex < savingsAddressesCount) {
        const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.SAVINGS,
          addressIndex,
          false
        )
        const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
          masterNodePrivateKey,
          WalletAddressCategory.SAVINGS,
          addressIndex,
          false
        )

        await this.injectAddressInDaemon(address.privateKey)
        await this.injectAddressInDaemon(addressChange.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          category: WalletAddressCategory.SAVINGS,
          change: addressChange.hash,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    /*
      --------------------------------------------------
      STEP 3: RANDOM ADDRESSES
    */

    const randomAddressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
      masterNodePrivateKey,
      WalletAddressCategory.RANDOM,
      0,
      false
    )

    let randomAddressIndex: number = randomPrivateKeysX.length
    try {
      while (--randomAddressIndex >= 0) {
        const privateKey: string = Crypto.decipherPrivateKey(randomPrivateKeysX[randomAddressIndex], passphrase)
        const hash: string = Electra.getAddressHashFromPrivateKey(privateKey)

        await this.injectAddressInDaemon(privateKey)
        await this.injectAddressInDaemon(randomAddressChange.privateKey)

        this.RANDOM_ADDRESSES.push({
          category: WalletAddressCategory.RANDOM,
          change: randomAddressChange.hash,
          hash,
          isHD: false,
          label: null,
        })
      }
    }
    catch (err) { throw err }

    this.STATE = WalletState.READY
  }

  /**
   * Export wallet data with ciphered private keys.
   *
   * @note
   * The returned string will be a stringified JSON WEF following the EIP-0002 specifications.
   * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
   */
  public async export(passphrase: string): Promise<string> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    // We export the random addresses private keys from the daemon
    const randomAddressesPrivateKeysCiphered: string[] = []
    let index: number = -1
    while (++index < this.randomAddresses.length) {
      const [err, privateKey] = await to(this.rpc.getPrivateKey(this.randomAddresses[index].hash))
      if (err !== null || privateKey === undefined) throw err
      randomAddressesPrivateKeysCiphered.push(Crypto.cipherPrivateKey(privateKey, passphrase))
    }

    const wefData: WalletExchangeFormat = [
      // tslint:disable-next-line:no-magic-numbers
      2,
      this.purseAddresses.length,
      this.checkingAddresses.length,
      this.savingsAddresses.length,
      (this.MASTER_NODE_ADDRESS as Address).privateKey,
      randomAddressesPrivateKeysCiphered
    ]

    return JSON.stringify(wefData)
  }

  /**
   * Import a ramdomly generated (legacy) WIF private key into the wallet.
   * If the [passphrase] is not defined, the <privateKey> MUST be given deciphered.
   * If the [passphrase] is defined, the <privateKey> MUST be given ciphered.
   */
  public async importRandomAddress(privateKey: string, passphrase: string): Promise<void> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    try {
      const addressChange: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
        (this.MASTER_NODE_ADDRESS as Address).privateKey,
        WalletAddressCategory.RANDOM,
        0,
        true,
      )

      await this.injectAddressInDaemon(privateKey)
      await this.injectAddressInDaemon(addressChange.privateKey)

      this.RANDOM_ADDRESSES.push({
        category: WalletAddressCategory.RANDOM,
        change: addressChange.hash,
        hash: Electra.getAddressHashFromPrivateKey(privateKey),
        isHD: false,
        label: null,
      })
    }
    catch (err) {
      throw err
    }
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
   * Get the global wallet balance, confirmed and unconfirmed.
   */
  public async getBalance(): Promise<WalletBalance> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    try {
      const [confirmedBalance, fullBalance]: [
        RpcMethodResult<'getbalance'>,
        RpcMethodResult<'getbalance'>
      ] = await Promise.all<
        RpcMethodResult<'getbalance'>,
        RpcMethodResult<'getbalance'>
      >([
        this.rpc.getBalance(),
        this.rpc.getBalance('*', 0),
      ])

      return {
        confirmed: confirmedBalance,
        unconfirmed: fullBalance - confirmedBalance,
      }
    }
    catch (err) {
      throw err
    }
  }

  /**
   * Get the CA category balance, confirmed and unconfirmed.
   */
  public async getCategoryBalance(category: WalletAddressCategory): Promise<WalletBalance> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const addressesHashes: string[] = this.allAddresses
      // tslint:disable-next-line:variable-name
      .filter(({ category: _category }: WalletAddress) => _category === category)
      .reduce((hashes: string[], { change, hash }: WalletAddress) => [...hashes, hash, change], [])

    const [err1, confirmedTransactions] = await to(this.rpc.listUnspent(1, LIST_TRANSACTIONS_LENGTH, addressesHashes))
    if (err1 !== null || confirmedTransactions === undefined) throw err1

    const [err2, allTransactions] = await to(this.rpc.listUnspent(0, LIST_TRANSACTIONS_LENGTH, addressesHashes))
    if (err2 !== null || allTransactions === undefined) throw err2

    const confirmed: number = confirmedTransactions
      // tslint:disable-next-line:no-parameter-reassignment variable-name
      .reduce((total: number, { amount: _amount }: RpcMethodResult<'listunspent'>[0]) => total += _amount, 0)
    const confirmedAndUnconfirmed: number = allTransactions
      // tslint:disable-next-line:no-parameter-reassignment variable-name
      .reduce((total: number, { amount: _amount }: RpcMethodResult<'listunspent'>[0]) => total += _amount, 0)

    return {
      confirmed,
      unconfirmed: confirmedAndUnconfirmed - confirmed,
    }
  }

  /**
   * Get the <address> balance, confirmed and unconfirmed.
   */
  public async getAddressBalance(addressHash: string): Promise<WalletBalance> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const [err1, confirmedTransactions] = await to(this.rpc.listUnspent(1, LIST_TRANSACTIONS_LENGTH, [addressHash]))
    if (err1 !== null || confirmedTransactions === undefined) throw err1

    const [err2, allTransactions] = await to(this.rpc.listUnspent(0, LIST_TRANSACTIONS_LENGTH, [addressHash]))
    if (err2 !== null || allTransactions === undefined) throw err2

    const confirmed: number = confirmedTransactions
      // tslint:disable-next-line:no-parameter-reassignment variable-name
      .reduce((total: number, { amount: _amount }: RpcMethodResult<'listunspent'>[0]) => total += _amount, 0)
    const confirmedAndUnconfirmed: number = allTransactions
      // tslint:disable-next-line:no-parameter-reassignment variable-name
      .reduce((total: number, { amount: _amount }: RpcMethodResult<'listunspent'>[0]) => total += _amount, 0)

    return {
      confirmed,
      unconfirmed: confirmedAndUnconfirmed - confirmed,
    }
  }

  /**
   * Get the wallet info.
   */
  public async getInfo(): Promise<WalletInfo> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

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
   * List the wallet transactions (from the newer to the older one).
   */
  public async getTransactions(
    count: number = LIST_TRANSACTIONS_LENGTH,
    category?: WalletAddressCategory
  ): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const [err1, res] = await to(this.rpc.listTransactions('*', LIST_TRANSACTIONS_LENGTH))
    if (err1 !== null || res === undefined) throw err1

    let transactionsRaw: RpcMethodResult<'listtransactions'>
    if (category !== undefined) {
      const categoryAddressesHashes: string[] = this.allAddresses
        // tslint:disable-next-line:variable-name
        .filter(({ category: _category }: WalletAddress) => _category === category)
        .reduce((hashes: string[], { change, hash }: WalletAddress) => [...hashes, hash, change], [])

      transactionsRaw = res
        .filter(({ address }: RpcMethodResult<'listtransactions'>[0]) => categoryAddressesHashes.includes(address))
    } else {
      transactionsRaw = res
    }

    let index: number = -1
    const transactions: WalletTransaction[] = []
    while (++index < transactionsRaw.length) {
      const transactionRaw: RpcMethodResult<'listtransactions'>[0] = transactionsRaw[index]
      const transaction: Partial<WalletTransaction> = {
        amount: transactionRaw.amount,
        confimationsCount: transactionRaw.confirmations,
        date: transactionRaw.time,
        hash: transactionRaw.txid,
      }

      if (transactionRaw.category === 'generate') {
        transaction.to = [transactionRaw.address]
        transaction.toCategories = [this.getCategoryFromAddress(transactionRaw.address)]
        transaction.type = WalletTransactionType.GENERATED
      } else {
        const [err2, transactionInfo] = await to(this.rpc.getTransaction(transaction.hash as string))
        if (err2 !== null || transactionInfo === undefined) throw err2

        if (transactionRaw.category === 'send') {
          transaction.from = [transactionRaw.address]
          transaction.fromCategories = [this.getCategoryFromAddress(transactionRaw.address)]
          transaction.to = transactionInfo.details
            // tslint:disable-next-line:variable-name
            .filter(({ category: _category }: RpcMethodResult<'gettransaction'>['details'][0]) =>
              _category === 'receive'
            )
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => address)
          transaction.toCategories = transactionInfo.details
            // tslint:disable-next-line:variable-name
            .filter(({ category: _category }: RpcMethodResult<'gettransaction'>['details'][0]) =>
              _category === 'receive'
            )
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => this.getCategoryFromAddress(address))
          transaction.type = WalletTransactionType.SENT
        }

        if (transactionRaw.category === 'receive') {
          transaction.from = transactionInfo.details
            // tslint:disable-next-line:variable-name
            .filter(({ category: _category }: RpcMethodResult<'gettransaction'>['details'][0]) => _category === 'send')
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => address)
          transaction.fromCategories = transactionInfo.details
            // tslint:disable-next-line:variable-name
            .filter(({ category: _category }: RpcMethodResult<'gettransaction'>['details'][0]) => _category === 'send')
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => this.getCategoryFromAddress(address))
          transaction.to = [transactionRaw.address]
          transaction.toCategories = [this.getCategoryFromAddress(transactionRaw.address)]
          transaction.type = WalletTransactionType.RECEIVED
        }
      }

      transactions.push(transaction as WalletTransaction)
    }

    return count < LIST_TRANSACTIONS_LENGTH
      ? transactions.reverse().slice(0, count)
      : transactions.reverse()
  }

  /**
   * Get the transaction info of <transactionHash>.
   */
  public async getTransaction(transactionHash: string): Promise<WalletTransaction | undefined> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    const [err, transactions] = await to(this.getTransactions())
    if (err !== null || transactions === undefined) throw err

    const found: WalletTransaction[] = transactions.filter(({ hash }: WalletTransaction) => hash === transactionHash)

    return found.length !== 0 ? found[0] : undefined
  }

  /**
   * Does the daemon user directory exist ?
   */
  public isDaemonUserDirectory(): boolean {
    // tslint:disable-next-line:no-require-imports
    return (require('fs').existsSync(DAEMON_USER_DIR_PATH) as boolean)
  }

  /**
   * Try to guess the daemon lock state by checking if the 'lock' method is available.
   */
  private async getDaemonLockState(): Promise<WalletLockState> {
    const [err] = await to(this.rpc.lock())
    if (err !== null && err.message === EJErrorCode.DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET) {
      return WalletLockState.UNLOCKED
    }

    return WalletLockState.LOCKED
  }

  /**
   * Inject an <addressPrivateKey> in the deamon.
   */
  private async injectAddressInDaemon(addressPrivateKey: string): Promise<void> {
    // We ignore this error in case the private key is already registered by the RPC deamon.
    await to(this.rpc.importPrivateKey(addressPrivateKey))
  }

  /**
   * Create and broadcast a new transaction of <amount> (inluding the transaction fees) <toAddressHash>
   * from the lower possible unspent confirmed (confirmations >= 1) ones.
   */
  // tslint:disable-next-line:cyclomatic-complexity
  public async send(amount: number, category: WalletAddressCategory, toAddressHash: string): Promise<void> {
    if (this.STATE !== WalletState.READY) throw new EJError(EJErrorCode.WALLET_STATE_NOT_READY)
    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) throw new EJError(EJErrorCode.WALLET_LOCK_STATE_NOT_UNLOCKED)
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) throw new EJError(EJErrorCode.WALLET_DAEMON_STATE_NOT_STARTED)

    if (amount <= 0) throw new Error(`ElectraJs.Wallet: You can only send #send() a strictly positive <amount>.`)
    if (Math.round(amount * SATOSHI) <= ECA_TRANSACTION_FEE) {
      throw new Error(`ElectraJs.Wallet: You can't send an <amount> lower or equal to the transaction fee.`)
    }

    const [err1, inputTransactionsRaw] = await to(this.getUnspentTransactionSumming(amount, category))
    if (err1 !== null || inputTransactionsRaw === undefined) throw err1

    const transactionsAmountTotal: number = inputTransactionsRaw
      // tslint:disable-next-line:no-parameter-reassignment variable-name
      .reduce((total: number, { amount: _amount }: WalletUnspentTransaction) => total += _amount, 0)

    const inputTransactions: Array<{ txid: string, vout: number }> = inputTransactionsRaw
      .map(({ txid, vout }: WalletUnspentTransaction) => ({ txid, vout }))

    const outputTransactions: { [addressHash: string]: number } = {}
    outputTransactions[toAddressHash] = amount - ECA_TRANSACTION_FEE

    // Change address output
    if (transactionsAmountTotal > amount) {
      const lastInputTransaction: WalletUnspentTransaction = inputTransactionsRaw[inputTransactions.length - 1]
      let changeAddress: string

      switch (category) {
        case WalletAddressCategory.CHECKING:
          changeAddress = lastInputTransaction.isChange
            ? this.checkingAddresses[lastInputTransaction.index].hash
            : this.checkingAddresses[lastInputTransaction.index].change
          outputTransactions[changeAddress] = transactionsAmountTotal - amount
          break

        case WalletAddressCategory.PURSE:
          changeAddress = lastInputTransaction.isChange
            ? this.purseAddresses[lastInputTransaction.index].hash
            : this.purseAddresses[lastInputTransaction.index].change
          outputTransactions[changeAddress] = transactionsAmountTotal - amount
          break

        case WalletAddressCategory.RANDOM:
          outputTransactions[this.checkingAddresses[0].hash] = transactionsAmountTotal - amount
          break

        case WalletAddressCategory.SAVINGS:
          changeAddress = lastInputTransaction.isChange
            ? this.savingsAddresses[lastInputTransaction.index].hash
            : this.savingsAddresses[lastInputTransaction.index].change
          outputTransactions[changeAddress] = transactionsAmountTotal - amount
          break

        default:
          throw new Error('ElectraJs.Wallet: This #send() case should never happen.')
      }
    }

    const [err2, unsignedTransaction] = await to(this.rpc.createRawTransaction(inputTransactions, outputTransactions))
    if (err2 !== null || unsignedTransaction === undefined) throw err2

    const [err3, signedTransaction] = await to(this.rpc.signRawTransaction(unsignedTransaction))
    if (err3 !== null || signedTransaction === undefined) throw err3

    const [err4, test] = await to(this.rpc.sendRawTransaction(signedTransaction.hex))
    if (err4 !== null || test === undefined) throw err4
  }

  /**
   * List the wallet CA unspent transactions, ordered by ascending amount.
   */
  private async getUnspentTransactionSumming(
    amount: number,
    category: WalletAddressCategory,
  ): Promise<WalletUnspentTransaction[]> {
    const addressesHashes: string[] = this.allAddresses
      // tslint:disable-next-line:variable-name
      .filter(({ category: _category }: WalletAddress) => _category === category)
      .reduce((hashes: string[], { change, hash }: WalletAddress) => [...hashes, hash, change], [])

    const [err, unspentTransactionsRaw] = await to(this.rpc.listUnspent(1, LIST_TRANSACTIONS_LENGTH, addressesHashes))
    if (err !== null || unspentTransactionsRaw === undefined) throw err

    const unspentTransactionsSorted: RpcMethodResult<'listunspent'> =
      R.sort(R.ascend(R.prop('amount')), unspentTransactionsRaw)

    let balance: number = 0
    let index: number = unspentTransactionsSorted.length
    const transactions: RpcMethodResult<'listunspent'> = []
    while (--index >= 0) {
      balance += unspentTransactionsSorted[index].amount
      transactions.push(unspentTransactionsSorted[index])
      if (balance >= amount) break
    }

    if (balance < amount) throw new EJError(EJErrorCode.WALLET_TRANSACTION_AMOUNT_HIGHER_THAN_AVAILABLE)

    return this.normalizeUnspentTransactions(category, transactions)
  }

  /**
   * Normalize daemon raw unspent transactions collection.
   */
  private normalizeUnspentTransactions(
    category: WalletAddressCategory,
    transactionsRaw: RpcMethodResult<'listunspent'>
  ): WalletUnspentTransaction[] {
    return transactionsRaw.map((transactionRaw: RpcMethodResult<'listunspent'>[0]) => {
      const transaction: Pick<WalletUnspentTransaction, 'address' | 'amount' | 'txid' | 'vout'> = {
        address: transactionRaw.address,
        amount: transactionRaw.amount,
        txid: transactionRaw.txid,
        vout: transactionRaw.vout,
      }

      let index: number
      switch (category) {
        case WalletAddressCategory.CHECKING:
          index = R.findIndex<WalletAddress>(R.propEq('hash', transaction.address))(this.checkingAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.CHECKING, index, isChange: false }
          index = R.findIndex<WalletAddress>(R.propEq('change', transaction.address))(this.checkingAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.CHECKING, index, isChange: true }
          throw new Error('ElectraJs.Wallet: This #normalizeUnspentTransactions() case should never happen.')

        case WalletAddressCategory.PURSE:
          index = R.findIndex<WalletAddress>(R.propEq('hash', transaction.address))(this.purseAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.PURSE, index, isChange: false }
          index = R.findIndex<WalletAddress>(R.propEq('change', transaction.address))(this.purseAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.PURSE, index, isChange: true }
          throw new Error('ElectraJs.Wallet: This #normalizeUnspentTransactions() case should never happen.')

        case WalletAddressCategory.RANDOM:
          index = R.findIndex<WalletAddress>(R.propEq('hash', transaction.address))(this.randomAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.PURSE, index, isChange: false }
          throw new Error('ElectraJs.Wallet: This #normalizeUnspentTransactions() case should never happen.')

        case WalletAddressCategory.SAVINGS:
          index = R.findIndex<WalletAddress>(R.propEq('hash', transaction.address))(this.savingsAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.SAVINGS, index, isChange: false }
          index = R.findIndex<WalletAddress>(R.propEq('change', transaction.address))(this.savingsAddresses)
          if (index !== -1) return { ...transaction, category: WalletAddressCategory.SAVINGS, index, isChange: true }
          throw new Error('ElectraJs.Wallet: This #normalizeUnspentTransactions() case should never happen.')

        default:
          throw new Error('ElectraJs.Wallet: This #normalizeUnspentTransactions() case should never happen.')
      }
    })
  }

  /**
   * Get the CA category from an address hash.
   */
  private getCategoryFromAddress(addressHash: string): WalletAddressCategory {
    const found: WalletAddress[] = this.allAddresses
      .filter(({ change, hash }: WalletAddress) => change === addressHash || hash === addressHash)

    return found.length === 0 ? WalletAddressCategory.EXTERNAL : found[0].category
  }
}

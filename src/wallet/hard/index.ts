// tslint:disable:max-file-line-count

import to from 'await-to-js'
import { ChildProcess } from 'child_process'
import * as R from 'ramda'

import { BINARIES_PATH, DAEMON_CONFIG, DAEMON_URI, DAEMON_USER_DIR_PATH, ECA_TRANSACTION_FEE } from '../../constants'
import closeElectraDaemons from '../../helpers/closeElectraDaemons'
import getMaxItemFromList from '../../helpers/getMaxItemFromList'
import injectElectraConfig from '../../helpers/injectElectraConfig'
import tryCatch from '../../helpers/tryCatch'
import wait from '../../helpers/wait'
import Crypto from '../../libs/crypto'
import Electra from '../../libs/electra'
import Rpc from '../../libs/rpc'

import { RpcMethodResult } from '../../libs/rpc/types'
import { Address, Omit } from '../../types'
import {
  PlatformBinary,
  WalletAddress,
  WalletAddressWithoutPK,
  WalletBalance,
  WalletDaemonState,
  WalletExchangeFormat,
  WalletInfo,
  WalletLockState,
  WalletStartDataHard,
  WalletState,
  WalletTransaction,
  WalletTransactionType
} from '../types'

const LIST_TRANSACTIONS_LENGTH: number = 1000000
// tslint:disable-next-line:no-magic-numbers
const ONE_YEAR_IN_SECONDS: number = 60 * 60 * 24 * 365
const PLATFORM_BINARY: PlatformBinary = {
  darwin: 'electrad-macos',
  linux: 'electrad-linux',
  win32: 'electrad-windows.exe'
}
const WALLET_INDEX: number = 0

/**
 * Wallet management.
 */
export default class WalletHard {
  /** List of the wallet HD addresses. */
  private ADDRESSES: WalletAddressWithoutPK[] = []
  /** List of the wallet HD addresses. */
  public get addresses(): WalletAddressWithoutPK[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #addresses are only available when the #state is "READY".`)
    }

    return this.ADDRESSES
  }

  /** List of the wallet non-HD (random) and HD addresses. */
  public get allAddresses(): WalletAddressWithoutPK[] {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #allAddresses are only available when the #state is "READY".`)
    }

    return [...this.ADDRESSES, ...this.RANDOM_ADDRESSES]
  }

  /** Daemon binaries directory path. */
  private readonly binariesPath: string

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
        #masterNodeAddress is only available after a brand new Wallet has been generated the #state is "READY".
      `)
    }

    if (this.LOCK_STATE === WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        #masterNodeAddress is only available on a staking or locked wallet (#lockState = "STAKING" | "LOCKED").
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
  private RANDOM_ADDRESSES: WalletAddressWithoutPK[] = []
  /** List of the wallet random (non-HD) addresses. */
  public get randomAddresses(): WalletAddressWithoutPK[] {
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

    // Stop any existing Electra deamon process first
    if (this.isFirstStart) {
      await closeElectraDaemons()
      this.isFirstStart = false
    }

    // Inject Electra.conf file if it doesn't already exist
    const [err1] = tryCatch(injectElectraConfig)
    if (err1 !== undefined) throw err1

    if (process.platform === 'win32') {
      // TODO Temporary hack for dev while the Windows binary is being fixed
      const binaryPath: string = BINARIES_PATH as string

      try {
        // tslint:disable-next-line:no-require-imports
        this.daemon = require('child_process').exec(binaryPath) as ChildProcess
      }
      catch (err) {
        throw err
      }
    } else {
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
  public async generate(mnemonic?: string, mnemonicExtension?: string, chainsCount: number = 1): Promise<void> {
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on an empty wallet (#state = "EMPTY").
        You need to #reset() it first, then #initialize() it again in order to #generate() a new one.
      `)
    }

    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on a started hard wallet (#daemon = "STARTED").
        You need to #startDaemon() first.
      `)
    }

    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called once the hard wallet has been unlocked (#lockState = "UNLOCKED").
        You need to #unlock() it first.
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

        await this.injectAddressInDaemon(address.privateKey)

        this.ADDRESSES.push({
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
          label: null
        })
      }
    }
    catch (err) { throw err }

    /*
      ----------------------------------
      STEP 4: RANDOM ADDRESSES
    */

    // We export all the used addresses from the RPC daemon
    const daemonAddresses: string[] = []
    const [err, entries] = await to(this.rpc.listAddressGroupings())
    if (err !== null || entries === undefined) throw err
    // tslint:disable-next-line:typedef
    entries.forEach((group) => group.forEach(([addressHash]) => daemonAddresses.push(addressHash)))

    // We filter out all the HD addresses
    const randomAddresses: string[] = daemonAddresses
      .filter((daemonAddressHash: string) =>
        this.ADDRESSES.filter(({ hash }: WalletAddress) => daemonAddressHash === hash).length === 0)

    // We save the random addresses
    this.RANDOM_ADDRESSES = randomAddresses.map((hash: string) => ({
      hash,
      isHD: false,
      label: null,
    }))

    this.STATE = WalletState.READY
  }

  /**
   * Create a new HD chain address.
   */
  public async createAddress(): Promise<void> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #export() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.LOCK_STATE !== WalletLockState.UNLOCKED) {
      throw new Error(`ElectraJs.Wallet:
        The wallet is currently locked. You need to #unlock() it first with <forStakingOnly> param to FALSE.
      `)
    }

    const address: Address = Electra.getDerivedChainFromMasterNodePrivateKey(
      (this.MASTER_NODE_ADDRESS as WalletAddress).privateKey,
      WALLET_INDEX,
      this.ADDRESSES.length
    )

    await this.injectAddressInDaemon(address.privateKey)

    this.ADDRESSES.push({
      ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
      label: null
    })
  }

  /**
   * Lock the wallet, that is cipher all its private keys.
   */
  public async lock(passphrase?: string): Promise<void> {
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #lock() method can only be called on a started wallet (#daemonState = "STARTED").`)
    }

    if (this.isNew && passphrase === undefined) {
      throw new Error(`ElectraJs.Wallet:
        This is a first time #lock() call. You need to provide a [passphrase] in order to set the passphrase.`)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) return

    if (passphrase !== undefined) {
      try {
        if (this.MASTER_NODE_ADDRESS !== undefined && !this.MASTER_NODE_ADDRESS.isCiphered) {
          this.MASTER_NODE_ADDRESS.privateKey = Crypto.cipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase)
          this.MASTER_NODE_ADDRESS.isCiphered = true
        }
      }
      catch (err) {
        throw err
      }

      const [err2] = await to(this.rpc.encryptWallet(passphrase))
      if (err2 !== null) { throw err2 }

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
    const [err3] = await to(this.rpc.lock())
    if (err3 !== null) throw err3

    this.LOCK_STATE = WalletLockState.LOCKED
  }

  /**
   * Unlock the wallet, that is decipher all its private keys.
   */
  public async unlock(passphrase: string, forStakingOnly: boolean = true): Promise<void> {
    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #unlock() method can only be called on a started wallet (#daemonState = "STARTED").`)
    }

    try {
      if (this.MASTER_NODE_ADDRESS !== undefined && this.MASTER_NODE_ADDRESS.isCiphered) {
        this.MASTER_NODE_ADDRESS.privateKey = Crypto.decipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase)
        this.MASTER_NODE_ADDRESS.isCiphered = false
      }
    }
    catch (err) { throw err }

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
    if (this.STATE !== WalletState.EMPTY) {
      throw new Error(`ElectraJs.Wallet:
        The #import() method can only be called on an empty wallet (#state = "EMPTY").
        Maybe you want to #reset() it first ?
      `)
    }

    if (this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #import() method can only be called on a started hard wallet (#daemon = "STARTED").
        You need to #startDaemon() first.
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
          ...R.omit<Omit<Address, 'isCiphered' | 'privateKey'>>(['isCiphered', 'privateKey'], address),
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
        await this.injectAddressInDaemon(privateKey)
        this.RANDOM_ADDRESSES.push({
          hash,
          isHD: true,
          label: null,
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

    const [err] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
    if (err !== null) throw err
  }

  /**
   * List the wallet transactions (from the newer to the older one).
   */
  public async getTransactions(count: number = LIST_TRANSACTIONS_LENGTH): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #getTransactions() is only available when the #state is "READY".`)
    }

    const [err1, transactionsRaw] = await to(this.rpc.listTransactions('*', LIST_TRANSACTIONS_LENGTH))
    if (err1 !== null || transactionsRaw === undefined) throw err1

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
        transaction.type = WalletTransactionType.GENERATED
      } else {
        const [err2, transactionInfo] = await to(this.rpc.getTransaction(transaction.hash as string))
        if (err2 !== null || transactionInfo === undefined) throw err2

        if (transactionRaw.category === 'send') {
          transaction.from = [transactionRaw.address]
          transaction.to = transactionInfo.details
            .filter(({ category }: RpcMethodResult<'gettransaction'>['details'][0]) => category === 'receive')
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => address)
          transaction.type = WalletTransactionType.SENT
        }

        if (transactionRaw.category === 'receive') {
          transaction.from = transactionInfo.details
            .filter(({ category }: RpcMethodResult<'gettransaction'>['details'][0]) => category === 'send')
            .map(({ address }: RpcMethodResult<'gettransaction'>['details'][0]) => address)
          transaction.to = [transactionRaw.address]
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
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #getTransaction() is only available when the #state is "READY".`)
    }

    const [err, transactions] = await to(this.getTransactions())
    if (err !== null || transactions === undefined) throw err

    const found: WalletTransaction[] = transactions.filter(({ hash }: WalletTransaction) => hash === transactionHash)

    return found.length !== 0 ? found[0] : undefined
  }

  /**
   * Does the daemon user directory exist ?
   */
  private isDaemonUserDirectory(): boolean {
    // tslint:disable-next-line:no-require-imports
    return (require('fs').existsSync(DAEMON_USER_DIR_PATH) as boolean)
  }

  /**
   * Try to guess the daemon lock state by checking if the 'lock' method is available.
   */
  private async getDaemonLockState(): Promise<WalletLockState> {
    if (this.DAEMON_STATE !== WalletDaemonState.STARTING) {
      throw new Error(`ElectraJs.Wallet:
        #getLockState() is only available when the hard wallet is starting (#DAEMON_STATE = 'STARTING').`)
    }

    const [err] = await to(this.rpc.lock())
    if (err !== null && err.message === 'DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET') {
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

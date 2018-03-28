import to from 'await-to-js'
import { ChildProcess } from 'child_process'
import * as R from 'ramda'

import { BINARIES_PATH, DAEMON_CONFIG, DAEMON_URI, DAEMON_USER_DIR_PATH, ECA_TRANSACTION_FEE } from '../constants'
import closeElectraDaemons from '../helpers/closeElectraDaemons'
import getMaxItemFromList from '../helpers/getMaxItemFromList'
import injectElectraConfig from '../helpers/injectElectraConfig'
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
  WalletDaemonState,
  WalletExchangeFormat,
  WalletInfo,
  WalletLockState,
  WalletState,
  WalletTransaction,
  WalletTransactionType
} from './types'

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

  /** Hard wallet daemon Node child process. */
  private daemon: ChildProcess

  /** Electra Daemon state. */
  private DAEMON_STATE: WalletDaemonState
  /** Electra Daemon state. */
  public get daemonState(): WalletDaemonState {
    if (!this.isHard) {
      throw new Error(`ElectraJs.Wallet: #daemonState is only available when using the hard wallet.`)
    }

    return this.DAEMON_STATE
  }

  /** Is it a hard wallet (= using the daemon binary) ? */
  private readonly isHard: boolean

  /** Is it a brand new wallet (= no pre-existing ".Electra directory") ? */
  public isNew: boolean

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

  public constructor(isHard: boolean = false) {
    this.isHard = isHard
    this.STATE = WalletState.EMPTY

    if (isHard) {
      this.rpc = new Rpc(DAEMON_URI, {
        password: DAEMON_CONFIG.rpcpassword,
        username: DAEMON_CONFIG.rpcuser
      })

      // tslint:disable-next-line:no-require-imports
      this.isNew = !this.isDaemonUserDirectory()

      this.DAEMON_STATE = WalletDaemonState.STOPPED

      return
    }

    this.LOCK_STATE = WalletLockState.UNLOCKED
  }

  /**
   * Start the hard wallet daemon.
   */
  public async startDaemon(): Promise<void> {
    if (!this.isHard) {
      throw new Error(`ElectraJs.Wallet: The #startDeamon() method can only be called on a hard wallet`)
    }

    this.DAEMON_STATE = WalletDaemonState.STARTING

    // Stop any existing Electra deamon process first
    await closeElectraDaemons()

    // Inject Electra.conf file if it doesn't already exist
    const [err1] = tryCatch(injectElectraConfig)
    if (err1 !== undefined) throw err1

    if (process.platform === 'win32') {
      // TODO Temporary hack for dev while the Windows binary is being fixed
      const binaryPath: string = BINARIES_PATH as string

      // TODO An Everyone:F may be too much...
      // tslint:disable-next-line:no-require-imports
      // require('child_process').execSync(`icacls ${binaryPath} /grant Everyone:F`)

      // tslint:disable-next-line:no-require-imports
      this.daemon = require('child_process').exec(binaryPath)

      // TODO Add a debug mode in ElectraJs settings
      this.daemon.stdout.setEncoding('utf8').on('data', console.log.bind(this))
      this.daemon.stderr.setEncoding('utf8').on('data', console.log.bind(this))

      this.daemon.on('close', (code: number) => {
        this.DAEMON_STATE = WalletDaemonState.STOPPED

        // tslint:disable-next-line:no-console
        console.log(`The wallet daemon exited with the code: ${code}.`)
      })
    } else {
      const binaryPath: string = `${BINARIES_PATH}/${PLATFORM_BINARY[process.platform]}`

      // Dirty hack to give enough permissions to the binary in order to be run
      // tslint:disable-next-line:no-require-imports
      require('child_process').execSync(`chmod 755 ${binaryPath}`)

      // tslint:disable-next-line:no-require-imports
      this.daemon = require('child_process').spawn(
        binaryPath,
        [
        `--deamon=1`,
        `--port=${DAEMON_CONFIG.port}`,
        `--rpcuser=${DAEMON_CONFIG.rpcuser}`,
        `--rpcpassword=${DAEMON_CONFIG.rpcpassword}`,
        `--rpcport=${DAEMON_CONFIG.rpcport}`
        ])

      // TODO Add a debug mode in ElectraJs settings
      this.daemon.stdout.setEncoding('utf8').on('data', console.log.bind(this))
      this.daemon.stderr.setEncoding('utf8').on('data', console.log.bind(this))

      this.daemon.on('close', (code: number) => {
        this.DAEMON_STATE = WalletDaemonState.STOPPED

        // tslint:disable-next-line:no-console
        console.log(`The wallet daemon exited with the code: ${code}.`)
      })
    }

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
    if (!this.isHard) {
      throw new Error(`ElectraJs.Wallet: The #stopDeamon() method can only be called on a hard wallet`)
    }

    this.DAEMON_STATE = WalletDaemonState.STOPPING

    await closeElectraDaemons()

    // Dirty hack since we have no idea how long the deamon process will take to be killed
    /*while ((this.DAEMON_STATE as WalletDaemonState) !== WalletDaemonState.STOPPED) {
      // tslint:disable-next-line:no-magic-numbers
      await wait(250)
    }*/

    if ((this.DAEMON_STATE as WalletDaemonState) !== WalletDaemonState.STOPPED) {
      this.DAEMON_STATE = WalletDaemonState.STOPPED
      this.daemon.kill()
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

    if (this.isHard && this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on a started hard wallet (#daemon = "STARTED").
        You need to #startDaemon() first.
      `)
    }

    if (this.isHard && this.LOCK_STATE !== WalletLockState.UNLOCKED) {
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

    if (this.isHard) {
      let i: number

      // We try to export all the used addresses from the RPC daemon
      const daemonAddresses: string[] = []
      const [err, entries] = await to(this.rpc.listAddressGroupings())
      if (err !== null || entries === undefined) throw err
      // tslint:disable-next-line:typedef
      entries.forEach((group) => group.forEach(([addressHash]) => daemonAddresses.push(addressHash)))

      // We filter out all the HD addresses
      const randomAddresses: string[] = daemonAddresses
        .filter((daemonAddressHash: string) =>
          this.ADDRESSES.filter(({ hash }: WalletAddress) => daemonAddressHash === hash).length === 0)

      // We try to retrieve the random addresses private keys and import them
      i = randomAddresses.length
      while (--i >= 0) {
        try {
          await this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey)
          this.RANDOM_ADDRESSES.push({
            hash: randomAddresses[i],
            isCiphered: false,
            isHD: false,
            label: null,
            privateKey: await this.rpc.getPrivateKey(randomAddresses[i])
          })
        }
        catch (err) {
          // We ignore this error for now.
        }
      }

      // We try to import the HD addresses into the RPC deamon
      i = this.ADDRESSES.length
      while (--i >= 0) {
        try { await this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey) }
        catch (err) {
          // We ignore this error in case the private key is already registered by the RPC deamon.
        }
      }
    }

    this.STATE = WalletState.READY
  }

  /**
   * Lock the wallet, that is cipher all its private keys.
   */
  public async lock(passphrase: string): Promise<void> {
    if (!this.isHard && this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #lock() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.isHard && this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #lock() method can only be called on a started wallet (#daemonState = "STARTED").`)
    }

    if (this.LOCK_STATE === WalletLockState.LOCKED) return

    if (this.isHard) {
      if (this.isNew) {
        const [err1] = await to(this.rpc.encryptWallet(passphrase))
        if (err1 !== null) { throw err1 }

        // Dirty hack since we have no idea how long the deamon process will take to exit
        while (this.DAEMON_STATE !== WalletDaemonState.STOPPED) {
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
      const [err2] = await to(this.rpc.lock())
      if (err2 !== null && err2.message === 'DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET') {
        this.isNew = true
        await this.lock(passphrase)

        return
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
    if (!this.isHard && this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: The #unlock() method can only be called on a ready wallet (#state = "READY").`)
    }

    if (this.isHard && this.DAEMON_STATE !== WalletDaemonState.STARTED) {
      throw new Error(`ElectraJs.Wallet:
        The #unlock() method can only be called on a started wallet (#daemonState = "STARTED").`)
    }

    if (this.isHard) {
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

    if (this.isHard) {
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
  }

  /**
   * Get the global wallet balance, or the <address> balance if specified.
   */
  public async getBalance(addressHash?: string): Promise<number> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: You can only #getBalance() from a ready wallet (#state = "READY").`)
    }

    if (this.isHard) {
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
   * Get the wallet info.
   */
  public async getInfo(): Promise<WalletInfo> {
    if (this.STATE !== WalletState.READY) {
      return Promise.reject(new Error(`ElectraJs.Wallet: #getInfo() is only available when the #state is "READY".`))
    }

    try {
      const [localBlockchainHeight, peersInfo, stakingInfo]: [
        RpcMethodResult<'getblockcount'>,
        RpcMethodResult<'getpeerinfo'>,
        RpcMethodResult<'getstakinginfo'>
      ] = await Promise.all<
        RpcMethodResult<'getblockcount'>,
        RpcMethodResult<'getpeerinfo'>,
        RpcMethodResult<'getstakinginfo'>
      >([
        this.rpc.getLocalBlockHeight(),
        this.rpc.getPeersInfo(),
        this.rpc.getStakingInfo(),
      ])

      const networkBlockchainHeight: number = peersInfo.length !== 0
        ? getMaxItemFromList(peersInfo, 'startingheight').startingheight
        : 0

      return {
        connectionsCount: peersInfo.length,
        isHD: Boolean(this.MASTER_NODE_ADDRESS),
        isStaking: stakingInfo.staking,
        isSynchonized: localBlockchainHeight >= networkBlockchainHeight,
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

    if (amount > (await this.getBalance() - ECA_TRANSACTION_FEE)) {
      throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`)
    }

    if (this.isHard) {
      const [err2] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
      if (err2 !== null) throw err2

      return
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
   * List the last wallet transactions.
   */
  public async getTransactions(count: number = 10, fromIndex: number = 0): Promise<WalletTransaction[]> {
    if (this.STATE !== WalletState.READY) {
      throw new Error(`ElectraJs.Wallet: #getTransactions() is only available when the #state is "READY".`)
    }

    if (this.isHard) {
      const [err1, transactionsRaw] = await to(this.rpc.listTransactions('*', count, fromIndex))
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

      return transactions
    }

    return []
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
    if (!this.isHard) {
      throw new Error(`ElectraJs.Wallet: #getLockState() is only available on a hard wallet.`)
    }

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

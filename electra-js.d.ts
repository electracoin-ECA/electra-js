type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]
type Omit<T, K extends Extract<keyof T, string>> = Pick<T, Diff<Extract<keyof T, string>, K>>
type OrNull<T> = T | null
type PartialOrNull<T> = OrNull<Partial<T>>

export interface Address {
  hash: string;
  isCiphered: boolean;
  isHD: boolean;
  privateKey: string;
}

export type AddressWithoutPK = Omit<Address, 'isCiphered' | 'privateKey'>

export type DaemonConfig = Partial<{
  addnode: string;
  alertnotify: string;
  banscore: number;
  bantime: number;
  bind: string;
  blockmaxsize: number;
  blockminsize: number;
  blocknotify: string;
  blockprioritysize: number;
  checkblocks: number;
  checklevel: number;
  conf: string;
  confchange: boolean;
  connect: string;
  cppolicy: boolean;
  daemon: boolean;
  datadir: string;
  dbcache: number;
  dblogsize: number;
  debug: boolean;
  debugnet: boolean;
  detachdb: boolean;
  discover: boolean;
  dns: boolean;
  dnsseed: boolean;
  enforcecanonical: boolean;
  externalip: string;
  irc: boolean;
  keypool: number;
  listen: boolean;
  loadblock: string;
  logtimestamps: boolean;
  maxconnections: number;
  maxreceivebuffer: number;
  maxsendbuffer: number;
  mininput: number;
  onlynet: string;
  paytxfee: number;
  pid: string;
  port: number;
  printtoconsole: boolean;
  printtodebugger: boolean;
  proxy: string;
  rescan: boolean;
  rpcallowip: string;
  rpcconnect: string;
  rpcpassword: string;
  rpcport: number;
  rpcssl: boolean;
  rpcsslcertificatechainfile: string;
  rpcsslciphers: string;
  rpcsslprivatekeyfile: string;
  rpcuser: string;
  salvagewallet: boolean;
  seednode: string;
  server: boolean;
  shrinkdebugfile: boolean;
  socks: number;
  staking: boolean;
  synctime: boolean;
  testnet: boolean;
  timeout: number;
  tor: string;
  upgradewallet: boolean;
  upnp: boolean;
  wallet: string;
  walletnotify: string;
}>

export interface SettingsPartial {
  binariesPath?: string
  daemonConfig?: Partial<DaemonConfig>
  isHard?: boolean
}

declare class ElectraJs<T extends WalletHard | WalletLight> {
  readonly constants: {
    BINARIES_PATH: string | undefined;
    DAEMON_CONFIG: DaemonConfig;
    DAEMON_URI: string;
    DAEMON_USER_DIR_PATH: string | undefined;
    ECA_NETWORK: any;
    ECA_NETWORK_TEST: any;
    ECA_TRANSACTION_FEE: number;
  }

  wallet: T;

  webServices: WebServices;

  constructor(settings?: SettingsPartial);

  getVersion(): string;
}

export default ElectraJs

export interface ElectraJsErrorReference {
  DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET: 302,
  DAEMON_RPC_METHOD_NOT_FOUND: 301
}

export interface ElectraJsError<T extends keyof ElectraJsErrorReference> extends Error {
  code: ElectraJsErrorReference[T];
  stack?: string;
  message: T;
}

/* ==================================================
  WALLET
*/

export interface WalletAddress extends Omit<Address, 'isCiphered' | 'privateKey'> {
  category: OrNull<WalletAddressCategory>
  change: string
  label: OrNull<string>
}

export enum WalletAddressCategory {
  CHECKING = 1,
  EXTERNAL = -1,
  PURSE = 0,
  RANDOM = 3,
  SAVINGS = 2,
}

export interface WalletBalance {
  confirmed: number
  unconfirmed: number
}

export enum WalletDaemonState {
  STARTED = 'STARTED',
  STARTING = 'STARTING',
  STOPPED = 'STOPPED',
  STOPPING = 'STOPPING',
}

export type WalletExchangeFormat = [
  2,
  number,
  number,
  number,
  string,
  string[]
];

export interface WalletInfo {
  connectionsCount?: number;
  isHD: boolean;
  isStaking: boolean;
  isSynchonized?: boolean;
  lastBlockGeneratedAt: number;
  localBlockchainHeight?: number;
  localStakingWeight?: number;
  networkBlockchainHeight: number;
  networkStakingWeight: number;
  nextStakingRewardIn: number;
}

export enum WalletLockState {
  LOCKED = 'LOCKED',
  STAKING = 'STAKING',
  UNLOCKED = 'UNLOCKED',
}

export interface WalletStartDataHard {
  addresses: WalletAddress[]
  masterNodeAddress: Address
  randomAddresses: WalletAddress[]
}

export interface WalletStartDataLight {
  addresses: WalletAddress[];
  masterNodeAddress: Address;
  randomAddresses: WalletAddress[];
}

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY',
}

export interface WalletTransaction {
  amount: number;
  confimationsCount: number;
  date: number;
  from: WalletTransactionEndpoint[];
  hash: string;
  to: WalletTransactionEndpoint[];
  type: WalletTransactionType;
}
export interface WalletTransactionEndpoint {
  address: string
  amount: number
  category: WalletAddressCategory
}
export enum WalletTransactionType {
  GENERATED = 'GENERATED',
  TRANSFERED = 'TRANSFERED',
}

export interface WalletHard {
  addresses: WalletAddress[];
  allAddresses: WalletAddress[];
  checkingAddresses: WalletAddress[];
  daemonState: WalletDaemonState;
  isNew: boolean;
  lockState: WalletLockState;
  masterNodeAddress: Address;
  mnemonic: string;
  purseAddresses: WalletAddress[];
  randomAddresses: WalletAddress[];
  savingsAddresses: WalletAddress[];
  state: WalletState;

  createAddress(passphrase: string, category: WalletAddressCategory): Promise<void>
  export(passphrase: string): Promise<string>;
  generate(passphrase: string, mnemonic?: string, mnemonicExtension?: string, purseAddressesCount?: number, checkingAddressesCount?: number, savingsAddressesCount?: number): Promise<void>;
  getAddressBalance(addressHash: string): Promise<WalletBalance>;
  getAddressCategory(addressHash: string): WalletAddressCategory;
  getBalance(): Promise<WalletBalance>;
  getCategoryBalance(category: WalletAddressCategory): Promise<WalletBalance>;
  getInfo(): Promise<WalletInfo>;
  getSavingsCumulatedRewards(): Promise<number>;
  getTransaction(transactionHash: string): Promise<WalletTransaction | undefined>;
  getTransactions(count?: number, inCategory?: WalletAddressCategory): Promise<WalletTransaction[]>;
  import(wefData: WalletExchangeFormat, passphrase: string): Promise<void>;
  importRandomAddress(privateKey: string, passphrase: string): Promise<void>;
  lock(passphrase?: string): Promise<void>;
  reset(): void;
  send(amount: number, category: WalletAddressCategory, toAddressHash: string): Promise<void>;
  start(data: WalletStartDataHard, passphrase: string): Promise<void>;
  startDaemon(): Promise<void>;
  stopDaemon(): Promise<void>;
  unlock(passphrase: string, forStakingOnly: boolean): Promise<void>;
}

export interface WalletLight {
  addresses: WalletAddress[];
  allAddresses: WalletAddress[];
  lockState: WalletLockState;
  masterNodeAddress: WalletAddress;
  mnemonic: string;
  randomAddresses: WalletAddress[];
  state: WalletState;

  generate(mnemonic?: string, mnemonicExtension?: string, chainsCount?: number): Promise<void>;
  import(wefData: WalletExchangeFormat, passphrase: string): Promise<void>;
  export(): string;
  reset(): void;
  start(data: WalletStartDataLight): void;

  importRandomAddress(privateKey: string, passphrase?: string): Promise<void>;

  lock(passphrase: string): Promise<void>;
  unlock(passphrase: string, forStakingOnly?: boolean): Promise<void>;

  getBalance(addressHash?: string): Promise<WalletBalance>;
  getInfo(): Promise<WalletInfo>;
  send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void>;
  getTransactions(count?: number): Promise<WalletTransaction[]>;
  getTransaction(transactionHash: string): Promise<WalletTransaction | undefined>;
}

/* ==================================================
  WEB SERVICES
*/

export interface CurrencyPrice {
  price: number
  priceInBtc: number
}

export interface WebServices {
  getBalanceFor(address: string): Promise<number>;
  getCurrentPriceIn(): Promise<CurrencyPrice>;
}

/* ==================================================
  ERRORS
*/

export enum EJErrorCode {
  DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET = 'DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET',
  DAEMON_RPC_METHOD_NOT_FOUND = 'DAEMON_RPC_METHOD_NOT_FOUND',
  WALLET_DAEMON_STATE_NOT_STARTED = 'WALLET_DAEMON_STATE_NOT_STARTED',
  WALLET_LOCK_STATE_NOT_LOCKED = 'WALLET_LOCK_STATE_NOT_LOCKED',
  WALLET_LOCK_STATE_NOT_STAKING = 'WALLET_LOCK_STATE_NOT_STAKING',
  WALLET_LOCK_STATE_NOT_UNLOCKED = 'WALLET_LOCK_STATE_NOT_UNLOCKED',
  WALLET_STATE_NOT_EMPTY = 'WALLET_STATE_NOT_EMPTY',
  WALLET_STATE_NOT_READY = 'WALLET_STATE_NOT_READY',
  WALLET_TRANSACTION_AMOUNT_HIGHER_THAN_AVAILABLE = 'WALLET_TRANSACTION_AMOUNT_HIGHER_THAN_AVAILABLE',
}

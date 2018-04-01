type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]
type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>
type OrNull<T> = T | null
type PartialOrNull<T> = OrNull<Partial<T>>

interface Address {
  hash: string;
  isCiphered: boolean;
  isHD: boolean;
  privateKey: string;
}

interface DaemonConfig {
  port: string;
  rpcpassword: string;
  rpcport: string;
  rpcuser: string;
}

interface Settings {
  binariesPath?: string
  isHard?: boolean;
}

declare class ElectraJs<T extends WalletHard | WalletLight> {
  readonly constants: {
    BINARIES_PATH: string | undefined;
    DAEMON_CONFIG: DaemonConfig;
    DAEMON_URI: string;
    DAEMON_USER_DIR_PATH: string | undefined;
    ECA_NETWORK: any;
    ECA_TRANSACTION_FEE: number;
  }

  wallet: T;

  webServices: WebServices;

  constructor(settings?: Settings);

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

export type CoinMarketCapCurrency =
  "AUD" | "BRL" | "BTC" | "CAD" | "CHF" | "CLP" | "CNY" | "CZK" | "DKK" | "EUR" |
  "GBP" | "HKD" | "HUF" | "IDR" | "ILS" | "INR" | "JPY" | "KRW" | "MXN" | "MYR" |
  "NOK" | "NZD" | "PHP" | "PKR" | "PLN" | "RUB" | "SEK" | "SGD" | "THB" | "TRY" |
  "TWD" | "USD" | "ZAR";

export interface WalletAddress extends Address {
  label: OrNull<string>;
}

export type WalletAddressWithoutPK = Omit<WalletAddress, 'isCiphered' | 'privateKey'>

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
  addresses: WalletAddressWithoutPK[];
  masterNodeAddress: WalletAddress;
  randomAddresses: WalletAddressWithoutPK[];
}

export interface WalletStartDataLight {
  addresses: WalletAddress[];
  masterNodeAddress: WalletAddress;
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
  from?: string[];
  hash: string;
  to: string[];
  type: WalletTransactionType;
}

export enum WalletTransactionType {
  GENERATED = 'GENERATED',
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
}

export interface WalletHard {
  addresses: WalletAddressWithoutPK[];
  allAddresses: WalletAddressWithoutPK[];
  daemonState: WalletDaemonState;
  isNew: boolean;
  lockState: WalletLockState;
  masterNodeAddress: WalletAddress;
  mnemonic: string;
  randomAddresses: WalletAddress[];
  state: WalletState;

  startDaemon(): Promise<void>;
  stopDaemon(): Promise<void>;

  generate(mnemonic?: string, mnemonicExtension?: string, chainsCount?: number): Promise<void>;
  import(wefData: WalletExchangeFormat, passphrase: string): Promise<void>;
  export(): string;
  reset(): void;
  start(data: WalletStartDataHard): void;

  createAddress(): Promise<void>
  importRandomAddress(privateKey: string, passphrase?: string): Promise<void>;
  lock(passphrase: string): Promise<void>;
  send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void>;
  unlock(passphrase: string, forStakingOnly?: boolean): Promise<void>;

  getBalance(addressHash?: string): Promise<WalletBalance>;
  getInfo(): Promise<WalletInfo>;
  getTransactions(count?: number): Promise<WalletTransaction[]>;
  getTransaction(transactionHash: string): Promise<WalletTransaction | undefined>;
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

export interface WebServices {
  getBalanceFor(address: string): Promise<number>;
  getCurrentPriceIn(currency?: CoinMarketCapCurrency): Promise<number>;
}

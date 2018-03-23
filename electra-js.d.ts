type OrNull<T> = T | null;
type PartialOrNull<T> = OrNull<Partial<T>>;

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
  isHard?: boolean;
}

declare class ElectraJs {
  readonly constants: {
    BINARIES_PATH: string | undefined;
    DAEMON_CONFIG: DaemonConfig;
    DAEMON_URI: string;
    ECA_NETWORK: any;
    ECA_TRANSACTION_FEE: number;
  }

  wallet: Wallet;

  webServices: WebServices;
  test: WalletInfo;

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

export interface Wallet {
  addresses: WalletAddress[];
  allAddresses: WalletAddress[];
  daemonState: WalletDaemonState;
  isNew: boolean;
  lockState: WalletLockState;
  mnemonic: string;
  randomAddresses: WalletAddress[];
  state: WalletState;

  startDaemon(): Promise<void>;
  stopDaemon(): Promise<void>;

  generate(mnemonic?: string, mnemonicExtension?: string, chainsCount?: number): Promise<void>;
  import(data: string, passphrase: string): Promise<void>;
  export(): string;
  reset(): void;

  importRandomAddress(privateKey: string, passphrase?: string): Promise<void>;

  lock(passphrase: string): Promise<void>;
  unlock(passphrase: string, forStakingOnly?: boolean): Promise<void>;

  getBalance(addressHash?: string): Promise<number>;
  getInfo(): Promise<WalletInfo>;
  send(amount: number, toAddressHash: string, fromAddressHash?: string): Promise<void>;
  getTransactions(count?: number, fromIndex?: number): Promise<WalletTransaction[]>;
}

export interface WebServices {
  getBalanceFor(address: string): Promise<number>;
  getCurrentPriceIn(currency?: CoinMarketCapCurrency): Promise<number>;
}

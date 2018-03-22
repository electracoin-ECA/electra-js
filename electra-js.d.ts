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

  wallet: ElectraJs.Wallet;

  webServices: ElectraJs.WebServices;

  constructor(settings?: Settings);

  getVersion(): string;
}

declare namespace ElectraJs {
  type CoinMarketCapCurrency =
    "AUD" | "BRL" | "BTC" | "CAD" | "CHF" | "CLP" | "CNY" | "CZK" | "DKK" | "EUR" |
    "GBP" | "HKD" | "HUF" | "IDR" | "ILS" | "INR" | "JPY" | "KRW" | "MXN" | "MYR" |
    "NOK" | "NZD" | "PHP" | "PKR" | "PLN" | "RUB" | "SEK" | "SGD" | "THB" | "TRY" |
    "TWD" | "USD" | "ZAR";

  interface WalletAddress extends Address {
    label: OrNull<string>;
  }

  type WalletExchangeFormat = [
    2,
    number,
    string,
    string[]
  ];

  interface WalletInfo {
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

  enum WalletLockState {
    LOCKED = 'LOCKED',
    STAKING = 'STAKING',
    UNLOCKED = 'UNLOCKED',
  }

  enum WalletState {
    EMPTY = 'EMPTY',
    READY = 'READY',
    STOPPED = 'STOPPED',
  }

  interface WalletTransaction {
    amount: number;
    confimationsCount: number;
    date: number;
    from?: string[];
    hash: string;
    to: string[];
    type: WalletTransactionType;
  }

  enum WalletTransactionType {
    GENERATED = 'GENERATED',
    RECEIVED = 'RECEIVED',
    SENT = 'SENT',
  }

  interface Wallet {
    addresses: WalletAddress[];
    allAddresses: WalletAddress[];
    lockState: WalletLockState;
    randomAddresses: WalletAddress[];

    mnemonic(): string;
    state(): WalletState;

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

  interface WebServices {
    getBalanceFor(address: string): Promise<number>;
    getCurrentPriceIn(currency?: CoinMarketCapCurrency): Promise<number>;
  }
}

export = ElectraJs

export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]
export type Omit<T, K extends Extract<keyof T, string>> = Pick<T, Diff<Extract<keyof T, string>, K>>
export type OrNull<T> = T | null
export type PartialOrNull<T> = OrNull<Partial<T>>

export interface Address {
  hash: string
  isCiphered: boolean
  isHD: boolean
  privateKey: string
}

export interface DaemonConfig {
  addnode?: string
  alertnotify?: string
  banscore?: number
  bantime?: number
  bind?: string
  blockmaxsize?: number
  blockminsize?: number
  blocknotify?: string
  blockprioritysize?: number
  checkblocks?: number
  checklevel?: number
  conf?: string
  confchange?: boolean
  connect?: string
  cppolicy?: boolean
  daemon: boolean
  datadir?: string
  dbcache?: number
  dblogsize?: number
  debug?: boolean
  debugnet?: boolean
  detachdb?: boolean
  discover?: boolean
  dns?: boolean
  dnsseed?: boolean
  enforcecanonical?: boolean
  externalip?: string
  irc?: boolean
  keypool?: number
  listen?: boolean
  loadblock?: string
  logtimestamps?: boolean
  maxconnections?: number
  maxreceivebuffer?: number
  maxsendbuffer?: number
  mininput?: number
  onlynet?: string
  paytxfee?: number
  pid?: string
  port: number
  printtoconsole?: boolean
  printtodebugger?: boolean
  proxy?: string
  rescan?: boolean
  rpcallowip?: string
  rpcconnect?: string
  rpcpassword: string
  rpcport: number
  rpcssl?: boolean
  rpcsslcertificatechainfile?: string
  rpcsslciphers?: string
  rpcsslprivatekeyfile?: string
  rpcuser: string
  salvagewallet?: boolean
  seednode?: string
  server?: boolean
  shrinkdebugfile?: boolean
  socks?: number
  staking?: boolean
  synctime?: boolean
  testnet?: boolean
  timeout?: number
  tor?: string
  upgradewallet?: boolean
  upnp?: boolean
  wallet?: string
  walletnotify?: string
}

export interface Settings {
  binariesPath: string
  daemonConfig: DaemonConfig
  isHard?: boolean
}
export interface SettingsPartial {
  binariesPath?: string
  daemonConfig?: Partial<DaemonConfig>
  isHard?: boolean
}

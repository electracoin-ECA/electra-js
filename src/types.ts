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
  addnode: string
  alertnotify: string
  banscore: string
  bantime: string
  bind: string
  blockmaxsize: string
  blockminsize: string
  blocknotify: string
  blockprioritysize: string
  checkblocks: string
  checklevel: string
  conf: string
  confchange: boolean
  connect: string
  cppolicy: boolean
  daemon: boolean
  datadir: string
  dbcache: string
  dblogsize: string
  debug: boolean
  debugnet: boolean
  detachdb: boolean
  discover: boolean
  dns: boolean
  dnsseed: boolean
  enforcecanonical: boolean
  externalip: string
  irc: boolean
  keypool: string
  listen: boolean
  loadblock: string
  logtimestamps: boolean
  maxconnections: string
  maxreceivebuffer: string
  maxsendbuffer: string
  mininput: string
  onlynet: string
  paytxfee: string
  pid: string
  port: string
  printtoconsole: boolean
  printtodebugger: boolean
  proxy: string
  rescan: boolean
  rpcallowip: string
  rpcconnect: string
  rpcpassword: string
  rpcport: string
  rpcssl: boolean
  rpcsslcertificatechainfile: string
  rpcsslciphers: string
  rpcsslprivatekeyfile: string
  rpcuser: string
  salvagewallet: boolean
  seednode: string
  server: boolean
  shrinkdebugfile: boolean
  socks: string
  staking: boolean
  synctime: boolean
  testnet: boolean
  timeout: string
  tor: string
  upgradewallet: boolean
  upnp: boolean
  wallet: string
  walletnotify: string
}

export interface Settings {
  binariesPath?: string
  isHard?: boolean
}

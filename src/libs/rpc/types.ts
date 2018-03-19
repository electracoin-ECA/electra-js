// tslint:disable:no-any

import { OrNull } from '../../types'

export interface RpcResult<T> {
  id: OrNull<string>
  error: OrNull<any>
  result: T
}

export interface RpcMethods {
  addmultisigaddress: any
  addredeemscript: any
  backupwallet: any
  checkwallet: {
    'wallet check passed': boolean
  }
  createrawtransaction: any
  decoderawtransaction: any
  decodescript: any
  dumpprivkey: string
  dumpwallet: any
  encryptwallet: void
  getaccount: string
  getaccountaddress: any
  getaddressesbyaccount: any
  getbalance: number
  getbestblockhash: string
  getblock: {
    hash: string
    confirmations: number
    size: number
    height: number
    version: number
    merkleroot: string
    mint: number
    time: number
    nonce: number
    bits: string
    difficulty: number
    blocktrust: string
    chaintrust: string
    previousblockhash: string
    nextblockhash: string
    flags: string
    proofhash: string
    entropybit: number
    modifier: string
    modifierchecksum: string
    tx: string[]
    signature: string
  }
  getblockcount: number
  getblockhash: any
  getblocktemplate: any
  getcheckpoint: {
    synccheckpoint: string
    height: number
    timestamp: string
    policy: string
  }
  getconnectioncount: number
  getdifficulty: {
    'proof-of-work': number
    'proof-of-stake': number
    'search-interval': number
  }
  getinfo: {
    version: string
    protocolversion: number
    walletversion: number
    balance: number
    newmint: number
    stake: number
    blocks: number
    timeoffset: number
    moneysupply: number
    connections: number
    proxy: string
    ip: string
    difficulty: {
      'proof-of-work': number
      'proof-of-stake': number
    }
    testnet: boolean
    keypoololdest: number
    keypoolsize: number
    paytxfee: number
    mininput: number
    unlocked_until: number
    errors: string
  }
  getmininginfo: any
  getnewaddress: OrNull<{
    account: string
  }>
  getnewpubkey: any
  getpeerinfo: Array<{
    addr: string
    services: string
    lastsend: number
    lastrecv: number
    conntime: number
    version: number
    subver: string
    inbound: false
    startingheight: number
    banscore: number
  }>
  getrawmempool: any
  getrawtransaction: any
  getreceivedbyaccount: any
  getreceivedbyaddress: any
  getstakinginfo: {
    enabled: boolean
    staking: boolean
    errors: string
    currentblocksize: number
    currentblocktx: number
    pooledtx: number
    difficulty: number
    'search-interval': number
    weight: number
    netstakeweight: number
    expectedtime: number
  }
  getsubsidy: any
  gettransaction: any
  getwork: any
  getworkex: any
  help: OrNull<{
    command: RpcMethod
  }>
  importprivkey: void
  importwallet: any
  keypoolrefill: any
  /** @deprecated */
  listaccounts: any
  listaddressgroupings: string[][][]
  /** @deprecated */
  listreceivedbyaccount: any
  listreceivedbyaddress: Array<{
    address: string
    account: string
    amount: number
    confirmations: number
  }>
  listsinceblock: any
  listtransactions: Array<{
    account: string
    address: string
    category: 'generate' | 'receive' | 'send'
    amount: number
    fee?: number
    confirmations: number
    blockhash?: string
    blockindex?: number
    blocktime?: number
    txid: string
    time: number
    timereceived: number
  }>
  listunspent: Array<{
    txid: string
    vout: number
    address: string
    account?: string
    scriptPubKey: string
    amount: number
    confirmations: number
  }>
  makekeypair: {
    PrivateKey: string
    PublicKey: string
  }
  move: any
  repairwallet: any
  resendtx: any
  reservebalance: any
  sendalert: any
  sendfrom: any
  sendmany: any
  sendrawtransaction: any
  sendtoaddress: string
  setaccount: any
  settxfee: any
  signmessage: any
  signrawtransaction: any
  stop: any
  submitblock: any
  validateaddress: {
    isvalid: boolean
    address?: string
    ismine?: boolean
    isscript?: boolean
    pubkey?: string
    iscompressed?: boolean
    account?: string
  }
  validatepubkey: {
    isvalid: boolean
    address?: string
    ismine?: boolean
    iscompressed?: boolean
  }
  verifymessage: any
  walletlock: void
  walletpassphrase: void
  walletpassphrasechange: any
}

export type RpcMethod = keyof RpcMethods
export type RpcMethodParams = OrNull<Array<boolean | number | string>>
export type RpcMethodResult<T extends RpcMethod> = RpcMethods[T]

export interface JsonRpcRequest<T extends RpcMethod> {
  readonly jsonrpc: '2.0'
  method: T
  params: RpcMethodParams
}

export interface JsonRpcResponse<T extends RpcMethod> {
  id: OrNull<string>
  error: OrNull<string>
  result: RpcMethods[T]
}

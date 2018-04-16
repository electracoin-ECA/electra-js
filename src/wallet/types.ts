import { Address, Omit, OrNull } from '../types'

export type AddressWithoutPK = Omit<Address, 'isCiphered' | 'privateKey'>

export type PlatformBinary = {
  [P in NodeJS.Platform]?: string
}

export interface WalletAddress extends Omit<Address, 'isCiphered' | 'privateKey'> {
  category: WalletAddressCategory
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

// https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
export type WalletExchangeFormat = [
  // tslint:disable-next-line:no-magic-numbers
  2,
  number,
  number,
  number,
  string,
  string[]
]

export interface WalletInfo {
  connectionsCount?: number
  isHD: boolean
  isStaking: boolean
  isSynchonized?: boolean
  lastBlockGeneratedAt: number // Unix timestamp in seconds
  localBlockchainHeight?: number
  localStakingWeight?: number
  networkBlockchainHeight: number
  networkStakingWeight: number
  nextStakingRewardIn: number // in seconds
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
  addresses: WalletAddress[]
  masterNodeAddress: Address
  randomAddresses: Address[]
}

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY',
}

export interface WalletTransaction {
  amount: number
  confimationsCount: number
  date: number // Unix timestamp in seconds
  from: WalletTransactionFrom[]
  hash: string
  to: string // Addresses hash
  toCategory: WalletAddressCategory
  type: WalletTransactionType
}
export interface WalletTransactionFrom {
  address: string
  amount: number
  category: WalletAddressCategory
}
export enum WalletTransactionType {
  GENERATED = 'GENERATED',
  TRANSFER = 'TRANSFER',
}

export interface WalletUnspentTransaction {
  address: string // Addresses hash
  amount: number
  category: WalletAddressCategory
  index: number
  isChange: boolean
  txid: string
  vout: number
}

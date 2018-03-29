import { Address, OrNull } from '../types'

export type PlatformBinary = {
  [P in NodeJS.Platform]?: string
}

export interface WalletAddress extends Address {
  label: OrNull<string>
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

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY',
}

export interface WalletTransaction {
  amount: number
  confimationsCount: number
  date: number // Unix timestamp in seconds
  from?: string[] // Addresses hash
  hash: string
  to: string[] // Addresses hash
  type: WalletTransactionType
}

export enum WalletTransactionType {
  GENERATED = 'GENERATED',
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
}

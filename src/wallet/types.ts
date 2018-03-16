import { Address, OrNull } from '../types'

export type PlatformBinary = {
  [P in NodeJS.Platform]?: string
}

export interface WalletAddress extends Address {
  label: OrNull<string>
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
  localBlockchainHeight?: number
  localStakingWeight?: number
  networkBlockchainHeight: number
  networkStakingWeight: number
  nextStakingRewardIn: number // in seconds
}

export interface WalletTransaction {
  amount: number
  confimationsCount: number
  date?: number // Unix timestamp in seconds
  fromAddressHash?: string
  hash: string
  toAddressHash: string
}

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY',
  STOPPED = 'STOPPED'
}

export enum WalletLockState {
  LOCKED = 'LOCKED',
  STAKING = 'STAKING',
  UNLOCKED = 'UNLOCKED'
}

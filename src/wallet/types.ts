import { Address, OrNull } from '../types'

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

export interface WalletTransaction {
  amount: number
  confimationsCount: number
  date?: number // Unix timestamp in seconds
  fromAddressHash?: string
  hash: string
  toAddressHash: string
}

export interface WalletStakingInfo {
  networkWeight: number
  nextRewardIn: number // in seconds
  staking: boolean
  weight: number
}

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY'
}

export enum WalletLockState {
  LOCKED = 'LOCKED',
  STAKING = 'STAKING',
  UNLOCKED = 'UNLOCKED'
}

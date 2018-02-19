import { Address, OrNull } from '../types'

export interface WalletAddress extends Address {
  label: OrNull<string>
}

export interface WalletData {
  chainsCount: number
  masterNodeAddress: OrNull<WalletAddress>
  randomAddresses: WalletAddress[]
}

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

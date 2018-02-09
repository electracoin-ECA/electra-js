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
  hash: string
  date: number // Unix timestamp in seconds
  fromAddress: WalletAddress
  toAddress: WalletAddress
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

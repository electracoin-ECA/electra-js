import { OrNull } from '../types'

export interface WalletAddress {
  hash: string
  isCiphered: boolean
  isHD: boolean
  label: OrNull<string>
  privateKey: string
}

export interface WalletData {
  chainsCount: number
  customAddresses: WalletAddress[]
  masterNodeAddress: OrNull<WalletAddress>
}

export interface WalletTransaction {
  amount: number
  hash: string
  date: number // Unix timestamp in seconds
  fromAddress: WalletAddress
  toAddress: WalletAddress
}

export enum WalletState {
  EMPTY = 'EMPTY',
  READY = 'READY'
}

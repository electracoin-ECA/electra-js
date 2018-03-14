export type OrNull<T> = T | null
export type PartialOrNull<T> = OrNull<Partial<T>>

export interface Address {
  hash: string
  isCiphered: boolean
  isHD: boolean
  privateKey: string
}

export interface DaemonConfig {
  port: string
  rpcpassword: string
  rpcport: string
  rpcuser: string
}

export interface Settings {
  isHard?: boolean
}

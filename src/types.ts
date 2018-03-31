export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>
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
  binariesPath?: string
  isHard?: boolean
}

import * as bitcoinJs from 'bitcoinjs-lib'

import { DaemonConfig } from './types'

let binariesPath: string | undefined
let daemonUserDirPath: string | undefined

if ((process as NodeJS.Process | undefined) !== undefined) {
  // tslint:disable:no-require-imports no-var-requires typedef
  const os = require('os')
  const path = require('path')
  // tslint:enable:no-require-imports no-var-requires typedef

  binariesPath = path.resolve(__dirname, `../bin`)

  switch (process.platform) {
    case 'darwin':
      daemonUserDirPath = path.resolve(os.homedir(), 'Library/Application Support/Electra')
      break

    case 'win32':
      daemonUserDirPath = path.resolve(os.homedir(), 'AppData/Roaming/Electra').replace(/\\/g, '/')
      break

    default:
      daemonUserDirPath = path.resolve(os.homedir(), '.Electra')
  }
}

export const BINARIES_PATH: string | undefined = binariesPath

export const DAEMON_CONFIG: DaemonConfig = {
  port: '5817',
  rpcpassword: 'pass',
  rpcport: '5788',
  rpcuser: 'user'
}

export const DAEMON_URI: string = `http://127.0.0.1:${DAEMON_CONFIG.rpcport}`

export const DAEMON_USER_DIR_PATH: string | undefined = daemonUserDirPath

// @see https://github.com/Electra-project/Electra/blob/master/src/base58.h#L274
// @see https://github.com/Electra-project/Electra/blob/master/src/main.cpp#L71
export const ECA_NETWORK: bitcoinJs.Network = {
  bip32: { public: 0, private: 0 },
  messagePrefix: '\x18Electra very Signed Message:\n',
  pubKeyHash: 0x21,
  scriptHash: 0x28,
  wif: 0xA1 // WIF version
}
export const ECA_NETWORK_TEST: bitcoinJs.Network = {
  bip32: { public: 0, private: 0 },
  messagePrefix: '\x18Electra very Signed Message:\n',
  pubKeyHash: 0x5C,
  scriptHash: 0x29,
  wif: 0xA1 // WIF version
}

export const ECA_TRANSACTION_FEE: number = 0.00001

import { api, Api } from './api'
import Wallet, { RpcAuth } from './wallet'

export interface Settings {
  rpcAuth: RpcAuth,
  rpcUri: string
}

/**
 * electra-js version
 * DO NOT CHANGE THIS LINE SINCE THE VERSION IS AUTOMATICALLY INJECTED
 */
const VERSION: string = '__ELECTRA-JS_VERSION__'

/**
 * Main ElectraJS class.
 */
export default class ElectraJs {
  /**
   * List the extra API methods.
   */
  public api: Api = api

  /**
   * List the extra API methods.
   */
  public wallet: Wallet

  public constructor(settings: Settings) {
    this.wallet = new Wallet(settings.rpcUri, settings.rpcAuth)
  }

  /**
   * Get the current version of ElectraJS.
   */
  public getVersion(): string {
    return VERSION
  }
}

// tslint:disable
// For TypeScript
module.exports = ElectraJs
module.exports.default = module.exports

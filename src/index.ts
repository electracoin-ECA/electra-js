import { RpcServerAuth } from './libs/rpc'
import Wallet from './wallet'
import webServices, { WebServices } from './web-services'

export interface Settings {
  rpcServerAuth?: RpcServerAuth,
  rpcServerUri?: string
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
  /** Wallet management. */
  public wallet: Wallet

  /** Web services. */
  public webServices: WebServices

  public constructor(settings: Settings = {}) {
    this.wallet = new Wallet(settings)
    this.webServices = webServices
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

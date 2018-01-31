import RpcServer, { RpcServerAuth } from './rpc-server'
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
  /** RPC server interactions. */
  public rpcServer: RpcServer

  /** Wallet management. */
  public wallet: Wallet

  /** Web services. */
  public webServices: WebServices

  public constructor(settings: Settings = {}) {
    if (settings.rpcServerUri !== undefined && settings.rpcServerAuth !== undefined) {
      this.rpcServer = new RpcServer(settings.rpcServerUri, settings.rpcServerAuth)
    }

    this.wallet = new Wallet()
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

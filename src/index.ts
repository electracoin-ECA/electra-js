import RpcServer, { RpcServerAuth } from './rpc-server'
import { utils, Utils } from './utils'

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
  /**
   * RPC server interactions.
   */
  public rpcServer: RpcServer

  /**
   * Utility helpers.
   */
  public utils: Utils = utils

  public constructor(settings: Settings) {
    if (settings.rpcServerUri !== undefined && settings.rpcServerAuth !== undefined) {
      this.rpcServer = new RpcServer(settings.rpcServerUri, settings.rpcServerAuth)
    }
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

import * as constants from './constants'
import Rpc from './libs/rpc'
import WalletHard from './wallet/hard'
import WalletLight from './wallet/light'
import webServices, { WebServices } from './web-services'

import { Settings, SettingsPartial } from './types'

export const SETTINGS_DEFAULT: Settings = {
  binariesPath: constants.BINARIES_PATH as string,
  daemonConfig: constants.DAEMON_CONFIG_DEFAULT,
}

/**
 * ElectraJs version.
 * DO NOT CHANGE THIS LINE SINCE THE VERSION IS AUTOMATICALLY INJECTED !
 */
const VERSION: string = '__ELECTRA-JS_VERSION__'

/**
 * Main ElectraJS class.
 */
export default class ElectraJs {
  /** Electra blockchain specific constants. */
  public readonly constants: typeof constants = constants

  /** RPC services. */
  public rpc: Rpc | undefined

  /** Wallet management. */
  public wallet: WalletHard | WalletLight

  /** Web services. */
  public webServices: WebServices

  public constructor(settings: SettingsPartial = {}) {
    const { isHard } = { ...settings }

    if (Boolean(isHard)) {
      settings.daemonConfig = settings.daemonConfig !== undefined
        ? { ...constants.DAEMON_CONFIG_DEFAULT, ...settings.daemonConfig }
        : constants.DAEMON_CONFIG_DEFAULT

      // tslint:disable-next-line:no-object-literal-type-assertion
      const { binariesPath, daemonConfig }: Settings = { ...SETTINGS_DEFAULT, ...settings } as Settings

      this.rpc = new Rpc(
        this.constants.DAEMON_URI,
        {
          password: daemonConfig.rpcpassword,
          username: daemonConfig.rpcuser,
        }
      )
      this.wallet = new WalletHard(binariesPath, daemonConfig)
    } else {
      this.wallet = new WalletLight()
    }

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

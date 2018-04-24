import * as constants from './constants'
import WalletHard from './wallet/hard'
import WalletLight from './wallet/light'
import webServices, { WebServices } from './web-services'

import { Settings } from './types'

const SETTINGS_DEFAULT: Settings = {
  isHard: false
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

  /** Wallet management. */
  public wallet: WalletHard | WalletLight

  /** Web services. */
  public webServices: WebServices

  public constructor(settings: Settings = {}) {
    const { binariesPath, isHard } = { ...SETTINGS_DEFAULT, ...settings }

    this.wallet = Boolean(isHard) ? new WalletHard(binariesPath) : new WalletLight()
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

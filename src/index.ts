import * as constants from './constants'
import Wallet from './wallet'
import webServices, { CoinMarketCapCurrency, WebServices } from './web-services'

export { CoinMarketCapCurrency }

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
  public wallet: Wallet

  /** Web services. */
  public webServices: WebServices

  public constructor(settings: Settings = {}) {
    const { isHard } = { ...SETTINGS_DEFAULT, ...settings }

    this.wallet = new Wallet(isHard)
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

import * as constants from './constants';
import Wallet from './wallet';
import { CoinMarketCapCurrency, WebServices } from './web-services';
export { CoinMarketCapCurrency };
import { Settings } from './types';
/**
 * Main ElectraJS class.
 */
export default class ElectraJs {
    /** Electra blockchain specific constants. */
    readonly constants: typeof constants;
    /** Wallet management. */
    wallet: Wallet;
    /** Web services. */
    webServices: WebServices;
    constructor(settings?: Settings);
    /**
     * Get the current version of ElectraJS.
     */
    getVersion(): string;
}

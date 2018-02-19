import * as constants from './constants';
import { RpcAuth } from './libs/rpc';
import Wallet from './wallet';
import { WebServices } from './web-services';
export interface Settings {
    rpcServerAuth?: RpcAuth;
    rpcServerUri?: string;
}
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

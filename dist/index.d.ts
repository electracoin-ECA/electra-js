import { Utils } from './utils';
import Wallet, { RpcAuth } from './wallet';
export interface Settings {
    rpcAuth: RpcAuth;
    rpcUri: string;
}
/**
 * Main ElectraJS class.
 */
export default class ElectraJs {
    /**
     * Utility helpers.
     */
    utils: Utils;
    /**
     * Wallet interactions.
     */
    wallet: Wallet;
    constructor(settings: Settings);
    /**
     * Get the current version of ElectraJS.
     */
    getVersion(): string;
}

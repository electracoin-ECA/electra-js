import { Api } from './api';
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
     * List the extra API methods.
     */
    api: Api;
    /**
     * List the extra API methods.
     */
    wallet: Wallet;
    constructor(settings: Settings);
    /**
     * Get the current version of ElectraJS.
     */
    getVersion(): string;
}

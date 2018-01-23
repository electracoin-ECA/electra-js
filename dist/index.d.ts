import RpcServer, { RpcServerAuth } from './rpc-server';
import { Utils } from './utils';
export interface Settings {
    rpcServerAuth?: RpcServerAuth;
    rpcServerUri?: string;
}
/**
 * Main ElectraJS class.
 */
export default class ElectraJs {
    /**
     * RPC server interactions.
     */
    rpcServer: RpcServer;
    /**
     * Utility helpers.
     */
    utils: Utils;
    constructor(settings: Settings);
    /**
     * Get the current version of ElectraJS.
     */
    getVersion(): string;
}

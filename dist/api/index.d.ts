import getCurrentPriceIn from './getCurrentPriceIn';
export interface Api {
    getCurrentPriceIn: typeof getCurrentPriceIn;
}
export declare const api: Api;

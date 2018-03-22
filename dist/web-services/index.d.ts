import getBalanceFor from './getBalanceFor';
import getCurrentPriceIn, { CoinMarketCapCurrency } from './getCurrentPriceIn';
export { CoinMarketCapCurrency };
export interface WebServices {
    getBalanceFor: typeof getBalanceFor;
    getCurrentPriceIn: typeof getCurrentPriceIn;
}
declare const _default: {
    getBalanceFor: typeof getBalanceFor;
    getCurrentPriceIn: typeof getCurrentPriceIn;
};
export default _default;

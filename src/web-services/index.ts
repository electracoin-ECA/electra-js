import getBalanceFor from './getBalanceFor'
import getCurrentPriceIn, { CoinMarketCapCurrency } from './getCurrentPriceIn'

export { CoinMarketCapCurrency }

export interface WebServices {
  getBalanceFor: typeof getBalanceFor
  getCurrentPriceIn: typeof getCurrentPriceIn
}

export default {
  getBalanceFor,
  getCurrentPriceIn
}

import getBalanceFor from './getBalanceFor'
import getCurrentPriceIn, { CoinMarketCapCurrency } from './getCurrentPriceIn'
import getBlockCount from './getBlockCount'

export { CoinMarketCapCurrency }

export interface WebServices {  
  getBalanceFor: typeof getBalanceFor
  getCurrentPriceIn: typeof getCurrentPriceIn  
  getBlockCount: typeof getBlockCount  
}

export default {
  getBalanceFor,
  getCurrentPriceIn,
  getBlockCount
}

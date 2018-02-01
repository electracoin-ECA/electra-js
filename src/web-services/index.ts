import getBalanceFor from './getBalanceFor'
import getCurrentPriceIn from './getCurrentPriceIn'

export interface WebServices {
  getBalanceFor: typeof getBalanceFor
  getCurrentPriceIn: typeof getCurrentPriceIn
}

export default {
  getBalanceFor,
  getCurrentPriceIn
}

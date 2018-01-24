import getCurrentPriceIn from './getCurrentPriceIn'

export interface WebServices {
  getCurrentPriceIn: typeof getCurrentPriceIn
}

export default {
  getCurrentPriceIn
}

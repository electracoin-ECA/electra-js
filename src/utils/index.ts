import getCurrentPriceIn from './getCurrentPriceIn'

export interface Utils {
  getCurrentPriceIn: typeof getCurrentPriceIn
}

export const utils: Utils = {
  getCurrentPriceIn
}

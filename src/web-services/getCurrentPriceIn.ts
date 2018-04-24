import to from 'await-to-js'
import Axios from 'axios'

import enumStringArray from '../helpers/enumStringArray'

// https://coinmarketcap.com/api/
// tslint:disable-next-line:typedef
export const CURRENCIES = enumStringArray([
  'aud', 'brl', 'btc', 'cad', 'chf', 'clp', 'cny', 'czk', 'dkk', 'eur',
  'gbp', 'hkd', 'huf', 'idr', 'ils', 'inr', 'jpy', 'krw', 'mxn', 'myr',
  'nok', 'nzd', 'php', 'pkr', 'pln', 'rub', 'sek', 'sgd', 'thb', 'try',
  'twd', 'usd', 'zar'
])

const URI: string = 'https://electra-api.herokuapp.com/v1/price'

export type Currency = keyof typeof CURRENCIES

interface ElectraApiPriceGetResponse {
  price: string
  priceBtc: string
}

interface CurrencyPrice {
  price: number
  priceInBtc: number
}

/**
 * Get the current price of ECA via CoinMarketCap.
 */
export default async function(): Promise<CurrencyPrice> {
  const currency: Currency = 'usd'
  const [ err, res ] = await to(Axios.get<ElectraApiPriceGetResponse>(`${URI}/${currency}`))
  if (err) throw new Error(`api#webServices(): ${err.message}`)

  if (res === undefined) {
    throw new Error(`api#webServices(): We did't get the expected response from Electra API.`)
  }

  return {
    price: Number(res.data.price),
    priceInBtc: Number(res.data.priceBtc),
  }
}

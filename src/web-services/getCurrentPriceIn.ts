import to from 'await-to-js'
import Axios from 'axios'

import enumStringArray from '../helpers/enumStringArray'

// https://coinmarketcap.com/api/
// tslint:disable-next-line:typedef
export const CURRENCIES = enumStringArray([
  'AUD', 'BRL', 'BTC', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR',
  'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR',
  'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY',
  'TWD', 'USD', 'ZAR'
])

const URI: string = 'https://api.coinmarketcap.com/v1/ticker/electra/'

export type CoinMarketCapCurrency = keyof typeof CURRENCIES

interface CoinMarketCapCoinInfo {
  id: 'electra'
  name: 'Electra'
  symbol: 'ECA'
  rank: string | null
  price_usd: string | null
  price_btc: string | null
  '24h_volume_usd': string | null
  market_cap_usd: string | null
  available_supply: string | null
  total_supply: string | null
  max_supply: string | null
  percent_change_1h: string | null
  percent_change_24h: string | null
  percent_change_7d: string | null
  last_updated: string | null
}

/**
 * Get the current price of ECA via CoinMarketCap.
 */
export default async function(currency: CoinMarketCapCurrency = 'USD'): Promise<number> {
  const [ err, res ] = await to(Axios.get<CoinMarketCapCoinInfo[]>(URI, { params: { convert: currency } }))
  if (err) throw new Error(`api#webServices(): ${err.message}`)

  if (res === undefined || !Array.isArray(res.data) || res.data.length === 0) {
    throw new Error(`api#webServices(): We did't get the expected response from CoinMarketCap.`)
  }

  const priceKey: keyof CoinMarketCapCoinInfo = `price_${currency.toLowerCase()}` as keyof CoinMarketCapCoinInfo

  return Number(res.data[0][priceKey])
}

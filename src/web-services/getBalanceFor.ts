import to from 'await-to-js'
import Axios from 'axios'

const URI: string = 'https://api.electraexplorer.com/ext/getaddress/'

interface ElectraExplorerGetAddressTransaction {
  addresses: string
  type: 'vin' | 'vout'
}

interface ElectraExplorerGetAddress {
  address: string
  balance: number
  last_txs: ElectraExplorerGetAddressTransaction[]
  received: number
  sent: number
}

/**
 * Get the current price of ECA via CoinMarketCap.
 */
export default async function(address: string): Promise<number> {
  const [ err, res ] = await to(Axios.get<ElectraExplorerGetAddress>(URI + address))
  if (err) throw new Error(`webServices#getBalanceFor(): ${err.message}`)

  if (res === undefined || typeof res.data !== 'object' || typeof res.data.balance !== 'number') {
    if (res !== undefined && typeof res.data === 'object') return 0

    throw new Error(`webServices#getBalanceFor(): We did't get the expected response from ElectraExplorer.`)
  }

  return Number(res.data.balance)
}

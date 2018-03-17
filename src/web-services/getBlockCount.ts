import to from 'await-to-js'
import Axios from 'axios'

const URI: string = 'https://api.electraexplorer.com/ext/blockcount'

/**
 * Get the current total block count from the ElectraExplorer API.
 * Useful when syncing to get the highest current block on network
 */
export default async function(): Promise<number> {
  const [ err, res ] = await to(Axios.get<number>(URI))
  if (err) throw new Error(`webServices#getBlockCount(): ${err.message}`)

  if (res === undefined || typeof res !== 'number') {
    throw new Error(`webServices#getBlockCount(): We did't get the expected response from ElectraExplorer.`)
  }

  return Number(res)
}

import to from 'await-to-js'
import Axios, { AxiosRequestConfig } from 'axios'

import { JsonRpcRequest, JsonRpcResponse, RpcMethod, RpcMethodParams, RpcMethodResult } from './types'

const CONFIG_DEFAULT: AxiosRequestConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
}

export default async function<T extends RpcMethod>(
  uri: string,
  method: T,
  params: RpcMethodParams,
  config: AxiosRequestConfig = {}
): Promise<RpcMethodResult<T>> {
  const rpcRequestDataFull: JsonRpcRequest<T> = { jsonrpc: '2.0', method, params }
  const configFull: AxiosRequestConfig = { ...CONFIG_DEFAULT, ...config }

  const [ err, res ] = await to(Axios.post<JsonRpcResponse<T>>(uri, rpcRequestDataFull, configFull))
  if (err !== null) throw new Error(err.message)

  if (res === undefined || res.data === undefined) {
    throw new Error(`We did't get the expected RPC response.`)
  }

  if (res.data.error !== null) {
    throw new Error(res.data.error)
  }

  return res.data.result
}

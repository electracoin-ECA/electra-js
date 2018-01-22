import { AxiosRequestConfig } from 'axios';
import { RpcMethod, RpcMethodParams, RpcMethodResult } from './types';
export default function <T extends RpcMethod>(uri: string, method: T, params: RpcMethodParams, config?: AxiosRequestConfig): Promise<RpcMethodResult<T>>;

import { EJErrorCode } from '../error'
import { RpcErrorTranslation } from './types'

export const RPC_ERRORS_TRANSLATION: RpcErrorTranslation = {
  // "'Error: running with an unencrypted wallet, but walletlock was called.'"
  '-15': EJErrorCode.DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET,
  // "Method not found"
  '-32601': EJErrorCode.DAEMON_RPC_METHOD_NOT_FOUND,
}

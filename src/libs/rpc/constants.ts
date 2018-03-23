import { ElectraJsErrorReference } from '../error/types'

export const RPC_ERRORS_TRANSLATION: {
  [code: string]: keyof ElectraJsErrorReference
} = {
  '-32601': 'DAEMON_RPC_METHOD_NOT_FOUND', // "Method not found"
}

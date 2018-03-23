import { ElectraJsErrorReference } from '../error/types'

export const RPC_ERRORS_TRANSLATION: {
  [code: string]: keyof ElectraJsErrorReference
} = {
  '-32601': '301', // "Method not found"
}

import { ERRORS } from './constants'
import { ElectraJsErrorReference } from './types'

/**
 * Custom ElectraJs error class.
 */
export default class ElectraJsError<T extends keyof ElectraJsErrorReference> extends Error {
  /** Error code. */
  public code: ElectraJsErrorReference[T]

  public constructor(key: T) {
    super(key)

    this.code = ERRORS[key]
  }
}

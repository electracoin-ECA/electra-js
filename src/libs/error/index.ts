import { EJErrorCode } from './types'

export { EJErrorCode }

/**
 * Custom ElectraJs error class.
 */
export default class EJError extends Error {
  /** Error code. */
  public code: EJErrorCode

  public constructor(code: EJErrorCode) {
    super(code)
    this.code = code
  }
}

import { ERRORS } from './constants'
import { ElectraJsErrorReference } from './types'

export default class ElectraJsError<T extends keyof ElectraJsErrorReference> extends Error {
  public code: T

  public constructor(code: T) {
    super(ERRORS[code])

    this.code = code
  }
}

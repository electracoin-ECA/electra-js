import { ERRORS } from './constants'
import { ElectraJsErrorReference } from './types'

export default class ElectraJsError<T extends keyof ElectraJsErrorReference> extends Error {
  public code: ElectraJsErrorReference[T]

  public constructor(key: T) {
    super(key)

    this.code = ERRORS[key]
  }
}

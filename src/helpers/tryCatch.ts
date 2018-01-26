/**
 * Helper to one-line try / catch statements
 */
export default function <T>(callback: () => T): [undefined, T] | [Error, undefined] {
  try {
    const res: T = callback()

    return [undefined, res]
  }
  catch (err) {
    return [err as Error, undefined]
  }
}

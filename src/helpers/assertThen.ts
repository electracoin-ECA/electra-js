import * as assert from 'assert'

/**
 * Test if a promise does not throw any error.
 */
export default async function<T>(call: () => Promise<T>): Promise<void> {
  let hasError: boolean = false
  await call().catch((err: Error | string) => {
    console.error(err)
    hasError = true
  })

  assert.strictEqual(hasError, false)
}

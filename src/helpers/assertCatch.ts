/**
 * Test if a promise does throw an error or not.
 */
export default async function<T>(call: () => Promise<T>): Promise<boolean> {
  let hasError: boolean = false
  await call().catch(() => hasError = true)

  return hasError
}

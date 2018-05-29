/**
 * Wait for <forInMs> milliseconds.
 */
export default async function(forInMs: number): Promise<void> {
  // tslint:disable-next-line:no-any
  return new Promise<void>((resolve: () => void): any => setTimeout(resolve, forInMs))
}

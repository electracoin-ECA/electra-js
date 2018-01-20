// tslint:disable

/**
 * Helper to create a K:V from an array of strings.
 */
export default function <T extends string>(strings: T[]): {[K in T]: K} {
  return strings.reduce((res: {}, key: string) =>
    (res: any, key: any) => {
      res[key] = key

      return res
    },
    Object.create(null)
  )
}

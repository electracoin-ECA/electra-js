import * as R from 'ramda'

export default function<T extends {}>(list: T[], propertyName: keyof T): T {
  return R.last(R.sortBy(R.prop(propertyName))(list)) as T
}

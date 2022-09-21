export const flatten = <T extends Record<any, any>>(target: T) => {
  const delimiter = '.'
  const output: any = {}

  const step = (object: T, prev?: string, currentDepth = 1) => {
    Object.keys(object).forEach((key) => {
      const value = object[key]
      const type = Object.prototype.toString.call(value)
      const isobject = type === '[object Object]' || type === '[object Array]'

      const newKey = prev ? prev + delimiter + key : key

      if (isobject && Object.keys(value).length) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
      return undefined
    })
  }

  step(target)

  return output
}

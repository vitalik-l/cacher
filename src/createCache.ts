import { flatten } from './flatten'

const isObject = (obj: any) => (obj ?? false)?.constructor?.name === 'Object'

const paramsToKeys = (params: any) => {
  if (isObject(params)) {
    const flattenObject = flatten(params)
    return [Object.keys(flattenObject).join(), ...Object.values(flattenObject)]
  }
  if (Array.isArray(params)) {
    return params
  }
  return [params]
}

export type Cache<TParams = any, TValue = any, TKey = any> = {
  has: (key: TParams) => boolean
  clear: () => void
  clone: () => Cache<TParams, TValue, TKey>
  set: (params: TParams, value: TValue) => void
  get: (params: TParams) => TValue
  delete: (params: TParams) => void
  keys: () => TParams[]
}

export const createCache = <TParams = any, TValue = any, TKey = any>(options?: {
  values?: Map<any, any>
  mapKey?: (params: TParams) => TKey
  keys?: Map<TParams, any>
}): Cache<TParams, TValue, TKey> => {
  const mapParams = options?.mapKey ?? ((key) => key as unknown as TKey)
  const cache: Map<any, any> = new Map(options?.values ?? [])
  const keysCache = new Map<TParams, any>(options?.keys ?? [])

  const api = {
    $$cache: cache,
    has: (key: TParams) => !!api.get(key),
    clear: () => cache.clear(),
    clone: () => createCache({ ...options, values: cache, keys: keysCache }),
    set: (params: TParams, value: TValue) => {
      let cursor = cache
      const keys = paramsToKeys(mapParams(params))
      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          if (!cursor.has(key)) {
            keysCache.set(params, keys)
            cursor.set(key, Object.assign(new Map(), { value, params }))
          } else {
            cursor.get(key).value = value
            cursor.get(key).params = params
          }
          return undefined
        }
        if (cursor.has(key) && cursor.get(key) instanceof Map) {
          cursor = cursor.get(key)
          return undefined
        }
        cursor.set(key, new Map())
        cursor = cursor.get(key)
        return undefined
      })
    },
    get: (params: TParams): TValue => {
      let result
      let cursor = cache
      const keys = paramsToKeys(mapParams(params))
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index]
        if (index === length - 1) {
          result = cursor.get(key)?.value
          break
        }
        cursor = cursor.get(key)
        if (!cursor) break
      }
      return result
    },
    delete: (params: TParams) => {
      let cursor: any = cache
      const callbacks: (() => void)[] = []
      const keys = paramsToKeys(mapParams(params))
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index]
        if (index === length - 1) {
          if (cursor.get(key)?.value !== undefined) {
            keysCache.delete(cursor.get(key).params)
            delete cursor.get(key).value
            delete cursor.get(key).params
          }
          if (!cursor.get(key)?.size) {
            cursor.delete(key)
            callbacks.forEach((fn) => fn())
          }
          // eslint-disable-next-line no-continue
          continue
        }
        if (!cursor.value) {
          const currentCursor = cursor
          callbacks.unshift(() => {
            if (!currentCursor.get(key)?.size) {
              currentCursor.delete(key)
            }
          })
        }
        cursor = cursor.get(key)
        if (!cursor) break
      }
    },
    keys: () => {
      return [...keysCache.keys()]
    }
  }

  return api
}

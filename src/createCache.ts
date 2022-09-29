const paramsToKeys = (params: any) => {
  return Array.isArray(params) ? params : [params];
};

export type Cache<TParams = any, TValue = any, TKey = any> = {
  has: (key: TParams) => boolean;
  clear: () => void;
  clone: () => Cache<TParams, TValue, TKey>;
  set: (params: TParams, value?: TValue) => void;
  get: (params: TParams) => TValue;
  delete: (params: TParams) => void;
  keys: () => TParams[];
};

export const createCache = <TParams = any, TValue = any, TKey = any>(options?: {
  values?: Map<any, any>;
  mapKey?: (params: TParams) => TKey;
  keys?: Map<TParams, any>;
}): Cache<TParams, TValue, TKey> => {
  const mapKey = options?.mapKey ?? ((key) => key as unknown as TKey);
  const cache: Map<any, any> = new Map(options?.values ?? []);
  const keysCache = new Map<TParams, any>(options?.keys ?? []);

  const api = {
    $$cache: cache,
    has: (key: TParams) => !!api.get(key),
    clear: () => {
      cache.clear();
      keysCache.clear();
    },
    clone: () => createCache({ ...options, values: cache, keys: keysCache }),
    set: (params: TParams, data?: TValue) => {
      const value = data ?? params;
      let cursor = cache;
      const keys = paramsToKeys(mapKey(params));
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index];
        if (index === length - 1) {
          if (!cursor.has(key)) {
            keysCache.set(params, keys);
            cursor.set(key, Object.assign(new Map(), { value, params }));
          } else {
            cursor.get(key).value = value;
            cursor.get(key).params = params;
          }
          continue;
        }
        if (cursor.has(key) && cursor.get(key) instanceof Map) {
          cursor = cursor.get(key);
          continue;
        }
        cursor.set(key, new Map());
        cursor = cursor.get(key);
      }
    },
    get: (params: TParams): TValue => {
      let result;
      let cursor = cache;
      const keys = paramsToKeys(mapKey(params));
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index];
        if (index === length - 1) {
          result = cursor.get(key)?.value;
          break;
        }
        cursor = cursor.get(key);
        if (!cursor) break;
      }
      return result;
    },
    delete: (params: TParams) => {
      let cursor: any = cache;
      const callbacks: (() => void)[] = [];
      const keys = paramsToKeys(mapKey(params));
      for (let index = 0, length = keys.length; index < length; index++) {
        const key = keys[index];
        if (index === length - 1) {
          if (cursor.get(key)?.value !== undefined) {
            keysCache.delete(cursor.get(key).params);
            delete cursor.get(key).value;
            delete cursor.get(key).params;
          }
          if (!cursor.get(key)?.size) {
            cursor.delete(key);
            callbacks.forEach((fn) => fn());
          }
          continue;
        }
        if (!cursor.value) {
          const currentCursor = cursor;
          callbacks.unshift(() => {
            if (!currentCursor.get(key)?.size) {
              currentCursor.delete(key);
            }
          });
        }
        cursor = cursor.get(key);
        if (!cursor) break;
      }
    },
    keys: () => {
      return [...keysCache.keys()];
    },
  };

  return api;
};

import { createCache } from './createCache'

describe('#createCache', () => {
  const cache = createCache()

  it('should return correct value', () => {
    cache.set([1], 1)
    expect(cache.get([1])).toBe(1)
  })

  it('should rewrite', () => {
    cache.set([1, 2], 2)
    cache.set([1, 2], 3)
    expect(cache.get([1, 2])).toBe(3)
  })

  it('should get undefined', () => {
    expect(cache.get([1, 345])).toBe(undefined)
  })

  it('should accept primitive as key', () => {
    cache.set('value', 1)
    expect(cache.get('value')).toBe(1)
    cache.clear()
    expect((cache as any).$$cache.size).toBe(0)
  })

  it('should remove', () => {
    cache.set([1, 2], 1)
    cache.set([1], 1)
    cache.set([2, 3], 4)
    cache.delete([1, 2])
    cache.delete([1])
    cache.delete([2, 3])
    expect((cache as any).$$cache.size).toBe(0)
  })

  it('should accept object as key', () => {
    cache.set({ a: 1, b: 2 }, 1)
    expect(cache.get({ a: 1, b: 2 })).toBe(1)
  })

  it('should delete object as key', () => {
    cache.set({ a: 1, b: 2 }, 2)
    expect(cache.get({ a: 1, b: 2 })).toBe(2)
    cache.delete({ a: 1, b: 2 })
    expect((cache as any).$$cache.size).toBe(0)
  })

  it('should accept array in object', () => {
    cache.set({ a: 1, b: [1, 2] }, true)
    expect(cache.get({ a: 1, b: [1, 2] })).toBeTruthy()
  })

  it('should accept nested object', () => {
    cache.set({ a: 1, b: { a: 2 } }, true)
    expect(cache.get({ a: 1, b: { a: 2 } })).toBeTruthy()
    // is the same
    expect(cache.get({ a: 1, 'b.a': 2 })).toBe(true)
  })

  it('should clone', () => {
    const tCache = createCache({ mapKey: (params) => params.a })
    tCache.set({ a: 1 }, true)
    const clonedCache = tCache.clone()
    expect(clonedCache.get({ a: 1 })).toBeTruthy()
    expect(clonedCache === tCache).toBeFalsy()
  })

  it('should not delete nested', () => {
    const tCache = createCache()
    tCache.set([1, undefined], true)
    tCache.set([1, 'test', undefined], true)
    tCache.delete([1, undefined])
    expect(tCache.get([1, undefined])).toBeFalsy()
    expect(tCache.get([1, 'test', undefined])).toBeTruthy()
  })

  it('should be iterable', () => {
    const tCache = createCache()
    tCache.set(1, true)
    tCache.set(2, true)
    tCache.set(3, true)
    tCache.delete(2)
    expect(tCache.keys()).toStrictEqual([1, 3])
  })
})

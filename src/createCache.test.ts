import { createCache } from './createCache';

describe('#createCache', () => {
  const cache = createCache();

  afterEach(() => {
    cache.clear();
  });

  test('should clear cache', () => {
    cache.set(1, true);
    expect(cache.keys().length).toBe(1);
    cache.clear();
    expect(cache.keys().length).toBe(0);
  });

  test('should return correct value', () => {
    cache.set([1], 1);
    expect(cache.get([1])).toBe(1);
  });

  test('should rewrite', () => {
    cache.set([1, 2], 2);
    cache.set([1, 2], 3);
    expect(cache.get([1, 2])).toBe(3);
  });

  test('should get undefined', () => {
    expect(cache.get([1, 345])).toBe(undefined);
  });

  test('should accept primitive as key', () => {
    cache.set('value', 1);
    expect(cache.get('value')).toBe(1);
  });

  test('should delete keys', () => {
    cache.set([1, 2], 1);
    cache.set([1], 1);
    cache.set([2, 3], 4);
    cache.delete([1, 2]);
    cache.delete([1]);
    cache.delete([2, 3]);
    expect(cache.keys().length).toBe(0);
  });

  test('should clone', () => {
    const tCache = createCache({ mapKey: (params) => params.a });
    tCache.set({ a: 1 }, true);
    const clonedCache = tCache.clone();
    expect(clonedCache.get({ a: 1 })).toBeTruthy();
    expect(clonedCache === tCache).toBeFalsy();
  });

  test('should not delete nested', () => {
    cache.set([1, undefined], true);
    cache.set([1, 'test', undefined], true);
    cache.delete([1, undefined]);
    expect(cache.get([1, undefined])).toBeFalsy();
    expect(cache.get([1, 'test', undefined])).toBeTruthy();
  });

  test('should return correct keys', () => {
    cache.set(1, true);
    cache.set(2, true);
    cache.set(3, true);
    cache.delete(2);
    expect(cache.keys()).toStrictEqual([1, 3]);
  });

  test('should set key as value when passing one argument', () => {
    cache.set('key');
    expect(cache.get('key')).toBe('key');
  });
});

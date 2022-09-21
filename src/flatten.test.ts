import { flatten } from './flatten'

describe('#flatten', () => {
  it('first', () => {
    expect(flatten({ a: 1, b: [1, 2] })).toStrictEqual({
      a: 1,
      'b.0': 1,
      'b.1': 2
    })
  })
})

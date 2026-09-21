const { flattenProperties } = require('./flattenProperties');

describe('flattenProperties', () => {
  it('should flatten nested objects into dot-delimited keys', () => {
    expect.assertions(1);

    const result = flattenProperties({
      orderId: 'o-1',
      customer: { name: 'Ada', address: { city: 'London' } }
    });

    expect(result).toStrictEqual({
      orderId: 'o-1',
      'customer.name': 'Ada',
      'customer.address.city': 'London'
    });
  });

  it('should keep arrays intact rather than expanding them into columns', () => {
    expect.assertions(1);

    expect(flattenProperties({ skus: ['a', 'b'] })).toStrictEqual({
      skus: ['a', 'b']
    });
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an array', ['a']],
    ['a string', 'nope']
  ])('should return an empty object for %s', (_label, input) => {
    expect.assertions(1);
    expect(flattenProperties(input)).toStrictEqual({});
  });
});

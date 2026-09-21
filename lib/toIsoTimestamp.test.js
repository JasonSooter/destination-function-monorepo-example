const { toIsoTimestamp } = require('./toIsoTimestamp');

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('toIsoTimestamp', () => {
  it('should convert a zoned timestamp to UTC', () => {
    expect.assertions(1);
    expect(toIsoTimestamp('2026-09-21T10:03:00-04:00')).toBe(
      '2026-09-21T14:03:00.000Z'
    );
  });

  it('should accept epoch milliseconds', () => {
    expect.assertions(1);
    expect(toIsoTimestamp(1789041780000)).toMatch(ISO_PATTERN);
  });

  it.each([
    ['omitted', undefined],
    ['an empty string', ''],
    ['unparseable', 'not-a-date']
  ])('should fall back to now when the timestamp is %s', (_label, input) => {
    expect.assertions(1);
    expect(toIsoTimestamp(input)).toMatch(ISO_PATTERN);
  });
});

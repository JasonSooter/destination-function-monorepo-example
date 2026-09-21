const { requireTraits } = require('./requireTraits');

jest.spyOn(global.console, 'log').mockImplementation();

describe('requireTraits', () => {
  it('should pass when every trait has a value', () => {
    expect.assertions(1);
    expect(requireTraits({ plan: 'gold', ltv: 0 }, ['plan', 'ltv'])).toBe(true);
  });

  it('should retry when traits have not been computed at all', () => {
    expect.assertions(1);
    expect(() => requireTraits(undefined, ['plan'])).toThrow(RetryError);
  });

  it('should retry when one trait is still uncomputed', () => {
    expect.assertions(1);
    expect(() => requireTraits({ plan: 'gold' }, ['plan', 'ltv'])).toThrow(
      /not yet computed: ltv/
    );
  });

  it('should skip rather than retry when a trait is definitively null', () => {
    expect.assertions(2);

    expect(requireTraits({ plan: null }, ['plan'])).toBe(false);
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});

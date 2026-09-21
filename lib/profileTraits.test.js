const { fetchProfileTraits } = require('./profileTraits');

jest.spyOn(global.console, 'log').mockImplementation();
jest.spyOn(global.console, 'time').mockImplementation();
jest.spyOn(global.console, 'timeEnd').mockImplementation();

const settings = {
  engageSpaceId: 'spa_123',
  profileApiToken: 'token_abc',
  traitsToReturn: ['plan']
};

describe('fetchProfileTraits', () => {
  it('should return the traits from the Profile API', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce(JSON.stringify({ traits: { plan: 'gold' } }));

    await expect(fetchProfileTraits('user-1', settings)).resolves.toStrictEqual(
      {
        plan: 'gold'
      }
    );
  });

  it.each([
    ['undefined', undefined],
    ['empty', []]
  ])(
    'should skip the network call when traitsToReturn is %s',
    async (_label, traitsToReturn) => {
      expect.assertions(2);

      const traits = await fetchProfileTraits('user-1', {
        ...settings,
        traitsToReturn
      });

      expect(fetch).not.toHaveBeenCalled();
      expect(traits).toStrictEqual({});
    }
  );

  it('should normalize a profile with no traits to an empty object', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce(JSON.stringify({}), { status: 404 });

    await expect(
      fetchProfileTraits('missing', settings)
    ).resolves.toStrictEqual({});
  });
});

const { onTrack } = require('./handlers');

jest.spyOn(global.console, 'log').mockImplementation();
jest.spyOn(global.console, 'error').mockImplementation();
jest.spyOn(global.console, 'time').mockImplementation();
jest.spyOn(global.console, 'timeEnd').mockImplementation();

const settings = {
  webhookUrl: 'https://example.com/hook',
  engageSpaceId: 'spa_123',
  profileApiToken: 'token_abc',
  traitsToReturn: ['plan']
};

const event = {
  event: 'Order Completed',
  userId: 'user-1',
  properties: { orderId: 'o-1', customer: { city: 'London' } }
};

describe('onTrack', () => {
  it('should forward the event enriched with profile traits', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce(JSON.stringify({ traits: { plan: 'gold' } }));
    fetch.mockResponseOnce('ok');

    const result = await onTrack(event, settings);

    expect(JSON.parse(fetch.mock.calls[1][1].body)).toStrictEqual({
      event: 'Order Completed',
      userId: 'user-1',
      properties: { orderId: 'o-1', 'customer.city': 'London' },
      traits: { plan: 'gold' }
    });
    expect(result.status).toBe(200);
  });

  it('should forward without calling the Profile API when no traits are configured', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce('ok');

    await onTrack(event, { ...settings, traitsToReturn: [] });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body).traits).toStrictEqual({});
  });

  it('should not forward anything when webhookUrl is missing', async () => {
    expect.assertions(2);

    await onTrack(event, { ...settings, webhookUrl: undefined });

    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

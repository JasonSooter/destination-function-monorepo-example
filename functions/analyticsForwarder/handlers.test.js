const { onTrack, onPage } = require('./handlers');

jest.spyOn(global.console, 'log').mockImplementation();
jest.spyOn(global.console, 'error').mockImplementation();

const settings = {
  collectorUrl: 'https://collector.example.com/events',
  collectorApiKey: 'key_123'
};

describe('onTrack', () => {
  it('should forward a normalized, flattened event', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce('ok');

    await onTrack(
      {
        event: 'Order Completed',
        userId: 'user-1',
        anonymousId: 'anon-1',
        timestamp: '2026-09-21T10:03:00-04:00',
        properties: { total: 42, customer: { city: 'London' } }
      },
      settings
    );

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toStrictEqual({
      name: 'Order Completed',
      occurredAt: '2026-09-21T14:03:00.000Z',
      anonymousId: 'anon-1',
      userId: 'user-1',
      attributes: { total: 42, 'customer.city': 'London' }
    });
    expect(fetch.mock.calls[0][0]).toBe(settings.collectorUrl);
  });

  it('should do nothing when collectorUrl is missing', async () => {
    expect.assertions(2);

    await onTrack({ event: 'Order Completed' }, {});

    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

describe('onPage', () => {
  it('should label a named page call', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce('ok');

    await onPage({ name: 'Pricing', userId: 'user-1' }, settings);

    expect(JSON.parse(fetch.mock.calls[0][1].body).name).toBe('Page: Pricing');
  });

  it('should label an unnamed page call', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce('ok');

    await onPage({ userId: 'user-1' }, settings);

    expect(JSON.parse(fetch.mock.calls[0][1].body).name).toBe('Page');
  });
});

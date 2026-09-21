const { onTrack, onIdentify } = require('./handlers');

jest.spyOn(global.console, 'log').mockImplementation();
jest.spyOn(global.console, 'error').mockImplementation();
jest.spyOn(global.console, 'time').mockImplementation();
jest.spyOn(global.console, 'timeEnd').mockImplementation();

const settings = {
  crmBaseUrl: 'https://crm.example.com',
  crmApiKey: 'key_123',
  engageSpaceId: 'spa_123',
  profileApiToken: 'token_abc',
  traitsToReturn: ['plan']
};

const personas = {
  context: { personas: { computation_key: 'vip_customers' } }
};

describe('onTrack', () => {
  it('should upsert the contact with profile traits when entering the audience', async () => {
    expect.assertions(3);
    fetch.mockResponseOnce(JSON.stringify({ traits: { plan: 'gold' } }));
    fetch.mockResponseOnce('ok');

    await onTrack(
      { ...personas, userId: 'user-1', properties: { vip_customers: true } },
      settings
    );

    expect(fetch.mock.calls[1][0]).toBe(
      'https://crm.example.com/contacts/upsert'
    );
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toStrictEqual({
      userId: 'user-1',
      listId: 'vip_customers',
      attributes: { plan: 'gold' }
    });
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe('Bearer key_123');
  });

  it('should remove the contact without querying the Profile API when exiting', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce('ok');

    await onTrack(
      { ...personas, userId: 'user-1', properties: { vip_customers: false } },
      settings
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      'https://crm.example.com/lists/vip_customers/remove'
    );
  });

  it('should upsert with empty attributes when no traits are configured', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce('ok');

    await onTrack(
      { ...personas, userId: 'user-1', properties: { vip_customers: true } },
      { ...settings, traitsToReturn: [] }
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1].body).attributes).toStrictEqual(
      {}
    );
  });

  it('should ignore an event with no audience membership change', async () => {
    expect.assertions(2);

    await onTrack({ userId: 'user-1' }, settings);

    expect(fetch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when the CRM settings are missing', async () => {
    expect.assertions(2);

    await onTrack({ ...personas, userId: 'user-1' }, {});

    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

describe('onIdentify', () => {
  it('should apply membership read from identify traits', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce('ok');

    await onIdentify(
      { ...personas, userId: 'user-1', traits: { vip_customers: false } },
      settings
    );

    expect(fetch.mock.calls[0][0]).toBe(
      'https://crm.example.com/lists/vip_customers/remove'
    );
  });
});

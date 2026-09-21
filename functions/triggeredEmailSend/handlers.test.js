const { onTrack } = require('./handlers');

jest.spyOn(global.console, 'log').mockImplementation();
jest.spyOn(global.console, 'error').mockImplementation();
jest.spyOn(global.console, 'time').mockImplementation();
jest.spyOn(global.console, 'timeEnd').mockImplementation();

const settings = {
  triggerEvents: ['Cart Abandoned'],
  templateId: 'tpl_1',
  marketingApiUrl: 'https://marketing.example.com',
  marketingApiKey: 'key_123',
  engageSpaceId: 'spa_123',
  profileApiToken: 'token_abc',
  requiredTraits: ['firstName', 'cartValue']
};

const event = { event: 'Cart Abandoned', userId: 'user-1' };
const traits = { firstName: 'Ada', cartValue: 42 };

describe('onTrack', () => {
  it('should request a send with the template attributes', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce(JSON.stringify({ traits }));
    fetch.mockResponseOnce('ok');

    await onTrack(event, settings);

    expect(fetch.mock.calls[1][0]).toBe(
      'https://marketing.example.com/messaging/v1/sends'
    );
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toStrictEqual({
      templateId: 'tpl_1',
      recipient: { userId: 'user-1' },
      attributes: traits
    });
  });

  it('should ignore an event that is not a trigger', async () => {
    expect.assertions(1);

    await onTrack({ ...event, event: 'Page Viewed' }, settings);

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should ignore the event when triggerEvents is not configured', async () => {
    expect.assertions(1);

    await onTrack(event, { ...settings, triggerEvents: undefined });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should retry when the required traits are not computed yet', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce(JSON.stringify({ traits: { firstName: 'Ada' } }));

    await expect(onTrack(event, settings)).rejects.toThrow(RetryError);
  });

  it('should skip the send when a required trait is definitively null', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce(
      JSON.stringify({ traits: { firstName: 'Ada', cartValue: null } })
    );

    const result = await onTrack(event, settings);

    expect(result).toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should send with no attributes when no traits are required', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce(JSON.stringify({ traits: {} }));
    fetch.mockResponseOnce('ok');

    await onTrack(event, { ...settings, requiredTraits: undefined });

    expect(fetch.mock.calls[0][0]).toContain('limit=0&include=');
    expect(JSON.parse(fetch.mock.calls[1][1].body).attributes).toStrictEqual(
      {}
    );
  });

  it('should do nothing when the marketing settings are missing', async () => {
    expect.assertions(2);

    await onTrack(event, { ...settings, templateId: undefined });

    expect(fetch).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

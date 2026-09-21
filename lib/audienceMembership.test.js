const { audienceMembership } = require('./audienceMembership');

const personas = {
  context: { personas: { computation_key: 'vip_customers' } }
};

describe('audienceMembership', () => {
  it('should read an entry from track properties', () => {
    expect.assertions(1);

    expect(
      audienceMembership({ ...personas, properties: { vip_customers: true } })
    ).toStrictEqual({ audienceKey: 'vip_customers', isMember: true });
  });

  it('should read an exit from identify traits', () => {
    expect.assertions(1);

    expect(
      audienceMembership({ ...personas, traits: { vip_customers: false } })
    ).toStrictEqual({ audienceKey: 'vip_customers', isMember: false });
  });

  it('should accept an explicit audience key override', () => {
    expect.assertions(1);

    expect(
      audienceMembership({ traits: { beta_users: true } }, 'beta_users')
    ).toStrictEqual({ audienceKey: 'beta_users', isMember: true });
  });

  it.each([
    ['there is no audience key', {}],
    ['the flag is missing', personas],
    [
      'the flag is not a boolean',
      { ...personas, traits: { vip_customers: 1 } }
    ],
    ['the event is empty', undefined]
  ])('should return undefined when %s', (_label, event) => {
    expect.assertions(1);
    expect(audienceMembership(event)).toBeUndefined();
  });
});

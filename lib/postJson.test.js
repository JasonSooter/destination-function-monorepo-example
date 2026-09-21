const { postJson } = require('./postJson');

jest.spyOn(global.console, 'log').mockImplementation();

const URL = 'https://example.com/collect';

describe('postJson', () => {
  it('should post the body as JSON and return the response', async () => {
    expect.assertions(3);
    fetch.mockResponseOnce('ok');

    const result = await postJson(URL, { a: 1 });

    expect(result).toStrictEqual({ status: 200, body: 'ok' });
    expect(fetch.mock.calls[0][1].body).toBe('{"a":1}');
    expect(fetch.mock.calls[0][1].headers['Content-Type']).toBe(
      'application/json'
    );
  });

  it('should merge caller headers over the default', async () => {
    expect.assertions(1);
    fetch.mockResponseOnce('ok');

    await postJson(URL, {}, { Authorization: 'Bearer t' });

    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer t');
  });

  it('should throw RetryError when the request cannot be sent', async () => {
    expect.assertions(1);
    fetch.mockRejectOnce(new Error('ECONNRESET'));

    await expect(postJson(URL, {})).rejects.toThrow(RetryError);
  });

  it.each([500, 503, 429])(
    'should throw RetryError on a transient %i',
    async status => {
      expect.assertions(1);
      fetch.mockResponseOnce('', { status });

      await expect(postJson(URL, {})).rejects.toThrow(RetryError);
    }
  );

  it('should report and return a permanent 4xx without retrying', async () => {
    expect.assertions(2);
    fetch.mockResponseOnce('bad request', { status: 400 });

    const result = await postJson(URL, {});

    expect(result.status).toBe(400);
    expect(console.log).toHaveBeenCalledTimes(1);
  });
});

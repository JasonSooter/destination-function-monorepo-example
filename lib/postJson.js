/**
 * POST a JSON body to a downstream service, translating transient failures into
 * a Segment redelivery.
 *
 * Every function here forwards data somewhere, so the decision of what counts as
 * retryable lives in one place: throwing RetryError asks Segment's runtime to
 * redeliver the event later, while a permanent 4xx is reported and swallowed so a
 * malformed payload does not retry forever.
 *
 * @param  {string} url
 * @param  {object} body            serialized as JSON
 * @param  {object} [headers]       merged over the JSON content type
 * @return {Promise<{status: number, body: string}>}
 */
async function postJson(url, body, headers = {}) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new RetryError(`POST ${url} failed to send: ${error.message}`);
  }

  const responseBody = await response.text();

  switch (true) {
    case response.status >= 500 || response.status === 429:
      throw new RetryError(
        `POST ${url} returned ${response.status}; will retry`
      );
    case response.status >= 400:
      // A 4xx means this payload will never be accepted, so retrying would only
      // burn the redelivery budget.
      console.log(`POST ${url} rejected with ${response.status}`, responseBody);
      return { status: response.status, body: responseBody };
    default:
      return { status: response.status, body: responseBody };
  }
}

module.exports = { postJson };

/**
 * Assert that the Profile API returned every trait a downstream template needs.
 *
 * The distinction matters for deliverability. A trait that is *undefined* usually
 * means the Profile API has not finished computing it yet, which is transient, so
 * RetryError lets Segment redeliver. A trait that is present but *null* is a real
 * answer — the profile genuinely has no value — so retrying would loop forever
 * and the caller should instead skip the event.
 *
 * @param  {object} [traits] traits returned by queryProfileAPI
 * @param  {string[]} names  trait names the caller needs
 * @return {boolean} true when every trait has a usable value; false when one is
 *   definitively null
 * @throws {RetryError} when traits have not been computed yet
 */
function requireTraits(traits, names) {
  if (_.isUndefined(traits)) {
    throw new RetryError('Profile API: traits undefined, retrying');
  }

  const missing = names.filter(name => _.isUndefined(traits[name]));
  if (missing.length > 0) {
    throw new RetryError(
      `Profile API: traits not yet computed: ${missing.join(', ')}`
    );
  }

  const nullTraits = names.filter(name => _.isNull(traits[name]));
  if (nullTraits.length > 0) {
    console.log('Skipping event: traits are null', { nullTraits });
    return false;
  }

  return true;
}

module.exports = { requireTraits };

const { queryProfileAPI } = require('./queryProfileAPI');

/**
 * Fetch the configured Engage traits for a user, or nothing if none are wanted.
 *
 * Wraps queryProfileAPI with the "enrichment is optional" behaviour that every
 * enriching function needs: skip the network call when no traits are configured,
 * and normalize a missing profile to an empty object so callers never branch on
 * undefined.
 *
 * This module requires another lib module, which the bundler inlines transitively
 * — lib helpers can be composed freely.
 *
 * @param  {string} userId
 * @param  {FunctionSettings} settings reads engageSpaceId, profileApiToken and
 *   traitsToReturn
 * @return {Promise<object>} traits, possibly empty
 */
async function fetchProfileTraits(userId, settings) {
  const { engageSpaceId, profileApiToken, traitsToReturn } = settings;

  if (!traitsToReturn?.length) {
    return {};
  }

  const profile = await queryProfileAPI(
    userId,
    traitsToReturn,
    engageSpaceId,
    profileApiToken
  );

  return profile?.traits ?? {};
}

module.exports = { fetchProfileTraits };

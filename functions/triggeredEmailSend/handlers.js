const { queryProfileAPI } = require('../../lib/queryProfileAPI');
const { requireTraits } = require('../../lib/requireTraits');
const { postJson } = require('../../lib/postJson');

/**
 * Request a triggered email send when a qualifying event arrives.
 *
 * Marketing-platform triggered sends interpolate profile traits into the email
 * template, so a send issued before those traits are computed produces a broken
 * email. `requireTraits` draws the distinction that matters: an uncomputed trait
 * is retried, a genuinely null trait skips the send.
 *
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
  const {
    triggerEvents,
    templateId,
    marketingApiUrl,
    marketingApiKey,
    engageSpaceId,
    profileApiToken,
    requiredTraits = []
  } = settings;

  if (!marketingApiUrl || !templateId) {
    console.error('Missing required settings: marketingApiUrl and templateId');
    return;
  }

  if (!triggerEvents?.includes(event.event)) {
    console.log('Event does not trigger a send; ignoring', {
      event: event.event
    });
    return;
  }

  const profile = await queryProfileAPI(
    event.userId,
    requiredTraits,
    engageSpaceId,
    profileApiToken
  );

  if (!requireTraits(profile?.traits, requiredTraits)) {
    return;
  }

  return postJson(
    `${marketingApiUrl}/messaging/v1/sends`,
    {
      templateId,
      recipient: { userId: event.userId },
      attributes: profile.traits
    },
    { Authorization: `Bearer ${marketingApiKey}` }
  );
}

module.exports = { onTrack };

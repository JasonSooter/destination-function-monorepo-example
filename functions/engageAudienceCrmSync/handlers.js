const { fetchProfileTraits } = require('../../lib/profileTraits');
const { audienceMembership } = require('../../lib/audienceMembership');
const { postJson } = require('../../lib/postJson');

/**
 * Apply an Engage audience membership change to a CRM.
 *
 * Entering the audience upserts the contact; leaving it removes the contact from
 * the corresponding CRM list. Both handlers do the same work because Engage
 * delivers audience changes as track events for some audiences and identify
 * events for others.
 *
 * @param  {SegmentEvent} event
 * @param  {FunctionSettings} settings
 */
async function syncMembership(event, settings) {
  const { crmBaseUrl, crmApiKey, audienceKey } = settings;

  if (!crmBaseUrl || !crmApiKey) {
    console.error('Missing required settings: crmBaseUrl and crmApiKey');
    return;
  }

  const membership = audienceMembership(event, audienceKey);
  if (!membership) {
    console.log('Event carries no audience membership change; ignoring', {
      userId: event.userId
    });
    return;
  }

  const headers = { Authorization: `Bearer ${crmApiKey}` };

  // Removal needs only the identifier, so the Profile API call is skipped
  // entirely — the CRM record is about to stop being synced anyway.
  if (!membership.isMember) {
    return postJson(
      `${crmBaseUrl}/lists/${membership.audienceKey}/remove`,
      { userId: event.userId },
      headers
    );
  }

  const traits = await fetchProfileTraits(event.userId, settings);

  return postJson(
    `${crmBaseUrl}/contacts/upsert`,
    {
      userId: event.userId,
      listId: membership.audienceKey,
      attributes: traits
    },
    headers
  );
}

/**
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
  return syncMembership(event, settings);
}

/**
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
  return syncMembership(event, settings);
}

module.exports = { onTrack, onIdentify };

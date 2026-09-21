const { fetchProfileTraits } = require('../../lib/profileTraits');
const { flattenProperties } = require('../../lib/flattenProperties');
const { postJson } = require('../../lib/postJson');

/**
 * Forward a track event to a customer webhook, enriched with Engage traits.
 *
 * The canonical enrichment pattern: the event alone rarely carries enough context
 * for the receiving system, so the computed traits it needs are fetched from the
 * Profile API and merged in before forwarding.
 *
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
  const { webhookUrl } = settings;

  if (!webhookUrl) {
    console.error('Missing required setting: webhookUrl');
    return;
  }

  const traits = await fetchProfileTraits(event.userId, settings);

  // Traits are namespaced rather than merged into properties so an audience trait
  // can never silently overwrite an event property of the same name.
  const payload = {
    event: event.event,
    userId: event.userId,
    properties: flattenProperties(event.properties),
    traits: flattenProperties(traits)
  };

  return postJson(webhookUrl, payload);
}

module.exports = { onTrack };

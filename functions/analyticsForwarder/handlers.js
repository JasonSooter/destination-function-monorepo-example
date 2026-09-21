const { flattenProperties } = require('../../lib/flattenProperties');
const { toIsoTimestamp } = require('../../lib/toIsoTimestamp');
const { postJson } = require('../../lib/postJson');

/**
 * Forward events to an analytics collector in a flat, normalized shape.
 *
 * This function needs no profile lookup, which is why it is a useful reference
 * point: its deployed bundle contains no Profile API code at all, because the
 * bundler follows each function's own require graph.
 *
 * @param  {SegmentEvent} event
 * @param  {FunctionSettings} settings
 * @param  {string} eventName name recorded in the collector
 */
async function forward(event, settings, eventName) {
  const { collectorUrl, collectorApiKey } = settings;

  if (!collectorUrl) {
    console.error('Missing required setting: collectorUrl');
    return;
  }

  return postJson(
    collectorUrl,
    {
      name: eventName,
      occurredAt: toIsoTimestamp(event.timestamp),
      anonymousId: event.anonymousId,
      userId: event.userId,
      attributes: flattenProperties(event.properties)
    },
    { Authorization: `Bearer ${collectorApiKey}` }
  );
}

/**
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
  return forward(event, settings, event.event);
}

/**
 * @param  {SegmentPageEvent} event
 * @param  {FunctionSettings} settings
 */
async function onPage(event, settings) {
  // Page calls carry the page name in `name` rather than `event`.
  return forward(event, settings, event.name ? `Page: ${event.name}` : 'Page');
}

module.exports = { onTrack, onPage };

/**
 * Resolve an Engage audience-sync event into an explicit membership change.
 *
 * Engage signals membership with a boolean trait named after the audience, and
 * sends the audience key in `context.personas.computation_key`. Reading that
 * shape correctly is fiddly enough — and repeated by every function that consumes
 * an audience — to be worth doing in one place.
 *
 * @param  {SegmentEvent} event
 * @param  {string} [audienceKey] overrides the key Engage reports
 * @return {{audienceKey: string, isMember: boolean}|undefined} undefined when the
 *   event carries no resolvable audience membership
 */
function audienceMembership(event, audienceKey) {
  const key = audienceKey || event?.context?.personas?.computation_key;
  // Track events put the flag in properties; identify events put it in traits.
  const traits = { ...event?.traits, ...event?.properties };
  const isMember = key ? traits[key] : undefined;

  return _.isBoolean(isMember) ? { audienceKey: key, isMember } : undefined;
}

module.exports = { audienceMembership };

/**
 * Normalize an event timestamp to a UTC ISO-8601 string.
 *
 * Segment events carry `timestamp`, `originalTimestamp` and `sentAt`, not always
 * in the same format, and collectors reject anything ambiguous. `moment` is a
 * Segment runtime global, so it needs no import.
 *
 * @param  {string|number|Date} [timestamp] falls back to now when absent
 * @return {string} e.g. 2026-09-21T14:03:00.000Z
 */
function toIsoTimestamp(timestamp) {
  const parsed = timestamp ? moment.utc(timestamp) : moment.utc();

  // An unparseable timestamp is worse than a missing one: it would silently land
  // as "Invalid date" in the warehouse.
  return parsed.isValid() ? parsed.toISOString() : moment.utc().toISOString();
}

module.exports = { toIsoTimestamp };

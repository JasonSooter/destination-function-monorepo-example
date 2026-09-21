/**
 * Flatten a nested object into dot-delimited keys.
 *
 * Many downstream collectors accept only scalar columns, so nested Segment
 * `properties` have to be flattened before they are sent. Arrays are left intact
 * rather than expanded into `items.0.sku`-style keys, which would produce an
 * unbounded and unstable column set.
 *
 * @param  {object} source
 * @param  {string} [prefix] key prefix, used when recursing
 * @return {object} flat object of scalar (or array) values
 */
function flattenProperties(source, prefix = '') {
  if (!_.isPlainObject(source)) {
    return {};
  }

  return Object.entries(source).reduce((flattened, [key, value]) => {
    const flatKey = prefix ? `${prefix}.${key}` : key;

    return _.isPlainObject(value)
      ? { ...flattened, ...flattenProperties(value, flatKey) }
      : { ...flattened, [flatKey]: value };
  }, {});
}

module.exports = { flattenProperties };

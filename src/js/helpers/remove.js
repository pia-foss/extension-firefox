/**
 * Build a subset of obj without the provided keys
 *
 * @param {Object} obj Origin object
 * @param {String[]} removals Keys to remove in new object
 * @immutable
 *
 * @returns {Object} subset of obj without removals keys
 */
module.exports = function (obj, ...removals) {
  return Object.keys(obj)
    .filter(key => !removals.includes(key))
    .map(key => ({key, value: obj[key]}))
    .reduce((accum, {key, value}) => {
      return {
        ...accum,
        [key]: value,
      };
    }, {})
}

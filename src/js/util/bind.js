/**
 * **More performant version of Function.prototype.bind**
 *
 * Note: Does not perform currying and overrides **new**
 *
 * @param {function} fn Function to bind to context
 * @param {*} context Context to bind function to
 *
 * @returns {Function} Bound version of 'fn'
 */
module.exports = function (fn, context) {
  return function (...args) {
    return fn.call(context, ...args);
  }
}

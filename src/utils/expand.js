import globby from "globby"

/**
  Globby wrapper
  @param {String || Array}  pattern(s) to match
  @param {Object}           options
  @return {Promise}
*/
export function expand (pattern, options) {
  return globby(pattern, options)
}

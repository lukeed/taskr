/**
  Flatten a nested array recursively.
  @param {Array}
  @return [[a],[b],[c]] -> [a,b,c]
*/

export function flatten(array) {
  return array.reduce(
    (flat, next) => flat.concat(Array.isArray(next) ? flatten(next) : next), []
  )
}

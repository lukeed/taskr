/**
  Promisify a function of the form (value, options, cb).
  @param {Function} async function
  @return {Function} new function returning a promise
*/
export function defer (asyncFunc) {
  return (value, options) => new Promise((resolve, reject) => {
    const cb = (err, value) => err ? reject(err) : resolve(value)
    asyncFunc(value, options || cb, options && cb)
  })
}

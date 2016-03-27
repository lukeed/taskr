/**
 * Promisify a function of the form (value, options, cb)
 * @param  {Function} asyncFunc  The function
 * @return {Function}            The new function, as a Promise
 */
module.exports = function (asyncFunc) {
	return function (value, options) {
		return new Promise(function (resolve, reject) {
			var cb = function (err, value) {
				return err ? reject(err) : resolve(value)
			}

			asyncFunc(value, options || cb, options && cb)
		})
	}
}

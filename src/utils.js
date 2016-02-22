'use strict';
var x = module.exports;

/**
 * Promisify a function of the form (value, options, cb)
 * @param  {Function} asyncFunc The function
 * @return {Function} 					The new function, as a Promise
 */
x.defer = function (asyncFunc) {
	return function (value, options) {
		return new Promise(function (resolve, reject) {
			var cb = function (err, value) {
				return err ? reject(err) : resolve(value);
			};

			asyncFunc(value, options || cb, options && cb);
		});
	};
};

/**
	Flatten a nested array recursively.
	@param {Array}
	@return [[a],[b],[c]] -> [a,b,c]
*/
x.flatten = function (array) {
	return array.reduce(function (flat, next) {
		return flat.concat(Array.isArray(next) ? x.flatten(next) : next);
	}, []);
};

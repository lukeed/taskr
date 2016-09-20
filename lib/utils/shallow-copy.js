module.exports = shallowCopy

/**
 * Create shallow copy object
 *
 * @param  {Object|null} merge	object to merge with
 * @param  {Object}	 	 value	targeting object
 * @return {Object}		 copy	shallow copy
 */
function shallowCopy(merge, value) {
	var copy = merge || {}
	Object.keys(value).forEach(function (key) {
		copy[key] = value[key]
	})

	return copy
}

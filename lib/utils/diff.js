var deepEqual = require('deep-equal')

module.exports = diff

/**
 * Get differences between two objects
 *
 * @param  {Object} orig  original object
 * @param  {Object} modified
 * @return {Array} array of differences
 */
function diff(orig, modified) {
	var differences = []

	// get keys of two objects
	var origKeys = Object.keys(orig)
	var modifiedKeys = Object.keys(modified)

	// process modified object first
	modifiedKeys.forEach(function (key) {
		var value = modified[key]
		if (orig[key] && !deepEqual(orig[key], value)) {
			differences.push({
				type: 'changed',
				name: key,
				value: value
			})
		} else if (!orig[key]) {
			// if value not in orig object
			// add it as new value
			differences.push({
				type: 'created',
				name: key,
				value: value
			})
		}
	})

	// process orig object to track deleted props
	origKeys.forEach(function (key) {
		var value = orig[key]
		if (!modified[key]) {
			differences.push({
				type: 'removed',
				name: key,
				value: value
			})
		}
	})

	return differences
}

var deepEqual = require('deep-equal')
var arrayToMap = require('./array-to-map')

// all changes types
var types = arrayToMap(['CREATED', 'CHANGED', 'REMOVED'])

/**
 * Get differences between two objects
 *
 * @param  {Object} root
 * @param  {Object} modified
 * @return {Array} array of differences
 */
function diff(root, modified) {
	var differences = []

	// get keys of two objects
	var rootKeys = Object.keys(root)
	var modifiedKeys = Object.keys(modified)

	// process modified object first
	modifiedKeys.forEach(function (key) {
		var value = modified[key]
		if (root[key] && !deepEqual(root[key], value)) {
			differences.push({
				type: types.CHANGED,
				name: key,
				value: value
			})
		} else if (!root[key]) {
			// if value not in root object
			// add it as new value
			differences.push({
				type: types.CREATED,
				name: key,
				value: value
			})
		}
	})

	// process root object to track deleted props
	rootKeys.forEach(function (key) {
		var value = root[key]
		if (!modified[key]) {
			differences.push({
				type: types.REMOVED,
				name: key,
				value: value
			})
		}
	})

	return differences
}

module.exports = {
	diff: diff,
	types: types
}

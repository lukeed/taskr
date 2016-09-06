var deepEqual = require('deep-equal')
var arrayToMap = require('./array-to-map')

var diffLabels = arrayToMap(['created', 'changed'])

/**
 * Get differences of two objects
 *
 * @param  {Object} root
 * @param  {Object} modified
 * @return {Array} array of differences
 */
function objectDiff(root, modified) {
	var diff = []
	Object.keys(modified).forEach(function (key) {
		var value = modified[key]

		// if value not in root object
		// add it as difference
		if (!root[key]) {
			diff.push({
				label: diffLabels.created,
				name: key,
				value: value
			})
		}

		if (root[key] && !deepEqual(root[key], value)) {
			diff.push({
				label: diffLabels.changed,
				name: key,
				value: value
			})
		}
	})

	return diff
}

module.exports = {
	objectDiff: objectDiff,
	diffLabels: diffLabels
}

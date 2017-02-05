"use strict"

const Promise = require("bluebird")
const glob = Promise.promisify(require("glob"))
const getUniques = require("../fn").getUniques
const toArray = require("../fn").toArray

const isString = val => typeof val === "string"
const hasIgnore = val => val[0] === "!"

function validate(arr) {
	if (!arr.every(isString)) {
		throw new TypeError("All patterns must be strings!")
	}
}

module.exports = function (patterns, opts) {
	opts = opts || {}
	patterns = toArray(patterns)

	try {
		validate(patterns)
	} catch (err) {
		return Promise.reject(err)
	}

	let ignore
	const globs = []
	const ignores = toArray(opts.ignore) || []

	patterns.forEach((pat, i) => {
		if (hasIgnore(pat)) {
			return
		}

		ignore = ignores.concat(
			patterns.slice(i).filter(hasIgnore).map(p => p.slice(1))
		)

		globs.push({
			pattern: pat,
			options: Object.assign({}, opts, {ignore})
		})
	})

	return Promise.all(
		globs.map(g => glob(g.pattern, g.options))
	).then(all => getUniques([].concat.apply([], all)))
}

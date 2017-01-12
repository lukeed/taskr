"use strict"

const bb = require("bluebird")
const rimraf = bb.promisify(require("rimraf"))
const toArray = require("../../lib/fn").toArray

/**
 * `fly-clear` stub
 * serves as test-util only
 */
const del = bb.coroutine(function * (src) {
	yield bb.all(toArray(src).map(g => rimraf(g)))
})

exports.del = del
module.exports = del

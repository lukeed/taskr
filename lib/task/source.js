"use strict"

const norm = require("path").normalize
const parser = require("path").parse
const Promise = require("bluebird")
const toArr = require("../fn").toArray
const flatten = require("../fn").flatten
const expand = require("../utils").expand
const read = require("../utils").read

const co = Promise.coroutine

module.exports = co(function * (globs, opts) {
	globs = flatten(toArr(globs))
	const files = yield expand(globs, opts)

	if (globs.length && !files.length) {
		this.emit("globs_no_match", globs, opts)
	}

	// pre-fetch each file"s content
	const datas = yield Promise.all(files.map(f => read(f)))

	// update known globs
	this._.globs = globs
	// update known files, as (mod"d) `pathObject`s
	this._.files = files.map((el, idx) => {
		const obj = parser(el)
		return {
			dir: norm(obj.dir),
			data: datas[idx],
			base: obj.base
		}
	})
})

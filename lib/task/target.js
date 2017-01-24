"use strict"

const p = require("path")
const Promise = require("bluebird")
const toArr = require("../fn").toArray
const flatten = require("../fn").flatten
const write = require("../utils").write

const rgx = /[\\|\/]/g
const co = Promise.coroutine
const norm = p.normalize
const format = p.format
const sep = p.sep

module.exports = co(function * (dirs, opts) {
	dirs = flatten(toArr(dirs))
	opts = opts || {}

	const files = this._.files
	// using `watcher`? original globs passed as `prevs`
	// non-wildcard glob segments that should be trimmed!
	const globs = (this._.prevs && this._.prevs.length > 0) ? this._.prevs : this._.globs

	const trims = globs.map(g => {
		let seg = g.split(rgx)
		const idx = seg.findIndex(str => str.includes("*"))

		if (idx === -1) {
			seg.pop()
		} else {
			seg = seg.slice(0, idx)
		}

		return norm(seg.join(sep))
	}).sort((a, b) => b.length - a.length)

	return yield Promise.all(
		flatten(
			files.map(obj => {
				// store data no longer changes
				const data = obj.data

				return dirs.map(d => {
					// clone `pathObject` per target dir
					const o = { dir: obj.dir, base: obj.base }
					// replace `source` segments with `target` dir
					for (const t of trims) {
						o.dir = o.dir.replace(t, d)
					}
					// create final filepath & write to it!
					return write(format(o), data)
				})
			})
		)
	)
})
